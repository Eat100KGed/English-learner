/* =============================================
   sync-gist.js  GitHub Gist 多设备同步
   ============================================= */

'use strict';

const GistSync = (() => {
  // ── 配置 ──────────────────────────────────────
  const GIST_TOKEN_KEY  = 'kaoyan_gist_token';
  const GIST_ID_KEY     = 'kaoyan_gist_id';
  const GIST_FILENAME   = 'kaoyan_vocab_progress.json';
  const GIST_SYNC_TS    = 'kaoyan_gist_last_sync';
  const API_BASE        = 'https://api.github.com';

  let _syncing = false;   // 防止并发
  let _autoTimer = null;

  // ── 持久化 helpers ────────────────────────────
  function getToken()  { return localStorage.getItem(GIST_TOKEN_KEY) || ''; }
  function getGistId() { return localStorage.getItem(GIST_ID_KEY) || ''; }
  function setGistId(id) { localStorage.setItem(GIST_ID_KEY, id); }
  function getLastSyncTs() { return parseInt(localStorage.getItem(GIST_SYNC_TS) || '0', 10); }
  function setLastSyncTs() { localStorage.setItem(GIST_SYNC_TS, Date.now()); }

  // ── UI 状态指示 ───────────────────────────────
  function setSyncStatus(state, msg) {
    // state: 'idle' | 'syncing' | 'ok' | 'error'
    const el = document.getElementById('sync-status');
    if (!el) return;
    const icons = { idle: '☁️', syncing: '🔄', ok: '✅', error: '❌' };
    el.textContent = (icons[state] || '☁️') + (msg ? ' ' + msg : '');
    el.dataset.state = state;
  }

  function setGistBtnState(loading) {
    const btn = document.getElementById('gist-sync-btn');
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = loading ? '同步中…' : '☁️ 立即同步';
  }

  // ── GitHub API 封装 ───────────────────────────
  async function apiRequest(method, path, body) {
    const token = getToken();
    if (!token) throw new Error('未配置 GitHub Token');
    const opts = {
      method,
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(API_BASE + path, opts);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.status === 204 ? null : res.json();
  }

  // ── 创建 Gist ────────────────────────────────
  async function createGist(content) {
    const data = await apiRequest('POST', '/gists', {
      description: '考研词汇打卡 - 进度同步',
      public: false,
      files: {
        [GIST_FILENAME]: { content }
      }
    });
    setGistId(data.id);
    return data.id;
  }

  // ── 更新 Gist ────────────────────────────────
  async function updateGist(gistId, content) {
    await apiRequest('PATCH', `/gists/${gistId}`, {
      files: { [GIST_FILENAME]: { content } }
    });
  }

  // ── 读取 Gist ────────────────────────────────
  async function fetchGist(gistId) {
    const data = await apiRequest('GET', `/gists/${gistId}`);
    const file = data.files[GIST_FILENAME];
    if (!file) throw new Error('Gist 文件不存在');
    // 如果内容被截断，用 raw_url 拉取完整内容
    if (file.truncated) {
      const res = await fetch(file.raw_url);
      return res.text();
    }
    return file.content;
  }

  // ── 查找已有的同步 Gist ───────────────────────
  async function findExistingGist() {
    const gists = await apiRequest('GET', '/gists');
    return gists.find(g => g.files && g.files[GIST_FILENAME]);
  }

  // ── 合并策略：以 xp 更高的为主，学习记录取并集 ──
  function mergeState(local, remote) {
    try {
      const r = typeof remote === 'string' ? JSON.parse(remote) : remote;
      if (!r || !r.progress) return local;

      const merged = JSON.parse(JSON.stringify(local)); // deep clone

      // 以 xp 更高一方为主数据
      const useRemote = (r.stats?.xp || 0) > (local.stats?.xp || 0);

      // stats 取最大值
      const fields = ['xp','totalLearned','totalReview','streak','bestStreak'];
      fields.forEach(f => {
        merged.stats[f] = Math.max(local.stats?.[f] || 0, r.stats?.[f] || 0);
      });

      // wordMemory 合并：取 interval 更大（记忆更好）的一方
      const localWM  = local.progress?.wordMemory || {};
      const remoteWM = r.progress?.wordMemory || {};
      const allKeys  = new Set([...Object.keys(localWM), ...Object.keys(remoteWM)]);
      merged.progress.wordMemory = {};
      allKeys.forEach(k => {
        const lv = localWM[k];
        const rv = remoteWM[k];
        if (!lv) { merged.progress.wordMemory[k] = rv; }
        else if (!rv) { merged.progress.wordMemory[k] = lv; }
        else {
          // 取复习次数更多的记录
          merged.progress.wordMemory[k] =
            (rv.reviews || 0) >= (lv.reviews || 0) ? rv : lv;
        }
      });

      // 学习过的单词列表取并集
      const lLearned = local.progress?.learned || [];
      const rLearned = r.progress?.learned || [];
      merged.progress.learned = [...new Set([...lLearned, ...rLearned])];

      // 最后登录取最新
      if ((r.progress?.lastLogin || '') > (local.progress?.lastLogin || '')) {
        merged.progress.lastLogin = r.progress.lastLogin;
      }

      // 设置以本地为准（不覆盖用户本机偏好）
      // merged.settings 保持 local

      return merged;
    } catch (e) {
      console.warn('[GistSync] merge error', e);
      return local;
    }
  }

  // ── 推送进度到 Gist ───────────────────────────
  async function push() {
    if (_syncing) return;
    if (!getToken()) return;
    if (!navigator.onLine) return;

    _syncing = true;
    setGistBtnState(true);
    setSyncStatus('syncing', '上传中…');

    try {
      // 拿到当前 AppState（由外部注入）
      const state = window._getAppStateForSync?.();
      if (!state) throw new Error('AppState 不可用');

      const content = JSON.stringify(state, null, 2);
      let gistId = getGistId();

      if (gistId) {
        await updateGist(gistId, content);
      } else {
        // 先找有没有已有的 gist
        const existing = await findExistingGist();
        if (existing) {
          setGistId(existing.id);
          await updateGist(existing.id, content);
        } else {
          gistId = await createGist(content);
        }
      }

      setLastSyncTs();
      setSyncStatus('ok', lastSyncLabel());
      return true;
    } catch (e) {
      console.warn('[GistSync] push error', e);
      setSyncStatus('error', e.message.slice(0, 30));
      return false;
    } finally {
      _syncing = false;
      setGistBtnState(false);
    }
  }

  // ── 拉取远端进度 ──────────────────────────────
  async function pull() {
    if (!getToken()) return null;
    if (!navigator.onLine) return null;

    setSyncStatus('syncing', '拉取中…');
    try {
      let gistId = getGistId();
      if (!gistId) {
        const existing = await findExistingGist();
        if (!existing) {
          setSyncStatus('idle');
          return null;  // 还没有云端数据
        }
        setGistId(existing.id);
        gistId = existing.id;
      }

      const remoteContent = await fetchGist(gistId);
      setSyncStatus('ok', lastSyncLabel());
      return remoteContent;
    } catch (e) {
      console.warn('[GistSync] pull error', e);
      setSyncStatus('error', e.message.slice(0, 30));
      return null;
    }
  }

  // ── 首次启动时同步 ────────────────────────────
  async function syncOnStart() {
    if (!getToken() || !navigator.onLine) {
      setSyncStatus('idle');
      return;
    }
    setSyncStatus('syncing', '连接中…');

    const remoteRaw = await pull();
    if (!remoteRaw) return;

    const local = window._getAppStateForSync?.();
    if (!local) return;

    const merged = mergeState(local, remoteRaw);
    window._setAppStateFromSync?.(merged);
    setSyncStatus('ok', lastSyncLabel());
  }

  // ── 自动同步（每 5 分钟，上次操作后 30s 去抖）──
  let _dirtyTimer = null;
  function schedulePush() {
    clearTimeout(_dirtyTimer);
    _dirtyTimer = setTimeout(() => { push(); }, 30000);
  }

  // ── Token 验证 ────────────────────────────────
  async function verifyToken(token) {
    try {
      const res = await fetch(`${API_BASE}/user`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github+json',
        }
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.login; // 返回用户名
    } catch { return null; }
  }

  // ── 工具：上次同步时间标签 ────────────────────
  function lastSyncLabel() {
    const ts = getLastSyncTs();
    if (!ts) return '';
    const diff = Math.round((Date.now() - ts) / 1000);
    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.round(diff/60)}分钟前`;
    return `${Math.round(diff/3600)}小时前`;
  }

  // ── 公开 API ──────────────────────────────────
  return {
    getToken,
    setToken(t) { localStorage.setItem(GIST_TOKEN_KEY, t); },
    clearToken() {
      localStorage.removeItem(GIST_TOKEN_KEY);
      localStorage.removeItem(GIST_ID_KEY);
      setSyncStatus('idle');
    },
    getGistId,
    isConfigured() { return !!getToken(); },

    push,
    pull,
    syncOnStart,
    schedulePush,    // 在 saveData 之后调用，触发延迟 push
    mergeState,
    verifyToken,
    lastSyncLabel,
    setSyncStatus,
  };
})();

/* =============================================
   vocab-app.js  考研词汇打卡 - 核心逻辑
   ============================================= */

'use strict';

// ====================================================
// 0. 在线词典 API (Free Dictionary API - 无需 Key)
// ====================================================
const DICT_CACHE_KEY = 'kaoyan_dict_cache_v1';
const dictCache = (() => {
  try { return JSON.parse(localStorage.getItem(DICT_CACHE_KEY)) || {}; }
  catch { return {}; }
})();

function saveDictCache() {
  try { localStorage.setItem(DICT_CACHE_KEY, JSON.stringify(dictCache)); } catch {}
}

/**
 * 从 Free Dictionary API 查询单词详细信息
 * 返回: { phonetic, audioUrl, partOfSpeech, definition, example } 或 null
 */
async function fetchWordFromAPI(word) {
  if (dictCache[word]) return dictCache[word];
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || !data[0]) return null;

    const entry = data[0];
    // 音标
    const phonetic = entry.phonetic ||
      (entry.phonetics?.find(p => p.text)?.text) || '';
    // 音频
    const audioUrl = entry.phonetics?.find(p => p.audio)?.audio || '';
    // 第一个词性和释义
    const meaning = entry.meanings?.[0];
    const partOfSpeech = meaning?.partOfSpeech || '';
    const defObj = meaning?.definitions?.[0];
    const definition = defObj?.definition || '';
    const example = defObj?.example || '';
    // 同义词
    const synonyms = (meaning?.synonyms || []).slice(0, 4);

    const result = { phonetic, audioUrl, partOfSpeech, definition, example, synonyms };
    dictCache[word] = result;
    saveDictCache();
    return result;
  } catch { return null; }
}

// 当前播放的音频对象
let currentAudio = null;

function playWordAudio(audioUrl) {
  if (!audioUrl) return;
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  currentAudio = new Audio(audioUrl);
  currentAudio.play().catch(() => {});
}

// 异步增强词卡：用 API 数据补充英文释义、例句、音频
async function enrichCardWithAPI(word) {
  if (!navigator.onLine) return;
  const apiData = await fetchWordFromAPI(word.word);
  if (!apiData) return;

  // 补充音标（如果本地没有）
  if (apiData.phonetic && !word.phonetic) {
    const el = document.getElementById('word-phonetic');
    if (el && !el.textContent) el.textContent = apiData.phonetic;
  }

  // 添加英文释义区域（在中文释义下方）
  if (apiData.definition) {
    let enDefEl = document.getElementById('word-en-def');
    if (!enDefEl) {
      const defEl = document.getElementById('word-definition');
      if (defEl) {
        enDefEl = document.createElement('div');
        enDefEl.id = 'word-en-def';
        enDefEl.className = 'word-en-def';
        defEl.parentNode.insertBefore(enDefEl, defEl.nextSibling);
      }
    }
    if (enDefEl) {
      enDefEl.innerHTML = `<span class="api-badge">API</span> <em>${apiData.partOfSpeech}</em> ${apiData.definition}`;
    }
  }

  // 补充英文例句（如果本地没有）
  if (apiData.example) {
    const exEl = document.getElementById('word-example');
    if (exEl && !exEl.textContent.trim()) {
      exEl.textContent = `"${apiData.example}"`;
    }
    // 添加 API 例句补充
    let apiExEl = document.getElementById('word-api-example');
    if (!apiExEl) {
      const exEl2 = document.getElementById('word-example');
      if (exEl2) {
        apiExEl = document.createElement('div');
        apiExEl.id = 'word-api-example';
        apiExEl.className = 'word-api-example';
        exEl2.parentNode.insertBefore(apiExEl, exEl2.nextSibling);
      }
    }
    if (apiExEl && apiData.example !== document.getElementById('word-example')?.textContent?.replace(/"/g, '')) {
      apiExEl.textContent = `📚 "${apiData.example}"`;
    }
  }

  // 音频按钮
  if (apiData.audioUrl) {
    let audioBtn = document.getElementById('word-audio-btn');
    if (!audioBtn) {
      const termEl = document.getElementById('word-term');
      if (termEl) {
        audioBtn = document.createElement('button');
        audioBtn.id = 'word-audio-btn';
        audioBtn.className = 'audio-btn pixel-btn';
        audioBtn.title = '点击发音';
        audioBtn.innerHTML = '🔊';
        termEl.insertAdjacentElement('afterend', audioBtn);
      }
    }
    if (audioBtn) {
      audioBtn.onclick = () => playWordAudio(apiData.audioUrl);
    }
  }

  // 同义词标签
  if (apiData.synonyms?.length > 0) {
    let synEl = document.getElementById('word-synonyms');
    if (!synEl) {
      const backEl = document.getElementById('card-back');
      if (backEl) {
        synEl = document.createElement('div');
        synEl.id = 'word-synonyms';
        synEl.className = 'word-synonyms';
        backEl.appendChild(synEl);
      }
    }
    if (synEl) {
      synEl.innerHTML = `<span class="syn-label">近义词：</span>` +
        apiData.synonyms.map(s => `<span class="syn-tag">${s}</span>`).join('');
    }
  }
}

// ====================================================
// 1. 数据存储 (localStorage)
// ====================================================
const STORAGE_KEY = 'kaoyan_vocab_v2';

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(AppState));
  } catch(e) { console.warn('Save failed', e); }
  // 触发 Gist 延迟同步（30s 去抖，仅已配置 Token 时生效）
  if (typeof GistSync !== 'undefined' && GistSync.isConfigured()) {
    GistSync.schedulePush();
  }
}

// 暴露 AppState 给 GistSync 模块使用
window._getAppStateForSync = () => AppState;
window._setAppStateFromSync = (merged) => {
  AppState = deepMerge(structuredClone(DEFAULT_STATE), merged);
  saveData();
  updateTopBar();
  showToast('☁️ 云端进度已合并', 'success', 3000);
};

// ====================================================
// 2. 应用状态
// ====================================================
const DEFAULT_STATE = {
  settings: {
    dailyCount: 10,
    levelFilter: 'all',
    showPhonetic: true,
    enableNotify: false,
  },
  stats: {
    totalLearned: 0,
    streak: 0,
    maxStreak: 0,
    coins: 0,
    xp: 0,
    level: 1,
    totalReviews: 0,
    correctReviews: 0,
  },
  progress: {
    learnedWordIds: [],   // 已学单词索引列表
    wordMemory: {},       // { wordIdx: { interval, easeFactor, nextReview, reps } }
    dailyLog: {},         // { 'YYYY-MM-DD': { learned: [...], reviewed: [...], done: bool } }
    currentDayWords: [],  // 今日单词索引
    currentDayDone: false,
    lastLogin: null,
  }
};

let AppState = null;

function initState() {
  const saved = loadData();
  AppState = saved ? deepMerge(structuredClone(DEFAULT_STATE), saved) : structuredClone(DEFAULT_STATE);
  // 每日初始化
  checkNewDay();
}

function deepMerge(target, source) {
  for (const key in source) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      if (!target[key]) target[key] = {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

// ====================================================
// 3. 日期工具
// ====================================================
function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' });
}

function checkNewDay() {
  const t = today();
  if (AppState.progress.lastLogin !== t) {
    // 判断连续打卡
    if (AppState.progress.lastLogin) {
      const prev = new Date(AppState.progress.lastLogin);
      const diff = (new Date(t) - prev) / 86400000;
      if (diff > 1) {
        AppState.stats.streak = 0;
        showMascotBubble('😢 好久不见，连续记录断了，今天重新开始！', 4000);
      }
    }
    // 生成今日单词
    if (!AppState.progress.dailyLog[t]) {
      generateDailyWords(t);
    }
    AppState.progress.lastLogin = t;
    saveData();
  }
}

// ====================================================
// 4. 词库过滤 + 今日单词生成
// ====================================================
function getFilteredWords() {
  const f = AppState.settings.levelFilter;
  if (f === 'all') return KAOYAN_WORDS;
  const [min, max] = f.split('-').map(Number);
  return KAOYAN_WORDS.filter(w => w.level >= min && w.level <= max);
}

function generateDailyWords(dateStr) {
  const pool = getFilteredWords();
  const learned = new Set(AppState.progress.learnedWordIds);
  const unlearned = pool.map((_, i) => i).filter(i => !learned.has(i));

  // 如果所有词都学过，从头开始复习
  let indices;
  if (unlearned.length === 0) {
    const all = pool.map((_, i) => i);
    indices = shuffleArray(all).slice(0, AppState.settings.dailyCount);
    showToast('🎊 全部单词已学完！进入巩固模式', 'success');
  } else {
    indices = shuffleArray(unlearned).slice(0, AppState.settings.dailyCount);
  }

  AppState.progress.currentDayWords = indices;
  AppState.progress.currentDayDone = false;
  AppState.progress.dailyLog[dateStr] = {
    learned: [],
    reviewed: [],
    done: false,
    wordIndices: indices,
  };
  saveData();
}

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ====================================================
// 5. SM-2 间隔重复算法
// ====================================================
// quality: 0=完全忘记, 3=勉强记得, 5=完全记得
function sm2Update(wordIdx, quality) {
  const mem = AppState.progress.wordMemory[wordIdx] || {
    interval: 1, easeFactor: 2.5, reps: 0, nextReview: today()
  };

  if (quality < 3) {
    mem.reps = 0;
    mem.interval = 1;
  } else {
    if (mem.reps === 0) mem.interval = 1;
    else if (mem.reps === 1) mem.interval = 6;
    else mem.interval = Math.round(mem.interval * mem.easeFactor);
    mem.reps += 1;
  }
  mem.easeFactor = Math.max(1.3, mem.easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  const next = new Date();
  next.setDate(next.getDate() + mem.interval);
  mem.nextReview = next.toISOString().slice(0, 10);

  AppState.progress.wordMemory[wordIdx] = mem;
  saveData();
}

function getReviewWords() {
  const t = today();
  const mem = AppState.progress.wordMemory;
  return Object.keys(mem)
    .filter(idx => mem[idx].nextReview <= t)
    .map(Number);
}

// ====================================================
// 6. 今日故事生成
// ====================================================
const STORY_TEMPLATES = [
  (words) => {
    const w = words.slice(0, Math.min(words.length, 6));
    const pool = [
      `One day, a young student decided to ${w[0]?.word || 'explore'} the world of knowledge. She knew she had to ${w[1]?.word || 'adapt'} to new challenges. Though the journey was not without ${w[2]?.word || 'conflict'}, her ${w[3]?.word || 'strategy'} proved effective. In the end, her efforts began to ${w[4]?.word || 'emerge'} as something remarkable. People around her were amazed by how she could ${w[5]?.word || 'transform'} difficulties into opportunities.`,
      `In a world full of change, learning to ${w[0]?.word || 'adapt'} is essential. A brilliant scientist set out to ${w[1]?.word || 'investigate'} a mysterious phenomenon. The research required her to ${w[2]?.word || 'analyze'} vast amounts of data. Despite the ${w[3]?.word || 'obstacle'} she faced, she did not ${w[4]?.word || 'abandon'} her goal. Eventually, her discovery helped ${w[5]?.word || 'transform'} our understanding of nature.`,
      `The city was undergoing rapid ${w[0]?.word || 'transition'}. A journalist sought to ${w[1]?.word || 'reveal'} the truth behind the changes. She had to ${w[2]?.word || 'navigate'} a complex web of information. Her editor reminded her to ${w[3]?.word || 'prioritize'} accuracy over speed. The story she published would ${w[4]?.word || 'challenge'} many conventional ${w[5]?.word || 'notion'}s about progress.`,
    ];
    return pool[Math.floor(Math.random() * pool.length)];
  }
];

function generateStory(wordIndices) {
  const pool = getFilteredWords();
  const words = wordIndices.map(i => pool[i]).filter(Boolean);
  const template = STORY_TEMPLATES[0];
  return template(words);
}

function renderStory(wordIndices) {
  const pool = getFilteredWords();
  const words = wordIndices.map(i => pool[i]).filter(Boolean);
  let text = generateStory(wordIndices);

  // 高亮单词
  words.forEach(w => {
    if (!w) return;
    const re = new RegExp(`\\b(${w.word})\\b`, 'gi');
    text = text.replace(re, `<span class="highlight" title="${w.definition}">$1</span>`);
  });

  document.getElementById('story-text').innerHTML = text;

  // 渲染单词标签
  const tagsEl = document.getElementById('story-words');
  tagsEl.innerHTML = words.map(w =>
    `<span class="story-tag">${w?.word || ''}</span>`
  ).join('');
}

// ====================================================
// 7. 学习流程
// ====================================================
let learnState = {
  queue: [],       // 待学索引队列
  current: 0,
  results: {},     // { idx: 'correct'|'hard'|'wrong' }
};

function initLearnSession() {
  const t = today();
  const log = AppState.progress.dailyLog[t];
  if (!log) { generateDailyWords(t); return initLearnSession(); }

  const pool = getFilteredWords();
  learnState.queue = [...(log.wordIndices || AppState.progress.currentDayWords)];
  learnState.current = 0;
  learnState.results = {};

  updateLearnProgress();
  showLearnCard();
}

function showLearnCard() {
  const pool = getFilteredWords();
  const cardEl = document.getElementById('word-card');
  const completeEl = document.getElementById('complete-panel');

  if (learnState.current >= learnState.queue.length) {
    // 完成学习
    cardEl.classList.add('hidden');
    completeEl.classList.remove('hidden');
    completeLearnSession();
    return;
  }

  cardEl.classList.remove('hidden');
  completeEl.classList.add('hidden');

  const idx = learnState.queue[learnState.current];
  const word = pool[idx];
  if (!word) { learnState.current++; showLearnCard(); return; }

  // 填充卡片正面
  document.getElementById('word-term').textContent = word.word;
  document.getElementById('word-phonetic').textContent =
    AppState.settings.showPhonetic ? (word.phonetic || '') : '';
  document.getElementById('word-pos').textContent = word.pos || '';

  // 填充卡片背面
  document.getElementById('word-definition').textContent = word.definition || '';
  document.getElementById('word-example').textContent = word.example ? `"${word.example}"` : '';

  // 重置翻转
  document.getElementById('card-back').classList.add('hidden');
  document.getElementById('reveal-btn').classList.remove('hidden');

  // 清理上一张卡片的 API 元素
  ['word-en-def','word-api-example','word-audio-btn','word-synonyms'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });

  // 卡片动画
  cardEl.style.animation = 'none';
  requestAnimationFrame(() => { cardEl.style.animation = ''; cardEl.classList.add('anim-bounce'); });
  setTimeout(() => cardEl.classList.remove('anim-bounce'), 600);

  updateLearnProgress();
  renderWordList();
}

function updateLearnProgress() {
  const total = learnState.queue.length;
  const done = learnState.current;
  const pct = total ? (done / total * 100) : 0;
  document.getElementById('learn-progress-bar').style.width = pct + '%';
  document.getElementById('learn-progress-text').textContent = `${done} / ${total}`;
}

function completeLearnSession() {
  const t = today();
  const log = AppState.progress.dailyLog[t];
  if (!log) return;

  // 统计
  const correct = Object.values(learnState.results).filter(r => r === 'correct').length;
  const hard    = Object.values(learnState.results).filter(r => r === 'hard').length;
  const wrong   = Object.values(learnState.results).filter(r => r === 'wrong').length;
  const total   = Object.keys(learnState.results).length;

  // 更新已学单词
  learnState.queue.forEach(idx => {
    if (!AppState.progress.learnedWordIds.includes(idx)) {
      AppState.progress.learnedWordIds.push(idx);
    }
    const q = learnState.results[idx] === 'correct' ? 5 :
              learnState.results[idx] === 'hard'    ? 3 : 1;
    sm2Update(idx, q);
  });

  // 打卡记录
  log.learned = learnState.queue;
  log.done = true;
  AppState.progress.currentDayDone = true;

  // 连续打卡
  AppState.stats.streak += 1;
  AppState.stats.maxStreak = Math.max(AppState.stats.streak, AppState.stats.maxStreak);
  AppState.stats.totalLearned += total;

  // 奖励
  const earnedCoins = correct * 2 + hard * 1;
  const earnedXp    = correct * 5 + hard * 2 + wrong * 1 + 20; // 基础20xp
  AppState.stats.coins += earnedCoins;
  AppState.stats.xp    += earnedXp;
  checkLevelUp();

  saveData();
  updateTopBar();
  launchConfetti();
  showMascotBubble('🎉 太棒了！今日打卡完成！', 4000);

  // 摘要
  document.getElementById('complete-summary').textContent =
    `认识 ${correct} 个 · 模糊 ${hard} 个 · 不认识 ${wrong} 个`;
  document.getElementById('reward-display').innerHTML =
    `<span class="reward-badge" style="border-color:#fbbf24;color:#fbbf24">+${earnedCoins} 🪙</span>
     <span class="reward-badge" style="border-color:#a78bfa;color:#a78bfa">+${earnedXp} ⭐ XP</span>
     <span class="reward-badge" style="border-color:#4ade80;color:#4ade80">🔥 连续 ${AppState.stats.streak} 天</span>`;

  // 生成今日故事
  renderStory(learnState.queue);
}

function handleAnswer(result) {
  const idx = learnState.queue[learnState.current];
  learnState.results[idx] = result;

  // 卡片动画反馈
  const card = document.getElementById('word-card');
  if (result === 'correct') {
    card.style.borderColor = 'var(--pixel-green)';
    card.classList.add('anim-bounce');
    showMascotBubble('✅ 棒！', 1000);
  } else if (result === 'wrong') {
    card.style.borderColor = 'var(--pixel-red)';
    card.classList.add('anim-shake');
    showMascotBubble('💪 没关系，多复习几次！', 1500);
  } else {
    card.style.borderColor = 'var(--pixel-yellow)';
    showMascotBubble('🤔 再巩固一下！', 1200);
  }

  setTimeout(() => {
    card.style.borderColor = '';
    card.classList.remove('anim-bounce', 'anim-shake');
    learnState.current++;
    showLearnCard();
  }, 400);
}

function renderWordList() {
  const pool = getFilteredWords();
  const listEl = document.getElementById('word-list');
  listEl.innerHTML = learnState.queue.map((idx, i) => {
    const w = pool[idx];
    if (!w) return '';
    const r = learnState.results[idx];
    const statusClass = r === 'correct' ? 'learned' : r === 'wrong' ? 'skipped' : '';
    const icon = r === 'correct' ? '✅' : r === 'wrong' ? '❌' : r === 'hard' ? '😅' : (i < learnState.current ? '•' : '');
    return `<div class="word-chip ${statusClass}" onclick="jumpToWord(${i})">
      <span class="chip-status">${icon}</span>
      <div><div class="chip-term">${w.word}</div><div class="chip-def">${w.definition?.slice(0,20) || ''}...</div></div>
    </div>`;
  }).join('');
}

function jumpToWord(idx) {
  if (idx < learnState.current) return; // 已学词不跳转
  learnState.current = idx;
  showLearnCard();
}

// ====================================================
// 8. 复习流程
// ====================================================
let reviewState = {
  queue: [],
  current: 0,
  results: {},
};

function initReviewSession() {
  const pool = getFilteredWords();
  const indices = getReviewWords();
  reviewState.queue = shuffleArray(indices);
  reviewState.current = 0;
  reviewState.results = {};

  const infoEl = document.getElementById('review-info');
  if (reviewState.queue.length === 0) {
    infoEl.innerHTML = `<div class="review-badge">今天暂无需要复习的单词 🎉</div>`;
    document.getElementById('review-card').classList.add('hidden');
    return;
  }

  infoEl.innerHTML = `
    <div class="review-badge">📋 待复习：${reviewState.queue.length} 个</div>
    <div class="review-badge">📅 基于艾宾浩斯遗忘曲线</div>
  `;
  showReviewCard();
}

function showReviewCard() {
  const pool = getFilteredWords();
  const cardEl = document.getElementById('review-card');
  const completeEl = document.getElementById('review-complete');

  if (reviewState.current >= reviewState.queue.length) {
    cardEl.classList.add('hidden');
    completeEl.classList.remove('hidden');
    const correct = Object.values(reviewState.results).filter(r => r === 'correct').length;
    const total = reviewState.queue.length;
    document.getElementById('review-complete-text').textContent =
      `复习了 ${total} 个单词，正确率 ${Math.round(correct / total * 100)}%！`;
    AppState.stats.totalReviews += total;
    AppState.stats.correctReviews += correct;
    AppState.stats.xp += correct * 3;
    checkLevelUp();
    saveData();
    updateTopBar();
    showMascotBubble('💪 复习完成！记忆更牢固了！', 3000);
    return;
  }

  cardEl.classList.remove('hidden');
  completeEl.classList.add('hidden');

  const idx = reviewState.queue[reviewState.current];
  const word = pool[idx];
  if (!word) { reviewState.current++; showReviewCard(); return; }

  document.getElementById('rv-term').textContent = word.word;
  document.getElementById('rv-phonetic').textContent = AppState.settings.showPhonetic ? (word.phonetic || '') : '';
  document.getElementById('rv-pos').textContent = word.pos || '';
  document.getElementById('rv-definition').textContent = word.definition || '';
  document.getElementById('rv-example').textContent = word.example ? `"${word.example}"` : '';
  document.getElementById('rv-card-back').classList.add('hidden');
  document.getElementById('rv-reveal-btn').classList.remove('hidden');
}

function handleReviewAnswer(result) {
  const idx = reviewState.queue[reviewState.current];
  reviewState.results[idx] = result;
  const q = result === 'correct' ? 5 : result === 'hard' ? 3 : 1;
  sm2Update(idx, q);

  const card = document.getElementById('review-card');
  card.classList.add(result === 'correct' ? 'anim-bounce' : 'anim-shake');
  setTimeout(() => {
    card.classList.remove('anim-bounce', 'anim-shake');
    reviewState.current++;
    showReviewCard();
  }, 350);
}

// ====================================================
// 9. 打卡日历
// ====================================================
let calendarMonth = new Date();

function renderCalendar() {
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const label = `${year}年 ${month + 1}月`;
  document.getElementById('cal-month-label').textContent = label;

  const grid = document.getElementById('calendar-grid');
  const dayLabels = ['日','一','二','三','四','五','六'];
  let html = dayLabels.map(d => `<div class="cal-day-label">${d}</div>`).join('');

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const t = today();

  // 空格填充
  for (let i = 0; i < firstDay; i++) {
    html += `<div class="cal-day empty"></div>`;
  }

  const log = AppState.progress.dailyLog;
  let checkedCount = 0;

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = dateStr === t;
    const isChecked = log[dateStr]?.done;
    const isPast = dateStr < t && !isChecked;

    if (isChecked) checkedCount++;

    let cls = 'cal-day';
    if (isToday) cls += ' today';
    if (isChecked) cls += ' checked';
    else if (isPast) cls += ' missed';

    html += `<div class="${cls}" title="${dateStr}">${d}</div>`;
  }

  grid.innerHTML = html;

  // 月度统计
  const statsEl = document.getElementById('monthly-stats');
  const totalDays = new Date().getDate(); // 本月已过天数（当月）
  const rate = totalDays ? Math.round(checkedCount / Math.min(totalDays, daysInMonth) * 100) : 0;
  statsEl.innerHTML = `
    <div class="m-stat"><span class="m-stat-val">${checkedCount}</span><div class="m-stat-label">已打卡天数</div></div>
    <div class="m-stat"><span class="m-stat-val">${daysInMonth - checkedCount}</span><div class="m-stat-label">未打卡天数</div></div>
    <div class="m-stat"><span class="m-stat-val">${rate}%</span><div class="m-stat-label">本月完成率</div></div>
    <div class="m-stat"><span class="m-stat-val">${AppState.stats.streak}</span><div class="m-stat-label">当前连续天数</div></div>
  `;

  // 月度计划
  renderMonthlyPlan(year, month, daysInMonth, checkedCount);
}

function renderMonthlyPlan(year, month, daysInMonth, checkedCount) {
  const remaining = daysInMonth - new Date().getDate();
  const wordsPerDay = AppState.settings.dailyCount;
  const planEl = document.getElementById('monthly-plan');
  planEl.innerHTML = `
    <div class="plan-title">📋 本月学习计划</div>
    <div class="plan-row"><span>月份目标单词数</span><span>${daysInMonth * wordsPerDay} 个</span></div>
    <div class="plan-row"><span>已完成单词数</span><span>${checkedCount * wordsPerDay} 个</span></div>
    <div class="plan-row"><span>剩余天数</span><span>${remaining} 天</span></div>
    <div class="plan-row"><span>预计完成单词数</span><span>${(checkedCount + remaining) * wordsPerDay} 个</span></div>
    <div class="plan-row"><span>累计学习总词数</span><span>${AppState.stats.totalLearned} 个</span></div>
  `;
}

// ====================================================
// 10. 统计页
// ====================================================
const LEVELS = [
  { name: '词汇新手', minXp: 0 },
  { name: '初级探索者', minXp: 100 },
  { name: '词汇学徒', minXp: 300 },
  { name: '中级冒险者', minXp: 600 },
  { name: '词汇达人', minXp: 1000 },
  { name: '高级探索者', minXp: 1500 },
  { name: '词汇大师', minXp: 2200 },
  { name: '考研精英', minXp: 3000 },
  { name: '词汇传奇', minXp: 5000 },
];

function checkLevelUp() {
  const xp = AppState.stats.xp;
  let lvl = 1;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) { lvl = i + 1; break; }
  }
  if (lvl > AppState.stats.level) {
    AppState.stats.level = lvl;
    showToast(`🎉 升级了！你现在是「${LEVELS[lvl-1].name}」！`, 'success');
    launchConfetti();
  }
}

function renderStats() {
  const s = AppState.stats;
  const pool = getFilteredWords();
  const grid = document.getElementById('stats-grid');
  grid.innerHTML = [
    { icon: '📖', val: s.totalLearned, label: '累计学习词数' },
    { icon: '🔥', val: s.streak, label: '连续打卡天数' },
    { icon: '🏆', val: s.maxStreak, label: '最长连续天数' },
    { icon: '🪙', val: s.coins, label: '词币数量' },
    { icon: '🔄', val: s.totalReviews, label: '累计复习次数' },
    { icon: '✅', val: s.totalReviews ? Math.round(s.correctReviews / s.totalReviews * 100) + '%' : '0%', label: '复习正确率' },
    { icon: '📚', val: pool.length, label: '词库总词数' },
    { icon: '📅', val: Object.keys(AppState.progress.dailyLog).filter(k => AppState.progress.dailyLog[k].done).length, label: '总打卡天数' },
  ].map(item => `
    <div class="stat-card">
      <span class="stat-card-icon">${item.icon}</span>
      <span class="stat-card-val">${item.val}</span>
      <div class="stat-card-label">${item.label}</div>
    </div>
  `).join('');

  // 等级进度条
  const lvl = AppState.stats.level;
  const currentLvl = LEVELS[lvl - 1] || LEVELS[0];
  const nextLvl = LEVELS[lvl] || null;
  const xp = s.xp;

  let pct = 100;
  if (nextLvl) {
    pct = Math.min(100, Math.round((xp - currentLvl.minXp) / (nextLvl.minXp - currentLvl.minXp) * 100));
  }
  document.getElementById('level-bar-fill').style.width = pct + '%';
  document.getElementById('level-text').textContent =
    `Lv.${lvl} ${currentLvl.name}  ${nextLvl ? `${xp} / ${nextLvl.minXp} XP → ${nextLvl.name}` : '满级！'}`;
}

// ====================================================
// 11. 顶部状态栏
// ====================================================
function updateTopBar() {
  document.getElementById('streak-count').textContent = AppState.stats.streak;
  document.getElementById('coin-count').textContent = AppState.stats.coins;
  document.getElementById('xp-count').textContent = AppState.stats.xp;
}

// ====================================================
// 12. 像素小人（Canvas 绘制）
// ====================================================
const MASCOT_STATES = {
  idle:    { frames: 2, fps: 1 },
  happy:   { frames: 4, fps: 8 },
  sad:     { frames: 2, fps: 3 },
  jump:    { frames: 4, fps: 12 },
  wave:    { frames: 4, fps: 8 },
};

let mascotAnim = { state: 'idle', frame: 0, timer: null };

function drawMascot(frame, state) {
  const canvas = document.getElementById('mascot-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // 基础颜色
  const skin = '#fde68a';
  const hair = '#1e3a5f';
  const body = '#3b82f6';
  const pants = '#1e40af';
  const shoe = '#1e293b';
  const eye = '#1e293b';
  const cheek = '#fca5a5';

  // 跳跃偏移
  let yOff = 0;
  if (state === 'jump') yOff = [-8, -16, -20, -12][frame % 4];
  if (state === 'happy') yOff = [0, -4, 0, -4][frame % 4];

  // 阴影
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(W/2, H - 6, 14, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  const draw = (x, y, w, h, color) => {
    ctx.fillStyle = color;
    ctx.fillRect(x, y + yOff, w, h);
  };

  // 身体
  draw(W/2 - 10, 30, 20, 18, body);
  // 左臂
  const armAngle = state === 'wave' ? [0, -4, -8, -4][frame % 4] : 0;
  draw(W/2 - 16, 31 + armAngle, 6, 12, body);
  draw(W/2 + 10, 31, 6, 12, body);
  // 手
  draw(W/2 - 18, 43 + armAngle, 6, 6, skin);
  draw(W/2 + 10, 43, 6, 6, skin);
  // 裤子
  draw(W/2 - 10, 48, 8, 14, pants);
  draw(W/2 + 2, 48, 8, 14, pants);
  // 鞋子
  draw(W/2 - 12, 62, 10, 6, shoe);
  draw(W/2 + 2, 62, 10, 6, shoe);
  // 头部
  draw(W/2 - 12, 8, 24, 22, skin);
  // 头发
  draw(W/2 - 12, 6, 24, 8, hair);
  draw(W/2 - 14, 10, 4, 10, hair);
  draw(W/2 + 10, 10, 4, 10, hair);
  // 眼睛
  const blinkFrame = frame % 8 === 0;
  if (!blinkFrame) {
    draw(W/2 - 7, 16, 4, 4, eye);
    draw(W/2 + 3, 16, 4, 4, eye);
    // 眼睛高光
    ctx.fillStyle = '#fff';
    ctx.fillRect(W/2 - 6, 16 + yOff, 2, 2);
    ctx.fillRect(W/2 + 4, 16 + yOff, 2, 2);
  } else {
    draw(W/2 - 7, 18, 4, 2, eye);
    draw(W/2 + 3, 18, 4, 2, eye);
  }
  // 腮红
  draw(W/2 - 10, 20, 4, 3, cheek);
  draw(W/2 + 6, 20, 4, 3, cheek);
  // 嘴
  if (state === 'sad') {
    ctx.fillStyle = eye;
    ctx.fillRect(W/2 - 3, 24 + yOff, 2, 2);
    ctx.fillRect(W/2 - 1, 25 + yOff, 2, 2);
    ctx.fillRect(W/2 + 1, 24 + yOff, 2, 2);
  } else {
    ctx.fillStyle = eye;
    ctx.fillRect(W/2 - 3, 22 + yOff, 2, 2);
    ctx.fillRect(W/2 - 1, 23 + yOff, 2, 2);
    ctx.fillRect(W/2 + 1, 22 + yOff, 2, 2);
  }
  // 书本道具（idle 时显示）
  if (state === 'idle' || state === 'wave') {
    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(W/2 - 14, 35 + yOff, 8, 10);
    ctx.fillStyle = '#fff';
    ctx.fillRect(W/2 - 13, 36 + yOff, 6, 1);
    ctx.fillRect(W/2 - 13, 38 + yOff, 6, 1);
    ctx.fillRect(W/2 - 13, 40 + yOff, 6, 1);
  }
}

function startMascotAnim(state = 'idle') {
  mascotAnim.state = state;
  mascotAnim.frame = 0;
  if (mascotAnim.timer) clearInterval(mascotAnim.timer);
  const cfg = MASCOT_STATES[state] || MASCOT_STATES.idle;
  mascotAnim.timer = setInterval(() => {
    mascotAnim.frame = (mascotAnim.frame + 1) % cfg.frames;
    drawMascot(mascotAnim.frame, state);
  }, 1000 / cfg.fps);
  drawMascot(0, state);
}

function triggerMascotAnim(state, duration = 2000) {
  startMascotAnim(state);
  setTimeout(() => startMascotAnim('idle'), duration);
}

function showMascotBubble(text, duration = 2500) {
  const el = document.getElementById('mascot-bubble');
  el.textContent = text;
  el.classList.remove('hidden');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.add('hidden'), duration);
}

// ====================================================
// 13. Toast 提示
// ====================================================
function showToast(msg, type = 'success', duration = 2500) {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.remove(), duration);
}

// ====================================================
// 14. 彩带庆祝特效
// ====================================================
function launchConfetti() {
  const colors = ['#4ade80','#60a5fa','#fbbf24','#f87171','#a78bfa','#fb923c'];
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);

  for (let i = 0; i < 36; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.cssText = `
      left: ${Math.random() * 100}vw;
      top: -10px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${6 + Math.random() * 8}px;
      height: ${6 + Math.random() * 8}px;
      animation-delay: ${Math.random() * .5}s;
      animation-duration: ${1 + Math.random() * .8}s;
    `;
    container.appendChild(piece);
  }

  setTimeout(() => container.remove(), 2500);
}

// ====================================================
// 15. 页面路由
// ====================================================
function switchPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));

  const page = document.getElementById(`page-${name}`);
  if (page) page.classList.add('active');
  document.querySelectorAll(`[data-page="${name}"]`).forEach(b => b.classList.add('active'));

  // 页面初始化
  if (name === 'learn')    initLearnSession();
  if (name === 'review')   initReviewSession();
  if (name === 'calendar') renderCalendar();
  if (name === 'story') {
    const t = today();
    const log = AppState.progress.dailyLog[t];
    const indices = log?.wordIndices || AppState.progress.currentDayWords || [];
    renderStory(indices);
  }
  if (name === 'stats') renderStats();
}

// ====================================================
// 16. 设置
// ====================================================
function openSettings() {
  document.getElementById('settings-modal').classList.remove('hidden');
  document.getElementById('daily-count').value = AppState.settings.dailyCount;
  document.getElementById('level-filter').value = AppState.settings.levelFilter;
  document.getElementById('show-phonetic').checked = AppState.settings.showPhonetic;
  document.getElementById('enable-notify').checked = AppState.settings.enableNotify;
  // 刷新 Gist 设置区 UI
  if (typeof refreshGistSettingsUI === 'function') refreshGistSettingsUI();
}

function saveSettings() {
  AppState.settings.dailyCount = parseInt(document.getElementById('daily-count').value) || 10;
  AppState.settings.levelFilter = document.getElementById('level-filter').value;
  AppState.settings.showPhonetic = document.getElementById('show-phonetic').checked;
  AppState.settings.enableNotify = document.getElementById('enable-notify').checked;
  saveData();
  document.getElementById('settings-modal').classList.add('hidden');
  showToast('设置已保存 ✅');
  // 重新生成今日单词
  generateDailyWords(today());
  initLearnSession();
}

// ====================================================
// GitHub Gist 设置 UI 刷新
// ====================================================
async function refreshGistSettingsUI() {
  const configured = typeof GistSync !== 'undefined' && GistSync.isConfigured();
  const setupRow      = document.getElementById('gist-setup-row');
  const configuredRow = document.getElementById('gist-configured-row');
  if (!setupRow || !configuredRow) return;

  if (configured) {
    setupRow.style.display      = 'none';
    configuredRow.style.display = '';
    // 尝试拉取用户名（从 Gist ID 推断或重新验证）
    const token = GistSync.getToken();
    try {
      const res = await fetch('https://api.github.com/user', {
        headers: { 'Authorization': `token ${token}`, 'Accept': 'application/vnd.github+json' }
      });
      if (res.ok) {
        const u = await res.json();
        const nameEl = document.getElementById('gist-username');
        const avatarEl = document.getElementById('gist-avatar');
        if (nameEl) nameEl.textContent = u.login;
        if (avatarEl && u.avatar_url) {
          avatarEl.innerHTML = `<img src="${u.avatar_url}" style="width:22px;height:22px;border-radius:50%;vertical-align:middle">`;
        }
      }
    } catch {}
  } else {
    setupRow.style.display      = '';
    configuredRow.style.display = 'none';
  }
}

function resetData() {
  if (!confirm('确定要重置所有数据吗？此操作不可撤销！')) return;
  localStorage.removeItem(STORAGE_KEY);
  AppState = structuredClone(DEFAULT_STATE);
  checkNewDay();
  saveData();
  updateTopBar();
  document.getElementById('settings-modal').classList.add('hidden');
  showToast('数据已重置', 'warning');
  switchPage('learn');
}

// ====================================================
// 17. 事件绑定 & 初始化
// ====================================================
function bindEvents() {
  // 导航切换
  document.querySelectorAll('.nav-item[data-page]').forEach(btn => {
    btn.addEventListener('click', () => switchPage(btn.dataset.page));
  });

  // 单词卡翻转
  document.getElementById('reveal-btn').addEventListener('click', () => {
    document.getElementById('card-back').classList.remove('hidden');
    document.getElementById('reveal-btn').classList.add('hidden');
    triggerMascotAnim('wave', 1500);
    // 翻卡时在线补充英文释义、音标、音频、例句
    const pool = getFilteredWords();
    const idx = learnState.queue[learnState.current];
    const word = pool[idx];
    if (word) enrichCardWithAPI(word);
  });

  // 学习答题
  document.getElementById('wrong-btn').addEventListener('click', () => handleAnswer('wrong'));
  document.getElementById('hard-btn').addEventListener('click', () => handleAnswer('hard'));
  document.getElementById('correct-btn').addEventListener('click', () => handleAnswer('correct'));

  // 完成后跳转
  document.getElementById('go-story-btn').addEventListener('click', () => switchPage('story'));
  document.getElementById('go-review-btn').addEventListener('click', () => switchPage('review'));

  // 复习答题
  document.getElementById('rv-reveal-btn').addEventListener('click', () => {
    document.getElementById('rv-card-back').classList.remove('hidden');
    document.getElementById('rv-reveal-btn').classList.add('hidden');
  });
  document.getElementById('rv-wrong-btn').addEventListener('click', () => handleReviewAnswer('wrong'));
  document.getElementById('rv-hard-btn').addEventListener('click', () => handleReviewAnswer('hard'));
  document.getElementById('rv-correct-btn').addEventListener('click', () => handleReviewAnswer('correct'));

  // 日历翻页
  document.getElementById('cal-prev').addEventListener('click', () => {
    calendarMonth.setMonth(calendarMonth.getMonth() - 1);
    renderCalendar();
  });
  document.getElementById('cal-next').addEventListener('click', () => {
    calendarMonth.setMonth(calendarMonth.getMonth() + 1);
    renderCalendar();
  });

  // 故事重新生成
  document.getElementById('regen-story-btn').addEventListener('click', () => {
    const t = today();
    const log = AppState.progress.dailyLog[t];
    const indices = log?.wordIndices || AppState.progress.currentDayWords || [];
    renderStory(indices);
    showToast('🎲 已生成新故事！');
    triggerMascotAnim('happy', 2000);
  });

  // 设置
  document.getElementById('settings-btn').addEventListener('click', openSettings);
  document.getElementById('save-settings-btn').addEventListener('click', saveSettings);
  document.getElementById('close-settings-btn').addEventListener('click', () => {
    document.getElementById('settings-modal').classList.add('hidden');
  });
  document.getElementById('reset-btn').addEventListener('click', resetData);

  // ===== GitHub Gist 同步事件 =====
  // 连接 GitHub Token
  document.getElementById('gist-connect-btn').addEventListener('click', async () => {
    const token = document.getElementById('gist-token-input').value.trim();
    if (!token || !token.startsWith('ghp_')) {
      showToast('Token 格式不对，应以 ghp_ 开头', 'error');
      return;
    }
    const connectBtn = document.getElementById('gist-connect-btn');
    connectBtn.disabled = true;
    connectBtn.textContent = '验证中…';
    const username = await GistSync.verifyToken(token);
    connectBtn.disabled = false;
    connectBtn.textContent = '🔗 连接 GitHub';
    if (!username) {
      showToast('Token 无效或无 gist 权限，请重试', 'error');
      return;
    }
    GistSync.setToken(token);
    document.getElementById('gist-token-input').value = '';
    showToast(`✅ 已连接 GitHub（${username}）`, 'success', 3000);
    refreshGistSettingsUI();
    // 连接后立即拉取远端进度
    const remoteRaw = await GistSync.pull();
    if (remoteRaw && window._getAppStateForSync) {
      const merged = GistSync.mergeState(window._getAppStateForSync(), remoteRaw);
      window._setAppStateFromSync(merged);
    }
  });

  // 断开连接
  document.getElementById('gist-logout-btn').addEventListener('click', () => {
    if (!confirm('断开后不会删除云端数据，下次连接可恢复。确认断开？')) return;
    GistSync.clearToken();
    showToast('已断开 GitHub 连接', 'warning');
    refreshGistSettingsUI();
  });

  // 立即同步
  document.getElementById('gist-sync-btn').addEventListener('click', async () => {
    const ok = await GistSync.push();
    if (ok) showToast('☁️ 同步成功！', 'success', 2000);
  });

  // 点击遮罩关闭
  document.getElementById('settings-modal').addEventListener('click', (e) => {
    if (e.target === document.getElementById('settings-modal')) {
      document.getElementById('settings-modal').classList.add('hidden');
    }
  });

  // 点击小人
  document.getElementById('pixel-mascot').addEventListener('click', () => {
    const messages = [
      '📖 加油！每天进步一点点！',
      '🔥 你的连续打卡好厉害！',
      '💪 坚持就是胜利！',
      '🌟 相信自己，考研必胜！',
      '📚 积累词汇，稳步前进！',
      '✨ 你比昨天更棒了！',
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    showMascotBubble(msg, 3000);
    triggerMascotAnim('happy', 2000);
  });

  // 键盘快捷键
  document.addEventListener('keydown', (e) => {
    const activePage = document.querySelector('.page.active')?.id;
    if (activePage === 'page-learn') {
      if (e.key === ' ' || e.key === 'Enter') {
        const backEl = document.getElementById('card-back');
        if (backEl.classList.contains('hidden')) {
          document.getElementById('reveal-btn').click();
        }
      }
      if (e.key === '1') document.getElementById('wrong-btn').click();
      if (e.key === '2') document.getElementById('hard-btn').click();
      if (e.key === '3') document.getElementById('correct-btn').click();
    }
  });

  // 移动端滑动手势
  let touchStartX = 0;
  document.addEventListener('touchstart', (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].clientX;
    const activePage = document.querySelector('.page.active')?.id;
    if (activePage === 'page-learn' && Math.abs(diff) > 60) {
      const backEl = document.getElementById('card-back');
      if (!backEl.classList.contains('hidden')) {
        if (diff > 0) document.getElementById('correct-btn').click();
        else document.getElementById('wrong-btn').click();
      }
    }
  }, { passive: true });
}

// ====================================================
// 18. 应用启动
// ====================================================
document.addEventListener('DOMContentLoaded', () => {
  initState();
  bindEvents();
  updateTopBar();
  startMascotAnim('idle');
  switchPage('learn');

  // 欢迎语
  const streak = AppState.stats.streak;
  if (streak > 0) {
    setTimeout(() => showMascotBubble(`🔥 连续打卡 ${streak} 天！继续加油！`, 3500), 800);
  } else {
    setTimeout(() => showMascotBubble('👋 欢迎！点击我给你加油！', 3000), 600);
  }

  // 检查今日复习提醒
  const reviewCount = getReviewWords().length;
  if (reviewCount > 0) {
    setTimeout(() => showToast(`📋 今天有 ${reviewCount} 个单词需要复习！`, 'warning', 4000), 2000);
  }

  // 联网状态监听
  function updateOnlineStatus() {
    const el = document.getElementById('online-status');
    const lbl = document.getElementById('online-label');
    if (!el || !lbl) return;
    if (navigator.onLine) {
      el.classList.remove('offline');
      lbl.textContent = '在线';
      el.title = '已联网，可获取详细词典数据';
    } else {
      el.classList.add('offline');
      lbl.textContent = '离线';
      el.title = '未联网，使用本地词库';
    }
  }
  updateOnlineStatus();
  window.addEventListener('online', () => {
    updateOnlineStatus();
    showToast('🌐 网络已连接，翻牌时将自动获取详细词典', 'success', 3000);
  });
  window.addEventListener('offline', () => {
    updateOnlineStatus();
    showToast('📴 网络断开，使用本地词库继续学习', 'warning', 3000);
  });

  // 启动时从 Gist 拉取云端进度并合并
  if (typeof GistSync !== 'undefined') {
    GistSync.setSyncStatus('idle');
    setTimeout(() => GistSync.syncOnStart(), 1200);
  }
});

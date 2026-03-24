/* =============================================
   vocab-app.js  考研词汇打卡 - 核心逻辑
   ============================================= */

'use strict';

// ====================================================
// 抽象语录 & 学习梗图数据
// ====================================================

// 学习主题抽象搞笑语录
const ABSTRACT_QUOTES = [
  '我不是在背单词，我是在和遗忘做拉锯战，而且我在输🪚',
  '单词背了忘，忘了背，背了又忘——这不是学习，这是薛定谔的词汇量',
  '睡前背十个单词，睡着忘十一个，多亏了梦里又造了个新词',
  '我的记忆曲线不是艾宾浩斯的，是过山车的🎢',
  '脑子：容量已满，请清理后重试。我：删什么？脑子：单词。',
  '今天计划背100个词，实际背了3个，但这3个我看了40遍，算精通了',
  '单词表第一页永远是最熟悉的陌生人',
  '我背单词的方式：abandon放弃→abandon背单词→abandon',
  '考研英语：你以为你会了，其实你没会；你以为你没会，其实你更没会',
  '学英语就像谈恋爱：刚开始激情四射，两周后开始摆烂',
  '背单词APP的连续打卡提醒就是现代版"催命符"📱',
  '我：今天背完这页。时间：11:58 PM。我：',
  '遗忘是大脑的自我保护机制，我的大脑非常健康',
  '单词本上密密麻麻的笔记，翻到第二页：此处一片空白',
  'abandon, abolish, absent... 我每次都从A开始，从未到过Z',
  '凌晨两点背单词，感觉自己文曲星下凡；早上七点，文曲星已回天庭',
  '英语听力：语速×2，我的理解速度÷2，净亏4倍',
  '做完一套真题感觉飞升，对答案原地爆炸，涅槃了🔥',
  '我的词汇量：认识→见过→好像见过→没见过→这是英文吗',
  '每天告诉自己今天一定好好学，每晚告诉自己明天一定好好学',
  '"就再刷一条视频"——史上最贵的谎言',
  '努力的尽头是什么？是发现别人比你更努力而且还在玩😇',
  '我在用生命背单词，单词在用遗忘回报我',
  '脑子是个好东西，可惜它跟我不是一路人',
  '背单词的第一天：热血沸腾。第七天：活着就行。',
];

// 学习主题搞笑表情包（内嵌 SVG，永不挂）
// 每张都是一个 data URI
const ABSTRACT_MEMES = (() => {
  // 辅助：把 SVG 字符串转成 data URI
  const svg2url = s => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);

  return [

    // 1. This is fine 🔥 —— 大火里背单词
    svg2url(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="160" style="background:#1a1a2e">
      <rect x="0" y="100" width="200" height="60" fill="#c0392b" rx="0"/>
      <rect x="10" y="80" width="180" height="30" fill="#e74c3c" rx="0"/>
      <!-- 火焰 -->
      <ellipse cx="30" cy="95" rx="18" ry="28" fill="#e67e22" opacity=".9"/>
      <ellipse cx="30" cy="90" rx="11" ry="20" fill="#f1c40f" opacity=".9"/>
      <ellipse cx="80" cy="88" rx="22" ry="32" fill="#e67e22" opacity=".9"/>
      <ellipse cx="80" cy="82" rx="13" ry="22" fill="#f1c40f" opacity=".8"/>
      <ellipse cx="150" cy="92" rx="20" ry="28" fill="#e67e22" opacity=".9"/>
      <ellipse cx="150" cy="86" rx="12" ry="18" fill="#f1c40f" opacity=".8"/>
      <!-- 小人坐着 -->
      <circle cx="118" cy="68" r="14" fill="#f5cba7" stroke="#000" stroke-width="1.5"/>
      <rect x="104" y="82" width="28" height="20" fill="#3498db" rx="3"/>
      <rect x="99" y="82" width="10" height="4" fill="#3498db" rx="2"/>
      <rect x="119" y="82" width="10" height="4" fill="#3498db" rx="2"/>
      <rect x="107" y="100" width="10" height="15" fill="#2c3e50" rx="2"/>
      <rect x="119" y="100" width="10" height="15" fill="#2c3e50" rx="2"/>
      <!-- 单词本 -->
      <rect x="96" y="88" width="24" height="18" fill="#fff" rx="2" stroke="#000" stroke-width="1"/>
      <line x1="99" y1="92" x2="117" y2="92" stroke="#aaa" stroke-width="1"/>
      <line x1="99" y1="96" x2="117" y2="96" stroke="#aaa" stroke-width="1"/>
      <line x1="99" y1="100" x2="117" y2="100" stroke="#aaa" stroke-width="1"/>
      <!-- 表情：微笑 -->
      <circle cx="113" cy="65" r="2" fill="#333"/>
      <circle cx="123" cy="65" r="2" fill="#333"/>
      <path d="M112 70 Q118 75 124 70" stroke="#333" stroke-width="1.5" fill="none"/>
      <!-- 文字 -->
      <text x="100" y="145" font-size="11" fill="#fff" font-family="monospace" text-anchor="middle">This is fine.</text>
      <text x="100" y="157" font-size="9" fill="#f1c40f" font-family="monospace" text-anchor="middle">（背单词中🔥）</text>
    </svg>`),

    // 2. 脑子转圈 loading —— 记忆已满
    svg2url(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="160" style="background:#0f0f23">
      <!-- 大脑轮廓 -->
      <ellipse cx="100" cy="72" rx="55" ry="45" fill="#c39bd3" stroke="#8e44ad" stroke-width="2"/>
      <path d="M55 72 Q45 55 60 45 Q70 35 85 42" stroke="#8e44ad" stroke-width="2" fill="none"/>
      <path d="M145 72 Q155 55 140 45 Q130 35 115 42" stroke="#8e44ad" stroke-width="2" fill="none"/>
      <path d="M70 80 Q75 90 85 88 Q95 86 100 92 Q105 86 115 88 Q125 90 130 80" stroke="#8e44ad" stroke-width="2" fill="none"/>
      <!-- ERROR 图标 -->
      <circle cx="100" cy="68" r="22" fill="#e74c3c" opacity=".85"/>
      <text x="100" y="63" font-size="20" text-anchor="middle" fill="#fff">⚠</text>
      <text x="100" y="80" font-size="8" text-anchor="middle" fill="#fff" font-family="monospace">MEMORY FULL</text>
      <!-- 进度条 -->
      <rect x="30" y="125" width="140" height="12" rx="6" fill="#2c2c4e"/>
      <rect x="30" y="125" width="137" height="12" rx="6" fill="#e74c3c"/>
      <text x="100" y="135" font-size="8" text-anchor="middle" fill="#fff" font-family="monospace">RAM: 100% (单词已满)</text>
      <!-- 底部文字 -->
      <text x="100" y="155" font-size="10" text-anchor="middle" fill="#c39bd3" font-family="monospace">请删除无用记忆后重试</text>
    </svg>`),

    // 3. 艾宾浩斯曲线 vs 我的实际情况
    svg2url(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="160" style="background:#1a1a2e">
      <!-- 坐标轴 -->
      <line x1="25" y1="20" x2="25" y2="120" stroke="#7f8c8d" stroke-width="1.5"/>
      <line x1="25" y1="120" x2="185" y2="120" stroke="#7f8c8d" stroke-width="1.5"/>
      <text x="13" y="24" font-size="8" fill="#7f8c8d" font-family="monospace">记</text>
      <text x="13" y="34" font-size="8" fill="#7f8c8d" font-family="monospace">忆</text>
      <text x="100" y="133" font-size="8" fill="#7f8c8d" text-anchor="middle" font-family="monospace">时间 →</text>
      <!-- 教科书曲线（蓝色，平缓下降） -->
      <path d="M30 30 Q70 45 110 65 Q150 82 180 90" stroke="#3498db" stroke-width="2" fill="none" stroke-dasharray="4,2"/>
      <text x="183" y="88" font-size="7" fill="#3498db" font-family="monospace">理论</text>
      <!-- 我的实际曲线（红色，急速崩坏） -->
      <path d="M30 30 Q40 32 55 115 Q80 118 185 118" stroke="#e74c3c" stroke-width="2.5" fill="none"/>
      <text x="183" y="115" font-size="7" fill="#e74c3c" font-family="monospace">我</text>
      <!-- 悲剧点 -->
      <circle cx="55" cy="115" r="4" fill="#f1c40f"/>
      <text x="58" y="110" font-size="7" fill="#f1c40f" font-family="monospace">睡了一觉</text>
      <!-- 标题 -->
      <text x="100" y="145" font-size="10" fill="#fff" text-anchor="middle" font-family="monospace">艾宾浩斯 vs 现实</text>
      <text x="100" y="157" font-size="8.5" fill="#e74c3c" text-anchor="middle" font-family="monospace">理论很丰满，脑子很骨感</text>
    </svg>`),

    // 4. 凌晨学习死亡现场
    svg2url(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="160" style="background:#05050f">
      <!-- 月亮 -->
      <circle cx="165" cy="25" r="18" fill="#f1c40f" opacity=".9"/>
      <circle cx="172" cy="20" r="14" fill="#05050f"/>
      <!-- 星星 -->
      <text x="20" y="22" font-size="10" fill="#fff" opacity=".7">★</text>
      <text x="55" y="15" font-size="7" fill="#fff" opacity=".5">★</text>
      <text x="130" y="18" font-size="8" fill="#fff" opacity=".6">★</text>
      <!-- 书桌 -->
      <rect x="20" y="105" width="160" height="8" fill="#5d4037" rx="2"/>
      <rect x="30" y="113" width="10" height="30" fill="#4e342e"/>
      <rect x="160" y="113" width="10" height="30" fill="#4e342e"/>
      <!-- 单词书 -->
      <rect x="55" y="78" width="35" height="28" fill="#e8e8e8" rx="1" stroke="#ccc" stroke-width="1"/>
      <rect x="55" y="78" width="5" height="28" fill="#e74c3c" rx="1"/>
      <line x1="63" y1="84" x2="87" y2="84" stroke="#bbb" stroke-width="1"/>
      <line x1="63" y1="88" x2="87" y2="88" stroke="#bbb" stroke-width="1"/>
      <line x1="63" y1="92" x2="87" y2="92" stroke="#bbb" stroke-width="1"/>
      <line x1="63" y1="96" x2="80" y2="96" stroke="#bbb" stroke-width="1"/>
      <!-- 趴睡的小人 -->
      <ellipse cx="120" cy="98" rx="22" ry="12" fill="#f5cba7" stroke="#000" stroke-width="1"/>
      <circle cx="105" cy="88" r="10" fill="#f5cba7" stroke="#000" stroke-width="1"/>
      <circle cx="103" cy="86" r="1.5" fill="#333"/>
      <circle cx="109" cy="86" r="1.5" fill="#333"/>
      <path d="M102 91 Q106 89 110 91" stroke="#333" stroke-width="1" fill="none"/>
      <!-- ZZZ -->
      <text x="125" y="78" font-size="11" fill="#7fb3f5" font-family="monospace" opacity=".9">Z</text>
      <text x="135" y="68" font-size="9" fill="#7fb3f5" font-family="monospace" opacity=".7">z</text>
      <text x="143" y="60" font-size="7" fill="#7fb3f5" font-family="monospace" opacity=".5">z</text>
      <!-- 文字 -->
      <text x="100" y="148" font-size="9.5" fill="#f1c40f" text-anchor="middle" font-family="monospace">凌晨2点背单词</text>
      <text x="100" y="159" font-size="9" fill="#7f8c8d" text-anchor="middle" font-family="monospace">背着背着就睡着了</text>
    </svg>`),

    // 5. Drake 指指点点（背 vs 不背）
    svg2url(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="160" style="background:#1a1a2e">
      <!-- 上格（拒绝）-->
      <rect x="0" y="0" width="200" height="80" fill="#2c3e50"/>
      <!-- Drake 拒绝手势 -->
      <circle cx="40" cy="30" r="16" fill="#f5cba7" stroke="#000" stroke-width="1.5"/>
      <rect x="28" y="45" width="24" height="22" fill="#e74c3c" rx="3"/>
      <!-- 拒绝表情 -->
      <circle cx="35" cy="27" r="2" fill="#333"/>
      <circle cx="45" cy="27" r="2" fill="#333"/>
      <path d="M35 35 Q40 31 45 35" stroke="#333" stroke-width="1.5" fill="none"/>
      <!-- 拒绝的X -->
      <line x1="32" y1="22" x2="38" y2="16" stroke="#e74c3c" stroke-width="2.5"/>
      <line x1="32" y1="16" x2="38" y2="22" stroke="#e74c3c" stroke-width="2.5"/>
      <text x="110" y="35" font-size="11" fill="#ecf0f1" font-family="monospace" text-anchor="middle">认真背单词</text>
      <text x="110" y="50" font-size="9.5" fill="#95a5a6" font-family="monospace" text-anchor="middle">每天打卡100个</text>
      <!-- 下格（接受）-->
      <rect x="0" y="80" width="200" height="80" fill="#34495e"/>
      <!-- Drake 指向手势 -->
      <circle cx="40" cy="110" r="16" fill="#f5cba7" stroke="#000" stroke-width="1.5"/>
      <rect x="28" y="125" width="24" height="22" fill="#e74c3c" rx="3"/>
      <!-- 开心表情 -->
      <circle cx="35" cy="107" r="2" fill="#333"/>
      <circle cx="45" cy="107" r="2" fill="#333"/>
      <path d="M35 114 Q40 119 45 114" stroke="#333" stroke-width="1.5" fill="none"/>
      <!-- 指向箭头 -->
      <text x="57" y="118" font-size="16" fill="#f1c40f">👉</text>
      <text x="110" y="112" font-size="11" fill="#ecf0f1" font-family="monospace" text-anchor="middle">"就刷一条视频"</text>
      <text x="110" y="128" font-size="9.5" fill="#95a5a6" font-family="monospace" text-anchor="middle">然后刷了仨小时</text>
    </svg>`),

    // 6. 考研人精神状态检测
    svg2url(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="160" style="background:#0d1117">
      <text x="100" y="22" font-size="11" fill="#58a6ff" text-anchor="middle" font-family="monospace">🔬 考研人精神检测</text>
      <!-- 仪表盘 -->
      <path d="M30 110 A70 70 0 0 1 170 110" stroke="#30363d" stroke-width="14" fill="none"/>
      <path d="M30 110 A70 70 0 0 1 170 110" stroke="url(#grad)" stroke-width="14" fill="none" stroke-dasharray="220" stroke-dashoffset="0"/>
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#2ecc71"/>
          <stop offset="40%" stop-color="#f1c40f"/>
          <stop offset="75%" stop-color="#e67e22"/>
          <stop offset="100%" stop-color="#e74c3c"/>
        </linearGradient>
      </defs>
      <!-- 指针（指向最右/崩溃区） -->
      <line x1="100" y1="110" x2="158" y2="62" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="100" cy="110" r="5" fill="#fff"/>
      <!-- 刻度标签 -->
      <text x="22" y="108" font-size="7.5" fill="#2ecc71" font-family="monospace">正常</text>
      <text x="85" y="42" font-size="7.5" fill="#f1c40f" text-anchor="middle" font-family="monospace">摆烂</text>
      <text x="163" y="78" font-size="7.5" fill="#e74c3c" font-family="monospace">崩了</text>
      <!-- 结果 -->
      <rect x="50" y="120" width="100" height="22" fill="#21262d" rx="4"/>
      <text x="100" y="135" font-size="10" fill="#e74c3c" text-anchor="middle" font-family="monospace">状态：已原地爆炸</text>
      <text x="100" y="155" font-size="9" fill="#8b949e" text-anchor="middle" font-family="monospace">建议：背一个词压压惊</text>
    </svg>`),

    // 7. 学习计划 vs 执行情况 饼图
    svg2url(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="160" style="background:#1a1a2e">
      <text x="100" y="18" font-size="10" fill="#ecf0f1" text-anchor="middle" font-family="monospace">我的时间分配</text>
      <!-- 饼图：圆心(100,85) 半径50 -->
      <!-- 学习 5% -->
      <path d="M100 85 L100 35 A50 50 0 0 1 109 35.2 Z" fill="#2ecc71"/>
      <!-- 刷手机 70% -->
      <path d="M100 85 L109 35.2 A50 50 0 1 1 72 120 Z" fill="#e74c3c"/>
      <!-- 发呆 15% -->
      <path d="M100 85 L72 120 A50 50 0 0 1 60 72 Z" fill="#f1c40f"/>
      <!-- 睡觉 10% -->
      <path d="M100 85 L60 72 A50 50 0 0 1 100 35 Z" fill="#3498db"/>
      <!-- 图例 -->
      <rect x="20" y="140" width="8" height="8" fill="#2ecc71"/>
      <text x="31" y="148" font-size="7.5" fill="#ecf0f1" font-family="monospace">学习5%</text>
      <rect x="72" y="140" width="8" height="8" fill="#e74c3c"/>
      <text x="83" y="148" font-size="7.5" fill="#ecf0f1" font-family="monospace">手机70%</text>
      <rect x="130" y="140" width="8" height="8" fill="#f1c40f"/>
      <text x="141" y="148" font-size="7.5" fill="#ecf0f1" font-family="monospace">发呆15%</text>
      <text x="100" y="160" font-size="8" fill="#95a5a6" text-anchor="middle" font-family="monospace">（学习计划：均匀分配）</text>
    </svg>`),

    // 8. 单词滚动条：记住 → 忘记
    svg2url(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="160" style="background:#0f111a">
      <text x="100" y="20" font-size="10" fill="#a78bfa" text-anchor="middle" font-family="monospace">单词记忆进度条</text>
      <!-- abandon -->
      <text x="18" y="40" font-size="9" fill="#e2e8f0" font-family="monospace">abandon</text>
      <rect x="18" y="43" width="120" height="8" rx="4" fill="#1e293b"/>
      <rect x="18" y="43" width="118" height="8" rx="4" fill="#22c55e"/>
      <text x="142" y="51" font-size="8" fill="#22c55e" font-family="monospace">✓ 记住了!</text>
      <!-- abolish -->
      <text x="18" y="65" font-size="9" fill="#e2e8f0" font-family="monospace">abolish</text>
      <rect x="18" y="68" width="120" height="8" rx="4" fill="#1e293b"/>
      <rect x="18" y="68" width="80" height="8" rx="4" fill="#f59e0b"/>
      <text x="142" y="76" font-size="8" fill="#f59e0b" font-family="monospace">模糊中</text>
      <!-- abstract -->
      <text x="18" y="90" font-size="9" fill="#e2e8f0" font-family="monospace">abstract</text>
      <rect x="18" y="93" width="120" height="8" rx="4" fill="#1e293b"/>
      <rect x="18" y="93" width="20" height="8" rx="4" fill="#ef4444"/>
      <text x="142" y="101" font-size="8" fill="#ef4444" font-family="monospace">忘干净了</text>
      <!-- abundant -->
      <text x="18" y="115" font-size="9" fill="#94a3b8" font-family="monospace">abundant</text>
      <rect x="18" y="118" width="120" height="8" rx="4" fill="#1e293b"/>
      <text x="142" y="126" font-size="8" fill="#64748b" font-family="monospace">没见过?</text>
      <!-- 箭头 -->
      <text x="100" y="148" font-size="9.5" fill="#a78bfa" text-anchor="middle" font-family="monospace">↑ 真实背单词现场</text>
      <text x="100" y="159" font-size="8.5" fill="#64748b" text-anchor="middle" font-family="monospace">以上 4 词均从A开始</text>
    </svg>`),
  ];
})();

// ====================================================
// 0. 音频 & 在线词典
// ====================================================

/**
 * 获取单词的真人读音 URL
 * 优先级：有道词典 TTS（国内直连）→ Free Dictionary API（备用）
 *
 * 有道 TTS：
 *   type=1  英式发音
 *   type=2  美式发音
 * 无需 API Key，直接拼接即可播放
 */
function getYoudaoAudioUrl(word, type = 2) {
  // type=2 美式，type=1 英式
  return `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=${type}`;
}

const DICT_CACHE_KEY = 'kaoyan_dict_cache_v1';
const dictCache = (() => {
  try { return JSON.parse(localStorage.getItem(DICT_CACHE_KEY)) || {}; }
  catch { return {}; }
})();

function saveDictCache() {
  try { localStorage.setItem(DICT_CACHE_KEY, JSON.stringify(dictCache)); } catch {}
}

/**
 * 从 Free Dictionary API 查询补充数据（英文释义、例句、同义词）
 * 音频已改用有道，此函数只取文字数据
 */
async function fetchWordFromAPI(word) {
  if (dictCache[word]) return dictCache[word];
  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!Array.isArray(data) || !data[0]) return null;

    const entry = data[0];
    const phonetic = entry.phonetic ||
      (entry.phonetics?.find(p => p.text)?.text) || '';
    const meaning = entry.meanings?.[0];
    const partOfSpeech = meaning?.partOfSpeech || '';
    const defObj = meaning?.definitions?.[0];
    const definition = defObj?.definition || '';
    const example = defObj?.example || '';
    const synonyms = (meaning?.synonyms || []).slice(0, 4);

    const result = { phonetic, partOfSpeech, definition, example, synonyms };
    dictCache[word] = result;
    saveDictCache();
    return result;
  } catch { return null; }
}

// 当前播放的音频对象
let currentAudio = null;

/**
 * 播放单词读音
 * 优先有道 TTS，无网络或失败时静默忽略
 */
function playWordAudio(word, fallbackUrl) {
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  // 先尝试有道美式发音
  const youdaoUrl = getYoudaoAudioUrl(word, 2);
  const audio = new Audio(youdaoUrl);
  audio.onerror = () => {
    // 有道失败 → 尝试英式
    const audio2 = new Audio(getYoudaoAudioUrl(word, 1));
    audio2.onerror = () => {
      // 最后备用 Free Dict URL
      if (fallbackUrl) new Audio(fallbackUrl).play().catch(() => {});
    };
    audio2.play().catch(() => {});
  };
  audio.play().catch(() => {
    if (fallbackUrl) new Audio(fallbackUrl).play().catch(() => {});
  });
  currentAudio = audio;
}

// ====================================================
// 0b. 卡片正面音频按钮（有道 TTS，无需翻牌即可点击）
// ====================================================

/**
 * 在单词卡正面注入🔊按钮（如已存在则更新绑定）
 * 调用时机：showLearnCard / showReviewCard 渲染完成后
 */
function injectFrontAudioBtn(wordText, btnContainerId, btnId) {
  const container = document.getElementById(btnContainerId);
  if (!container) return;
  let btn = document.getElementById(btnId);
  if (!btn) {
    btn = document.createElement('button');
    btn.id = btnId;
    btn.className = 'audio-btn pixel-btn';
    btn.title = '点击发音（有道·美式）';
    btn.innerHTML = '🔊';
    container.insertAdjacentElement('afterend', btn);
  }
  // 更新点击绑定
  btn.onclick = (e) => {
    e.stopPropagation();
    playWordAudio(wordText);
    btn.classList.add('audio-playing');
    setTimeout(() => btn.classList.remove('audio-playing'), 1200);
  };
}

// 异步增强词卡背面：用 API 数据补充英文释义、例句、同义词
async function enrichCardWithAPI(word) {
  if (!navigator.onLine) return;
  const apiData = await fetchWordFromAPI(word.word);

  // 补充音标（如果本地没有）
  if (apiData?.phonetic && !word.phonetic) {
    const el = document.getElementById('word-phonetic');
    if (el && !el.textContent) el.textContent = apiData.phonetic;
  }

  // 英文释义
  if (apiData?.definition) {
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
      enDefEl.innerHTML = `<span class="api-badge">EN</span> <em>${apiData.partOfSpeech}</em> ${apiData.definition}`;
    }
  }

  // 英文例句
  if (apiData?.example) {
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
    if (apiExEl) apiExEl.textContent = `📚 "${apiData.example}"`;
  }

  // 同义词
  if (apiData?.synonyms?.length > 0) {
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
// 0c. 词库来源说明（已内嵌5045词，无需动态拉取）
// ====================================================
// 词库已内嵌：有道背单词 KaoYan_1 / KaoYan_2 / KaoYan_3 合并，共 5045 词
// level: 1=基础高频(前20%), 2=核心词汇(前50%), 3=考研必备(前80%), 4=拓展提升

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

  // 高亮单词（可点击，携带词库索引）
  words.forEach(w => {
    if (!w) return;
    const re = new RegExp(`\\b(${w.word})\\b`, 'gi');
    text = text.replace(re, (match) => {
      const idx = pool.indexOf(w);
      return `<span class="highlight story-word-link" data-word="${w.word}" data-idx="${idx}" title="点击查看释义">${match}</span>`;
    });
  });

  document.getElementById('story-text').innerHTML = text;

  // 渲染单词标签
  const tagsEl = document.getElementById('story-words');
  tagsEl.innerHTML = words.map(w =>
    `<span class="story-tag story-word-link" data-word="${w?.word || ''}" data-idx="${pool.indexOf(w)}">${w?.word || ''}</span>`
  ).join('');

  // 绑定点击事件（故事文本和标签区域）
  document.querySelectorAll('.story-word-link').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const wordText = el.dataset.word;
      const idx = parseInt(el.dataset.idx);
      showStoryWordCard(wordText, idx);
    });
  });
}

// ====================================================
// 6b. 故事页词义卡片
// ====================================================
let storyWordCardIdx = null; // 当前弹出的词库索引

function showStoryWordCard(wordText, idx) {
  const pool = getFilteredWords();
  const word = pool[idx] || KAOYAN_WORDS.find(w => w.word.toLowerCase() === wordText.toLowerCase());
  if (!word) return;

  storyWordCardIdx = idx;

  const card = document.getElementById('story-word-card');
  document.getElementById('swc-term').textContent = word.word;
  document.getElementById('swc-phonetic').textContent = word.phonetic || '';
  document.getElementById('swc-def').textContent = word.definition || '';

  // 显示当前该词的学习状态提示
  const result = learnState.results[idx];
  const hint = result === 'correct' ? '✅ 今日已标记：认识'
             : result === 'hard'    ? '😅 今日已标记：模糊'
             : result === 'wrong'   ? '❌ 今日已标记：不认识'
             : '';
  document.getElementById('swc-hint').textContent = hint;

  card.classList.remove('hidden');

  // 绑定音频按钮
  document.getElementById('swc-audio-btn').onclick = () => playWordAudio(word.word);
}

function hideStoryWordCard() {
  document.getElementById('story-word-card').classList.add('hidden');
  storyWordCardIdx = null;
}

function handleStoryWordAnswer(result) {
  if (storyWordCardIdx === null) return;
  const idx = storyWordCardIdx;

  // 如果这个词在今日学习队列里，更新 learnState.results
  if (learnState.queue.includes(idx)) {
    learnState.results[idx] = result;
    renderWordList();
    // 同步上传
    saveAndPush();
  }

  // 更新 SM-2
  const q = result === 'correct' ? 5 : result === 'hard' ? 3 : 1;
  sm2Update(idx, q);

  // 更新 hint 文字
  const hint = result === 'correct' ? '✅ 已标记：认识'
             : result === 'hard'    ? '😅 已标记：模糊'
             : '❌ 已标记：不认识';
  document.getElementById('swc-hint').textContent = hint;

  const colors = { correct: 'var(--pixel-green)', hard: 'var(--pixel-yellow)', wrong: 'var(--pixel-red)' };
  const card = document.getElementById('story-word-card');
  card.style.borderColor = colors[result] || '';
  setTimeout(() => { card.style.borderColor = ''; }, 800);

  showToast(result === 'correct' ? '✅ 已标记认识！' : result === 'hard' ? '😅 继续加油！' : '❌ 已加入复习列表！', 'success', 1500);
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
  ['word-en-def','word-api-example','word-front-audio-btn','word-synonyms'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });

  // 在正面音标旁注入🔊按钮（有道 TTS，无需翻牌即可点击）
  injectFrontAudioBtn(word.word, 'word-phonetic', 'word-front-audio-btn');

  // 卡片动画
  cardEl.style.animation = 'none';
  requestAnimationFrame(() => { cardEl.style.animation = ''; cardEl.classList.add('anim-bounce'); });
  setTimeout(() => cardEl.classList.remove('anim-bounce'), 600);

  updateLearnProgress();
  renderWordList();
}

function updateLearnProgress() {
  const total = learnState.queue.length;
  const done = Object.keys(learnState.results).length;
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
  log.wordResults = { ...learnState.results }; // 记录每词的学习结果
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
  // 像素小人专属完成文本框
  showMascotBubble('🐂🍺 又学了一天！', 5000);
  triggerMascotAnim('happy', 5000);

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

  // 立即刷新词块颜色
  renderWordList();

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

  // 每完成一词立即推送到 Gist
  saveAndPush();

  setTimeout(() => {
    card.style.borderColor = '';
    card.classList.remove('anim-bounce', 'anim-shake');
    learnState.current++;
    showLearnCard();
  }, 400);
}

/**
 * 保存本地并静默推送 Gist（单词完成时调用）
 */
function saveAndPush() {
  saveData();
  if (typeof GistSync !== 'undefined' && GistSync.isConfigured()) {
    // 静默推送，不显示 toast
    GistSync.push(true).catch(() => {});
  }
}

function renderWordList() {
  const pool = getFilteredWords();
  const listEl = document.getElementById('word-list');
  const current = learnState.current;
  listEl.innerHTML = learnState.queue.map((idx, i) => {
    const w = pool[idx];
    if (!w) return '';
    const r = learnState.results[idx];
    // 颜色：认识=绿，不认识=红，模糊=黄，当前=蓝，未到=默认
    let colorClass = '';
    if (r === 'correct')     colorClass = 'wg-correct';
    else if (r === 'wrong')  colorClass = 'wg-wrong';
    else if (r === 'hard')   colorClass = 'wg-hard';
    else if (i === current)  colorClass = 'wg-current';
    return `<div class="word-grid-chip ${colorClass}" onclick="jumpToWord(${i})" title="${w.definition?.slice(0,40) || ''}">
      <span class="wgc-word">${w.word}</span>
    </div>`;
  }).join('');
}

function jumpToWord(idx) {
  // 任意跳转（不再限制已学词）
  learnState.current = idx;
  showLearnCard();
  // 滚动回卡片区域
  document.getElementById('card-stage')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  // 复习卡正面也注入🔊按钮
  ['rv-front-audio-btn'].forEach(id => { const e = document.getElementById(id); if (e) e.remove(); });
  injectFrontAudioBtn(word.word, 'rv-phonetic', 'rv-front-audio-btn');
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

    // 有打卡记录的日期可点击展示词汇
    const clickable = isChecked ? `onclick="showCalDayDetail('${dateStr}')" style="cursor:pointer"` : '';
    html += `<div class="${cls}" title="${dateStr}" ${clickable}>${d}</div>`;
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

function showCalDayDetail(dateStr) {
  const log = AppState.progress.dailyLog[dateStr];
  if (!log || !log.done) return;

  const pool = getFilteredWords();
  const indices = log.wordIndices || log.learned || [];
  const results = log.wordResults || {}; // 如果有保存逐词结果

  document.getElementById('cdd-date').textContent = dateStr;
  document.getElementById('cdd-count').textContent = `共 ${indices.length} 词`;

  const gridEl = document.getElementById('cdd-word-grid');
  gridEl.innerHTML = indices.map(idx => {
    const w = pool[idx];
    if (!w) return '';
    const r = results[idx];
    let colorClass = '';
    if (r === 'correct')    colorClass = 'wg-correct';
    else if (r === 'wrong') colorClass = 'wg-wrong';
    else if (r === 'hard')  colorClass = 'wg-hard';
    return `<div class="word-grid-chip ${colorClass}" title="${w.definition?.slice(0,50) || ''}">
      <span class="wgc-word">${w.word}</span>
    </div>`;
  }).join('') || '<div style="color:#aaa;padding:8px">暂无词汇记录</div>';

  document.getElementById('cal-day-detail').classList.remove('hidden');
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
  const totalWords = KAOYAN_WORDS.length; // 完整词库大小（不受level过滤影响）
  const filteredCount = pool.length;      // 当前筛选后的词库大小
  const grid = document.getElementById('stats-grid');

  // 词库总词数：显示完整词库大小，当前筛选的词数用 tooltip 展示
  const vocabDisplay = filteredCount < totalWords
    ? `<span title="当前筛选级别：${filteredCount} 词 / 完整词库：${totalWords} 词">${filteredCount.toLocaleString()} <span class="vocab-source-tag">已筛</span></span>`
    : `${totalWords.toLocaleString()} <span class="vocab-source-tag">完整版</span>`;

  grid.innerHTML = [
    { icon: '📖', val: s.totalLearned, label: '累计学习词数' },
    { icon: '🔥', val: s.streak, label: '连续打卡天数' },
    { icon: '🏆', val: s.maxStreak, label: '最长连续天数' },
    { icon: '🪙', val: s.coins, label: '词币数量' },
    { icon: '🔄', val: s.totalReviews, label: '累计复习次数' },
    { icon: '✅', val: s.totalReviews ? Math.round(s.correctReviews / s.totalReviews * 100) + '%' : '0%', label: '复习正确率' },
    { icon: '📚', val: vocabDisplay, label: '词库总词数', raw: true },
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
  el.classList.remove('bubble-img-mode');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.add('hidden'), duration);
}

// 显示抽象内容气泡（文字 or 图片 meme，随机挑一个）
function showAbstractBubble() {
  const el = document.getElementById('mascot-bubble');
  clearTimeout(el._timer);

  // 随机决定显示文字还是图片（40% 图片，60% 文字）
  const showImg = Math.random() < 0.4;
  const pool = showImg ? ABSTRACT_MEMES : ABSTRACT_QUOTES;
  const item = pool[Math.floor(Math.random() * pool.length)];

  el.classList.remove('hidden');

  if (showImg) {
    el.classList.add('bubble-img-mode', 'loaded');
    el.innerHTML = `<img src="${item}" alt="meme" class="meme-img">`;
    el._timer = setTimeout(() => {
      el.classList.add('hidden');
      el.classList.remove('bubble-img-mode', 'loaded');
    }, 5000);
  } else {
    el.classList.remove('bubble-img-mode', 'loaded');
    el.textContent = item;
    el._timer = setTimeout(() => el.classList.add('hidden'), 5000);
  }
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
    hideStoryWordCard();
    showToast('🎲 已生成新故事！');
    triggerMascotAnim('happy', 2000);
  });

  // 故事词义卡片关闭
  document.getElementById('swc-close').addEventListener('click', hideStoryWordCard);
  // 故事词义卡片三选项
  document.getElementById('swc-wrong').addEventListener('click', () => handleStoryWordAnswer('wrong'));
  document.getElementById('swc-hard').addEventListener('click', () => handleStoryWordAnswer('hard'));
  document.getElementById('swc-correct').addEventListener('click', () => handleStoryWordAnswer('correct'));

  // 日历词汇详情弹窗关闭
  document.getElementById('cdd-close').addEventListener('click', () => {
    document.getElementById('cal-day-detail').classList.add('hidden');
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

  // 点击小人 → 随机显示抽象语录或搞笑表情包
  document.getElementById('pixel-mascot').addEventListener('click', () => {
    showAbstractBubble();
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

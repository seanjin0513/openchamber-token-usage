/**
 * Token 用量 —— OpenChamber 面板
 *
 * 展示本会话 / 今天 / 近 7 天 / 近 30 天 / 历史累计的 token 与费用。
 * 费用由本地服务按用户填写、保存在扩展存储里的价格表估算：
 *   - 每个模型可单独定价（输入 / 输出 / 缓存读取 / 缓存写入，每百万 tokens）
 *   - 可选长上下文分段（超过阈值后使用另一组单价）
 *   - 可选峰谷时段（谷时使用另一组单价，按本机时区）
 */
import { connectHost } from '@openchamber/sdk';
import { applyHostReady } from '@openchamber/sdk/ui';

const host = connectHost();

const ICON_MARK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="6" rx="6.5" ry="2.6"/><path d="M5.5 6v5.2c0 1.44 2.91 2.6 6.5 2.6s6.5-1.16 6.5-2.6V6"/><path d="M5.5 11.2V16c0 1.44 2.91 2.6 6.5 2.6s6.5-1.16 6.5-2.6v-4.8"/></svg>`;
const ICON_REFRESH = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.34 5.66"/><path d="M20 4v7h-7"/></svg>`;
const ICON_EDIT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`;
const ICON_CHEVRON = `<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>`;

const CURRENCIES = {
  CNY: '¥',
  USD: '$',
  EUR: '€',
  JPY: '¥',
  GBP: '£',
};

const COPY = {
  zh: {
    title: 'Token 用量',
    tagline: '本地统计 · 手动定价',
    refresh: '刷新',
    tabOverview: '概览',
    tabPrices: '价格',
    balance: '余额',
    balanceEmpty: '当前会话暂无提供商',
    balanceProviders: '各提供商余额',
    genericProvider: '通用',
    edit: '编辑',
    save: '保存',
    cancel: '取消',
    unset: '未设置',
    wSession: '本会话',
    wToday: '今天',
    wWeek: '近 7 天',
    wMonth: '近 30 天',
    wAll: '历史累计',
    noSession: '未打开会话',
    cache: '缓存命中',
    chartTitle: '近 14 天',
    chartEmpty: '暂无用量',
    tipCost: '费用',
    modelsTitle: '按模型',
    modelsEmpty: '还没有可统计的调用',
    unpriced: '未定价',
    unpricedHint: '以下模型还没有价格，费用按 0 计算。',
    priceTitle: '价格设置',
    currency: '货币',
    priceHint: '单价单位为每百万 tokens；费用按每次调用的 token 明细估算。',
    addDefault: '添加默认单价',
    defaultRule: '默认单价（所有未匹配的模型）',
    addModel: '添加模型',
    addModelPlaceholder: 'provider/model，例如 cnit/deepseek-chat',
    add: '添加',
    remove: '删除单价',
    single: '单独定价',
    priceInput: '输入',
    priceOutput: '输出',
    priceCacheRead: '缓存读取',
    priceCacheWrite: '缓存写入',
    unit: '每百万 tokens',
    longContext: '长上下文分段',
    over: '超过',
    tokensAfter: 'tokens 后',
    offPeak: '峰谷时段',
    valley: '谷时',
    peak: '峰时',
    localTime: '按本机时区',
    weekendValley: '周末全天谷价',
    holidayValley: '节假日全天谷价',
    holidayHint: '日期用逗号分隔，例如 2026-10-01, 2026-10-02',
    longWins: '长上下文与谷时同时命中时，按长上下文价格计算。',
    following: '未单独定价，使用',
    useFallback: '用',
    defaultShort: '默认单价',
    noRule: '未设置单价',
    dbPath: '数据库路径（可选）',
    dbPathHint: '留空自动查找 ~/.local/share/opencode/opencode.db',
    savePath: '保存路径',
    usage: '用量',
    historyTitle: '历史统计',
    historyAll: '统计全部历史',
    historySince: (time) => `统计自 ${time} 起`,
    clearHistory: '清空历史统计',
    restoreHistory: '恢复完整历史',
    historyHint: '只清空本扩展的统计，不删除 OpenCode 数据；可随时恢复。',
    updated: (time) => `更新于 ${time}`,
    source: (count) => `OpenCode · ${count.toLocaleString('zh-CN')} 条调用`,
    loading: '读取中…',
    errorTitle: '无法读取用量',
    errNoService: '扩展的本地服务还没有启动。请在 设置 → 扩展 中允许它运行本地服务，然后重试。',
    errServiceFailed: '扩展的本地服务启动失败。重新加载扩展或重启 OpenChamber 后再试。',
    errTimeout: '本地服务响应超时，请重试。',
    errGeneric: '无法读取用量，请重试。',
    errDbMissing: '找不到 OpenCode 数据库。请确认 OpenCode 已在本机运行过，或手动填写数据库路径。',
    errDbFailed: '读取 OpenCode 数据库失败。',
    errSqlite: '当前运行环境不支持 node:sqlite，无法读取数据库。',
    hidden: '已隐藏',
  },
  en: {
    title: 'Token Usage',
    tagline: 'Local stats · your own prices',
    refresh: 'Refresh',
    tabOverview: 'Overview',
    tabPrices: 'Prices',
    balance: 'Balance',
    balanceEmpty: 'No provider in this session',
    balanceProviders: 'Provider balances',
    genericProvider: 'General',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    unset: 'Not set',
    wSession: 'This session',
    wToday: 'Today',
    wWeek: 'Last 7 days',
    wMonth: 'Last 30 days',
    wAll: 'All time',
    noSession: 'No session open',
    cache: 'cache hit',
    chartTitle: 'Last 14 days',
    chartEmpty: 'No usage yet',
    tipCost: 'Cost',
    modelsTitle: 'By model',
    modelsEmpty: 'No calls recorded yet',
    unpriced: 'Unpriced',
    unpricedHint: 'These models have no price yet; their cost counts as 0.',
    priceTitle: 'Pricing',
    currency: 'Currency',
    priceHint: 'Prices are per million tokens. Cost is estimated from each call’s token usage.',
    addDefault: 'Add default price',
    defaultRule: 'Default price (every model without its own)',
    addModel: 'Add model',
    addModelPlaceholder: 'provider/model, e.g. cnit/deepseek-chat',
    add: 'Add',
    remove: 'Remove price',
    single: 'Set price',
    priceInput: 'Input',
    priceOutput: 'Output',
    priceCacheRead: 'Cache read',
    priceCacheWrite: 'Cache write',
    unit: 'per 1M tokens',
    longContext: 'Long-context tier',
    over: 'Over',
    tokensAfter: 'tokens',
    offPeak: 'Peak / off-peak',
    valley: 'Off-peak',
    peak: 'Peak',
    localTime: 'local time',
    weekendValley: 'All weekend at off-peak',
    holidayValley: 'All holidays at off-peak',
    holidayHint: 'Comma-separated dates, e.g. 2026-10-01, 2026-10-02',
    longWins: 'When a call matches both, the long-context price applies.',
    following: 'Falls back to',
    useFallback: 'Uses',
    defaultShort: 'Default',
    noRule: 'No price set',
    dbPath: 'Database path (optional)',
    dbPathHint: 'Leave empty to use ~/.local/share/opencode/opencode.db',
    savePath: 'Save path',
    usage: 'Usage',
    historyTitle: 'History',
    historyAll: 'Counting all history',
    historySince: (time) => `Counting since ${time}`,
    clearHistory: 'Clear history',
    restoreHistory: 'Restore full history',
    historyHint: 'Clears this extension’s stats only; OpenCode data is untouched and can be restored.',
    updated: (time) => `Updated ${time}`,
    source: (count) => `OpenCode · ${count.toLocaleString('en-US')} calls`,
    loading: 'Reading…',
    errorTitle: 'Could not read usage',
    errNoService:
      'The extension’s local service has not started. Allow it to run a local service in Settings → Extensions, then retry.',
    errServiceFailed: 'The local service failed to start. Reload the extension or restart OpenChamber.',
    errTimeout: 'The local service timed out. Try again.',
    errGeneric: 'Could not read usage. Try again.',
    errDbMissing: 'OpenCode’s database was not found. Run OpenCode on this machine once, or set the path manually.',
    errDbFailed: 'Reading the OpenCode database failed.',
    errSqlite: 'This runtime has no node:sqlite support, so the database cannot be read.',
    hidden: 'Hidden',
  },
};

const APP_HTML = `
<div class="wrap">
  <header class="hero">
    <div class="mark">${ICON_MARK}</div>
    <div class="titles">
      <h1 data-copy="title"></h1>
      <p class="tagline" data-copy="tagline"></p>
    </div>
    <button class="icon-btn" id="refresh" type="button">${ICON_REFRESH}</button>
  </header>

  <div class="tabs" role="tablist">
    <button class="tab" id="tab-overview" data-tab="overview" type="button" role="tab" data-copy="tabOverview"></button>
    <button class="tab" id="tab-prices" data-tab="prices" type="button" role="tab" data-copy="tabPrices"></button>
  </div>

  <div class="notice" id="notice" hidden>
    <div class="notice-title" id="notice-title"></div>
    <div class="notice-body" id="notice-body"></div>
  </div>

  <section id="view-overview">
    <div class="card balance" id="balance-card">
      <div class="balance-line">
        <span class="balance-word" data-copy="balance"></span>
        <div class="balance-list" id="balance-list"></div>
        <button class="ghost small" id="balance-edit" type="button"></button>
      </div>
      <form class="balance-form" id="balance-form" hidden>
        <div class="balance-fields" id="balance-fields"></div>
        <div class="balance-actions">
          <button class="primary small" id="balance-save" type="button" data-copy="save"></button>
          <button class="ghost small" id="balance-cancel" type="button" data-copy="cancel"></button>
        </div>
      </form>
    </div>

    <div class="windows" id="windows"></div>

    <div class="card chart-card">
      <div class="section-head"><span data-copy="chartTitle"></span><span class="hint" id="chart-total"></span></div>
      <div class="chart-wrap">
        <div class="chart" id="chart"></div>
        <div class="chart-tip" id="chart-tip" hidden></div>
      </div>
      <div class="chart-axis"><span id="chart-from"></span><span id="chart-to"></span></div>
    </div>

    <div class="card models-card" id="models-card">
      <button class="section-head section-toggle" id="models-toggle" type="button" aria-expanded="true">
        <span data-copy="modelsTitle"></span>
        <span class="hint" id="models-hint"></span>
        <span class="chev-wrap">${ICON_CHEVRON}</span>
      </button>
      <div id="models"></div>
    </div>

    <div class="card history-card">
      <div class="section-head"><span data-copy="historyTitle"></span><span class="hint" id="history-hint"></span></div>
      <div class="history-actions">
        <button class="ghost small" id="clear-history" type="button" data-copy="clearHistory"></button>
        <button class="ghost small" id="restore-history" type="button" data-copy="restoreHistory" hidden></button>
      </div>
      <p class="hint" data-copy="historyHint"></p>
    </div>

    <footer class="foot">
      <span id="updated"></span>
      <span class="foot-mark" id="source"></span>
    </footer>
  </section>

  <section id="view-prices" hidden>
    <div class="card price-head">
      <label class="field">
        <span data-copy="currency"></span>
        <select id="currency">
          <option value="CNY">CNY ¥</option>
          <option value="USD">USD $</option>
          <option value="EUR">EUR €</option>
          <option value="JPY">JPY ¥</option>
          <option value="GBP">GBP £</option>
        </select>
      </label>
      <p class="hint" data-copy="priceHint"></p>
    </div>

    <div id="rules"></div>

    <button class="ghost add-default" id="add-default" type="button" data-copy="addDefault"></button>

    <form class="add-model" id="add-model">
      <input id="new-model" type="text" spellcheck="false" autocomplete="off" />
      <button class="ghost small" type="submit" data-copy="add"></button>
    </form>

    <details class="advanced">
      <summary data-copy="dbPath"></summary>
      <div class="advanced-body">
        <p class="hint" data-copy="dbPathHint"></p>
        <form class="add-model" id="db-form">
          <input id="db-path" type="text" spellcheck="false" autocomplete="off" />
          <button class="ghost small" type="submit" data-copy="savePath"></button>
        </form>
      </div>
    </details>

    <p class="hint" id="unpriced-hint" hidden></p>
    <p class="hint" data-copy="longWins"></p>
  </section>
</div>`;

/* ------------------------------------------------------------------- state */

const state = {
  lang: 'zh',
  mounted: false,
  tab: 'overview',
  session: null,
  data: null,
  error: null,
  loading: true,
  refreshing: false,
  updatedAt: 0,
  settings: {
    currency: 'CNY',
    balances: {},
    balanceBaselines: {},
    rules: [],
    dbPath: '',
    historyStart: 0,
    modelsCollapsed: false,
  },
  openRules: new Set(),
  balanceEditing: false,
};

const refs = {};
let refreshTimer = null;
let saveTimer = null;
let statsTimer = null;

const t = () => COPY[state.lang];

/* ------------------------------------------------------------------- utils */

function $(id) {
  return document.getElementById(id);
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
}

function money(value) {
  const number = Number(value);
  const symbol = CURRENCIES[state.settings.currency] || '';
  if (!Number.isFinite(number)) return `${symbol}0.00`;
  const abs = Math.abs(number);
  let digits = 2;
  if (abs > 0 && abs < 0.01) digits = 4;
  else if (abs < 1) digits = 3;
  return `${symbol}${number.toLocaleString(state.lang === 'zh' ? 'zh-CN' : 'en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}`;
}

function moneyPlain(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return '0';
  return String(Math.round(number * 10000) / 10000);
}

function formatTokens(value) {
  const number = Number(value) || 0;
  if (number < 1000) return String(Math.round(number));
  if (number < 1_000_000) {
    const scaled = number / 1000;
    return `${scaled >= 100 ? scaled.toFixed(0) : scaled.toFixed(scaled >= 10 ? 1 : 2).replace(/\.0+$/, '')}k`;
  }
  if (number < 1_000_000_000) {
    const scaled = number / 1_000_000;
    return `${scaled >= 100 ? scaled.toFixed(0) : scaled.toFixed(2).replace(/\.?0+$/, '')}M`;
  }
  return `${(number / 1_000_000_000).toFixed(2)}B`;
}

function formatTime(ms) {
  try {
    return new Date(ms).toLocaleTimeString(state.lang === 'zh' ? 'zh-CN' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function formatDateTime(ms) {
  try {
    return new Date(ms).toLocaleString(state.lang === 'zh' ? 'zh-CN' : 'en-US', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function renderHistory() {
  if (!refs.historyHint) return;
  const start = Number(state.settings.historyStart) || 0;
  refs.historyHint.textContent = start ? t().historySince(formatDateTime(start)) : t().historyAll;
  refs.restoreHistory.hidden = start <= 0;
}

function errorText(error) {
  if (!error) return '';
  const code = typeof error.code === 'string' ? error.code : '';
  const message = error instanceof Error ? error.message : String(error);
  if (code && message) return `${code}: ${message}`;
  return code || message;
}

function humanError() {
  const error = state.error;
  if (!error) return null;
  const code = error.code || '';
  let body = '';
  if (code === 'db-missing') {
    body = t().errDbMissing;
    if (Array.isArray(error.tried) && error.tried.length) {
      body += `\n${error.tried.join('\n')}`;
    }
  } else if (code === 'NO_SERVICE') body = t().errNoService;
  else if (code === 'SERVICE_FAILED') body = t().errServiceFailed;
  else if (code === 'HOST_TIMEOUT') body = t().errTimeout;
  else if (code === 'db-read-failed') body = `${t().errDbFailed} ${error.detail || ''}`.trim();
  else if (code === 'sqlite-unavailable') body = t().errSqlite;
  else body = `${t().errGeneric}${error.message ? ` (${error.message})` : ''}`;
  return { title: t().errorTitle, body };
}

/* --------------------------------------------------------------- formatting */

function sanitizeNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? n : 0;
}

function sanitizeHolidays(input) {
  const values = Array.isArray(input)
    ? input
    : typeof input === 'string'
      ? input.split(/[\s,，;；]+/)
      : [];
  const days = [];
  const seen = new Set();
  for (const value of values) {
    if (typeof value !== 'string') continue;
    const day = value.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || seen.has(day)) continue;
    seen.add(day);
    days.push(day);
  }
  return days;
}

function sanitizeBalances(raw) {
  const balances = {};
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    for (const [key, value] of Object.entries(raw)) {
      if (!key) continue;
      const n = Number(value);
      if (Number.isFinite(n) && n >= 0) balances[key] = n;
    }
  }
  if (!Object.keys(balances).length && typeof raw === 'number' && Number.isFinite(raw) && raw >= 0) {
    balances['*'] = raw;
  }
  return balances;
}

function sanitizeRule(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const key = typeof raw.key === 'string' ? raw.key.trim() : '';
  if (!key) return null;
  const rule = {
    key,
    input: sanitizeNumber(raw.input),
    output: sanitizeNumber(raw.output),
    cacheRead: sanitizeNumber(raw.cacheRead),
    cacheWrite: sanitizeNumber(raw.cacheWrite),
  };
  if (raw.long && typeof raw.long === 'object') {
    rule.long = {
      over: sanitizeNumber(raw.long.over),
      input: sanitizeNumber(raw.long.input),
      output: sanitizeNumber(raw.long.output),
      cacheRead: sanitizeNumber(raw.long.cacheRead),
      cacheWrite: sanitizeNumber(raw.long.cacheWrite),
    };
  }
  if (raw.offPeak && typeof raw.offPeak === 'object') {
    rule.offPeak = {
      start: typeof raw.offPeak.start === 'string' ? raw.offPeak.start : '00:30',
      end: typeof raw.offPeak.end === 'string' ? raw.offPeak.end : '08:30',
      weekend: raw.offPeak.weekend === true,
      holidayMode: raw.offPeak.holidayMode === true || sanitizeHolidays(raw.offPeak.holidays).length > 0,
      holidays: sanitizeHolidays(raw.offPeak.holidays),
      input: sanitizeNumber(raw.offPeak.input),
      output: sanitizeNumber(raw.offPeak.output),
      cacheRead: sanitizeNumber(raw.offPeak.cacheRead),
      cacheWrite: sanitizeNumber(raw.offPeak.cacheWrite),
    };
  }
  return rule;
}

function sanitizeSettings(raw) {
  const settings = {
    currency: CURRENCIES[raw?.currency] ? raw.currency : 'CNY',
    balances: sanitizeBalances(raw?.balances ?? raw?.balance),
    balanceBaselines: sanitizeBalances(raw?.balanceBaselines),
    rules: [],
    dbPath: typeof raw?.dbPath === 'string' ? raw.dbPath : '',
    historyStart:
      typeof raw?.historyStart === 'number' && Number.isFinite(raw.historyStart) && raw.historyStart > 0
        ? raw.historyStart
        : 0,
    modelsCollapsed: raw?.modelsCollapsed === true,
  };
  const seen = new Set();
  if (Array.isArray(raw?.rules)) {
    for (const item of raw.rules) {
      const rule = sanitizeRule(item);
      if (!rule || seen.has(rule.key)) continue;
      seen.add(rule.key);
      settings.rules.push(rule);
    }
  }
  return settings;
}

/* ------------------------------------------------------------------ storage */

async function loadSettings() {
  try {
    const stored = await host.storage.get('settings');
    if (stored && typeof stored === 'object') state.settings = sanitizeSettings(stored);
  } catch {
    // storage may be unavailable; keep defaults
  }
}

function persistSettings() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    host.storage.set('settings', state.settings).catch(() => {});
  }, 250);
}

function persistNow() {
  clearTimeout(saveTimer);
  return host.storage.set('settings', state.settings).catch(() => {});
}

/* -------------------------------------------------------------------- mount */

function mount() {
  $('app').innerHTML = APP_HTML;

  refs.refresh = $('refresh');
  refs.tabOverview = $('tab-overview');
  refs.tabPrices = $('tab-prices');
  refs.notice = $('notice');
  refs.noticeTitle = $('notice-title');
  refs.noticeBody = $('notice-body');
  refs.balanceEdit = $('balance-edit');
  refs.balanceForm = $('balance-form');
  refs.balanceList = $('balance-list');
  refs.balanceFields = $('balance-fields');
  refs.balanceSave = $('balance-save');
  refs.historyHint = $('history-hint');
  refs.clearHistory = $('clear-history');
  refs.restoreHistory = $('restore-history');
  refs.windows = $('windows');
  refs.chart = $('chart');
  refs.chartTip = $('chart-tip');
  refs.chartTotal = $('chart-total');
  refs.chartFrom = $('chart-from');
  refs.chartTo = $('chart-to');
  refs.models = $('models');
  refs.modelsHint = $('models-hint');
  refs.modelsCard = $('models-card');
  refs.modelsToggle = $('models-toggle');
  refs.updated = $('updated');
  refs.source = $('source');
  refs.rules = $('rules');
  refs.currency = $('currency');
  refs.addModel = $('add-model');
  refs.newModel = $('new-model');
  refs.dbForm = $('db-form');
  refs.dbPath = $('db-path');
  refs.unpricedHint = $('unpriced-hint');
  refs.addDefault = $('add-default');

  refs.refresh.addEventListener('click', () => void refresh());
  refs.addDefault.addEventListener('click', () => addRule('*', true));
  refs.tabOverview.addEventListener('click', () => switchTab('overview'));
  refs.tabPrices.addEventListener('click', () => switchTab('prices'));
  refs.balanceEdit.addEventListener('click', () => openBalance());
  refs.balanceForm.addEventListener('submit', (event) => {
    event.preventDefault();
    saveBalance();
  });
  refs.balanceSave.addEventListener('click', () => saveBalance());
  refs.modelsToggle.addEventListener('click', () => {
    state.settings.modelsCollapsed = !state.settings.modelsCollapsed;
    persistSettings();
    renderModelsToggle();
  });
  refs.clearHistory.addEventListener('click', () => {
    state.settings.historyStart = Date.now();
    persistNow();
    renderHistory();
    void refresh({ quiet: true });
  });
  refs.restoreHistory.addEventListener('click', () => {
    state.settings.historyStart = 0;
    persistNow();
    renderHistory();
    void refresh({ quiet: true });
  });
  refs.balanceForm.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeBalance();
  });
  $('balance-cancel').addEventListener('click', () => closeBalance());
  refs.currency.addEventListener('change', () => {
    state.settings.currency = CURRENCIES[refs.currency.value] ? refs.currency.value : 'CNY';
    persistSettings();
    renderAll();
  });
  refs.addModel.addEventListener('submit', (event) => {
    event.preventDefault();
    const key = refs.newModel.value.trim();
    if (!key) return;
    refs.newModel.value = '';
    addRule(key);
  });
  refs.dbForm.addEventListener('submit', (event) => {
    event.preventDefault();
    state.settings.dbPath = refs.dbPath.value.trim();
    persistNow();
    void refresh();
  });

  applyCopy();
  renderAll();
}

function switchTab(tab) {
  state.tab = tab;
  const overview = tab !== 'prices';
  $('view-overview').hidden = !overview;
  $('view-prices').hidden = overview;
  refs.tabOverview.setAttribute('aria-selected', overview ? 'true' : 'false');
  refs.tabPrices.setAttribute('aria-selected', overview ? 'false' : 'true');
  if (overview) renderStats();
  else renderPrices();
}

function applyCopy() {
  const copy = t();
  for (const node of document.querySelectorAll('[data-copy]')) {
    const key = node.getAttribute('data-copy');
    const value = copy[key];
    if (typeof value === 'string') node.textContent = value;
  }
  refs.refresh?.setAttribute('title', copy.refresh);
  refs.refresh?.setAttribute('aria-label', copy.refresh);
  refs.newModel?.setAttribute('placeholder', copy.addModelPlaceholder);
  if (refs.currency) refs.currency.value = state.settings.currency;
  document.documentElement.lang = state.lang === 'zh' ? 'zh-CN' : 'en';
}

function renderAll() {
  if (!state.mounted) return;
  renderNotice();
  renderHistory();
  renderModelsToggle();
  if (state.tab === 'prices') renderPrices();
  else renderStats();
  if (refs.currency) refs.currency.value = state.settings.currency;
  if (refs.dbPath && document.activeElement !== refs.dbPath) {
    refs.dbPath.value = state.settings.dbPath;
  }
  renderBalance();
}

/* -------------------------------------------------------------------- data */

async function refresh({ quiet = false } = {}) {
  if (state.refreshing) return;
  state.refreshing = true;
  if (!quiet) state.loading = !state.data;
  refs.refresh?.classList.add('busy');
  renderStats();

  try {
    const payload = {
      sessionId: state.session?.id ?? null,
      now: Date.now(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      dbPath: state.settings.dbPath || '',
      resetAt: state.settings.historyStart || 0,
      prices: { currency: state.settings.currency, rules: state.settings.rules },
    };
    const response = await host.serviceRequest({
      method: 'POST',
      path: '/stats',
      body: JSON.stringify(payload),
    });
    if (!response || response.status !== 200) throw new Error(`HTTP ${response?.status ?? '?'}`);
    const data = JSON.parse(response.body);
    if (!data || data.ok !== true) {
      state.error = {
        code: data?.error || 'ERROR',
        detail: data?.detail || '',
        tried: data?.tried || [],
        message: data?.message || '',
      };
      state.data = null;
    } else {
      state.data = data;
      state.error = null;
      state.updatedAt = Date.now();
    }
  } catch (error) {
    state.error = { code: error?.code || 'ERROR', message: errorText(error) };
    state.data = null;
  } finally {
    state.refreshing = false;
    state.loading = false;
    refs.refresh?.classList.remove('busy');
    // 只更新统计区域，避免在价格页输入时重建表单、打断输入焦点。
    renderStats();
    renderNotice();
    if (state.tab === 'prices') {
      const unpriced = state.data?.unpriced || [];
      if (refs.unpricedHint) {
        refs.unpricedHint.hidden = unpriced.length === 0;
        if (unpriced.length) {
          refs.unpricedHint.textContent = `${t().unpricedHint} ${unpriced.map((item) => item.key).join('、')}`;
        }
      }
    }
  }
}

function scheduleRefresh() {
  clearTimeout(statsTimer);
  statsTimer = setTimeout(() => void refresh({ quiet: true }), 700);
}

/* ------------------------------------------------------------------ render */

function renderNotice() {
  if (!refs.notice) return;
  const info = humanError();
  refs.notice.hidden = !info;
  if (info) {
    refs.noticeTitle.textContent = info.title;
    refs.noticeBody.textContent = info.body;
  }
}

const KNOWN_PROVIDERS = {
  deepseek: 'DeepSeek',
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  google: 'Google',
  siliconflow: 'SiliconFlow',
  'siliconflow-cn': 'SiliconFlow CN',
};

function providerName(provider) {
  if (provider === '*') return t().genericProvider;
  const configured = state.data?.providerNames?.[provider];
  if (typeof configured === 'string' && configured.trim()) return configured.trim();
  if (KNOWN_PROVIDERS[provider]) return KNOWN_PROVIDERS[provider];
  return String(provider || '')
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function sessionProviders() {
  const models = state.data?.windows?.session?.models;
  if (!Array.isArray(models)) return [];
  return [...new Set(models.map((model) => model.providerID).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b),
  );
}

function providerSpent(provider) {
  const lifetime = state.data?.lifetime?.providers;
  if (Array.isArray(lifetime)) {
    const found = lifetime.find((item) => item.providerID === provider);
    return Number(found?.cost) || 0;
  }
  return (state.data?.models || [])
    .filter((model) => model.providerID === provider)
    .reduce((sum, model) => sum + (Number(model.cost) || 0), 0);
}

function ensureBalanceBaselines() {
  if (!state.data) return;
  const balances = state.settings.balances || {};
  const baselines = (state.settings.balanceBaselines ||= {});
  let changed = false;
  for (const [provider, value] of Object.entries(balances)) {
    if (!Number.isFinite(value)) continue;
    if (!Number.isFinite(baselines[provider])) {
      baselines[provider] = providerSpent(provider);
      changed = true;
    }
  }
  for (const provider of Object.keys(baselines)) {
    if (!Object.prototype.hasOwnProperty.call(balances, provider)) {
      delete baselines[provider];
      changed = true;
    }
  }
  if (changed) persistSettings();
}

function renderBalance() {
  if (!refs.balanceList) return;
  const providers = sessionProviders();
  const balances = state.settings.balances || {};

  refs.balanceEdit.innerHTML = `${ICON_EDIT}<span>${t().edit}</span>`;
  refs.balanceEdit.hidden = state.balanceEditing;
  refs.balanceForm.hidden = !state.balanceEditing;
  refs.balanceList.hidden = state.balanceEditing;
  refs.balanceList.innerHTML = '';

  if (!providers.length) {
    refs.balanceList.append(el('div', 'balance-empty', t().balanceEmpty));
    return;
  }
  for (const provider of providers) {
    const row = el('div', 'balance-provider');
    row.append(el('span', 'name', providerName(provider)));
    const balance = balances[provider];
    const baseline = state.settings.balanceBaselines?.[provider];
    const spentSince = Number.isFinite(baseline)
      ? Math.max(0, providerSpent(provider) - baseline)
      : 0;
    const remaining = Number.isFinite(balance) ? balance - spentSince : null;
    const text = el('span', 'value', Number.isFinite(remaining) ? money(remaining) : t().unset);
    if (!Number.isFinite(remaining)) text.classList.add('muted');
    else if (remaining < 0) text.classList.add('negative');
    row.append(text);
    refs.balanceList.append(row);
  }
}

function renderBalanceFields() {
  if (!refs.balanceFields) return;
  const providers = sessionProviders();
  refs.balanceFields.innerHTML = '';
  if (!providers.length) {
    refs.balanceFields.append(el('p', 'hint', t().balanceEmpty));
    return;
  }
  for (const provider of providers) {
    const row = el('label', 'balance-field');
    row.append(el('span', 'name', providerName(provider)));
    const input = el('input');
    input.type = 'number';
    input.min = '0';
    input.step = '0.01';
    input.inputMode = 'decimal';
    input.dataset.provider = provider;
    input.placeholder = '0';
    const value = state.settings.balances?.[provider];
    input.value = Number.isFinite(value) ? String(value) : '';
    row.append(input);
    refs.balanceFields.append(row);
  }
  refs.balanceFields.querySelector('input')?.focus();
}

function openBalance() {
  state.balanceEditing = true;
  renderBalance();
  renderBalanceFields();
}

function closeBalance() {
  state.balanceEditing = false;
  renderBalance();
}

function saveBalance() {
  const next = { ...(state.settings.balances || {}) };
  const baselines = { ...(state.settings.balanceBaselines || {}) };
  for (const input of refs.balanceFields?.querySelectorAll('input[data-provider]') || []) {
    const provider = input.dataset.provider;
    if (!provider) continue;
    const text = input.value.trim();
    if (text === '') {
      delete next[provider];
      delete baselines[provider];
      continue;
    }
    const value = Number(text);
    if (!Number.isFinite(value) || value < 0) continue;
    const unchanged = Number.isFinite(next[provider]) && next[provider] === value;
    next[provider] = value;
    if (!unchanged || !Number.isFinite(baselines[provider])) {
      baselines[provider] = providerSpent(provider);
    }
  }
  state.settings.balances = next;
  state.settings.balanceBaselines = baselines;
  persistNow();
  state.balanceEditing = false;
  renderBalance();
}

function renderStats() {
  if (!state.mounted) return;
  ensureBalanceBaselines();
  renderBalance();
  renderHistory();
  renderWindows();
  renderChart();
  renderModels();
  renderModelsToggle();
  if (refs.updated) {
    refs.updated.textContent = state.updatedAt ? t().updated(formatTime(state.updatedAt)) : '';
  }
  if (refs.source) {
    const count = state.data?.db?.messages;
    refs.source.textContent = typeof count === 'number' ? t().source(count) : '';
  }
}

const WINDOW_ORDER = [
  ['session', 'wSession'],
  ['today', 'wToday'],
  ['week', 'wWeek'],
  ['month', 'wMonth'],
  ['all', 'wAll'],
];

function renderWindows() {
  if (!refs.windows) return;
  refs.windows.replaceChildren();

  for (const [key, labelKey] of WINDOW_ORDER) {
    const window = state.data?.windows?.[key] || null;
    const row = el('div', 'wrow');
    if (key === 'today') row.classList.add('today');

    const main = el('div', 'wmain');
    const label = el('div', 'wlabel', t()[labelKey]);
    if (key === 'session' && state.data?.session?.title) {
      label.title = state.data.session.title;
    }
    main.append(label);

    let meta;
    if (key === 'session' && !state.data?.sessionId) meta = t().noSession;
    else if (!window) meta = state.loading ? t().loading : '—';
    else {
      meta = `${formatTokens(window.tokens?.total || 0)} tokens`;
      if (window.cacheRate > 0) meta += ` · ${t().cache} ${Math.round(window.cacheRate * 100)}%`;
    }
    main.append(el('div', 'wmeta', meta));

    const side = el('div', 'wside');
    const cost = el('div', 'wcost');
    if (!window || (key === 'session' && !state.data?.sessionId)) {
      cost.textContent = '—';
    } else {
      cost.textContent = money(window.cost || 0);
      if (window.steps === 0) cost.classList.add('muted');
      if ((window.models || []).some((model) => !model.priced) && window.steps > 0) {
        cost.append(el('span', 'star', '*'));
        cost.title = t().unpricedHint;
      }
    }
    side.append(cost);
    if (window && window.steps > 0) {
      side.append(el('div', 'wsteps', `${window.steps}`));
    }

    row.append(main, side);
    refs.windows.append(row);
  }
}

function renderChart() {
  if (!refs.chart) return;
  refs.chart.replaceChildren();
  if (refs.chartTip) refs.chartTip.hidden = true;
  const days = (state.data?.days || []).slice(-14);
  if (!days.length) {
    refs.chart.append(el('div', 'chart-empty', t().chartEmpty));
    refs.chartTotal.textContent = '';
    refs.chartFrom.textContent = '';
    refs.chartTo.textContent = '';
    return;
  }

  const max = Math.max(...days.map((day) => day.tokens || 0), 0);
  const total = days.reduce((sum, day) => sum + (day.cost || 0), 0);
  refs.chartTotal.textContent = total > 0 ? money(total) : '';

  for (const day of days) {
    const bar = el('div', 'bar');
    const ratio = max > 0 ? (day.tokens || 0) / max : 0;
    bar.style.height = `${Math.max(ratio > 0 ? 6 : 2, Math.round(ratio * 100))}%`;
    if (!day.tokens) bar.classList.add('empty');
    const label = `${day.day} · ${formatTokens(day.tokens || 0)} tokens · ${money(day.cost || 0)}`;
    bar.tabIndex = 0;
    bar.setAttribute('aria-label', label);

    const showTip = () => {
      if (!refs.chartTip) return;
      refs.chartTip.replaceChildren(
        el('div', 'tip-date', day.day),
        (() => {
          const row = el('div', 'tip-row');
          row.append(el('span', '', t().usage), el('span', '', `${formatTokens(day.tokens || 0)} tokens`));
          return row;
        })(),
        (() => {
          const row = el('div', 'tip-row');
          row.append(el('span', '', t().tipCost), el('span', '', money(day.cost || 0)));
          return row;
        })(),
      );
      refs.chartTip.hidden = false;
      const chartRect = refs.chart.getBoundingClientRect();
      const barRect = bar.getBoundingClientRect();
      const tipRect = refs.chartTip.getBoundingClientRect();
      const left = Math.max(
        0,
        Math.min(
          barRect.left - chartRect.left + barRect.width / 2 - tipRect.width / 2,
          chartRect.width - tipRect.width,
        ),
      );
      const top = Math.max(0, barRect.top - chartRect.top - tipRect.height - 4);
      refs.chartTip.style.left = `${left}px`;
      refs.chartTip.style.top = `${top}px`;
    };
    const hideTip = () => {
      if (refs.chartTip) refs.chartTip.hidden = true;
    };
    bar.addEventListener('mouseenter', showTip);
    bar.addEventListener('mouseleave', hideTip);
    bar.addEventListener('focus', showTip);
    bar.addEventListener('blur', hideTip);
    refs.chart.append(bar);
  }

  const first = days[0].day.slice(5).replace('-', '/');
  const last = days[days.length - 1].day.slice(5).replace('-', '/');
  refs.chartFrom.textContent = first;
  refs.chartTo.textContent = last;
}

function renderModelsToggle() {
  if (!refs.modelsCard || !refs.modelsToggle) return;
  const collapsed = Boolean(state.settings.modelsCollapsed);
  refs.modelsCard.classList.toggle('collapsed', collapsed);
  refs.modelsToggle.setAttribute('aria-expanded', String(!collapsed));
}

function renderModels() {
  if (!refs.models) return;
  refs.models.replaceChildren();
  const models = (state.data?.models || []).slice(0, 8);
  if (!models.length) {
    refs.models.append(el('div', 'empty-line', t().modelsEmpty));
    refs.modelsHint.textContent = '';
    return;
  }
  refs.modelsHint.textContent = `${state.data.models.length}`;

  for (const model of models) {
    const row = el('button', 'mrow');
    row.type = 'button';
    row.dataset.key = model.key;

    const left = el('div', 'mmain');
    const name = el('div', 'mname', model.modelID);
    const provider = el('div', 'mprov', providerName(model.providerID));
    left.append(name, provider);

    const right = el('div', 'mside');
    right.append(el('div', 'mcost', money(model.cost || 0)));
    right.append(
      el('div', 'mtokens', `${formatTokens(model.tokens?.total || 0)}${model.priced ? '' : ` · ${t().unpriced}`}`),
    );
    if (!model.priced) row.classList.add('unpriced');

    row.append(left, right);
    row.addEventListener('click', () => {
      switchTab('prices');
      state.openRules.add(model.key);
      renderPrices();
      const target = refs.rules.querySelector(`[data-key="${cssEscape(model.key)}"]`);
      target?.scrollIntoView({ block: 'nearest' });
    });
    refs.models.append(row);
  }
}

function cssEscape(value) {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') return CSS.escape(value);
  return String(value).replace(/["\\]/g, '\\$&');
}

/* ------------------------------------------------------------------ prices */

function matchRuleFor(key, rules) {
  const exact = rules.find((rule) => rule.key === key);
  if (exact) return { rule: exact, exact: true };
  const slash = key.indexOf('/');
  const providerID = slash >= 0 ? key.slice(0, slash) : '';
  const modelID = slash >= 0 ? key.slice(slash + 1) : key;
  const byModel = rules.find((rule) => rule.key === modelID);
  if (byModel) return { rule: byModel, exact: false };
  if (providerID) {
    const byProvider = rules.find((rule) => rule.key === `${providerID}/*`);
    if (byProvider) return { rule: byProvider, exact: false };
  }
  const fallback = rules.find((rule) => rule.key === '*');
  if (fallback) return { rule: fallback, exact: false };
  return { rule: null, exact: false };
}

function ruleEntries() {
  const observed = state.data?.models || [];
  const seen = new Set(observed.map((model) => model.key));
  const entries = [];
  const defaultRule = state.settings.rules.find((rule) => rule.key === '*');
  if (defaultRule) entries.push({ key: '*', rule: defaultRule, usage: null, exact: true });

  for (const model of observed) {
    const match = matchRuleFor(model.key, state.settings.rules);
    entries.push({
      key: model.key,
      rule: match.exact ? match.rule : null,
      fallback: match.exact ? null : match.rule,
      usage: model,
      exact: match.exact,
    });
  }

  for (const rule of state.settings.rules) {
    if (rule.key === '*' || seen.has(rule.key)) continue;
    entries.push({ key: rule.key, rule, fallback: null, usage: null, exact: true });
  }
  return entries;
}

function priceSummary(rule) {
  if (!rule) return '';
  const parts = [
    `${t().priceInput} ${moneyPlain(rule.input)}`,
    `${t().priceOutput} ${moneyPlain(rule.output)}`,
    `${t().priceCacheRead} ${moneyPlain(rule.cacheRead)}`,
  ];
  if (rule.cacheWrite > 0) parts.push(`${t().priceCacheWrite} ${moneyPlain(rule.cacheWrite)}`);
  return parts.join(' · ');
}

function renderPrices() {
  if (!refs.rules) return;
  refs.rules.replaceChildren();
  const entries = ruleEntries();

  for (const entry of entries) {
    refs.rules.append(buildRuleCard(entry));
  }

  const hasDefault = state.settings.rules.some((rule) => rule.key === '*');
  if (refs.addDefault) refs.addDefault.hidden = hasDefault;

  const unpriced = state.data?.unpriced || [];
  refs.unpricedHint.hidden = unpriced.length === 0;
  if (unpriced.length) {
    refs.unpricedHint.textContent = `${t().unpricedHint} ${unpriced.map((item) => item.key).join('、')}`;
  }
}

function buildRuleCard(entry) {
  const details = el('details', 'rule');
  details.dataset.key = entry.key;
  if (state.openRules.has(entry.key)) details.open = true;

  const summary = el('summary');
  const head = el('div', 'rule-head');
  const title = el('div', 'rule-name');
  title.textContent = entry.key === '*' ? t().defaultRule : entry.key;
  title.title = title.textContent;
  if (entry.key === '*') title.classList.add('default');
  head.append(title);

  const meta = el('div', 'rule-meta');
  const usage = entry.usage;
  if (usage) {
    meta.textContent = `${formatTokens(usage.tokens?.total || 0)} · ${money(usage.cost || 0)}`;
  } else if (entry.rule) {
    meta.textContent = priceSummary(entry.rule);
  } else if (!entry.fallback) {
    meta.textContent = t().noRule;
  }
  head.append(meta);

  const badge = el('div', 'rule-badge');
  if (!entry.rule && !entry.fallback) {
    badge.textContent = t().unpriced;
    badge.classList.add('warn');
  } else if (!entry.exact && entry.fallback) {
    const full = `${t().following} ${entry.fallback.key === '*' ? t().defaultRule : entry.fallback.key}`;
    badge.textContent = `${t().useFallback} ${entry.fallback.key === '*' ? t().defaultShort : entry.fallback.key}`;
    badge.title = full;
    badge.classList.add('soft');
  } else if (entry.rule?.long) {
    badge.textContent = '长上下文';
    badge.classList.add('soft');
  } else if (entry.rule?.offPeak) {
    badge.textContent = '峰谷';
    badge.classList.add('soft');
  }
  head.append(badge, (() => {
    const chevron = document.createElement('span');
    chevron.className = 'chev-wrap';
    chevron.innerHTML = ICON_CHEVRON;
    return chevron;
  })());

  summary.append(head);
  details.append(summary);

  details.addEventListener('toggle', () => {
    if (details.open) state.openRules.add(entry.key);
    else state.openRules.delete(entry.key);
  });

  if (entry.rule) {
    details.append(buildRuleBody(entry.rule));
  } else {
    const body = el('div', 'rule-body');
    const button = el('button', 'ghost small', t().single);
    button.type = 'button';
    button.addEventListener('click', () => addRule(entry.key, true));
    body.append(button);
    details.append(body);
  }

  return details;
}

function buildRuleBody(rule) {
  const body = el('div', 'rule-body');

  const grid = el('div', 'grid');
  grid.append(
    priceField(rule, 'input', t().priceInput),
    priceField(rule, 'output', t().priceOutput),
    priceField(rule, 'cacheRead', t().priceCacheRead),
    priceField(rule, 'cacheWrite', t().priceCacheWrite),
  );
  body.append(grid, el('div', 'unit-hint', t().unit));

  /* long context */
  const longToggle = checkboxRow(t().longContext, Boolean(rule.long));
  body.append(longToggle.row);
  if (rule.long) {
    const box = el('div', 'extra');
    const overRow = el('label', 'field wide');
    overRow.append(document.createTextNode(`${t().over} `));
    const over = el('input');
    over.type = 'number';
    over.min = '0';
    over.step = '1000';
    over.value = String(rule.long.over || 0);
    over.addEventListener('input', () => {
      rule.long.over = sanitizeNumber(over.value);
      scheduleSave();
      scheduleRefresh();
    });
    overRow.append(over, document.createTextNode(` ${t().tokensAfter}`));
    box.append(overRow);
    const longGrid = el('div', 'grid');
    longGrid.append(
      priceField(rule.long, 'input', t().priceInput),
      priceField(rule.long, 'output', t().priceOutput),
      priceField(rule.long, 'cacheRead', t().priceCacheRead),
      priceField(rule.long, 'cacheWrite', t().priceCacheWrite),
    );
    box.append(longGrid);
    body.append(box);
  }
  longToggle.input.addEventListener('change', () => {
    if (longToggle.input.checked) {
      rule.long = {
        over: rule.long?.over || 200000,
        input: rule.long?.input ?? rule.input * 2,
        output: rule.long?.output ?? rule.output * 2,
        cacheRead: rule.long?.cacheRead ?? rule.cacheRead * 2,
        cacheWrite: rule.long?.cacheWrite ?? rule.cacheWrite * 2,
      };
      state.openRules.add(rule.key);
    } else {
      delete rule.long;
    }
    persistSettings();
    renderPrices();
    scheduleRefresh();
  });

  /* off-peak */
  const offToggle = checkboxRow(t().offPeak, Boolean(rule.offPeak));
  body.append(offToggle.row);
  if (rule.offPeak) {
    const box = el('div', 'extra');
    const timeRow = el('div', 'time-row');
    const start = timeInput(rule.offPeak.start);
    start.addEventListener('input', () => {
      rule.offPeak.start = start.value || '00:30';
      scheduleSave();
      scheduleRefresh();
    });
    const end = timeInput(rule.offPeak.end);
    end.addEventListener('input', () => {
      rule.offPeak.end = end.value || '08:30';
      scheduleSave();
      scheduleRefresh();
    });
    timeRow.append(
      el('span', 'time-label', `${t().valley} ${t().localTime}`),
      start,
      el('span', 'time-dash', '–'),
      end,
    );
    box.append(timeRow);

    const weekend = checkboxRow(t().weekendValley, Boolean(rule.offPeak.weekend));
    weekend.input.addEventListener('change', () => {
      rule.offPeak.weekend = weekend.input.checked;
      scheduleSave();
      scheduleRefresh();
    });
    box.append(weekend.row);

    const holiday = checkboxRow(t().holidayValley, Boolean(rule.offPeak.holidayMode));
    holiday.input.addEventListener('change', () => {
      rule.offPeak.holidayMode = holiday.input.checked;
      if (!holiday.input.checked) rule.offPeak.holidays = [];
      persistSettings();
      renderPrices();
      scheduleRefresh();
    });
    box.append(holiday.row);
    if (rule.offPeak.holidayMode) {
      const holidayInput = el('input', 'holiday-input');
      holidayInput.type = 'text';
      holidayInput.spellcheck = false;
      holidayInput.autocomplete = 'off';
      holidayInput.placeholder = '2026-10-01, 2026-10-02';
      holidayInput.value = (rule.offPeak.holidays || []).join(', ');
      holidayInput.addEventListener('input', () => {
        rule.offPeak.holidays = sanitizeHolidays(holidayInput.value);
        scheduleSave();
        scheduleRefresh();
      });
      box.append(holidayInput, el('p', 'hint', t().holidayHint));
    }

    const offGrid = el('div', 'grid');
    offGrid.append(
      priceField(rule.offPeak, 'input', t().priceInput),
      priceField(rule.offPeak, 'output', t().priceOutput),
      priceField(rule.offPeak, 'cacheRead', t().priceCacheRead),
      priceField(rule.offPeak, 'cacheWrite', t().priceCacheWrite),
    );
    box.append(offGrid);
    body.append(box);
  }
  offToggle.input.addEventListener('change', () => {
    if (offToggle.input.checked) {
      rule.offPeak = {
        start: rule.offPeak?.start || '00:30',
        end: rule.offPeak?.end || '08:30',
        weekend: rule.offPeak?.weekend === true,
        holidayMode: rule.offPeak?.holidayMode === true,
        holidays: rule.offPeak?.holidays || [],
        input: rule.offPeak?.input ?? roundPrice(rule.input * 0.5),
        output: rule.offPeak?.output ?? roundPrice(rule.output * 0.5),
        cacheRead: rule.offPeak?.cacheRead ?? roundPrice(rule.cacheRead * 0.5),
        cacheWrite: rule.offPeak?.cacheWrite ?? roundPrice(rule.cacheWrite * 0.5),
      };
      state.openRules.add(rule.key);
    } else {
      delete rule.offPeak;
    }
    persistSettings();
    renderPrices();
    scheduleRefresh();
  });

  const actions = el('div', 'rule-actions');
  const remove = el('button', 'ghost small danger', t().remove);
  remove.type = 'button';
  remove.addEventListener('click', () => {
    state.settings.rules = state.settings.rules.filter((item) => item.key !== rule.key);
    state.openRules.delete(rule.key);
    persistNow();
    renderPrices();
    void refresh({ quiet: true });
  });
  actions.append(remove);
  body.append(actions);

  return body;
}

function roundPrice(value) {
  return Math.round(value * 10000) / 10000;
}

function priceField(target, field, label) {
  const wrap = el('label', 'field');
  wrap.append(el('span', '', label));
  const input = el('input');
  input.type = 'number';
  input.min = '0';
  input.step = 'any';
  input.inputMode = 'decimal';
  input.value = target[field] === 0 ? '0' : String(target[field] ?? 0);
  input.addEventListener('input', () => {
    target[field] = sanitizeNumber(input.value);
    scheduleSave();
    scheduleRefresh();
  });
  wrap.append(input);
  return wrap;
}

function checkboxRow(label, checked) {
  const row = el('label', 'check-row');
  const input = el('input');
  input.type = 'checkbox';
  input.checked = checked;
  row.append(input, el('span', '', label));
  return { row, input };
}

function timeInput(value) {
  const input = el('input', 'time-input');
  input.type = 'time';
  input.step = '60';
  input.value = value || '00:30';
  return input;
}

function addRule(key, open = true) {
  const existing = state.settings.rules.find((rule) => rule.key === key);
  if (existing) {
    if (open) {
      state.openRules.add(key);
      renderPrices();
    }
    return;
  }
  const fallback = matchRuleFor(key, state.settings.rules).rule;
  const rule = {
    key,
    input: fallback?.input ?? 0,
    output: fallback?.output ?? 0,
    cacheRead: fallback?.cacheRead ?? 0,
    cacheWrite: fallback?.cacheWrite ?? 0,
  };
  state.settings.rules.push(rule);
  state.openRules.add(key);
  persistNow();
  renderPrices();
}

function scheduleSave() {
  persistSettings();
}

/* --------------------------------------------------------------------- boot */

async function boot() {
  await loadSettings();
  applyCopy();
  renderAll();

  host.onSession((session) => {
    const previous = state.session?.id ?? null;
    state.session = session;
    if ((session?.id ?? null) !== previous) void refresh({ quiet: true });
  });

  host.onSessionLifecycle((event) => {
    if (event?.phase === 'completed' || event?.phase === 'failure') {
      void refresh({ quiet: true });
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && Date.now() - state.updatedAt > 20000) {
      void refresh({ quiet: true });
    }
  });

  await refresh();

  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(() => {
    if (document.visibilityState === 'hidden' || state.refreshing) return;
    if (Date.now() - state.updatedAt < 20000) return;
    void refresh({ quiet: true });
  }, 20000);
}

host.onReady((ctx) => {
  const lang = /^zh/i.test(ctx.locale || '') ? 'zh' : 'en';
  applyHostReady(ctx, document.documentElement);
  state.session = ctx.session || null;

  if (!state.mounted) {
    state.mounted = true;
    state.lang = lang;
    mount();
    void boot();
    return;
  }

  if (lang !== state.lang) {
    state.lang = lang;
    applyCopy();
    renderAll();
  }
});

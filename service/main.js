"use strict";

// src/service.js
var http = require("node:http");
var fs = require("node:fs");
var os = require("node:os");
var path = require("node:path");
var PORT = Number(process.env.OPENCHAMBER_SERVICE_PORT);
var TOKEN = process.env.OPENCHAMBER_SERVICE_TOKEN || "";
var MAX_BODY_BYTES = 512 * 1024;
var CACHE_MS = 3e3;
var MAX_RULES = 200;
var WINDOWS = ["session", "today", "week", "month", "all"];
var DatabaseSync = null;
try {
  ({ DatabaseSync } = require("node:sqlite"));
} catch {
  DatabaseSync = null;
}
function dataDirs() {
  const home = os.homedir();
  const dirs = [];
  if (process.env.OPENCODE_DATA_DIR && process.env.OPENCODE_DATA_DIR.trim()) {
    dirs.push(path.join(process.env.OPENCODE_DATA_DIR.trim(), "opencode.db"));
    dirs.push(process.env.OPENCODE_DATA_DIR.trim());
  }
  if (process.env.XDG_DATA_HOME && process.env.XDG_DATA_HOME.trim()) {
    dirs.push(path.join(process.env.XDG_DATA_HOME.trim(), "opencode", "opencode.db"));
  }
  dirs.push(path.join(home, ".local", "share", "opencode", "opencode.db"));
  dirs.push(path.join(home, "Library", "Application Support", "opencode", "opencode.db"));
  dirs.push(path.join(home, ".opencode", "opencode.db"));
  return dirs;
}
function dbCandidates(preferred) {
  const list = [];
  if (typeof preferred === "string" && preferred.trim() && path.isAbsolute(preferred.trim())) {
    const value = preferred.trim();
    list.push(value.endsWith(".db") ? value : path.join(value, "opencode.db"));
  }
  list.push(...dataDirs());
  return [...new Set(list)];
}
function readProviderNames() {
  const names = {};
  const home = os.homedir();
  const candidates = [];
  const configured = process.env.OPENCODE_CONFIG;
  if (configured && configured.trim()) {
    const value = configured.trim();
    candidates.push(value);
    candidates.push(path.join(value, "opencode.json"));
  }
  if (process.env.XDG_CONFIG_HOME && process.env.XDG_CONFIG_HOME.trim()) {
    candidates.push(path.join(process.env.XDG_CONFIG_HOME.trim(), "opencode", "opencode.json"));
  }
  candidates.push(path.join(home, ".config", "opencode", "opencode.json"));
  candidates.push(path.join(home, ".config", "opencode", "opencode.jsonc"));
  candidates.push(path.join(home, "Library", "Application Support", "opencode", "opencode.json"));
  for (const candidate of candidates) {
    try {
      if (!fs.existsSync(candidate) || !fs.statSync(candidate).isFile()) continue;
      const data = JSON.parse(fs.readFileSync(candidate, "utf8"));
      const providers = data?.providers || data?.provider || {};
      for (const [id, value] of Object.entries(providers)) {
        const name = typeof value?.name === "string" ? value.name.trim() : "";
        if (id && name) names[id] = name;
      }
    } catch {
    }
  }
  return names;
}
function findDatabase(preferred) {
  const tried = dbCandidates(preferred);
  for (const candidate of tried) {
    try {
      if (fs.statSync(candidate).isFile()) return { path: candidate, tried };
    } catch {
    }
  }
  return { path: null, tried };
}
var cache = {
  dbPath: null,
  stamp: "",
  readAt: 0,
  records: [],
  sessions: [],
  error: null
};
function stampOf(dbPath) {
  const parts = [];
  for (const file of [dbPath, `${dbPath}-wal`, `${dbPath}-shm`]) {
    try {
      const stat = fs.statSync(file);
      parts.push(`${file}:${stat.mtimeMs}:${stat.size}`);
    } catch {
      parts.push(`${file}:-`);
    }
  }
  return parts.join("|");
}
function loadDatabase(dbPath) {
  const stamp = stampOf(dbPath);
  if (cache.dbPath === dbPath && cache.stamp === stamp && Date.now() - cache.readAt < CACHE_MS) {
    return cache;
  }
  if (!DatabaseSync) {
    return {
      ...cache,
      dbPath,
      stamp,
      readAt: Date.now(),
      error: "sqlite-unavailable"
    };
  }
  let db = null;
  try {
    db = new DatabaseSync(dbPath, { readOnly: true });
    db.exec("PRAGMA busy_timeout = 2500");
    const rows = db.prepare(
      `SELECT
           m.session_id              AS sessionId,
           m.time_created            AS createdAt,
           json_extract(m.data, '$.time.completed')       AS completedAt,
           json_extract(m.data, '$.model.providerID')     AS providerID,
           json_extract(m.data, '$.model.id')             AS modelID,
           json_extract(m.data, '$.tokens.input')         AS input,
           json_extract(m.data, '$.tokens.output')        AS output,
           json_extract(m.data, '$.tokens.reasoning')     AS reasoning,
           json_extract(m.data, '$.tokens.cache.read')    AS cacheRead,
           json_extract(m.data, '$.tokens.cache.write')   AS cacheWrite
         FROM session_message m
         WHERE m.type = 'assistant'
           AND json_extract(m.data, '$.tokens') IS NOT NULL`
    ).all();
    const sessions = db.prepare(
      `SELECT id, parent_id AS parentId, title, directory, time_created AS createdAt
         FROM session_v2`
    ).all();
    const records = [];
    for (const row of rows) {
      const input = num(row.input);
      const output = num(row.output);
      const reasoning = num(row.reasoning);
      const cacheRead = num(row.cacheRead);
      const cacheWrite = num(row.cacheWrite);
      if (input + output + reasoning + cacheRead + cacheWrite <= 0) continue;
      const ts = num(row.completedAt) || num(row.createdAt);
      if (!ts) continue;
      records.push({
        sessionId: String(row.sessionId || ""),
        ts,
        providerID: row.providerID ? String(row.providerID) : "unknown",
        modelID: row.modelID ? String(row.modelID) : "unknown",
        input,
        output,
        reasoning,
        cacheRead,
        cacheWrite
      });
    }
    cache.dbPath = dbPath;
    cache.stamp = stamp;
    cache.readAt = Date.now();
    cache.records = records;
    cache.sessions = sessions.map((item) => ({
      id: String(item.id || ""),
      parentId: item.parentId ? String(item.parentId) : null,
      title: item.title ? String(item.title) : "",
      directory: item.directory ? String(item.directory) : ""
    }));
    cache.error = null;
    return cache;
  } catch (error) {
    return {
      ...cache,
      dbPath,
      stamp,
      readAt: Date.now(),
      error: "db-read-failed",
      errorDetail: String(error && error.message || error)
    };
  } finally {
    try {
      db?.close();
    } catch {
    }
  }
}
function num(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}
function pad(value) {
  return String(value).padStart(2, "0");
}
function addDays(dayKey, delta) {
  const [year, month, day] = dayKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + delta));
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;
}
function makeLocalParts(timeZone) {
  let formatter;
  let zone = typeof timeZone === "string" && timeZone.trim() ? timeZone.trim() : "UTC";
  try {
    formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    });
  } catch {
    zone = "UTC";
    formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23"
    });
  }
  return (ts) => {
    const parts = formatter.formatToParts(new Date(ts));
    let year = 0;
    let month = 0;
    let day = 0;
    let hour = 0;
    let minute = 0;
    for (const part of parts) {
      if (part.type === "year") year = Number(part.value);
      else if (part.type === "month") month = Number(part.value);
      else if (part.type === "day") day = Number(part.value);
      else if (part.type === "hour") hour = Number(part.value);
      else if (part.type === "minute") minute = Number(part.value);
    }
    return {
      day: `${year}-${pad(month)}-${pad(day)}`,
      minutes: hour % 24 * 60 + minute
    };
  };
}
function toMinutes(value, fallback) {
  if (typeof value !== "string") return fallback;
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return fallback;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return fallback;
  return hour * 60 + minute;
}
function inWindow(minutes, start, end) {
  if (start === end) return true;
  if (start < end) return minutes >= start && minutes < end;
  return minutes >= start || minutes < end;
}
function sanitizePrice(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    input: num(raw.input),
    output: num(raw.output),
    cacheRead: num(raw.cacheRead),
    cacheWrite: num(raw.cacheWrite)
  };
}
function sanitizeTier(raw) {
  const prices = sanitizePrice(raw);
  if (!prices) return null;
  const over = num(raw.over);
  return { over, ...prices };
}
function sanitizeHolidays(input) {
  if (!Array.isArray(input)) return [];
  const days = [];
  const seen = /* @__PURE__ */ new Set();
  for (const value of input.slice(0, 400)) {
    if (typeof value !== "string") continue;
    const day = value.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || seen.has(day)) continue;
    seen.add(day);
    days.push(day);
  }
  return days;
}
function sanitizeRules(input) {
  if (!input || !Array.isArray(input.rules)) return [];
  const rules = [];
  for (const raw of input.rules.slice(0, MAX_RULES)) {
    if (!raw || typeof raw !== "object") continue;
    const key = typeof raw.key === "string" ? raw.key.trim() : "";
    if (!key) continue;
    const prices = sanitizePrice(raw);
    if (!prices) continue;
    const rule = { key, ...prices };
    if (raw.long && typeof raw.long === "object") {
      const tier = sanitizeTier(raw.long);
      if (tier && tier.over > 0) rule.long = tier;
    }
    if (raw.offPeak && typeof raw.offPeak === "object") {
      const start = toMinutes(raw.offPeak.start, null);
      const end = toMinutes(raw.offPeak.end, null);
      const offPrices = sanitizePrice(raw.offPeak);
      if (start !== null && end !== null && offPrices) {
        rule.offPeak = {
          start,
          end,
          startLabel: raw.offPeak.start,
          endLabel: raw.offPeak.end,
          weekend: raw.offPeak.weekend === true,
          holidays: sanitizeHolidays(raw.offPeak.holidays),
          ...offPrices
        };
      }
    }
    rules.push(rule);
  }
  return rules;
}
function ruleIndex(rules) {
  const map = /* @__PURE__ */ new Map();
  for (const rule of rules) {
    if (!map.has(rule.key)) map.set(rule.key, rule);
  }
  return map;
}
function ruleFor(index, providerID, modelID) {
  return index.get(`${providerID}/${modelID}`) || index.get(modelID) || index.get(`${providerID}/*`) || index.get("*") || null;
}
function isWeekend(dayKey) {
  const [year, month, day] = dayKey.split("-").map(Number);
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  return weekday === 0 || weekday === 6;
}
function costOf(record, rule, localTime) {
  const prompt = record.input + record.cacheRead + record.cacheWrite;
  let prices = rule;
  if (rule.long && prompt >= rule.long.over) {
    prices = rule.long;
  } else if (rule.offPeak) {
    const offPeak = inWindow(localTime.minutes, rule.offPeak.start, rule.offPeak.end) || rule.offPeak.weekend && isWeekend(localTime.day) || (rule.offPeak.holidays?.includes(localTime.day) ?? false);
    if (offPeak) prices = rule.offPeak;
  }
  const cost = (record.input * prices.input + record.output * prices.output + record.reasoning * prices.output + record.cacheRead * prices.cacheRead + record.cacheWrite * prices.cacheWrite) / 1e6;
  return Number.isFinite(cost) && cost > 0 ? cost : 0;
}
function emptyBucket() {
  return {
    cost: 0,
    steps: 0,
    tokens: { input: 0, output: 0, reasoning: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
    models: /* @__PURE__ */ new Map()
  };
}
function addToBucket(bucket, record, cost, priced) {
  bucket.cost += cost;
  bucket.steps += 1;
  const t = bucket.tokens;
  t.input += record.input;
  t.output += record.output;
  t.reasoning += record.reasoning;
  t.cacheRead += record.cacheRead;
  t.cacheWrite += record.cacheWrite;
  t.total += record.input + record.output + record.reasoning + record.cacheRead + record.cacheWrite;
  const key = `${record.providerID}/${record.modelID}`;
  let model = bucket.models.get(key);
  if (!model) {
    model = {
      key,
      providerID: record.providerID,
      modelID: record.modelID,
      cost: 0,
      steps: 0,
      priced,
      tokens: { input: 0, output: 0, reasoning: 0, cacheRead: 0, cacheWrite: 0, total: 0 }
    };
    bucket.models.set(key, model);
  }
  model.cost += cost;
  model.steps += 1;
  model.tokens.input += record.input;
  model.tokens.output += record.output;
  model.tokens.reasoning += record.reasoning;
  model.tokens.cacheRead += record.cacheRead;
  model.tokens.cacheWrite += record.cacheWrite;
  model.tokens.total += record.input + record.output + record.reasoning + record.cacheRead + record.cacheWrite;
}
function finishBucket(bucket) {
  const t = bucket.tokens;
  const denominator = t.input + t.cacheRead;
  return {
    cost: round(bucket.cost, 8),
    steps: bucket.steps,
    tokens: t,
    cacheRate: denominator > 0 ? t.cacheRead / denominator : 0,
    models: [...bucket.models.values()].map((model) => ({ ...model, cost: round(model.cost, 8) })).sort((a, b) => b.cost - a.cost || b.tokens.total - a.tokens.total)
  };
}
function round(value, digits) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}
function sessionFamily(sessions, sessionId) {
  const ids = /* @__PURE__ */ new Set();
  if (!sessionId) return ids;
  ids.add(sessionId);
  const children = /* @__PURE__ */ new Map();
  for (const session of sessions) {
    if (!session.parentId) continue;
    const list = children.get(session.parentId) || [];
    list.push(session.id);
    children.set(session.parentId, list);
  }
  const queue = [sessionId];
  while (queue.length) {
    const current = queue.pop();
    for (const child of children.get(current) || []) {
      if (ids.has(child)) continue;
      ids.add(child);
      queue.push(child);
    }
  }
  return ids;
}
function buildStats({ records, sessions, now, timeZone, sessionId, rules, resetAt, dbInfo }) {
  const local = makeLocalParts(timeZone);
  const today = local(now).day;
  const weekStart = addDays(today, -6);
  const monthStart = addDays(today, -29);
  const family = sessionFamily(sessions, sessionId);
  const index = ruleIndex(rules);
  const reset = num(resetAt);
  const buckets = Object.fromEntries(WINDOWS.map((name) => [name, emptyBucket()]));
  const unpriced = /* @__PURE__ */ new Map();
  const daily = /* @__PURE__ */ new Map();
  const dayKeys = [];
  for (let i = 29; i >= 0; i -= 1) dayKeys.push(addDays(today, -i));
  for (const key of dayKeys) daily.set(key, { day: key, cost: 0, tokens: 0 });
  let counted = 0;
  let lifetimeCost = 0;
  const lifetimeProviders = /* @__PURE__ */ new Map();
  for (const record of records) {
    const localTime = local(record.ts);
    const rule = ruleFor(index, record.providerID, record.modelID);
    const cost = rule ? costOf(record, rule, localTime) : 0;
    const tokenTotal = record.input + record.output + record.reasoning + record.cacheRead + record.cacheWrite;
    lifetimeCost += cost;
    const lifetime = lifetimeProviders.get(record.providerID) || {
      providerID: record.providerID,
      cost: 0,
      steps: 0,
      tokens: 0
    };
    lifetime.cost += cost;
    lifetime.steps += 1;
    lifetime.tokens += tokenTotal;
    lifetimeProviders.set(record.providerID, lifetime);
    if (reset && record.ts < reset) continue;
    counted += 1;
    addToBucket(buckets.all, record, cost, Boolean(rule));
    if (localTime.day >= monthStart) addToBucket(buckets.month, record, cost, Boolean(rule));
    if (localTime.day >= weekStart) addToBucket(buckets.week, record, cost, Boolean(rule));
    if (localTime.day === today) addToBucket(buckets.today, record, cost, Boolean(rule));
    if (sessionId && family.has(record.sessionId)) {
      addToBucket(buckets.session, record, cost, Boolean(rule));
    }
    if (!rule) {
      const key = `${record.providerID}/${record.modelID}`;
      const entry = unpriced.get(key) || {
        key,
        providerID: record.providerID,
        modelID: record.modelID,
        tokens: 0,
        steps: 0
      };
      entry.tokens += record.input + record.output + record.reasoning + record.cacheRead + record.cacheWrite;
      entry.steps += 1;
      unpriced.set(key, entry);
    }
    const day = daily.get(localTime.day);
    if (day) {
      day.cost += cost;
      day.tokens += record.input + record.output + record.reasoning + record.cacheRead + record.cacheWrite;
    }
  }
  const current = sessions.find((item) => item.id === sessionId) || null;
  return {
    generatedAt: Date.now(),
    timeZone,
    sessionId: sessionId || null,
    session: current ? { id: current.id, title: current.title, directory: current.directory, found: true } : { id: sessionId || null, title: "", directory: "", found: false },
    windows: Object.fromEntries(WINDOWS.map((name) => [name, finishBucket(buckets[name])])),
    days: [...daily.values()].map((item) => ({ ...item, cost: round(item.cost, 8) })),
    models: finishBucket(buckets.all).models,
    lifetime: {
      cost: round(lifetimeCost, 8),
      providers: [...lifetimeProviders.values()].map((item) => ({ ...item, cost: round(item.cost, 8) })).sort((a, b) => b.cost - a.cost || b.tokens - a.tokens)
    },
    unpriced: [...unpriced.values()].sort((a, b) => b.tokens - a.tokens),
    db: {
      path: dbInfo.path,
      messages: counted,
      readAt: dbInfo.readAt
    }
  };
}
function send(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "content-length": Buffer.byteLength(payload)
  });
  res.end(payload);
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error("body too large"), { code: "BODY_TOO_LARGE" }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}
function parseJson(text) {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
var server = http.createServer(async (req, res) => {
  try {
    if (!TOKEN || req.headers.authorization !== `Bearer ${TOKEN}`) {
      return send(res, 401, { ok: false, error: "unauthorized" });
    }
    const url = new URL(req.url || "/", "http://127.0.0.1");
    if (req.method === "GET" && url.pathname === "/health") {
      return send(res, 200, { ok: true, pid: process.pid });
    }
    if (req.method === "POST" && url.pathname === "/stats") {
      const raw = await readBody(req);
      const payload = parseJson(raw);
      if (!payload || typeof payload !== "object") {
        return send(res, 200, { ok: false, error: "bad-request" });
      }
      const found = findDatabase(payload.dbPath);
      if (!found.path) {
        return send(res, 200, { ok: false, error: "db-missing", tried: found.tried });
      }
      const loaded = loadDatabase(found.path);
      if (loaded.error) {
        return send(res, 200, {
          ok: false,
          error: loaded.error,
          detail: loaded.errorDetail || null,
          path: found.path
        });
      }
      const now = Number(payload.now) > 0 ? Number(payload.now) : Date.now();
      const timeZone = typeof payload.timeZone === "string" ? payload.timeZone : "UTC";
      const sessionId = typeof payload.sessionId === "string" && payload.sessionId ? payload.sessionId : null;
      const rules = sanitizeRules(payload.prices);
      const resetAt = Number(payload.resetAt) > 0 ? Number(payload.resetAt) : 0;
      const stats = buildStats({
        records: loaded.records,
        sessions: loaded.sessions,
        now,
        timeZone,
        sessionId,
        rules,
        resetAt,
        dbInfo: { path: found.path, readAt: loaded.readAt }
      });
      return send(res, 200, { ok: true, ...stats, providerNames: readProviderNames() });
    }
    return send(res, 404, { ok: false, error: "not-found" });
  } catch (error) {
    if (error && error.code === "BODY_TOO_LARGE") {
      return send(res, 413, { ok: false, error: "body-too-large" });
    }
    return send(res, 500, {
      ok: false,
      error: "internal",
      detail: String(error && error.message || error)
    });
  }
});
server.on("error", (error) => {
  console.error("[token-usage] server error:", error);
  process.exit(1);
});
function shutdown() {
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 1500).unref();
}
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
server.listen(PORT, "127.0.0.1", () => {
  console.log(`[token-usage] listening on 127.0.0.1:${PORT}`);
});

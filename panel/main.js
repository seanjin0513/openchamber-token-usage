(() => {
  // node_modules/@openchamber/sdk/dist/api-version.js
  var OPENCHAMBER_SDK_CHANNEL = "openchamber.sdk";
  var OPENCHAMBER_SDK_API_VERSION = 1;

  // node_modules/@openchamber/sdk/dist/scrollbar-style.js
  var GUEST_SCROLLING_ATTRIBUTE = "data-oc-scrolling";
  var GUEST_SCROLLBAR_CSS = `
:root {
  /* Quiet at rest like the app's own thumbs; hover gives a clear grab target. */
  --oc-scrollbar-thumb: color-mix(in srgb, var(--oc-muted, currentColor) 18%, transparent);
  --oc-scrollbar-thumb-hover: color-mix(in srgb, var(--oc-muted, currentColor) 36%, transparent);
  scrollbar-gutter: stable;
}
* {
  scrollbar-width: thin;
  scrollbar-color: transparent transparent;
}
:hover, [${GUEST_SCROLLING_ATTRIBUTE}] {
  scrollbar-color: var(--oc-scrollbar-thumb) transparent;
}
/* Chromium's standard scrollbar properties otherwise override its pseudo-elements. */
@supports selector(::-webkit-scrollbar) {
  *, :hover, [${GUEST_SCROLLING_ATTRIBUTE}] { scrollbar-width: auto; scrollbar-color: auto; }
  ::-webkit-scrollbar { width: 6px; height: 6px; background: transparent; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 999px;
    min-width: 24px;
    min-height: 24px;
  }
  :hover::-webkit-scrollbar-thumb, [${GUEST_SCROLLING_ATTRIBUTE}]::-webkit-scrollbar-thumb { background: var(--oc-scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--oc-scrollbar-thumb-hover); }
  ::-webkit-scrollbar-corner { background: transparent; }
  ::-webkit-scrollbar-button { display: none; width: 0; height: 0; }
}
@media (forced-colors: active) {
  *, :hover, [${GUEST_SCROLLING_ATTRIBUTE}] { scrollbar-color: auto; }
  ::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb:hover { background: CanvasText; }
}
`;
  function installGuestScrollbarActivity(doc) {
    const root = doc.documentElement;
    if (root.hasAttribute("data-oc-scrollbar-activity"))
      return;
    root.setAttribute("data-oc-scrollbar-activity", "");
    const timers = /* @__PURE__ */ new WeakMap();
    doc.addEventListener("scroll", (event) => {
      const target = event.target === doc ? root : event.target;
      if (!(target instanceof Element))
        return;
      if (!target.hasAttribute("data-oc-scrolling"))
        target.setAttribute("data-oc-scrolling", "");
      const pending = timers.get(target);
      if (pending !== void 0)
        clearTimeout(pending);
      timers.set(target, setTimeout(() => {
        timers.delete(target);
        target.removeAttribute("data-oc-scrolling");
      }, 1e3));
    }, { capture: true, passive: true });
  }
  var GUEST_SCROLLBAR_SCRIPT = `(${installGuestScrollbarActivity.toString()})(document);`;

  // node_modules/@openchamber/sdk/dist/workspace.js
  var GUEST_STORAGE_KEY_MAX = 128;
  var GUEST_STORAGE_VALUE_BYTES = 65536;

  // node_modules/@openchamber/sdk/dist/shells.js
  var GUEST_SHELL_ID_MAX = 128;
  var GUEST_SHELL_OUTPUT_TAIL_MAX = 65536;

  // node_modules/@openchamber/sdk/dist/status-controls.js
  var GUEST_STATUS_CONTROLS_MAX = 4;
  var GUEST_STATUS_CONTROL_ID = /^[a-z][a-z0-9-]{0,39}$/;
  var GUEST_STATUS_CONTROL_LABEL_MAX = 60;
  var GUEST_STATUS_CONTROL_OPTIONS_MAX = 16;
  var GUEST_STATUS_CONTROL_VALUE_MAX = 80;
  var isControlObject = (value) => Object(value) === value && !Array.isArray(value);
  var hasOnlyKeys = (value, keys) => Object.keys(value).every((key) => keys.includes(key));
  var isLabel = (value) => String(value) === value && value.length >= 1 && value.length <= GUEST_STATUS_CONTROL_LABEL_MAX;
  var isValue = (value) => String(value) === value && value.length >= 1 && value.length <= GUEST_STATUS_CONTROL_VALUE_MAX;
  var isGuestStatusControls = (controls) => {
    if (!Array.isArray(controls) || controls.length > GUEST_STATUS_CONTROLS_MAX)
      return false;
    const ids = /* @__PURE__ */ new Set();
    for (const control of controls) {
      if (!isControlObject(control) || !GUEST_STATUS_CONTROL_ID.test(control.id) || !isLabel(control.label))
        return false;
      if (control.disabled !== void 0 && control.disabled !== true && control.disabled !== false)
        return false;
      if (ids.has(control.id))
        return false;
      ids.add(control.id);
      if (control.kind === "button") {
        if (!hasOnlyKeys(control, ["kind", "id", "label", "disabled"]))
          return false;
        continue;
      }
      if (control.kind !== "select" || !hasOnlyKeys(control, ["kind", "id", "label", "value", "options", "disabled"]))
        return false;
      if (!isValue(control.value) || !Array.isArray(control.options) || control.options.length < 1 || control.options.length > GUEST_STATUS_CONTROL_OPTIONS_MAX)
        return false;
      const values = /* @__PURE__ */ new Set();
      for (const option of control.options) {
        if (!isControlObject(option) || !hasOnlyKeys(option, ["value", "label"]) || !isValue(option.value) || !isLabel(option.label) || values.has(option.value))
          return false;
        values.add(option.value);
      }
      if (!values.has(control.value))
        return false;
    }
    return true;
  };

  // node_modules/@openchamber/sdk/dist/manifest.js
  var TRACKER_URL_TOKENS = ["{id}", "{segment}", "{segments+}"];
  var TRACKER_URL_TOKEN_SET = new Set(TRACKER_URL_TOKENS);

  // node_modules/@openchamber/sdk/dist/session-events.js
  var GUEST_SESSION_EVENT_TYPES = ["turn-finished", "turn-failed", "permission-asked", "question-asked"];
  var SESSION_EVENTS_IDLE_MS = 10 * 6e4;
  var EVENT_TYPES = new Set(GUEST_SESSION_EVENT_TYPES);

  // node_modules/@openchamber/sdk/dist/file-editor.js
  var GUEST_FILE_EDITOR_CONTENT_MAX = 2e7;
  var GUEST_FILE_EDITOR_VERSION_MAX = 256;
  var fileEditorPayloadSize = (value) => "bytes" in value ? value.bytes.byteLength : value.content.length;
  var sameFileEditorDocument = (left, right) => {
    if (left.path !== right.path || left.readOnly !== right.readOnly)
      return false;
    if (left.encoding === "text" || right.encoding === "text") {
      return left.encoding === "text" && right.encoding === "text" && left.content === right.content;
    }
    if (left.bytes.byteLength !== right.bytes.byteLength)
      return false;
    for (let index = 0; index < left.bytes.byteLength; index += 1) {
      if (left.bytes[index] !== right.bytes[index])
        return false;
    }
    return true;
  };

  // node_modules/@openchamber/sdk/dist/popover.js
  var GUEST_POPOVER_ID = /^[A-Za-z0-9_-]{1,80}$/;
  var GUEST_POPOVER_COORDINATE_MAX = 1e5;
  var GUEST_POPOVER_WIDTH_MIN = 160;
  var GUEST_POPOVER_WIDTH_MAX = 640;
  var GUEST_POPOVER_HEIGHT_MIN = 48;
  var GUEST_POPOVER_HEIGHT_MAX = 480;
  var GUEST_POPOVER_DATA_MAX = 16e3;
  var GUEST_POPOVER_DATA_DEPTH_MAX = 32;
  var GUEST_POPOVER_SIDES = ["left", "right", "top", "bottom"];
  var hasBoundedJsonTree = (value, depth = 0, budget = { remaining: GUEST_POPOVER_DATA_MAX }) => {
    if (--budget.remaining < 0 || depth >= GUEST_POPOVER_DATA_DEPTH_MAX)
      return false;
    if (value === null)
      return true;
    const children = Array.isArray(value) ? value : Object(value) === value ? Object.values(value) : [];
    for (const item of children) {
      if (!hasBoundedJsonTree(item, depth + 1, budget))
        return false;
    }
    return true;
  };
  var isFiniteJson = (value) => {
    if (value === null || value === true || value === false)
      return true;
    if (Array.isArray(value))
      return Object.keys(value).every((key) => /^(0|[1-9]\d*)$/.test(key) && Number(key) < value.length) && value.every(isFiniteJson);
    if (Object(value) === value) {
      const prototype = Object.getPrototypeOf(value);
      return (prototype === null || prototype === Object.prototype) && Object.values(value).every(isFiniteJson);
    }
    return String(value) === value || Number.isFinite(value);
  };
  var isGuestPopoverRequest = (request) => {
    try {
      if (String(request.id) !== request.id || !GUEST_POPOVER_ID.test(request.id) || !Number.isFinite(request.anchor.x) || Math.abs(request.anchor.x) > GUEST_POPOVER_COORDINATE_MAX || !Number.isFinite(request.anchor.y) || Math.abs(request.anchor.y) > GUEST_POPOVER_COORDINATE_MAX || !Number.isFinite(request.anchor.width) || !Number.isFinite(request.anchor.height) || request.anchor.width <= 0 || request.anchor.height <= 0 || request.anchor.width > GUEST_POPOVER_COORDINATE_MAX || request.anchor.height > GUEST_POPOVER_COORDINATE_MAX || !Number.isInteger(request.width) || request.width < GUEST_POPOVER_WIDTH_MIN || request.width > GUEST_POPOVER_WIDTH_MAX || !Number.isInteger(request.height) || request.height < GUEST_POPOVER_HEIGHT_MIN || request.height > GUEST_POPOVER_HEIGHT_MAX || request.side !== void 0 && !GUEST_POPOVER_SIDES.includes(request.side) || request.focus !== void 0 && request.focus !== true && request.focus !== false || !hasBoundedJsonTree(request.data) || !isFiniteJson(request.data))
        return false;
      return JSON.stringify(request.data).length <= GUEST_POPOVER_DATA_MAX;
    } catch {
      return false;
    }
  };

  // node_modules/@openchamber/sdk/dist/contract.js
  var GUEST_FILE_STAT_KINDS = ["file", "directory", "other", "missing"];
  var isStartSessionResult = (value) => Boolean(value && "sessionId" in value);
  var isPromptResult = (value) => Boolean(value && "sent" in value && !("sessionId" in value));
  var GUEST_COMMIT_SHA = /^[0-9a-f]{7,64}$/i;
  var isGuestCommitSha = (value) => GUEST_COMMIT_SHA.test(value);
  var GUEST_TOAST_MAX = 500;
  var GUEST_CLIPBOARD_TEXT_MAX = 32e3;
  var GUEST_COMPOSE_TEXT_MAX = 16e3;
  var GUEST_ATTACH_ID_MAX = 128;
  var GUEST_ATTACH_TITLE_MAX = 200;
  var GUEST_ATTACH_URL_MAX = 2e3;
  var GUEST_ATTACH_TEXT_MAX = 16e3;
  var GUEST_ATTACH_AUTHOR_MAX = 80;
  var GUEST_ATTACH_BRANCH_MAX = 200;
  var GUEST_ATTACH_DATA_MAX = 16e3;
  var GUEST_REQUEST_PATH_MAX = 2e3;
  var GUEST_REQUEST_TIMEOUT_MS = 2e4;
  var GUEST_FILE_PATH_MAX = 1024;
  var GUEST_FILE_CONTENT_MAX = 2e6;
  var GUEST_GENERATE_PROMPT_MAX = 64e3;
  var GUEST_GENERATE_SYSTEM_MAX = 8e3;
  var GUEST_GENERATE_OUTPUT_TOKENS_MAX = 4e3;
  var GUEST_GENERATE_TIMEOUT_MS = 96e4;
  var GUEST_GENERATE_LATE_KEEP_MS = 60 * 6e4;
  var GUEST_BADGE_MAX = 999;
  var GUEST_FRAME_HEIGHT_MAX = 1e4;
  var GUEST_RESOLVE_ERROR_MAX = 500;
  var HOST_REQUEST_ERROR_CODES = [
    "HOST_UNAVAILABLE",
    "HOST_TIMEOUT",
    "HOST_REJECTED",
    "DISCONNECTED",
    "DISABLED",
    "BAD_PATH",
    "NO_INTEGRATION",
    "NO_SERVICE",
    "SERVICE_FAILED",
    "REQUEST_FAILED",
    "RESPONSE_TOO_LARGE",
    "NO_SESSION",
    "SESSION_BUSY",
    "NOT_GRANTED",
    "NO_DIRECTORY",
    "NOT_FOUND",
    "FILE_TOO_LARGE",
    "DENIED",
    "NO_MODEL",
    "MODEL_FAILED",
    "UNSUPPORTED"
  ];
  var SERVICE_STATUS_VALUES = ["stopped", "starting", "ready", "failed"];
  var hostRequestErrorCodeSet = new Set(HOST_REQUEST_ERROR_CODES);
  var isHostRequestErrorCode = (value) => hostRequestErrorCodeSet.has(value);
  var resolveHostRequestErrorCode = (value) => value && isHostRequestErrorCode(value) ? value : "HOST_REJECTED";
  var isJsonValue = (value) => {
    if (value === void 0)
      return false;
    if (value === null || value === true || value === false)
      return true;
    if (String(value) === value)
      return true;
    if (Number(value) === value)
      return Number.isFinite(value);
    if (Array.isArray(value))
      return value.every(isJsonValue);
    if (Object(value) === value)
      return Object.values(value).every(isJsonValue);
    return false;
  };
  var isAttachData = (value) => isJsonValue(value) && JSON.stringify(value).length <= GUEST_ATTACH_DATA_MAX;
  var clampBranch = (value) => value?.trim().slice(0, GUEST_ATTACH_BRANCH_MAX) ?? "";
  var clampAttachRequest = (request) => {
    const id = request.id.trim().slice(0, GUEST_ATTACH_ID_MAX);
    const title = request.title.trim().slice(0, GUEST_ATTACH_TITLE_MAX);
    const url = request.url.trim().slice(0, GUEST_ATTACH_URL_MAX);
    const text = request.text?.trim().slice(0, GUEST_ATTACH_TEXT_MAX);
    const author = request.author?.trim().slice(0, GUEST_ATTACH_AUTHOR_MAX);
    const kind = request.kind === "pull" ? "pull" : "issue";
    const next = {
      providerId: request.providerId.trim(),
      id,
      title: title || id,
      url,
      kind
    };
    if (text) {
      next.text = text;
    }
    if (author) {
      next.author = author;
    }
    if (kind === "pull") {
      const head = clampBranch(request.branches?.head);
      const base = clampBranch(request.branches?.base);
      if (head && base) {
        next.branches = { head, base };
      }
    }
    if (isAttachData(request.data)) {
      next.data = request.data;
    }
    return next;
  };
  var clampStartSessionRequest = (request) => {
    const next = clampAttachRequest(request);
    if (request.projectId)
      next.projectId = request.projectId;
    if (request.navigation)
      next.navigation = request.navigation;
    if (request.worktree) {
      next.worktree = request.worktree;
    }
    return next;
  };
  var clampPromptRequest = (request) => {
    const next = {
      text: request.text.trim().slice(0, GUEST_COMPOSE_TEXT_MAX)
    };
    if (request.send) {
      next.send = true;
    }
    return next;
  };
  var clampBadgeCount = (count) => {
    if (count === null || !Number.isFinite(count))
      return null;
    return Math.min(GUEST_BADGE_MAX, Math.max(0, Math.round(count)));
  };
  var clampFrameHeight = (height) => {
    if (!Number.isFinite(height))
      return 0;
    return Math.min(GUEST_FRAME_HEIGHT_MAX, Math.max(0, Math.ceil(height)));
  };
  var isGuestFilePath = (value) => value.length > 0 && value.length <= GUEST_FILE_PATH_MAX && !value.includes("\0") && !value.includes("\\");
  var isGuestRequestPath = (value) => {
    if (!value.startsWith("/") || value.includes("\0") || value.includes("\\") || value.includes("://")) {
      return false;
    }
    if (value.length > GUEST_REQUEST_PATH_MAX) {
      return false;
    }
    const segments = value.split("/");
    return !segments.some((segment) => segment === "." || segment === "..");
  };
  var serviceStatusSet = new Set(SERVICE_STATUS_VALUES);
  var isServiceStatusResult = (value) => Boolean(value && "status" in value && serviceStatusSet.has(String(value.status)) && !("body" in value));
  var isGuestRequestResult = (value) => Boolean(value && "status" in value && "body" in value && Number.isInteger(value.status));
  var isFileReadResult = (value) => Boolean(value && "content" in value && String(value.content) === value.content);
  var isFileWriteResult = (value) => Boolean(value && "written" in value && value.written === true);
  var isFileListResult = (value) => Boolean(value && "entries" in value && Array.isArray(value.entries));
  var fileStatKindSet = new Set(GUEST_FILE_STAT_KINDS);
  var isFileStatResult = (value) => Boolean(value && "kind" in value && "size" in value && fileStatKindSet.has(String(value.kind)) && Number.isFinite(value.size));
  var isGenerateResult = (value) => Boolean(value && "text" in value && String(value.text) === value.text && !("status" in value));
  var HOST_PUSH_TYPES = /* @__PURE__ */ new Set([
    "workspace",
    "shells",
    "ready",
    "directory",
    "session",
    "connection",
    "settings",
    "session-lifecycle",
    "item",
    "resolve",
    "action",
    "status-control-event",
    "popover-closed",
    "file-open",
    "file-snapshot",
    "file-saved",
    "generate-late"
  ]);
  var asWireRecord = (data) => Object(data) === data ? data : null;
  var isNonEmptyString = (value) => String(value) === value && value.length > 0;
  var readResultMessage = (wire) => {
    if (!isNonEmptyString(wire.id))
      return null;
    if (wire.ok === true) {
      const message = {
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "result",
        id: wire.id,
        ok: true
      };
      if (Object(wire.payload) === wire.payload) {
        message.payload = wire.payload;
      }
      return message;
    }
    if (wire.ok === false && isNonEmptyString(wire.error)) {
      return {
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "result",
        id: wire.id,
        ok: false,
        error: wire.error,
        code: resolveHostRequestErrorCode(isNonEmptyString(wire.code) ? wire.code : void 0)
      };
    }
    return null;
  };
  var readHostMessage = (data) => {
    const wire = asWireRecord(data);
    if (!wire || wire.channel !== OPENCHAMBER_SDK_CHANNEL || wire.v !== OPENCHAMBER_SDK_API_VERSION)
      return null;
    if (wire.type === "result")
      return readResultMessage(wire);
    if (!HOST_PUSH_TYPES.has(String(wire.type)) || Object(wire.payload) !== wire.payload)
      return null;
    return wire;
  };

  // node_modules/@openchamber/sdk/dist/host.js
  var isKeyEvent = (event) => "key" in event && "metaKey" in event && "ctrlKey" in event;
  var isSaveShortcut = (event) => (event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === "s";
  var HostRequestError = class extends Error {
    code;
    constructor(code, message) {
      super(message);
      this.name = "HostRequestError";
      this.code = code;
    }
  };
  var rejectBadPath = () => Promise.reject(new HostRequestError("BAD_PATH", 'Request path must start with "/" and stay on the declared origin.'));
  var rejectBadFilePath = () => Promise.reject(new HostRequestError("BAD_PATH", `File path must be 1 to ${GUEST_FILE_PATH_MAX} characters without NUL or backslash.`));
  var deviceStorageScope = (options) => {
    if (options === void 0)
      return void 0;
    if (Object(options) !== options || Array.isArray(options) || options.scope !== void 0 && options.scope !== "instance" && options.scope !== "device") {
      throw new HostRequestError("HOST_REJECTED", 'Storage scope must be "instance" or "device".');
    }
    return options.scope === "device" ? "device" : void 0;
  };
  var nextId = (n) => {
    n.value += 1;
    return `oc-${n.value}`;
  };
  var connectHost = (options = {}) => {
    const target = options.target ?? ("window" in globalThis ? window : null);
    if (!target) {
      throw new HostRequestError("HOST_UNAVAILABLE", "No window. connectHost runs in a browser frame.");
    }
    const acceptSource = options.acceptSource ?? ((source) => source === target.parent);
    const requestTimeoutMs = options.requestTimeoutMs ?? GUEST_REQUEST_TIMEOUT_MS;
    const readyListeners = /* @__PURE__ */ new Set();
    const directoryListeners = /* @__PURE__ */ new Set();
    const sessionListeners = /* @__PURE__ */ new Set();
    const lifecycleListeners = /* @__PURE__ */ new Set();
    const connectionListeners = /* @__PURE__ */ new Set();
    const settingsListeners = /* @__PURE__ */ new Set();
    const itemListeners = /* @__PURE__ */ new Set();
    const statusControlListeners = /* @__PURE__ */ new Set();
    const popoverClosedListeners = /* @__PURE__ */ new Set();
    const lateGenerateListeners = /* @__PURE__ */ new Set();
    const unclaimedLateGenerate = [];
    let resolveHandler = null;
    let actionHandler = null;
    const fileOpenListeners = /* @__PURE__ */ new Set();
    const fileSavedListeners = /* @__PURE__ */ new Set();
    let fileSnapshotHandler = null;
    let lastFile = null;
    let saveShortcutInstalled = false;
    const pending = /* @__PURE__ */ new Map();
    const workspaceListeners = /* @__PURE__ */ new Map();
    const shellsListeners = /* @__PURE__ */ new Map();
    let disposed = false;
    const ids = { value: 0 };
    let lastReady = null;
    let lastLifecycle = null;
    let popoverPointerActive = false;
    let popoverFocusActive = false;
    let popoverActivityReported = null;
    const lifecycleFromSession = (session) => {
      if (!session)
        return null;
      return {
        sessionId: session.id,
        phase: session.busy ? "started" : "completed"
      };
    };
    const post = (message) => {
      target.parent.postMessage(message, "*");
    };
    const listenForLateGenerate = () => {
      if (disposed || target.parent === target || lateGenerateListeners.size === 0 || lastReady?.features?.lateGenerateResults !== true)
        return;
      post({ channel: OPENCHAMBER_SDK_CHANNEL, v: OPENCHAMBER_SDK_API_VERSION, type: "generate-late-listen" });
    };
    const emit = (listeners, value) => {
      for (const listener of listeners) {
        try {
          listener(value);
        } catch (error) {
          console.error(error);
        }
      }
    };
    const onMessage = (event) => {
      if (!(event instanceof MessageEvent))
        return;
      if (!acceptSource(event.source))
        return;
      const message = readHostMessage(event.data);
      if (!message)
        return;
      if (message.type === "workspace") {
        const listener = workspaceListeners.get(message.payload.subscriptionId);
        if (listener)
          emit([listener], message.payload.snapshot);
        return;
      }
      if (message.type === "shells") {
        const listener = shellsListeners.get(message.payload.subscriptionId);
        if (listener)
          emit([listener], message.payload.snapshot);
        return;
      }
      if (message.type === "ready") {
        lastReady = message.payload;
        lastLifecycle = lifecycleFromSession(message.payload.session);
        emit(readyListeners, message.payload);
        emit(directoryListeners, message.payload.directory);
        emit(sessionListeners, message.payload.session);
        if (lastLifecycle) {
          emit(lifecycleListeners, lastLifecycle);
        }
        emit(connectionListeners, message.payload.connection);
        emit(settingsListeners, message.payload.settings);
        emit(itemListeners, message.payload.item);
        listenForLateGenerate();
        return;
      }
      if (message.type === "generate-late") {
        if (lateGenerateListeners.size === 0)
          unclaimedLateGenerate.push(message.payload);
        else
          emit(lateGenerateListeners, message.payload);
        return;
      }
      if (message.type === "directory") {
        if (lastReady) {
          lastReady = { ...lastReady, directory: message.payload.directory };
        }
        emit(directoryListeners, message.payload.directory);
        return;
      }
      if (message.type === "session") {
        if (lastReady) {
          lastReady = { ...lastReady, session: message.payload.session };
        }
        if (!message.payload.session) {
          lastLifecycle = null;
        } else if (lastLifecycle?.sessionId !== message.payload.session.id) {
          lastLifecycle = lifecycleFromSession(message.payload.session);
        }
        emit(sessionListeners, message.payload.session);
        return;
      }
      if (message.type === "session-lifecycle") {
        lastLifecycle = message.payload;
        emit(lifecycleListeners, message.payload);
        return;
      }
      if (message.type === "connection") {
        if (lastReady) {
          lastReady = { ...lastReady, connection: message.payload.connection };
        }
        emit(connectionListeners, message.payload.connection);
        return;
      }
      if (message.type === "settings") {
        if (lastReady) {
          lastReady = { ...lastReady, settings: message.payload.settings };
        }
        emit(settingsListeners, message.payload.settings);
        return;
      }
      if (message.type === "item") {
        if (lastReady) {
          lastReady = { ...lastReady, item: message.payload.item };
        }
        emit(itemListeners, message.payload.item);
        return;
      }
      if (message.type === "status-control-event") {
        emit(statusControlListeners, message.payload);
        return;
      }
      if (message.type === "popover-closed") {
        emit(popoverClosedListeners, message.payload);
        return;
      }
      if (message.type === "action") {
        const answer = (payload) => {
          if (!disposed)
            post({
              channel: OPENCHAMBER_SDK_CHANNEL,
              v: OPENCHAMBER_SDK_API_VERSION,
              type: "action-result",
              id: message.id,
              payload
            });
        };
        const handler = actionHandler;
        if (!handler) {
          answer({ ok: false, error: "This extension does not handle background actions." });
          return;
        }
        Promise.resolve().then(() => handler(message.payload)).then(() => answer({ ok: true }), (error) => {
          const text = (error instanceof Error ? error.message : String(error)).trim();
          answer({ ok: false, error: (text || "Action failed.").slice(0, GUEST_RESOLVE_ERROR_MAX) });
        });
        return;
      }
      if (message.type === "file-open") {
        const next = message.payload;
        if (lastFile && sameFileEditorDocument(lastFile, next))
          return;
        lastFile = next;
        emit(fileOpenListeners, message.payload);
        return;
      }
      if (message.type === "file-saved") {
        emit(fileSavedListeners, message.payload.version);
        return;
      }
      if (message.type === "file-snapshot") {
        const answer = (payload) => {
          if (!disposed)
            post({
              channel: OPENCHAMBER_SDK_CHANNEL,
              v: OPENCHAMBER_SDK_API_VERSION,
              type: "file-snapshot-result",
              id: message.id,
              payload
            });
        };
        const fail = (text) => answer({ error: (text.trim() || "Could not read the edited file.").slice(0, GUEST_RESOLVE_ERROR_MAX) });
        const handler = fileSnapshotHandler;
        if (!handler) {
          fail("This extension does not edit files.");
          return;
        }
        Promise.resolve().then(() => handler(message.payload.purpose)).then((snapshot) => {
          if (fileEditorPayloadSize(snapshot) > GUEST_FILE_EDITOR_CONTENT_MAX) {
            fail(`The file is over ${GUEST_FILE_EDITOR_CONTENT_MAX} ${"bytes" in snapshot ? "bytes" : "characters"}.`);
            return;
          }
          if (snapshot.version.length > GUEST_FILE_EDITOR_VERSION_MAX) {
            fail(`The snapshot version is over ${GUEST_FILE_EDITOR_VERSION_MAX} characters.`);
            return;
          }
          answer({ snapshot: "bytes" in snapshot ? { bytes: snapshot.bytes, version: snapshot.version } : { content: snapshot.content, version: snapshot.version } });
        }, (error) => fail(error instanceof Error ? error.message : String(error)));
        return;
      }
      if (message.type === "resolve") {
        const answer = (payload) => {
          post({
            channel: OPENCHAMBER_SDK_CHANNEL,
            v: OPENCHAMBER_SDK_API_VERSION,
            type: "resolve-result",
            id: message.id,
            payload
          });
        };
        const handler = resolveHandler;
        if (!handler) {
          answer({ error: "This extension does not resolve commands." });
          return;
        }
        Promise.resolve().then(() => handler(message.payload)).then((item) => answer({ item: item ? clampAttachRequest(item) : null }), (error) => {
          const text = (error instanceof Error ? error.message : String(error)).trim();
          answer({ error: (text || "Command failed.").slice(0, GUEST_RESOLVE_ERROR_MAX) });
        });
        return;
      }
      const waiter = pending.get(message.id);
      if (!waiter)
        return;
      clearTimeout(waiter.timer);
      pending.delete(message.id);
      if (message.ok) {
        waiter.resolve(message.payload);
        return;
      }
      waiter.reject(new HostRequestError(message.code, message.error));
    };
    target.addEventListener("message", onMessage);
    post({
      channel: OPENCHAMBER_SDK_CHANNEL,
      v: OPENCHAMBER_SDK_API_VERSION,
      type: "hello"
    });
    const send = (message, timeoutMs = requestTimeoutMs) => {
      if (disposed || target.parent === target) {
        return Promise.reject(new HostRequestError("HOST_UNAVAILABLE", "No host frame. This page is not in an iframe."));
      }
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(message.id);
          reject(new HostRequestError("HOST_TIMEOUT", "Host did not answer in time."));
        }, timeoutMs);
        pending.set(message.id, { resolve, reject, timer });
        post(message);
      });
    };
    const request = (message) => send(message).then(() => void 0);
    const envelope = { channel: OPENCHAMBER_SDK_CHANNEL, v: OPENCHAMBER_SDK_API_VERSION };
    const notify = (message) => {
      if (!disposed && target.parent !== target)
        post(message);
    };
    const requestFileSave = () => notify({ ...envelope, type: "file-save" });
    const onSaveShortcut = (event) => {
      if (!isKeyEvent(event) || !isSaveShortcut(event))
        return;
      event.preventDefault();
      requestFileSave();
    };
    const onPopoverEscape = (event) => {
      if (!isKeyEvent(event) || event.key !== "Escape" || lastReady?.surface !== "popover" || !lastReady.popover)
        return;
      event.preventDefault();
      void closePopover(lastReady.popover.id, "escape").catch(() => void 0);
    };
    const reportPopoverActivity = () => {
      const popover = lastReady?.surface === "popover" ? lastReady.popover : void 0;
      if (!popover)
        return;
      const active2 = popoverPointerActive || popoverFocusActive;
      if (popoverActivityReported === active2)
        return;
      popoverActivityReported = active2;
      void setPopoverAnchorActive(popover.id, active2).catch(() => void 0);
    };
    const onPopoverPointerOver = () => {
      if (lastReady?.surface !== "popover" || popoverPointerActive)
        return;
      popoverPointerActive = true;
      reportPopoverActivity();
    };
    const onPopoverPointerOut = (event) => {
      if (lastReady?.surface !== "popover" || event.relatedTarget !== null || !popoverPointerActive)
        return;
      popoverPointerActive = false;
      reportPopoverActivity();
    };
    const onPopoverFocus = () => {
      if (lastReady?.surface !== "popover" || popoverFocusActive)
        return;
      popoverFocusActive = true;
      reportPopoverActivity();
    };
    const onPopoverBlur = () => {
      if (lastReady?.surface !== "popover" || !popoverFocusActive)
        return;
      popoverFocusActive = false;
      reportPopoverActivity();
    };
    const requireIdentity = (value, maximum = 1024) => {
      if (!value.trim() || value.length > maximum)
        throw new HostRequestError("HOST_REJECTED", `Identity must contain 1 to ${maximum} characters.`);
    };
    const readWorkspace = async (query) => {
      if (query.kind !== "projects")
        requireIdentity(query.projectId);
      const result = await send({ ...envelope, type: "workspace-read", id: nextId(ids), payload: query });
      if (!result || !("kind" in result) || !("state" in result) || result.kind !== query.kind) {
        throw new HostRequestError("HOST_REJECTED", "Host did not return workspace data.");
      }
      return result;
    };
    const subscribeWorkspace = async (query, listener) => {
      if (query.kind !== "projects")
        requireIdentity(query.projectId);
      const subscriptionId = nextId(ids);
      workspaceListeners.set(subscriptionId, listener);
      try {
        await request({ ...envelope, type: "workspace-subscribe", id: nextId(ids), payload: { subscriptionId, query } });
      } catch (error) {
        workspaceListeners.delete(subscriptionId);
        if (!disposed)
          post({ ...envelope, type: "workspace-unsubscribe", id: nextId(ids), payload: { subscriptionId } });
        throw error;
      }
      return () => {
        if (!workspaceListeners.delete(subscriptionId) || disposed)
          return;
        post({ ...envelope, type: "workspace-unsubscribe", id: nextId(ids), payload: { subscriptionId } });
      };
    };
    const subscribeShells = async (scope, listener) => {
      if (scope.kind === "session")
        requireIdentity(scope.sessionId);
      if (scope.kind === "project")
        requireIdentity(scope.projectId);
      const subscriptionId = nextId(ids);
      shellsListeners.set(subscriptionId, listener);
      try {
        await request({ ...envelope, type: "shells-subscribe", id: nextId(ids), payload: { subscriptionId, scope } });
      } catch (error) {
        shellsListeners.delete(subscriptionId);
        if (!disposed)
          post({ ...envelope, type: "shells-unsubscribe", id: nextId(ids), payload: { subscriptionId } });
        throw error;
      }
      return () => {
        if (!shellsListeners.delete(subscriptionId) || disposed)
          return;
        post({ ...envelope, type: "shells-unsubscribe", id: nextId(ids), payload: { subscriptionId } });
      };
    };
    const storage = async (payload) => {
      if ("key" in payload && (payload.key.length === 0 || payload.key.length > GUEST_STORAGE_KEY_MAX)) {
        throw new HostRequestError("HOST_REJECTED", "Storage key must contain 1 to 128 characters.");
      }
      if (payload.op === "set" && !isJsonValue(payload.value)) {
        throw new HostRequestError("HOST_REJECTED", "Storage values must be JSON.");
      }
      if (payload.op === "set" && new TextEncoder().encode(JSON.stringify(payload.value)).length > GUEST_STORAGE_VALUE_BYTES) {
        throw new HostRequestError("HOST_REJECTED", "Storage value exceeds 64 KiB.");
      }
      if (payload.scope === "device" && lastReady?.features?.deviceStorage !== true) {
        throw new HostRequestError("UNSUPPORTED", "This host does not support device storage.");
      }
      const result = await send({ ...envelope, type: "storage", id: nextId(ids), payload });
      if (!result || !("storage" in result) || result.op !== payload.op)
        throw new HostRequestError("HOST_REJECTED", "Host did not return storage data.");
      return result;
    };
    const closePopover = (id, reason) => lastReady?.features?.popovers !== true && !(lastReady?.surface === "popover" && lastReady.popover?.id === id) ? Promise.reject(new HostRequestError("UNSUPPORTED", "This host does not support popovers.")) : request({ ...envelope, type: "popover-close", id: nextId(ids), payload: reason ? { id, reason } : { id } });
    const setPopoverAnchorActive = (id, active2) => lastReady?.features?.popovers !== true && !(lastReady?.surface === "popover" && lastReady.popover?.id === id) ? Promise.reject(new HostRequestError("UNSUPPORTED", "This host does not support popovers.")) : request({ ...envelope, type: "popover-anchor", id: nextId(ids), payload: { id, active: active2 } });
    target.addEventListener("keydown", onPopoverEscape, true);
    target.addEventListener("pointerover", onPopoverPointerOver);
    target.addEventListener("pointermove", onPopoverPointerOver);
    target.addEventListener("pointerout", onPopoverPointerOut);
    target.addEventListener("focus", onPopoverFocus);
    target.addEventListener("blur", onPopoverBlur);
    return {
      onAction: (handler) => {
        actionHandler = handler;
        return () => {
          if (actionHandler === handler)
            actionHandler = null;
        };
      },
      listProjects: async () => {
        const result = await readWorkspace({ kind: "projects" });
        if (result.kind !== "projects")
          throw new HostRequestError("HOST_REJECTED", "Expected projects.");
        return result;
      },
      listWorktrees: async (projectId) => {
        const result = await readWorkspace({ kind: "worktrees", projectId });
        if (result.kind !== "worktrees")
          throw new HostRequestError("HOST_REJECTED", "Expected worktrees.");
        return result;
      },
      listSessions: async (projectId) => {
        const result = await readWorkspace({ kind: "sessions", projectId });
        if (result.kind !== "sessions")
          throw new HostRequestError("HOST_REJECTED", "Expected sessions.");
        return result;
      },
      onProjects: (listener) => subscribeWorkspace({ kind: "projects" }, (snapshot) => {
        if (snapshot.kind === "projects")
          listener(snapshot);
      }),
      onWorktrees: (projectId, listener) => subscribeWorkspace({ kind: "worktrees", projectId }, (snapshot) => {
        if (snapshot.kind === "worktrees")
          listener(snapshot);
      }),
      onSessions: (projectId, listener) => subscribeWorkspace({ kind: "sessions", projectId }, (snapshot) => {
        if (snapshot.kind === "sessions")
          listener(snapshot);
      }),
      onRunningShells: (scope, listener) => subscribeShells(scope, listener),
      readShellOutput: async (shellId, options2) => {
        requireIdentity(shellId, GUEST_SHELL_ID_MAX);
        const cursor = options2?.cursor;
        if (cursor !== void 0 && (!Number.isInteger(cursor) || cursor < 0)) {
          throw new HostRequestError("HOST_REJECTED", "Shell output cursor must be a non-negative integer.");
        }
        const tailBytes = options2?.tailBytes;
        if (tailBytes !== void 0 && (!Number.isInteger(tailBytes) || tailBytes < 1 || tailBytes > GUEST_SHELL_OUTPUT_TAIL_MAX)) {
          throw new HostRequestError("HOST_REJECTED", `Shell output tailBytes must be an integer between 1 and ${GUEST_SHELL_OUTPUT_TAIL_MAX}.`);
        }
        const result = await send({ ...envelope, type: "shell-output", id: nextId(ids), payload: { shellId, cursor, tailBytes } });
        const output = result;
        if (!output || typeof output.output !== "string" || !Number.isFinite(output.cursor)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return shell output.");
        }
        return output;
      },
      stopShell: async (shellId) => {
        requireIdentity(shellId, GUEST_SHELL_ID_MAX);
        const result = await send({ ...envelope, type: "shell-stop", id: nextId(ids), payload: { shellId } });
        if (result?.stopped !== true)
          throw new HostRequestError("HOST_REJECTED", "Host did not stop the shell.");
        return { stopped: true };
      },
      openSession: async (sessionId) => {
        requireIdentity(sessionId);
        await request({ ...envelope, type: "open-session", id: nextId(ids), payload: { sessionId } });
      },
      storage: {
        get: async (key, options2) => {
          const scope = deviceStorageScope(options2);
          const payload = { op: "get", key };
          if (scope)
            payload.scope = scope;
          const result = await storage(payload);
          return result.op === "get" && result.found ? result.value : void 0;
        },
        set: async (key, value, options2) => {
          const scope = deviceStorageScope(options2);
          const payload = { op: "set", key, value };
          if (scope)
            payload.scope = scope;
          await storage(payload);
        },
        delete: async (key, options2) => {
          const scope = deviceStorageScope(options2);
          const payload = { op: "delete", key };
          if (scope)
            payload.scope = scope;
          await storage(payload);
        },
        keys: async (options2) => {
          const scope = deviceStorageScope(options2);
          const payload = { op: "keys" };
          if (scope)
            payload.scope = scope;
          const result = await storage(payload);
          if (result.op !== "keys")
            throw new HostRequestError("HOST_REJECTED", "Expected storage keys.");
          return result.keys;
        }
      },
      onReady: (listener) => {
        readyListeners.add(listener);
        if (lastReady)
          listener(lastReady);
        return () => {
          readyListeners.delete(listener);
        };
      },
      onDirectory: (listener) => {
        directoryListeners.add(listener);
        if (lastReady)
          listener(lastReady.directory);
        return () => {
          directoryListeners.delete(listener);
        };
      },
      onSession: (listener) => {
        sessionListeners.add(listener);
        if (lastReady)
          listener(lastReady.session);
        return () => {
          sessionListeners.delete(listener);
        };
      },
      onSessionLifecycle: (listener) => {
        lifecycleListeners.add(listener);
        if (lastLifecycle)
          listener(lastLifecycle);
        return () => {
          lifecycleListeners.delete(listener);
        };
      },
      onConnection: (listener) => {
        connectionListeners.add(listener);
        if (lastReady)
          listener(lastReady.connection);
        return () => {
          connectionListeners.delete(listener);
        };
      },
      onSettings: (listener) => {
        settingsListeners.add(listener);
        if (lastReady)
          listener(lastReady.settings);
        return () => {
          settingsListeners.delete(listener);
        };
      },
      onItem: (listener) => {
        itemListeners.add(listener);
        if (lastReady)
          listener(lastReady.item);
        return () => {
          itemListeners.delete(listener);
        };
      },
      onStatusControl: (listener) => {
        statusControlListeners.add(listener);
        return () => {
          statusControlListeners.delete(listener);
        };
      },
      onPopoverClosed: (listener) => {
        popoverClosedListeners.add(listener);
        return () => {
          popoverClosedListeners.delete(listener);
        };
      },
      setStatusControls: (controls) => {
        if (lastReady?.features?.statusControls !== true) {
          return Promise.reject(new HostRequestError("UNSUPPORTED", "This host does not support status controls."));
        }
        if (!isGuestStatusControls(controls)) {
          return Promise.reject(new HostRequestError("HOST_REJECTED", "Status controls must have unique bounded ids and valid selected options."));
        }
        return request({ ...envelope, type: "status-controls", id: nextId(ids), payload: { controls } });
      },
      openPopover: (payload) => {
        if (lastReady?.features?.popovers !== true) {
          return Promise.reject(new HostRequestError("UNSUPPORTED", "This host does not support popovers."));
        }
        if (!isGuestPopoverRequest(payload)) {
          return Promise.reject(new HostRequestError("HOST_REJECTED", "Popover requests need bounded geometry and JSON data."));
        }
        return request({ ...envelope, type: "popover-open", id: nextId(ids), payload });
      },
      closePopover,
      setPopoverAnchorActive,
      onResolve: (handler) => {
        resolveHandler = handler;
        return () => {
          if (resolveHandler === handler)
            resolveHandler = null;
        };
      },
      toast: (payload) => {
        const message = payload.message.trim();
        if (!message || message.length > GUEST_TOAST_MAX) {
          return Promise.reject(new HostRequestError("HOST_REJECTED", `Toast message must contain 1 to ${GUEST_TOAST_MAX} characters.`));
        }
        if (payload.copy && payload.copy !== true && (!payload.copy.text.length || payload.copy.text.length > GUEST_CLIPBOARD_TEXT_MAX)) {
          return Promise.reject(new HostRequestError("HOST_REJECTED", `Toast copy text must contain 1 to ${GUEST_CLIPBOARD_TEXT_MAX} characters.`));
        }
        return request({
          channel: OPENCHAMBER_SDK_CHANNEL,
          v: OPENCHAMBER_SDK_API_VERSION,
          type: "toast",
          id: nextId(ids),
          payload: { ...payload, message }
        });
      },
      openUrl: (url) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "open-url",
        id: nextId(ids),
        payload: { url }
      }),
      openCommit: (sha) => isGuestCommitSha(sha) ? request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "open-commit",
        id: nextId(ids),
        payload: { sha }
      }) : Promise.reject(new HostRequestError("HOST_REJECTED", "Commit id must be 7 to 64 hex characters.")),
      openSurface: (surfaceId) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "open-surface",
        id: nextId(ids),
        payload: { surfaceId }
      }),
      writeClipboard: (text) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "clipboard-write",
        id: nextId(ids),
        payload: { text }
      }),
      compose: (payload) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "compose",
        id: nextId(ids),
        payload
      }),
      attach: (payload) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "attach",
        id: nextId(ids),
        payload: clampAttachRequest(payload)
      }),
      startSession: async (payload) => {
        if (payload.projectId !== void 0)
          requireIdentity(payload.projectId);
        const worktree = payload.worktree;
        if (worktree && worktree !== true) {
          if (worktree.kind === "existing")
            requireIdentity(worktree.directory);
          else {
            if (worktree.name !== void 0)
              requireIdentity(worktree.name, 200);
            if (worktree.baseBranch !== void 0)
              requireIdentity(worktree.baseBranch, 200);
          }
        }
        const result = await send({
          channel: OPENCHAMBER_SDK_CHANNEL,
          v: OPENCHAMBER_SDK_API_VERSION,
          type: "start-session",
          id: nextId(ids),
          payload: clampStartSessionRequest(payload)
        }, options.requestTimeoutMs ?? 18e4);
        if (!isStartSessionResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return a session.");
        }
        return result;
      },
      prompt: (payload) => send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "prompt",
        id: nextId(ids),
        payload: clampPromptRequest(payload)
      }).then((result) => {
        if (!isPromptResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return a prompt result.");
        }
        return result;
      }),
      sessionLink: (payload) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "session-link",
        id: nextId(ids),
        payload: clampAttachRequest(payload)
      }),
      close: () => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "close",
        id: nextId(ids)
      }),
      oauthStart: () => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "oauth-start",
        id: nextId(ids)
      }),
      oauthDisconnect: () => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "oauth-disconnect",
        id: nextId(ids)
      }),
      request: (payload) => (isGuestRequestPath(payload.path) ? send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "request",
        id: nextId(ids),
        payload
      }) : rejectBadPath()).then((result) => {
        if (!isGuestRequestResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host request result was empty.");
        }
        return result;
      }),
      serviceRequest: (payload) => (isGuestRequestPath(payload.path) ? send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "service-request",
        id: nextId(ids),
        payload
      }) : rejectBadPath()).then((result) => {
        if (!isGuestRequestResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host service request result was empty.");
        }
        return result;
      }),
      serviceStatus: () => send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "service-status",
        id: nextId(ids)
      }).then((result) => {
        if (!isServiceStatusResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return service status.");
        }
        return result;
      }),
      readFile: (path) => (isGuestFilePath(path) ? send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "file-read",
        id: nextId(ids),
        payload: { path }
      }) : rejectBadFilePath()).then((result) => {
        if (!isFileReadResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return file content.");
        }
        return result;
      }),
      writeFile: (path, content) => {
        if (!isGuestFilePath(path)) {
          return rejectBadFilePath();
        }
        if (content.length > GUEST_FILE_CONTENT_MAX) {
          return Promise.reject(new HostRequestError("FILE_TOO_LARGE", `Content is over ${GUEST_FILE_CONTENT_MAX} characters.`));
        }
        return send({
          channel: OPENCHAMBER_SDK_CHANNEL,
          v: OPENCHAMBER_SDK_API_VERSION,
          type: "file-write",
          id: nextId(ids),
          payload: { path, content }
        }).then((result) => {
          if (!isFileWriteResult(result)) {
            throw new HostRequestError("HOST_REJECTED", "Host did not confirm the write.");
          }
          return result;
        });
      },
      listDir: (path) => (isGuestFilePath(path) ? send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "file-list",
        id: nextId(ids),
        payload: { path }
      }) : rejectBadFilePath()).then((result) => {
        if (!isFileListResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return directory entries.");
        }
        return result;
      }),
      stat: (path) => (isGuestFilePath(path) ? send({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "file-stat",
        id: nextId(ids),
        payload: { path }
      }) : rejectBadFilePath()).then((result) => {
        if (!isFileStatResult(result)) {
          throw new HostRequestError("HOST_REJECTED", "Host did not return file status.");
        }
        return result;
      }),
      generate: (input) => {
        const prompt = input.prompt.trim();
        const system = input.system?.trim();
        if (prompt.length === 0 || prompt.length > GUEST_GENERATE_PROMPT_MAX) {
          return Promise.reject(new HostRequestError("HOST_REJECTED", `Prompt must be 1 to ${GUEST_GENERATE_PROMPT_MAX} characters.`));
        }
        if (system !== void 0 && (system.length === 0 || system.length > GUEST_GENERATE_SYSTEM_MAX)) {
          return Promise.reject(new HostRequestError("HOST_REJECTED", `System prompt must be 1 to ${GUEST_GENERATE_SYSTEM_MAX} characters.`));
        }
        const maxOutputTokens = input.maxOutputTokens === void 0 ? void 0 : Math.min(GUEST_GENERATE_OUTPUT_TOKENS_MAX, Math.max(1, Math.floor(input.maxOutputTokens)));
        if (maxOutputTokens !== void 0 && !Number.isFinite(maxOutputTokens)) {
          return Promise.reject(new HostRequestError("HOST_REJECTED", "maxOutputTokens must be a number."));
        }
        const payload = { prompt };
        if (system !== void 0)
          payload.system = system;
        if (maxOutputTokens !== void 0)
          payload.maxOutputTokens = maxOutputTokens;
        return send({
          channel: OPENCHAMBER_SDK_CHANNEL,
          v: OPENCHAMBER_SDK_API_VERSION,
          type: "generate",
          id: nextId(ids),
          payload
        }, options.requestTimeoutMs ?? GUEST_GENERATE_TIMEOUT_MS).then((result) => {
          if (!isGenerateResult(result)) {
            throw new HostRequestError("HOST_REJECTED", "Host did not return generated text.");
          }
          return result;
        });
      },
      onLateGenerateResult: (listener) => {
        lateGenerateListeners.add(listener);
        for (const result of unclaimedLateGenerate.splice(0))
          emit([listener], result);
        listenForLateGenerate();
        return () => {
          lateGenerateListeners.delete(listener);
        };
      },
      setBadge: (count) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "badge",
        id: nextId(ids),
        payload: { count: clampBadgeCount(count) }
      }),
      setHeight: (height) => request({
        channel: OPENCHAMBER_SDK_CHANNEL,
        v: OPENCHAMBER_SDK_API_VERSION,
        type: "resize",
        id: nextId(ids),
        payload: { height: clampFrameHeight(height) }
      }),
      onFileOpen: (listener) => {
        fileOpenListeners.add(listener);
        if (!saveShortcutInstalled) {
          saveShortcutInstalled = true;
          target.addEventListener("keydown", onSaveShortcut, true);
        }
        if (lastFile)
          listener(lastFile);
        return () => {
          fileOpenListeners.delete(listener);
        };
      },
      onFileSnapshot: (handler) => {
        fileSnapshotHandler = handler;
        return () => {
          if (fileSnapshotHandler === handler)
            fileSnapshotHandler = null;
        };
      },
      onFileSaved: (listener) => {
        fileSavedListeners.add(listener);
        return () => {
          fileSavedListeners.delete(listener);
        };
      },
      reportFileChange: (change) => notify({ ...envelope, type: "file-change", payload: { dirty: change.dirty, edited: change.edited } }),
      requestFileSave,
      reportFileUnsupported: () => notify({ ...envelope, type: "file-unsupported" }),
      dispose: () => {
        for (const subscriptionId of workspaceListeners.keys()) {
          post({ ...envelope, type: "workspace-unsubscribe", id: nextId(ids), payload: { subscriptionId } });
        }
        workspaceListeners.clear();
        for (const subscriptionId of shellsListeners.keys()) {
          post({ ...envelope, type: "shells-unsubscribe", id: nextId(ids), payload: { subscriptionId } });
        }
        shellsListeners.clear();
        disposed = true;
        resolveHandler = null;
        actionHandler = null;
        fileSnapshotHandler = null;
        fileOpenListeners.clear();
        fileSavedListeners.clear();
        if (saveShortcutInstalled)
          target.removeEventListener("keydown", onSaveShortcut, true);
        target.removeEventListener("message", onMessage);
        target.removeEventListener("keydown", onPopoverEscape, true);
        target.removeEventListener("pointerover", onPopoverPointerOver);
        target.removeEventListener("pointermove", onPopoverPointerOver);
        target.removeEventListener("pointerout", onPopoverPointerOut);
        target.removeEventListener("focus", onPopoverFocus);
        target.removeEventListener("blur", onPopoverBlur);
        for (const waiter of pending.values()) {
          clearTimeout(waiter.timer);
          waiter.reject(new HostRequestError("HOST_UNAVAILABLE", "Host client was disposed."));
        }
        pending.clear();
        readyListeners.clear();
        directoryListeners.clear();
        sessionListeners.clear();
        lifecycleListeners.clear();
        connectionListeners.clear();
        settingsListeners.clear();
        itemListeners.clear();
        statusControlListeners.clear();
        popoverClosedListeners.clear();
        lateGenerateListeners.clear();
        unclaimedLateGenerate.length = 0;
      }
    };
  };

  // node_modules/@openchamber/sdk/dist/service-providers.js
  var BROWSER_CONTROL_ACTIONS = [
    "browser.open",
    "browser.snapshot",
    "browser.click",
    "browser.type",
    "browser.select",
    "browser.scroll",
    "browser.back",
    "browser.forward",
    "browser.inspect",
    "browser.capture",
    "browser.resize",
    "browser.close"
  ];
  var BROWSER_PROVIDER_IDLE_MS = 10 * 6e4;
  var CONTROL_ACTIONS = new Set(BROWSER_CONTROL_ACTIONS);
  var SOURCE_CONTROL_PROVIDER_IDLE_MS = 10 * 6e4;
  var NOTIFICATIONS_PROVIDER_IDLE_MS = 10 * 6e4;
  var TRACKER_PROVIDER_IDLE_MS = 10 * 6e4;

  // node_modules/@openchamber/sdk/dist/service-surface.js
  var SURFACE_CONTROLLERS = ["none", "agent", "user"];
  var CONTROLLERS = new Set(SURFACE_CONTROLLERS);

  // node_modules/@openchamber/sdk/dist/ui/theme.js
  var TOKEN_VARS = [
    ["--oc-bg", "background"],
    ["--oc-elevated", "elevated"],
    ["--oc-fg", "foreground"],
    ["--oc-muted", "muted"],
    ["--oc-subtle", "subtle"],
    ["--oc-border", "border"],
    ["--oc-hover", "hover"],
    ["--oc-selection", "selection"],
    ["--oc-focus", "focus"],
    ["--oc-primary", "primary"],
    ["--oc-muted-surface", "mutedSurface"],
    ["--oc-elevated-fg", "elevatedForeground"],
    ["--oc-active", "active"],
    ["--oc-selection-fg", "selectionForeground"],
    ["--oc-primary-fg", "primaryForeground"],
    ["--oc-primary-text", "primaryText"],
    ["--oc-success-text", "successText"],
    ["--oc-warning-text", "warningText"],
    ["--oc-error-text", "errorText"],
    ["--oc-info-text", "infoText"],
    ["--oc-success", "success"],
    ["--oc-warning", "warning"],
    ["--oc-error", "error"],
    ["--oc-info", "info"],
    ["--oc-font", "font"],
    ["--oc-mono", "mono"],
    ["--oc-radius", "radius"],
    ["--surface-background", "background"],
    ["--surface-elevated", "elevated"],
    ["--surface-foreground", "foreground"],
    ["--surface-muted-foreground", "muted"],
    ["--surface-subtle", "subtle"],
    ["--interactive-border", "border"],
    ["--interactive-hover", "hover"],
    ["--interactive-selection", "selection"],
    ["--interactive-focus-ring", "focus"],
    ["--primary", "primary"],
    ["--surface-muted", "mutedSurface"],
    ["--surface-elevated-foreground", "elevatedForeground"],
    ["--interactive-active", "active"],
    ["--interactive-selection-foreground", "selectionForeground"],
    ["--primary-foreground", "primaryForeground"],
    ["--primary-text", "primaryText"],
    ["--success-text", "successText"],
    ["--warning-text", "warningText"],
    ["--error-text", "errorText"],
    ["--info-text", "infoText"],
    ["--status-success", "success"],
    ["--status-warning", "warning"],
    ["--status-error", "error"],
    ["--status-info", "info"],
    ["--font-sans", "font"],
    ["--font-mono", "mono"],
    ["--radius", "radius"]
  ];
  var SYNTAX_TOKEN_VARS = [
    ["--oc-syntax-keyword", "--syntax-keyword", "syntaxKeyword"],
    ["--oc-syntax-string", "--syntax-string", "syntaxString"],
    ["--oc-syntax-number", "--syntax-number", "syntaxNumber"],
    ["--oc-syntax-function", "--syntax-function", "syntaxFunction"],
    ["--oc-syntax-type", "--syntax-type", "syntaxType"],
    ["--oc-syntax-comment", "--syntax-comment", "syntaxComment"],
    ["--oc-syntax-variable", "--syntax-variable", "syntaxVariable"],
    ["--oc-syntax-operator", "--syntax-operator", "syntaxOperator"]
  ];
  var applyHostTheme = (theme, root) => {
    root.style.colorScheme = theme.mode;
    for (const [name, key] of TOKEN_VARS) {
      root.style.setProperty(name, theme.tokens[key]);
    }
    for (const [alias, hostName, key] of SYNTAX_TOKEN_VARS) {
      const value = theme.tokens[key] ?? "";
      root.style.setProperty(alias, value);
      root.style.setProperty(hostName, value);
    }
    root.style.setProperty("font-family", theme.tokens.font);
    root.style.setProperty("font-size", "0.875rem");
    root.style.setProperty("line-height", "1.45");
    root.style.setProperty("color", theme.tokens.foreground);
  };
  var applyHostReady = (ctx, root) => {
    applyHostTheme(ctx.theme, root);
    if (root.dataset) {
      root.dataset.ocSurface = ctx.surface;
      root.dataset.ocTheme = ctx.theme.mode;
    }
  };

  // node_modules/@openchamber/sdk/dist/ui/style.js
  var OC_ALIAS = {
    "surface-background": "bg",
    "surface-elevated": "elevated",
    "surface-elevated-foreground": "elevated-fg",
    "surface-foreground": "fg",
    "surface-muted-foreground": "muted",
    "surface-muted": "muted-surface",
    "surface-subtle": "subtle",
    "interactive-border": "border",
    "interactive-hover": "hover",
    "interactive-active": "active",
    "interactive-selection": "selection",
    "interactive-selection-foreground": "selection-fg",
    "interactive-focus-ring": "focus",
    "primary": "primary",
    "primary-foreground": "primary-fg",
    "primary-text": "primary-text",
    "success-text": "success-text",
    "warning-text": "warning-text",
    "error-text": "error-text",
    "info-text": "info-text",
    "status-success": "success",
    "status-warning": "warning",
    "status-error": "error",
    "status-info": "info",
    "font-sans": "font",
    "font-mono": "mono",
    "radius": "radius"
  };
  var v = (name, fallback) => `var(--${name}, var(--oc-${OC_ALIAS[name]}, ${fallback}))`;
  var bg = v("surface-background", "transparent");
  var elevated = v("surface-elevated", "transparent");
  var elevatedFg = v("surface-elevated-foreground", "inherit");
  var fg = v("surface-foreground", "inherit");
  var muted = v("surface-muted-foreground", "gray");
  var secondary = v("surface-muted", "transparent");
  var border = v("interactive-border", "currentColor");
  var hover = v("interactive-hover", "transparent");
  var active = v("interactive-active", "transparent");
  var selection = v("interactive-selection", "transparent");
  var selectionFg = v("interactive-selection-foreground", "inherit");
  var primary = v("primary", "currentColor");
  var primaryText = v("primary-text", "inherit");
  var errorText = v("error-text", "inherit");
  var font = v("font-sans", "inherit");
  var mono = v("font-mono", "monospace");
  var radius = v("radius", "9px");
  var controlRadius = `calc(${radius} - 2px)`;
  var smallRadius = `calc(${radius} - 4px)`;
  var mix = (color, pct, base = "transparent") => `color-mix(in srgb, ${color} ${pct}%, ${base})`;
  var focusFill = `background-image: linear-gradient(${hover}, ${hover});`;
  var field = (edge, width = "0.5px") => `box-shadow: inset 0 0 0 ${width} ${edge}, var(--oc-sdk-field-lift);`;
  var raised = "border-color: var(--oc-sdk-edge); box-shadow: var(--oc-sdk-raised-lift);";
  var litButton = "box-shadow: var(--oc-sdk-lit);";
  var darkLift = `inset 0 0.5px 0 0 ${mix(fg, 8)}, 0 1px 2px 0 rgb(0 0 0 / 0.4)`;
  var THEME_VARS = `
:root {
  --oc-sdk-edge: ${mix(fg, 16)};
  --oc-sdk-field-bg: ${elevated};
  --oc-sdk-raised-bg: ${bg};
  --oc-sdk-field-lift: inset 0 1px 2px 0 rgb(0 0 0 / 0.04);
  --oc-sdk-raised-lift: 0 1px 1.5px 0 rgb(0 0 0 / 0.08);
  --oc-sdk-lit: inset 0 1px 0 0 rgb(255 255 255 / 0.2), 0 1px 1.5px 0 rgb(0 0 0 / 0.1);
  --oc-sdk-float-edge: rgb(0 0 0 / 0.14);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.7), 0 1px 2px -0.5px rgb(0 0 0 / 0.06), 0 4px 8px -2px rgb(0 0 0 / 0.08), 0 12px 20px -4px rgb(0 0 0 / 0.06);
}
:root[data-oc-theme="dark"] {
  --oc-sdk-edge: ${mix(fg, 14)};
  --oc-sdk-field-bg: ${mix(bg, 50, elevated)};
  --oc-sdk-raised-bg: ${elevated};
  --oc-sdk-field-lift: ${darkLift};
  --oc-sdk-raised-lift: ${darkLift};
  --oc-sdk-lit: ${darkLift};
  --oc-sdk-float-edge: rgb(0 0 0 / 0.55);
  --oc-sdk-float: inset 0 1px 0 0 rgb(255 255 255 / 0.04), inset 0 0 0 0.5px rgb(255 255 255 / 0.08), 0 8px 16px 0 rgb(0 0 0 / 0.25), 0 4px 8px 0 rgb(0 0 0 / 0.25);
}`;
  var tone = (name) => {
    const color = v(`status-${name}`, "currentColor");
    return `
.oc-sdk[data-tone="${name}"], .oc-sdk [data-tone="${name}"] { --oc-sdk-tone: ${color}; --oc-sdk-tone-text: ${v(`${name}-text`, "inherit")}; }`;
  };
  var UI_SIZE_CSS = `
.oc-sdk { box-sizing: border-box; font-size: 0.875rem; line-height: 1.45; }
.oc-sdk *, .oc-sdk *::before, .oc-sdk *::after { box-sizing: border-box; }
/* :where() keeps the reset at zero specificity so every primitive class below overrides it. */
:where(.oc-sdk) :where(button, input, textarea), :where(button.oc-sdk, input.oc-sdk, textarea.oc-sdk) { font: inherit; color: inherit; margin: 0; }
:where(.oc-sdk) :where(button), :where(button.oc-sdk) { cursor: pointer; background: none; border: 0; padding: 0; }
.oc-sdk button:disabled, button.oc-sdk:disabled, .oc-sdk[aria-disabled="true"], .oc-sdk [aria-disabled="true"] { opacity: .5; pointer-events: none; }

.oc-sdk-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 32px; padding: 0 12px; border: 1px solid transparent; font-size: 0.875rem; font-weight: 500; line-height: 1; white-space: nowrap; }
.oc-sdk-btn[data-size="sm"] { gap: 6px; height: 28px; padding: 0 10px; font-size: 0.8125rem; }
.oc-sdk-btn[data-size="xs"] { gap: 4px; height: 24px; padding: 0 8px; font-size: 0.75rem; }
.oc-sdk-btn[data-loading="true"] { opacity: .5; pointer-events: none; }
.oc-sdk-btn > .oc-sdk-spinner-ring { width: 14px; height: 14px; }

.oc-sdk-field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-field-label { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-field-note { font-size: 0.75rem; }
.oc-sdk-input { display: block; width: 100%; min-width: 0; height: 32px; padding: 0 10px; border: 0; font-size: 0.875rem; line-height: 1.45; appearance: none; }
textarea.oc-sdk-input { height: auto; padding: 8px 10px; resize: vertical; }

.oc-sdk-search { position: relative; min-width: 0; }
.oc-sdk-search .oc-sdk-input { padding-left: 34px; padding-right: 34px; }
.oc-sdk-search-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); pointer-events: none; }
.oc-sdk-search-clear { position: absolute; right: 6px; top: 50%; transform: translateY(-50%); display: none; align-items: center; justify-content: center; width: 24px; height: 24px; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-clear { display: inline-flex; }

.oc-sdk-select { position: relative; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-trigger { display: inline-flex; align-items: center; gap: 6px; align-self: flex-start; width: auto; max-width: 100%; min-width: 0; height: 28px; padding: 0 10px; border: 1px solid transparent; font-size: 0.8125rem; text-align: left; }
.oc-sdk-trigger-value { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-trigger-chevron { flex: 0 0 auto; }
.oc-sdk-popup { position: fixed; z-index: 50; display: flex; flex-direction: column; gap: 2px; min-width: 160px; max-width: calc(100vw - 16px); max-height: min(320px, calc(100vh - 16px)); overflow: auto; padding: 4px; border: 1px solid transparent; }
.oc-sdk-popup-search { flex: 0 0 auto; padding: 2px 2px 4px; }
.oc-sdk-popup-search .oc-sdk-input { height: 28px; font-size: 0.8125rem; }
.oc-sdk-option { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; font-size: 0.8125rem; text-align: left; }
.oc-sdk-option-label { flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-option-hint { flex: 0 0 auto; font-size: 0.75rem; }
.oc-sdk-option-check { flex: 0 0 auto; display: inline-flex; width: 14px; visibility: hidden; }
.oc-sdk-option[aria-selected="true"] > .oc-sdk-option-check { visibility: visible; }
.oc-sdk-popup-empty { padding: 8px; font-size: 0.8125rem; }

.oc-sdk-check { display: inline-flex; align-items: flex-start; gap: 8px; width: 100%; text-align: left; }
.oc-sdk-check-box { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; margin-top: 3px; border: 1px solid transparent; }
.oc-sdk-check-box > svg { display: none; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box > svg { display: block; }
.oc-sdk-check-thumb { flex: 0 0 auto; position: relative; width: 36px; height: 20px; }
.oc-sdk-check-thumb::after { content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px; }
.oc-sdk-check-text { display: flex; flex-direction: column; min-width: 0; }
.oc-sdk-check-label { font-size: 0.875rem; }
.oc-sdk-check-desc { font-size: 0.75rem; }

.oc-sdk-tabs { display: inline-flex; gap: 2px; padding: 2px; max-width: 100%; overflow: auto; }
.oc-sdk-tab { display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 10px; border: 1px solid transparent; font-size: 0.8125rem; font-weight: 500; white-space: nowrap; }
.oc-sdk-tab-count { font-size: 0.75rem; font-variant-numeric: tabular-nums; }

.oc-sdk-badge { display: inline-flex; align-items: center; padding: 1px 6px; font-size: 11px; font-weight: 500; line-height: 16px; white-space: nowrap; }

.oc-sdk-list { display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.oc-sdk-row { display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px; text-align: left; }
.oc-sdk-row-lead { flex: 0 0 auto; width: 64px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
.oc-sdk-row-main { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; }
.oc-sdk-row-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.oc-sdk-row-sub { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.75rem; }
.oc-sdk-row-meta { flex: 0 0 auto; font-size: 0.75rem; font-variant-numeric: tabular-nums; }
.oc-sdk-list-empty { padding: 16px 8px; text-align: center; font-size: 0.8125rem; }

.oc-sdk-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; padding: 40px 16px; text-align: center; }
.oc-sdk-empty-title { margin: 0; font-size: 0.8125rem; font-weight: 600; }
.oc-sdk-empty-body { margin: 0; max-width: 32rem; font-size: 0.8125rem; }
.oc-sdk-empty-action { margin-top: 12px; }

@keyframes oc-sdk-spin { to { transform: rotate(360deg); } }
.oc-sdk-spinner { display: inline-flex; align-items: center; gap: 8px; font-size: 0.8125rem; }
.oc-sdk-spinner-ring { width: 16px; height: 16px; border: 2px solid transparent; animation: oc-sdk-spin .8s linear infinite; }
.oc-sdk-spinner[data-size="sm"] .oc-sdk-spinner-ring { width: 12px; height: 12px; }

.oc-sdk-banner { display: flex; align-items: flex-start; gap: 12px; padding: 8px 12px; border: 1px solid transparent; }
.oc-sdk-banner-text { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
.oc-sdk-banner-title { font-size: 0.8125rem; font-weight: 500; }
.oc-sdk-banner-body { font-size: 0.8125rem; }
.oc-sdk-banner-action { flex: 0 0 auto; }

.oc-sdk-separator { display: flex; align-items: center; gap: 8px; width: 100%; margin: 8px 0; font-size: 0.75rem; }
.oc-sdk-separator::before, .oc-sdk-separator::after { content: ""; flex: 1 1 auto; height: 1px; }
.oc-sdk-separator[data-labeled="false"]::after { display: none; }
.oc-sdk-popup > .oc-sdk-separator { margin: 4px 0; }

.oc-sdk-progress { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.oc-sdk-progress-label { display: flex; justify-content: space-between; font-size: 0.75rem; font-variant-numeric: tabular-nums; }
.oc-sdk-progress-track { height: 6px; overflow: hidden; }
.oc-sdk-progress-fill { height: 100%; transform-origin: left; transition: transform 200ms ease-out; }
.oc-sdk-progress-value { display: inline-flex; align-items: center; gap: 2px; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { font-weight: 600; }

.oc-sdk-menu { position: relative; display: inline-flex; }

.oc-sdk-text { white-space: pre-wrap; overflow-wrap: anywhere; }
.oc-sdk-text img { display: block; max-width: 100%; margin: 8px 0; }
`;
  var GUEST_UI_LOOK_CSS = `${THEME_VARS}
.oc-sdk { color: ${fg}; font-family: ${font}; }
.oc-sdk :focus-visible, .oc-sdk:focus-visible { outline: none; }
.oc-sdk :where(button, a[href], [role="button"], [role="tab"], [role="option"]):focus-visible, button.oc-sdk:focus-visible { ${focusFill} }
.oc-sdk-mono { font-family: ${mono}; }
.oc-sdk-muted { color: ${muted}; }
${tone("success")}${tone("warning")}${tone("error")}${tone("info")}
.oc-sdk[data-tone="primary"], .oc-sdk [data-tone="primary"] { --oc-sdk-tone: ${primary}; --oc-sdk-tone-text: ${primaryText}; }

.oc-sdk-btn { border-radius: ${controlRadius}; transition: background 150ms ease-out, color 150ms ease-out; }
.oc-sdk-btn[data-size="xs"] { border-radius: ${smallRadius}; }
.oc-sdk-btn[data-variant="default"] { color: ${primaryText}; background: ${mix(primary, 10, bg)}; border-color: ${mix(primary, 12)}; ${litButton} }
.oc-sdk-btn[data-variant="default"]:hover { background: ${mix(primary, 16, bg)}; }
.oc-sdk-btn[data-variant="default"]:active { background: ${mix(primary, 22, bg)}; box-shadow: none; }
.oc-sdk-btn[data-variant="secondary"] { background: ${secondary}; color: var(--oc-fg); }
.oc-sdk-btn[data-variant="secondary"]:hover { background-image: linear-gradient(${hover}, ${hover}); }
.oc-sdk-btn[data-variant="secondary"]:active { background-image: linear-gradient(${active}, ${active}); }
.oc-sdk-btn[data-variant="outline"] { background: var(--oc-sdk-raised-bg); color: ${elevatedFg}; ${raised} }
.oc-sdk-btn[data-variant="outline"]:hover { background-image: linear-gradient(${hover}, ${hover}); }
.oc-sdk-btn[data-variant="outline"]:active { background-image: linear-gradient(${active}, ${active}); box-shadow: none; }
.oc-sdk-btn[data-variant="ghost"] { background: transparent; }
.oc-sdk-btn[data-variant="ghost"]:hover { background: ${hover}; }
.oc-sdk-btn[data-variant="ghost"]:active { background: ${active}; }
.oc-sdk-btn[data-variant="destructive"] { --oc-sdk-tone: ${v("status-error", "red")}; color: ${errorText}; background: ${mix("var(--oc-sdk-tone)", 7, bg)}; border-color: ${mix("var(--oc-sdk-tone)", 12)}; ${litButton} }
.oc-sdk-btn[data-variant="destructive"]:hover { background: ${mix("var(--oc-sdk-tone)", 9, bg)}; }
.oc-sdk-btn[data-variant="destructive"]:active { background: ${mix("var(--oc-sdk-tone)", 11, bg)}; box-shadow: none; }

.oc-sdk-field-note { color: ${muted}; }
.oc-sdk-field[data-invalid="true"] .oc-sdk-field-note { color: ${errorText}; }
.oc-sdk-input { border-radius: ${controlRadius}; background: var(--oc-sdk-field-bg); color: ${elevatedFg}; ${field("var(--oc-sdk-edge)")} transition: background 150ms ease-out; }
.oc-sdk-input::placeholder { color: ${muted}; }
.oc-sdk-input:hover:not(:focus) { background-image: linear-gradient(${hover}, ${hover}); }
.oc-sdk-input:focus, .oc-sdk-input:focus-visible { ${field(mix(fg, 26), "1px")} }
.oc-sdk-field[data-invalid="true"] .oc-sdk-input, .oc-sdk-field[data-invalid="true"] .oc-sdk-input:focus { ${field(v("status-error", "red"), "1px")} }
.oc-sdk-input[data-mono="true"] { font-family: ${mono}; }

.oc-sdk-search-icon { color: ${muted}; }
.oc-sdk-search[data-active="true"] .oc-sdk-search-icon { color: ${primary}; }
.oc-sdk-search-clear { border-radius: ${smallRadius}; color: ${muted}; }
.oc-sdk-search-clear:hover { background: ${hover}; color: ${fg}; }

.oc-sdk-trigger { border-radius: ${controlRadius}; background: var(--oc-sdk-raised-bg); color: ${elevatedFg}; ${raised} transition: background 150ms ease-out; }
.oc-sdk-trigger:hover { background-image: linear-gradient(${hover}, ${hover}); }
.oc-sdk-trigger[aria-expanded="true"] { background-image: linear-gradient(${active}, ${active}); }
.oc-sdk-trigger-value[data-empty="true"] { color: ${muted}; }
.oc-sdk-trigger-chevron { color: ${muted}; }
/* The app's floating level: the glass edge (a hairline ring and a lit top line, dark outside and light inside in dark themes) over soft shadows. The outer ring is the border, over the page like the app's. */
.oc-sdk-popup { --surface-foreground: ${elevatedFg}; border-color: var(--oc-sdk-float-edge); border-radius: 12px; background: ${elevated}; background-clip: padding-box; color: ${elevatedFg}; box-shadow: var(--oc-sdk-float); }
.oc-sdk-option { border-radius: 8px; }
.oc-sdk-option[data-active="true"] { background: ${hover}; }
/* A selected option shows a check mark in the text colour, like the app's own pickers. Options without the mark come
   from bundles built before it existed and keep the selection fill as their only sign of the choice. */
.oc-sdk-option[aria-selected="true"]:not([data-mark]) { background: ${selection}; color: ${selectionFg}; }
.oc-sdk-option-check { color: ${fg}; }
.oc-sdk-option[data-destructive="true"] { color: ${errorText}; }
.oc-sdk-option[data-destructive="true"][data-active="true"] { background: ${mix(v("status-error", "red"), 10)}; }
.oc-sdk-option-hint { color: ${muted}; }
.oc-sdk-popup-empty { color: ${muted}; }

/* Checked stays neutral: the mark carries the state, and the primary colour stays with primary actions. */
.oc-sdk-check-box { border-color: ${border}; border-radius: 4px; color: ${fg}; transition: border-color 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-box { border-color: ${mix(fg, 60, border)}; }
.oc-sdk-check-thumb { border-radius: 9999px; background: ${border}; transition: background 150ms ease-out; }
.oc-sdk-check-thumb::after { border-radius: 9999px; background: ${bg}; transition: transform 150ms ease-out; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb { background: ${primary}; }
.oc-sdk-check[aria-checked="true"] .oc-sdk-check-thumb::after { transform: translateX(16px); }
.oc-sdk-check:focus-visible { box-shadow: none; }
.oc-sdk-check:focus-visible .oc-sdk-check-box, .oc-sdk-check:focus-visible .oc-sdk-check-thumb { ${focusFill} }
.oc-sdk-check-desc { color: ${muted}; }

.oc-sdk-tabs { border-radius: 10px; }
.oc-sdk-tabs[data-track="true"] { background: ${mix(fg, 4)}; box-shadow: inset 0 1px 2px 0 rgb(0 0 0 / 0.16); }
.oc-sdk-tab { border-radius: 8px; color: ${muted}; transition: color 150ms ease-out, background 150ms ease-out; }
.oc-sdk-tab:hover { color: ${fg}; }
.oc-sdk-tab[aria-selected="true"] { color: ${selectionFg}; background: ${selection}; border-color: ${border}; }
.oc-sdk-tabs[data-track="true"] .oc-sdk-tab[aria-selected="true"] { color: ${elevatedFg}; background: var(--oc-sdk-raised-bg); ${raised} }
.oc-sdk-tab-count { color: ${muted}; }

/* The app's neutral badge: a step of the text colour, the same in every theme. */
.oc-sdk-badge { border-radius: 9999px; background: ${mix(fg, 6)}; color: ${muted}; }
.oc-sdk-badge[data-tone] { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); background: ${mix("var(--oc-sdk-tone)", 15)}; }

.oc-sdk-row { border-radius: 6px; transition: background 120ms ease-out; }
.oc-sdk-row:hover, .oc-sdk-row[data-active="true"] { background: ${hover}; }
.oc-sdk-row[aria-selected="true"] { background: ${selection}; color: ${selectionFg}; }
.oc-sdk-row-lead { font-family: ${mono}; color: ${muted}; }
.oc-sdk-row-sub { color: ${muted}; }
.oc-sdk-row-meta { color: ${muted}; }
.oc-sdk-row[aria-selected="true"] .oc-sdk-row-lead, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-sub, .oc-sdk-row[aria-selected="true"] .oc-sdk-row-meta { color: inherit; opacity: .75; }
.oc-sdk-list-empty { color: ${muted}; }

.oc-sdk-empty-body { color: ${muted}; }

.oc-sdk-spinner { color: ${muted}; }
.oc-sdk-spinner-ring { border-color: ${border}; border-top-color: ${primary}; border-radius: 9999px; }

/* Set apart by its tint alone, like the app's banners. */
.oc-sdk-banner { border-color: transparent; border-radius: 8px; background: ${mix("var(--oc-sdk-tone)", 10)}; }
.oc-sdk-banner-title { color: var(--oc-sdk-tone-text, var(--oc-sdk-tone)); }
.oc-sdk-banner-body { color: ${muted}; }

.oc-sdk-separator { color: ${muted}; }
.oc-sdk-separator::before, .oc-sdk-separator::after { background: ${mix(border, 40)}; }

.oc-sdk-progress-label { color: ${muted}; }
/* The app's progress: a groove a step of the text colour, green once done. Older bundles mark done only through aria-valuenow. */
.oc-sdk-progress-track { border-radius: 9999px; background: ${mix(fg, 6)}; }
.oc-sdk-progress-fill { border-radius: 9999px; background: var(--oc-sdk-tone, ${primary}); }
.oc-sdk-progress-track[aria-valuenow="100"] > .oc-sdk-progress-fill:not([data-tone]) { background: ${v("status-success", "currentColor")}; }
.oc-sdk-progress[data-done="true"] .oc-sdk-progress-value { color: ${v("success-text", "inherit")}; }

.oc-sdk-text a { color: ${primaryText}; text-decoration: underline; text-underline-offset: 2px; }
.oc-sdk-text img { border-radius: 8px; border: 1px solid ${mix(border, 60)}; }
`;
  var UI_CSS = `
${GUEST_SCROLLBAR_CSS}
${UI_SIZE_CSS}
${GUEST_UI_LOOK_CSS}`;

  // src/panel.js
  var host = connectHost();
  var ICON_MARK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><ellipse cx="12" cy="6" rx="6.5" ry="2.6"/><path d="M5.5 6v5.2c0 1.44 2.91 2.6 6.5 2.6s6.5-1.16 6.5-2.6V6"/><path d="M5.5 11.2V16c0 1.44 2.91 2.6 6.5 2.6s6.5-1.16 6.5-2.6v-4.8"/></svg>`;
  var ICON_REFRESH = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 11a8 8 0 1 0-2.34 5.66"/><path d="M20 4v7h-7"/></svg>`;
  var ICON_EDIT = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>`;
  var ICON_CHEVRON = `<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>`;
  var CURRENCIES = {
    CNY: "\xA5",
    USD: "$",
    EUR: "\u20AC",
    JPY: "\xA5",
    GBP: "\xA3"
  };
  var COPY = {
    zh: {
      title: "Token \u7528\u91CF",
      tagline: "\u672C\u5730\u7EDF\u8BA1 \xB7 \u624B\u52A8\u5B9A\u4EF7",
      refresh: "\u5237\u65B0",
      tabOverview: "\u6982\u89C8",
      tabPrices: "\u4EF7\u683C",
      balance: "\u4F59\u989D",
      balanceEmpty: "\u5F53\u524D\u4F1A\u8BDD\u6682\u65E0\u63D0\u4F9B\u5546",
      balanceProviders: "\u5404\u63D0\u4F9B\u5546\u4F59\u989D",
      genericProvider: "\u901A\u7528",
      edit: "\u7F16\u8F91",
      save: "\u4FDD\u5B58",
      cancel: "\u53D6\u6D88",
      unset: "\u672A\u8BBE\u7F6E",
      wSession: "\u672C\u4F1A\u8BDD",
      wToday: "\u4ECA\u5929",
      wWeek: "\u8FD1 7 \u5929",
      wMonth: "\u8FD1 30 \u5929",
      wAll: "\u5386\u53F2\u7D2F\u8BA1",
      noSession: "\u672A\u6253\u5F00\u4F1A\u8BDD",
      cache: "\u7F13\u5B58\u547D\u4E2D",
      chartTitle: "\u8FD1 14 \u5929",
      chartEmpty: "\u6682\u65E0\u7528\u91CF",
      tipCost: "\u8D39\u7528",
      modelsTitle: "\u6309\u6A21\u578B",
      modelsEmpty: "\u8FD8\u6CA1\u6709\u53EF\u7EDF\u8BA1\u7684\u8C03\u7528",
      unpriced: "\u672A\u5B9A\u4EF7",
      unpricedHint: "\u4EE5\u4E0B\u6A21\u578B\u8FD8\u6CA1\u6709\u4EF7\u683C\uFF0C\u8D39\u7528\u6309 0 \u8BA1\u7B97\u3002",
      priceTitle: "\u4EF7\u683C\u8BBE\u7F6E",
      currency: "\u8D27\u5E01",
      priceHint: "\u5355\u4EF7\u5355\u4F4D\u4E3A\u6BCF\u767E\u4E07 tokens\uFF1B\u8D39\u7528\u6309\u6BCF\u6B21\u8C03\u7528\u7684 token \u660E\u7EC6\u4F30\u7B97\u3002",
      addDefault: "\u6DFB\u52A0\u9ED8\u8BA4\u5355\u4EF7",
      defaultRule: "\u9ED8\u8BA4\u5355\u4EF7\uFF08\u6240\u6709\u672A\u5339\u914D\u7684\u6A21\u578B\uFF09",
      addModel: "\u6DFB\u52A0\u6A21\u578B",
      addModelPlaceholder: "provider/model\uFF0C\u4F8B\u5982 cnit/deepseek-chat",
      add: "\u6DFB\u52A0",
      remove: "\u5220\u9664\u5355\u4EF7",
      single: "\u5355\u72EC\u5B9A\u4EF7",
      priceInput: "\u8F93\u5165",
      priceOutput: "\u8F93\u51FA",
      priceCacheRead: "\u7F13\u5B58\u8BFB\u53D6",
      priceCacheWrite: "\u7F13\u5B58\u5199\u5165",
      unit: "\u6BCF\u767E\u4E07 tokens",
      longContext: "\u957F\u4E0A\u4E0B\u6587\u5206\u6BB5",
      over: "\u8D85\u8FC7",
      tokensAfter: "tokens \u540E",
      offPeak: "\u5CF0\u8C37\u65F6\u6BB5",
      valley: "\u8C37\u65F6",
      peak: "\u5CF0\u65F6",
      localTime: "\u6309\u672C\u673A\u65F6\u533A",
      weekendValley: "\u5468\u672B\u5168\u5929\u8C37\u4EF7",
      holidayValley: "\u8282\u5047\u65E5\u5168\u5929\u8C37\u4EF7",
      holidayHint: "\u65E5\u671F\u7528\u9017\u53F7\u5206\u9694\uFF0C\u4F8B\u5982 2026-10-01, 2026-10-02",
      longWins: "\u957F\u4E0A\u4E0B\u6587\u4E0E\u8C37\u65F6\u540C\u65F6\u547D\u4E2D\u65F6\uFF0C\u6309\u957F\u4E0A\u4E0B\u6587\u4EF7\u683C\u8BA1\u7B97\u3002",
      following: "\u672A\u5355\u72EC\u5B9A\u4EF7\uFF0C\u4F7F\u7528",
      useFallback: "\u7528",
      defaultShort: "\u9ED8\u8BA4\u5355\u4EF7",
      noRule: "\u672A\u8BBE\u7F6E\u5355\u4EF7",
      dbPath: "\u6570\u636E\u5E93\u8DEF\u5F84\uFF08\u53EF\u9009\uFF09",
      dbPathHint: "\u7559\u7A7A\u81EA\u52A8\u67E5\u627E ~/.local/share/opencode/opencode.db",
      savePath: "\u4FDD\u5B58\u8DEF\u5F84",
      usage: "\u7528\u91CF",
      historyTitle: "\u5386\u53F2\u7EDF\u8BA1",
      historyAll: "\u7EDF\u8BA1\u5168\u90E8\u5386\u53F2",
      historySince: (time) => `\u7EDF\u8BA1\u81EA ${time} \u8D77`,
      clearHistory: "\u6E05\u7A7A\u5386\u53F2\u7EDF\u8BA1",
      restoreHistory: "\u6062\u590D\u5B8C\u6574\u5386\u53F2",
      historyHint: "\u53EA\u6E05\u7A7A\u672C\u6269\u5C55\u7684\u7EDF\u8BA1\uFF0C\u4E0D\u5220\u9664 OpenCode \u6570\u636E\uFF1B\u53EF\u968F\u65F6\u6062\u590D\u3002",
      updated: (time) => `\u66F4\u65B0\u4E8E ${time}`,
      source: (count) => `OpenCode \xB7 ${count.toLocaleString("zh-CN")} \u6761\u8C03\u7528`,
      loading: "\u8BFB\u53D6\u4E2D\u2026",
      errorTitle: "\u65E0\u6CD5\u8BFB\u53D6\u7528\u91CF",
      errNoService: "\u6269\u5C55\u7684\u672C\u5730\u670D\u52A1\u8FD8\u6CA1\u6709\u542F\u52A8\u3002\u8BF7\u5728 \u8BBE\u7F6E \u2192 \u6269\u5C55 \u4E2D\u5141\u8BB8\u5B83\u8FD0\u884C\u672C\u5730\u670D\u52A1\uFF0C\u7136\u540E\u91CD\u8BD5\u3002",
      errServiceFailed: "\u6269\u5C55\u7684\u672C\u5730\u670D\u52A1\u542F\u52A8\u5931\u8D25\u3002\u91CD\u65B0\u52A0\u8F7D\u6269\u5C55\u6216\u91CD\u542F OpenChamber \u540E\u518D\u8BD5\u3002",
      errTimeout: "\u672C\u5730\u670D\u52A1\u54CD\u5E94\u8D85\u65F6\uFF0C\u8BF7\u91CD\u8BD5\u3002",
      errGeneric: "\u65E0\u6CD5\u8BFB\u53D6\u7528\u91CF\uFF0C\u8BF7\u91CD\u8BD5\u3002",
      errDbMissing: "\u627E\u4E0D\u5230 OpenCode \u6570\u636E\u5E93\u3002\u8BF7\u786E\u8BA4 OpenCode \u5DF2\u5728\u672C\u673A\u8FD0\u884C\u8FC7\uFF0C\u6216\u624B\u52A8\u586B\u5199\u6570\u636E\u5E93\u8DEF\u5F84\u3002",
      errDbFailed: "\u8BFB\u53D6 OpenCode \u6570\u636E\u5E93\u5931\u8D25\u3002",
      errSqlite: "\u5F53\u524D\u8FD0\u884C\u73AF\u5883\u4E0D\u652F\u6301 node:sqlite\uFF0C\u65E0\u6CD5\u8BFB\u53D6\u6570\u636E\u5E93\u3002",
      hidden: "\u5DF2\u9690\u85CF"
    },
    en: {
      title: "Token Usage",
      tagline: "Local stats \xB7 your own prices",
      refresh: "Refresh",
      tabOverview: "Overview",
      tabPrices: "Prices",
      balance: "Balance",
      balanceEmpty: "No provider in this session",
      balanceProviders: "Provider balances",
      genericProvider: "General",
      edit: "Edit",
      save: "Save",
      cancel: "Cancel",
      unset: "Not set",
      wSession: "This session",
      wToday: "Today",
      wWeek: "Last 7 days",
      wMonth: "Last 30 days",
      wAll: "All time",
      noSession: "No session open",
      cache: "cache hit",
      chartTitle: "Last 14 days",
      chartEmpty: "No usage yet",
      tipCost: "Cost",
      modelsTitle: "By model",
      modelsEmpty: "No calls recorded yet",
      unpriced: "Unpriced",
      unpricedHint: "These models have no price yet; their cost counts as 0.",
      priceTitle: "Pricing",
      currency: "Currency",
      priceHint: "Prices are per million tokens. Cost is estimated from each call\u2019s token usage.",
      addDefault: "Add default price",
      defaultRule: "Default price (every model without its own)",
      addModel: "Add model",
      addModelPlaceholder: "provider/model, e.g. cnit/deepseek-chat",
      add: "Add",
      remove: "Remove price",
      single: "Set price",
      priceInput: "Input",
      priceOutput: "Output",
      priceCacheRead: "Cache read",
      priceCacheWrite: "Cache write",
      unit: "per 1M tokens",
      longContext: "Long-context tier",
      over: "Over",
      tokensAfter: "tokens",
      offPeak: "Peak / off-peak",
      valley: "Off-peak",
      peak: "Peak",
      localTime: "local time",
      weekendValley: "All weekend at off-peak",
      holidayValley: "All holidays at off-peak",
      holidayHint: "Comma-separated dates, e.g. 2026-10-01, 2026-10-02",
      longWins: "When a call matches both, the long-context price applies.",
      following: "Falls back to",
      useFallback: "Uses",
      defaultShort: "Default",
      noRule: "No price set",
      dbPath: "Database path (optional)",
      dbPathHint: "Leave empty to use ~/.local/share/opencode/opencode.db",
      savePath: "Save path",
      usage: "Usage",
      historyTitle: "History",
      historyAll: "Counting all history",
      historySince: (time) => `Counting since ${time}`,
      clearHistory: "Clear history",
      restoreHistory: "Restore full history",
      historyHint: "Clears this extension\u2019s stats only; OpenCode data is untouched and can be restored.",
      updated: (time) => `Updated ${time}`,
      source: (count) => `OpenCode \xB7 ${count.toLocaleString("en-US")} calls`,
      loading: "Reading\u2026",
      errorTitle: "Could not read usage",
      errNoService: "The extension\u2019s local service has not started. Allow it to run a local service in Settings \u2192 Extensions, then retry.",
      errServiceFailed: "The local service failed to start. Reload the extension or restart OpenChamber.",
      errTimeout: "The local service timed out. Try again.",
      errGeneric: "Could not read usage. Try again.",
      errDbMissing: "OpenCode\u2019s database was not found. Run OpenCode on this machine once, or set the path manually.",
      errDbFailed: "Reading the OpenCode database failed.",
      errSqlite: "This runtime has no node:sqlite support, so the database cannot be read.",
      hidden: "Hidden"
    }
  };
  var APP_HTML = `
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
          <option value="CNY">CNY \xA5</option>
          <option value="USD">USD $</option>
          <option value="EUR">EUR \u20AC</option>
          <option value="JPY">JPY \xA5</option>
          <option value="GBP">GBP \xA3</option>
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
  var state = {
    lang: "zh",
    mounted: false,
    tab: "overview",
    session: null,
    data: null,
    error: null,
    loading: true,
    refreshing: false,
    updatedAt: 0,
    settings: {
      currency: "CNY",
      balances: {},
      balanceBaselines: {},
      rules: [],
      dbPath: "",
      historyStart: 0,
      modelsCollapsed: false
    },
    openRules: /* @__PURE__ */ new Set(),
    balanceEditing: false
  };
  var refs = {};
  var refreshTimer = null;
  var saveTimer = null;
  var statsTimer = null;
  var t = () => COPY[state.lang];
  function $(id) {
    return document.getElementById(id);
  }
  function el2(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== void 0 && text !== null) node.textContent = text;
    return node;
  }
  function money(value) {
    const number = Number(value);
    const symbol = CURRENCIES[state.settings.currency] || "";
    if (!Number.isFinite(number)) return `${symbol}0.00`;
    const abs = Math.abs(number);
    let digits = 2;
    if (abs > 0 && abs < 0.01) digits = 4;
    else if (abs < 1) digits = 3;
    return `${symbol}${number.toLocaleString(state.lang === "zh" ? "zh-CN" : "en-US", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    })}`;
  }
  function moneyPlain(value) {
    const number = Number(value);
    if (!Number.isFinite(number)) return "0";
    return String(Math.round(number * 1e4) / 1e4);
  }
  function formatTokens(value) {
    const number = Number(value) || 0;
    if (number < 1e3) return String(Math.round(number));
    if (number < 1e6) {
      const scaled = number / 1e3;
      return `${scaled >= 100 ? scaled.toFixed(0) : scaled.toFixed(scaled >= 10 ? 1 : 2).replace(/\.0+$/, "")}k`;
    }
    if (number < 1e9) {
      const scaled = number / 1e6;
      return `${scaled >= 100 ? scaled.toFixed(0) : scaled.toFixed(2).replace(/\.?0+$/, "")}M`;
    }
    return `${(number / 1e9).toFixed(2)}B`;
  }
  function formatTime(ms) {
    try {
      return new Date(ms).toLocaleTimeString(state.lang === "zh" ? "zh-CN" : "en-US", {
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "";
    }
  }
  function formatDateTime(ms) {
    try {
      return new Date(ms).toLocaleString(state.lang === "zh" ? "zh-CN" : "en-US", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return "";
    }
  }
  function renderHistory() {
    if (!refs.historyHint) return;
    const start = Number(state.settings.historyStart) || 0;
    refs.historyHint.textContent = start ? t().historySince(formatDateTime(start)) : t().historyAll;
    refs.restoreHistory.hidden = start <= 0;
  }
  function errorText2(error) {
    if (!error) return "";
    const code = typeof error.code === "string" ? error.code : "";
    const message = error instanceof Error ? error.message : String(error);
    if (code && message) return `${code}: ${message}`;
    return code || message;
  }
  function humanError() {
    const error = state.error;
    if (!error) return null;
    const code = error.code || "";
    let body = "";
    if (code === "db-missing") {
      body = t().errDbMissing;
      if (Array.isArray(error.tried) && error.tried.length) {
        body += `
${error.tried.join("\n")}`;
      }
    } else if (code === "NO_SERVICE") body = t().errNoService;
    else if (code === "SERVICE_FAILED") body = t().errServiceFailed;
    else if (code === "HOST_TIMEOUT") body = t().errTimeout;
    else if (code === "db-read-failed") body = `${t().errDbFailed} ${error.detail || ""}`.trim();
    else if (code === "sqlite-unavailable") body = t().errSqlite;
    else body = `${t().errGeneric}${error.message ? ` (${error.message})` : ""}`;
    return { title: t().errorTitle, body };
  }
  function sanitizeNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  }
  function sanitizeHolidays(input) {
    const values = Array.isArray(input) ? input : typeof input === "string" ? input.split(/[\s,，;；]+/) : [];
    const days = [];
    const seen = /* @__PURE__ */ new Set();
    for (const value of values) {
      if (typeof value !== "string") continue;
      const day = value.trim();
      if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || seen.has(day)) continue;
      seen.add(day);
      days.push(day);
    }
    return days;
  }
  function sanitizeBalances(raw) {
    const balances = {};
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      for (const [key, value] of Object.entries(raw)) {
        if (!key) continue;
        const n = Number(value);
        if (Number.isFinite(n) && n >= 0) balances[key] = n;
      }
    }
    if (!Object.keys(balances).length && typeof raw === "number" && Number.isFinite(raw) && raw >= 0) {
      balances["*"] = raw;
    }
    return balances;
  }
  function sanitizeRule(raw) {
    if (!raw || typeof raw !== "object") return null;
    const key = typeof raw.key === "string" ? raw.key.trim() : "";
    if (!key) return null;
    const rule = {
      key,
      input: sanitizeNumber(raw.input),
      output: sanitizeNumber(raw.output),
      cacheRead: sanitizeNumber(raw.cacheRead),
      cacheWrite: sanitizeNumber(raw.cacheWrite)
    };
    if (raw.long && typeof raw.long === "object") {
      rule.long = {
        over: sanitizeNumber(raw.long.over),
        input: sanitizeNumber(raw.long.input),
        output: sanitizeNumber(raw.long.output),
        cacheRead: sanitizeNumber(raw.long.cacheRead),
        cacheWrite: sanitizeNumber(raw.long.cacheWrite)
      };
    }
    if (raw.offPeak && typeof raw.offPeak === "object") {
      rule.offPeak = {
        start: typeof raw.offPeak.start === "string" ? raw.offPeak.start : "00:30",
        end: typeof raw.offPeak.end === "string" ? raw.offPeak.end : "08:30",
        weekend: raw.offPeak.weekend === true,
        holidayMode: raw.offPeak.holidayMode === true || sanitizeHolidays(raw.offPeak.holidays).length > 0,
        holidays: sanitizeHolidays(raw.offPeak.holidays),
        input: sanitizeNumber(raw.offPeak.input),
        output: sanitizeNumber(raw.offPeak.output),
        cacheRead: sanitizeNumber(raw.offPeak.cacheRead),
        cacheWrite: sanitizeNumber(raw.offPeak.cacheWrite)
      };
    }
    return rule;
  }
  function sanitizeSettings(raw) {
    const settings = {
      currency: CURRENCIES[raw?.currency] ? raw.currency : "CNY",
      balances: sanitizeBalances(raw?.balances ?? raw?.balance),
      balanceBaselines: sanitizeBalances(raw?.balanceBaselines),
      rules: [],
      dbPath: typeof raw?.dbPath === "string" ? raw.dbPath : "",
      historyStart: typeof raw?.historyStart === "number" && Number.isFinite(raw.historyStart) && raw.historyStart > 0 ? raw.historyStart : 0,
      modelsCollapsed: raw?.modelsCollapsed === true
    };
    const seen = /* @__PURE__ */ new Set();
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
  async function loadSettings() {
    try {
      const stored = await host.storage.get("settings");
      if (stored && typeof stored === "object") state.settings = sanitizeSettings(stored);
    } catch {
    }
  }
  function persistSettings() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      host.storage.set("settings", state.settings).catch(() => {
      });
    }, 250);
  }
  function persistNow() {
    clearTimeout(saveTimer);
    return host.storage.set("settings", state.settings).catch(() => {
    });
  }
  function mount() {
    $("app").innerHTML = APP_HTML;
    refs.refresh = $("refresh");
    refs.tabOverview = $("tab-overview");
    refs.tabPrices = $("tab-prices");
    refs.notice = $("notice");
    refs.noticeTitle = $("notice-title");
    refs.noticeBody = $("notice-body");
    refs.balanceEdit = $("balance-edit");
    refs.balanceForm = $("balance-form");
    refs.balanceList = $("balance-list");
    refs.balanceFields = $("balance-fields");
    refs.balanceSave = $("balance-save");
    refs.historyHint = $("history-hint");
    refs.clearHistory = $("clear-history");
    refs.restoreHistory = $("restore-history");
    refs.windows = $("windows");
    refs.chart = $("chart");
    refs.chartTip = $("chart-tip");
    refs.chartTotal = $("chart-total");
    refs.chartFrom = $("chart-from");
    refs.chartTo = $("chart-to");
    refs.models = $("models");
    refs.modelsHint = $("models-hint");
    refs.modelsCard = $("models-card");
    refs.modelsToggle = $("models-toggle");
    refs.updated = $("updated");
    refs.source = $("source");
    refs.rules = $("rules");
    refs.currency = $("currency");
    refs.addModel = $("add-model");
    refs.newModel = $("new-model");
    refs.dbForm = $("db-form");
    refs.dbPath = $("db-path");
    refs.unpricedHint = $("unpriced-hint");
    refs.addDefault = $("add-default");
    refs.refresh.addEventListener("click", () => void refresh());
    refs.addDefault.addEventListener("click", () => addRule("*", true));
    refs.tabOverview.addEventListener("click", () => switchTab("overview"));
    refs.tabPrices.addEventListener("click", () => switchTab("prices"));
    refs.balanceEdit.addEventListener("click", () => openBalance());
    refs.balanceForm.addEventListener("submit", (event) => {
      event.preventDefault();
      saveBalance();
    });
    refs.balanceSave.addEventListener("click", () => saveBalance());
    refs.modelsToggle.addEventListener("click", () => {
      state.settings.modelsCollapsed = !state.settings.modelsCollapsed;
      persistSettings();
      renderModelsToggle();
    });
    refs.clearHistory.addEventListener("click", () => {
      state.settings.historyStart = Date.now();
      persistNow();
      renderHistory();
      void refresh({ quiet: true });
    });
    refs.restoreHistory.addEventListener("click", () => {
      state.settings.historyStart = 0;
      persistNow();
      renderHistory();
      void refresh({ quiet: true });
    });
    refs.balanceForm.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeBalance();
    });
    $("balance-cancel").addEventListener("click", () => closeBalance());
    refs.currency.addEventListener("change", () => {
      state.settings.currency = CURRENCIES[refs.currency.value] ? refs.currency.value : "CNY";
      persistSettings();
      renderAll();
    });
    refs.addModel.addEventListener("submit", (event) => {
      event.preventDefault();
      const key = refs.newModel.value.trim();
      if (!key) return;
      refs.newModel.value = "";
      addRule(key);
    });
    refs.dbForm.addEventListener("submit", (event) => {
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
    const overview = tab !== "prices";
    $("view-overview").hidden = !overview;
    $("view-prices").hidden = overview;
    refs.tabOverview.setAttribute("aria-selected", overview ? "true" : "false");
    refs.tabPrices.setAttribute("aria-selected", overview ? "false" : "true");
    if (overview) renderStats();
    else renderPrices();
  }
  function applyCopy() {
    const copy = t();
    for (const node of document.querySelectorAll("[data-copy]")) {
      const key = node.getAttribute("data-copy");
      const value = copy[key];
      if (typeof value === "string") node.textContent = value;
    }
    refs.refresh?.setAttribute("title", copy.refresh);
    refs.refresh?.setAttribute("aria-label", copy.refresh);
    refs.newModel?.setAttribute("placeholder", copy.addModelPlaceholder);
    if (refs.currency) refs.currency.value = state.settings.currency;
    document.documentElement.lang = state.lang === "zh" ? "zh-CN" : "en";
  }
  function renderAll() {
    if (!state.mounted) return;
    renderNotice();
    renderHistory();
    renderModelsToggle();
    if (state.tab === "prices") renderPrices();
    else renderStats();
    if (refs.currency) refs.currency.value = state.settings.currency;
    if (refs.dbPath && document.activeElement !== refs.dbPath) {
      refs.dbPath.value = state.settings.dbPath;
    }
    renderBalance();
  }
  async function refresh({ quiet = false } = {}) {
    if (state.refreshing) return;
    state.refreshing = true;
    if (!quiet) state.loading = !state.data;
    refs.refresh?.classList.add("busy");
    renderStats();
    try {
      const payload = {
        sessionId: state.session?.id ?? null,
        now: Date.now(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
        dbPath: state.settings.dbPath || "",
        resetAt: state.settings.historyStart || 0,
        prices: { currency: state.settings.currency, rules: state.settings.rules }
      };
      const response = await host.serviceRequest({
        method: "POST",
        path: "/stats",
        body: JSON.stringify(payload)
      });
      if (!response || response.status !== 200) throw new Error(`HTTP ${response?.status ?? "?"}`);
      const data = JSON.parse(response.body);
      if (!data || data.ok !== true) {
        state.error = {
          code: data?.error || "ERROR",
          detail: data?.detail || "",
          tried: data?.tried || [],
          message: data?.message || ""
        };
        state.data = null;
      } else {
        state.data = data;
        state.error = null;
        state.updatedAt = Date.now();
      }
    } catch (error) {
      state.error = { code: error?.code || "ERROR", message: errorText2(error) };
      state.data = null;
    } finally {
      state.refreshing = false;
      state.loading = false;
      refs.refresh?.classList.remove("busy");
      renderStats();
      renderNotice();
      if (state.tab === "prices") {
        const unpriced = state.data?.unpriced || [];
        if (refs.unpricedHint) {
          refs.unpricedHint.hidden = unpriced.length === 0;
          if (unpriced.length) {
            refs.unpricedHint.textContent = `${t().unpricedHint} ${unpriced.map((item) => item.key).join("\u3001")}`;
          }
        }
      }
    }
  }
  function scheduleRefresh() {
    clearTimeout(statsTimer);
    statsTimer = setTimeout(() => void refresh({ quiet: true }), 700);
  }
  function renderNotice() {
    if (!refs.notice) return;
    const info = humanError();
    refs.notice.hidden = !info;
    if (info) {
      refs.noticeTitle.textContent = info.title;
      refs.noticeBody.textContent = info.body;
    }
  }
  var KNOWN_PROVIDERS = {
    deepseek: "DeepSeek",
    openai: "OpenAI",
    anthropic: "Anthropic",
    google: "Google",
    siliconflow: "SiliconFlow",
    "siliconflow-cn": "SiliconFlow CN"
  };
  function providerName(provider) {
    if (provider === "*") return t().genericProvider;
    const configured = state.data?.providerNames?.[provider];
    if (typeof configured === "string" && configured.trim()) return configured.trim();
    if (KNOWN_PROVIDERS[provider]) return KNOWN_PROVIDERS[provider];
    return String(provider || "").split(/[-_]/).filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
  }
  function sessionProviders() {
    const models = state.data?.windows?.session?.models;
    if (!Array.isArray(models)) return [];
    return [...new Set(models.map((model) => model.providerID).filter(Boolean))].sort(
      (a, b) => a.localeCompare(b)
    );
  }
  function providerSpent(provider) {
    const lifetime = state.data?.lifetime?.providers;
    if (Array.isArray(lifetime)) {
      const found = lifetime.find((item) => item.providerID === provider);
      return Number(found?.cost) || 0;
    }
    return (state.data?.models || []).filter((model) => model.providerID === provider).reduce((sum, model) => sum + (Number(model.cost) || 0), 0);
  }
  function ensureBalanceBaselines() {
    if (!state.data) return;
    const balances = state.settings.balances || {};
    const baselines = state.settings.balanceBaselines ||= {};
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
    refs.balanceList.innerHTML = "";
    if (!providers.length) {
      refs.balanceList.append(el2("div", "balance-empty", t().balanceEmpty));
      return;
    }
    for (const provider of providers) {
      const row = el2("div", "balance-provider");
      row.append(el2("span", "name", providerName(provider)));
      const balance = balances[provider];
      const baseline = state.settings.balanceBaselines?.[provider];
      const spentSince = Number.isFinite(baseline) ? Math.max(0, providerSpent(provider) - baseline) : 0;
      const remaining = Number.isFinite(balance) ? balance - spentSince : null;
      const text = el2("span", "value", Number.isFinite(remaining) ? money(remaining) : t().unset);
      if (!Number.isFinite(remaining)) text.classList.add("muted");
      else if (remaining < 0) text.classList.add("negative");
      row.append(text);
      refs.balanceList.append(row);
    }
  }
  function renderBalanceFields() {
    if (!refs.balanceFields) return;
    const providers = sessionProviders();
    refs.balanceFields.innerHTML = "";
    if (!providers.length) {
      refs.balanceFields.append(el2("p", "hint", t().balanceEmpty));
      return;
    }
    for (const provider of providers) {
      const row = el2("label", "balance-field");
      row.append(el2("span", "name", providerName(provider)));
      const input = el2("input");
      input.type = "number";
      input.min = "0";
      input.step = "0.01";
      input.inputMode = "decimal";
      input.dataset.provider = provider;
      input.placeholder = "0";
      const value = state.settings.balances?.[provider];
      input.value = Number.isFinite(value) ? String(value) : "";
      row.append(input);
      refs.balanceFields.append(row);
    }
    refs.balanceFields.querySelector("input")?.focus();
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
    const next = { ...state.settings.balances || {} };
    const baselines = { ...state.settings.balanceBaselines || {} };
    for (const input of refs.balanceFields?.querySelectorAll("input[data-provider]") || []) {
      const provider = input.dataset.provider;
      if (!provider) continue;
      const text = input.value.trim();
      if (text === "") {
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
      refs.updated.textContent = state.updatedAt ? t().updated(formatTime(state.updatedAt)) : "";
    }
    if (refs.source) {
      const count = state.data?.db?.messages;
      refs.source.textContent = typeof count === "number" ? t().source(count) : "";
    }
  }
  var WINDOW_ORDER = [
    ["session", "wSession"],
    ["today", "wToday"],
    ["week", "wWeek"],
    ["month", "wMonth"],
    ["all", "wAll"]
  ];
  function renderWindows() {
    if (!refs.windows) return;
    refs.windows.replaceChildren();
    for (const [key, labelKey] of WINDOW_ORDER) {
      const window2 = state.data?.windows?.[key] || null;
      const row = el2("div", "wrow");
      if (key === "today") row.classList.add("today");
      const main = el2("div", "wmain");
      const label = el2("div", "wlabel", t()[labelKey]);
      if (key === "session" && state.data?.session?.title) {
        label.title = state.data.session.title;
      }
      main.append(label);
      let meta;
      if (key === "session" && !state.data?.sessionId) meta = t().noSession;
      else if (!window2) meta = state.loading ? t().loading : "\u2014";
      else {
        meta = `${formatTokens(window2.tokens?.total || 0)} tokens`;
        if (window2.cacheRate > 0) meta += ` \xB7 ${t().cache} ${Math.round(window2.cacheRate * 100)}%`;
      }
      main.append(el2("div", "wmeta", meta));
      const side = el2("div", "wside");
      const cost = el2("div", "wcost");
      if (!window2 || key === "session" && !state.data?.sessionId) {
        cost.textContent = "\u2014";
      } else {
        cost.textContent = money(window2.cost || 0);
        if (window2.steps === 0) cost.classList.add("muted");
        if ((window2.models || []).some((model) => !model.priced) && window2.steps > 0) {
          cost.append(el2("span", "star", "*"));
          cost.title = t().unpricedHint;
        }
      }
      side.append(cost);
      if (window2 && window2.steps > 0) {
        side.append(el2("div", "wsteps", `${window2.steps}`));
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
      refs.chart.append(el2("div", "chart-empty", t().chartEmpty));
      refs.chartTotal.textContent = "";
      refs.chartFrom.textContent = "";
      refs.chartTo.textContent = "";
      return;
    }
    const max = Math.max(...days.map((day) => day.tokens || 0), 0);
    const total = days.reduce((sum, day) => sum + (day.cost || 0), 0);
    refs.chartTotal.textContent = total > 0 ? money(total) : "";
    for (const day of days) {
      const bar = el2("div", "bar");
      const ratio = max > 0 ? (day.tokens || 0) / max : 0;
      bar.style.height = `${Math.max(ratio > 0 ? 6 : 2, Math.round(ratio * 100))}%`;
      if (!day.tokens) bar.classList.add("empty");
      const label = `${day.day} \xB7 ${formatTokens(day.tokens || 0)} tokens \xB7 ${money(day.cost || 0)}`;
      bar.tabIndex = 0;
      bar.setAttribute("aria-label", label);
      const showTip = () => {
        if (!refs.chartTip) return;
        refs.chartTip.replaceChildren(
          el2("div", "tip-date", day.day),
          (() => {
            const row = el2("div", "tip-row");
            row.append(el2("span", "", t().usage), el2("span", "", `${formatTokens(day.tokens || 0)} tokens`));
            return row;
          })(),
          (() => {
            const row = el2("div", "tip-row");
            row.append(el2("span", "", t().tipCost), el2("span", "", money(day.cost || 0)));
            return row;
          })()
        );
        refs.chartTip.hidden = false;
        const chartRect = refs.chart.getBoundingClientRect();
        const barRect = bar.getBoundingClientRect();
        const tipRect = refs.chartTip.getBoundingClientRect();
        const left = Math.max(
          0,
          Math.min(
            barRect.left - chartRect.left + barRect.width / 2 - tipRect.width / 2,
            chartRect.width - tipRect.width
          )
        );
        const top = Math.max(0, barRect.top - chartRect.top - tipRect.height - 4);
        refs.chartTip.style.left = `${left}px`;
        refs.chartTip.style.top = `${top}px`;
      };
      const hideTip = () => {
        if (refs.chartTip) refs.chartTip.hidden = true;
      };
      bar.addEventListener("mouseenter", showTip);
      bar.addEventListener("mouseleave", hideTip);
      bar.addEventListener("focus", showTip);
      bar.addEventListener("blur", hideTip);
      refs.chart.append(bar);
    }
    const first = days[0].day.slice(5).replace("-", "/");
    const last = days[days.length - 1].day.slice(5).replace("-", "/");
    refs.chartFrom.textContent = first;
    refs.chartTo.textContent = last;
  }
  function renderModelsToggle() {
    if (!refs.modelsCard || !refs.modelsToggle) return;
    const collapsed = Boolean(state.settings.modelsCollapsed);
    refs.modelsCard.classList.toggle("collapsed", collapsed);
    refs.modelsToggle.setAttribute("aria-expanded", String(!collapsed));
  }
  function renderModels() {
    if (!refs.models) return;
    refs.models.replaceChildren();
    const models = (state.data?.models || []).slice(0, 8);
    if (!models.length) {
      refs.models.append(el2("div", "empty-line", t().modelsEmpty));
      refs.modelsHint.textContent = "";
      return;
    }
    refs.modelsHint.textContent = `${state.data.models.length}`;
    for (const model of models) {
      const row = el2("button", "mrow");
      row.type = "button";
      row.dataset.key = model.key;
      const left = el2("div", "mmain");
      const name = el2("div", "mname", model.modelID);
      const provider = el2("div", "mprov", providerName(model.providerID));
      left.append(name, provider);
      const right = el2("div", "mside");
      right.append(el2("div", "mcost", money(model.cost || 0)));
      right.append(
        el2("div", "mtokens", `${formatTokens(model.tokens?.total || 0)}${model.priced ? "" : ` \xB7 ${t().unpriced}`}`)
      );
      if (!model.priced) row.classList.add("unpriced");
      row.append(left, right);
      row.addEventListener("click", () => {
        switchTab("prices");
        state.openRules.add(model.key);
        renderPrices();
        const target = refs.rules.querySelector(`[data-key="${cssEscape(model.key)}"]`);
        target?.scrollIntoView({ block: "nearest" });
      });
      refs.models.append(row);
    }
  }
  function cssEscape(value) {
    if (typeof CSS !== "undefined" && typeof CSS.escape === "function") return CSS.escape(value);
    return String(value).replace(/["\\]/g, "\\$&");
  }
  function matchRuleFor(key, rules) {
    const exact = rules.find((rule) => rule.key === key);
    if (exact) return { rule: exact, exact: true };
    const slash = key.indexOf("/");
    const providerID = slash >= 0 ? key.slice(0, slash) : "";
    const modelID = slash >= 0 ? key.slice(slash + 1) : key;
    const byModel = rules.find((rule) => rule.key === modelID);
    if (byModel) return { rule: byModel, exact: false };
    if (providerID) {
      const byProvider = rules.find((rule) => rule.key === `${providerID}/*`);
      if (byProvider) return { rule: byProvider, exact: false };
    }
    const fallback = rules.find((rule) => rule.key === "*");
    if (fallback) return { rule: fallback, exact: false };
    return { rule: null, exact: false };
  }
  function ruleEntries() {
    const observed = state.data?.models || [];
    const seen = new Set(observed.map((model) => model.key));
    const entries = [];
    const defaultRule = state.settings.rules.find((rule) => rule.key === "*");
    if (defaultRule) entries.push({ key: "*", rule: defaultRule, usage: null, exact: true });
    for (const model of observed) {
      const match = matchRuleFor(model.key, state.settings.rules);
      entries.push({
        key: model.key,
        rule: match.exact ? match.rule : null,
        fallback: match.exact ? null : match.rule,
        usage: model,
        exact: match.exact
      });
    }
    for (const rule of state.settings.rules) {
      if (rule.key === "*" || seen.has(rule.key)) continue;
      entries.push({ key: rule.key, rule, fallback: null, usage: null, exact: true });
    }
    return entries;
  }
  function priceSummary(rule) {
    if (!rule) return "";
    const parts = [
      `${t().priceInput} ${moneyPlain(rule.input)}`,
      `${t().priceOutput} ${moneyPlain(rule.output)}`,
      `${t().priceCacheRead} ${moneyPlain(rule.cacheRead)}`
    ];
    if (rule.cacheWrite > 0) parts.push(`${t().priceCacheWrite} ${moneyPlain(rule.cacheWrite)}`);
    return parts.join(" \xB7 ");
  }
  function renderPrices() {
    if (!refs.rules) return;
    refs.rules.replaceChildren();
    const entries = ruleEntries();
    for (const entry of entries) {
      refs.rules.append(buildRuleCard(entry));
    }
    const hasDefault = state.settings.rules.some((rule) => rule.key === "*");
    if (refs.addDefault) refs.addDefault.hidden = hasDefault;
    const unpriced = state.data?.unpriced || [];
    refs.unpricedHint.hidden = unpriced.length === 0;
    if (unpriced.length) {
      refs.unpricedHint.textContent = `${t().unpricedHint} ${unpriced.map((item) => item.key).join("\u3001")}`;
    }
  }
  function buildRuleCard(entry) {
    const details = el2("details", "rule");
    details.dataset.key = entry.key;
    if (state.openRules.has(entry.key)) details.open = true;
    const summary = el2("summary");
    const head = el2("div", "rule-head");
    const title = el2("div", "rule-name");
    title.textContent = entry.key === "*" ? t().defaultRule : entry.key;
    title.title = title.textContent;
    if (entry.key === "*") title.classList.add("default");
    head.append(title);
    const meta = el2("div", "rule-meta");
    const usage = entry.usage;
    if (usage) {
      meta.textContent = `${formatTokens(usage.tokens?.total || 0)} \xB7 ${money(usage.cost || 0)}`;
    } else if (entry.rule) {
      meta.textContent = priceSummary(entry.rule);
    } else if (!entry.fallback) {
      meta.textContent = t().noRule;
    }
    head.append(meta);
    const badge = el2("div", "rule-badge");
    if (!entry.rule && !entry.fallback) {
      badge.textContent = t().unpriced;
      badge.classList.add("warn");
    } else if (!entry.exact && entry.fallback) {
      const full = `${t().following} ${entry.fallback.key === "*" ? t().defaultRule : entry.fallback.key}`;
      badge.textContent = `${t().useFallback} ${entry.fallback.key === "*" ? t().defaultShort : entry.fallback.key}`;
      badge.title = full;
      badge.classList.add("soft");
    } else if (entry.rule?.long) {
      badge.textContent = "\u957F\u4E0A\u4E0B\u6587";
      badge.classList.add("soft");
    } else if (entry.rule?.offPeak) {
      badge.textContent = "\u5CF0\u8C37";
      badge.classList.add("soft");
    }
    head.append(badge, (() => {
      const chevron = document.createElement("span");
      chevron.className = "chev-wrap";
      chevron.innerHTML = ICON_CHEVRON;
      return chevron;
    })());
    summary.append(head);
    details.append(summary);
    details.addEventListener("toggle", () => {
      if (details.open) state.openRules.add(entry.key);
      else state.openRules.delete(entry.key);
    });
    if (entry.rule) {
      details.append(buildRuleBody(entry.rule));
    } else {
      const body = el2("div", "rule-body");
      const button2 = el2("button", "ghost small", t().single);
      button2.type = "button";
      button2.addEventListener("click", () => addRule(entry.key, true));
      body.append(button2);
      details.append(body);
    }
    return details;
  }
  function buildRuleBody(rule) {
    const body = el2("div", "rule-body");
    const grid = el2("div", "grid");
    grid.append(
      priceField(rule, "input", t().priceInput),
      priceField(rule, "output", t().priceOutput),
      priceField(rule, "cacheRead", t().priceCacheRead),
      priceField(rule, "cacheWrite", t().priceCacheWrite)
    );
    body.append(grid, el2("div", "unit-hint", t().unit));
    const longToggle = checkboxRow(t().longContext, Boolean(rule.long));
    body.append(longToggle.row);
    if (rule.long) {
      const box = el2("div", "extra");
      const overRow = el2("label", "field wide");
      overRow.append(document.createTextNode(`${t().over} `));
      const over = el2("input");
      over.type = "number";
      over.min = "0";
      over.step = "1000";
      over.value = String(rule.long.over || 0);
      over.addEventListener("input", () => {
        rule.long.over = sanitizeNumber(over.value);
        scheduleSave();
        scheduleRefresh();
      });
      overRow.append(over, document.createTextNode(` ${t().tokensAfter}`));
      box.append(overRow);
      const longGrid = el2("div", "grid");
      longGrid.append(
        priceField(rule.long, "input", t().priceInput),
        priceField(rule.long, "output", t().priceOutput),
        priceField(rule.long, "cacheRead", t().priceCacheRead),
        priceField(rule.long, "cacheWrite", t().priceCacheWrite)
      );
      box.append(longGrid);
      body.append(box);
    }
    longToggle.input.addEventListener("change", () => {
      if (longToggle.input.checked) {
        rule.long = {
          over: rule.long?.over || 2e5,
          input: rule.long?.input ?? rule.input * 2,
          output: rule.long?.output ?? rule.output * 2,
          cacheRead: rule.long?.cacheRead ?? rule.cacheRead * 2,
          cacheWrite: rule.long?.cacheWrite ?? rule.cacheWrite * 2
        };
        state.openRules.add(rule.key);
      } else {
        delete rule.long;
      }
      persistSettings();
      renderPrices();
      scheduleRefresh();
    });
    const offToggle = checkboxRow(t().offPeak, Boolean(rule.offPeak));
    body.append(offToggle.row);
    if (rule.offPeak) {
      const box = el2("div", "extra");
      const timeRow = el2("div", "time-row");
      const start = timeInput(rule.offPeak.start);
      start.addEventListener("input", () => {
        rule.offPeak.start = start.value || "00:30";
        scheduleSave();
        scheduleRefresh();
      });
      const end = timeInput(rule.offPeak.end);
      end.addEventListener("input", () => {
        rule.offPeak.end = end.value || "08:30";
        scheduleSave();
        scheduleRefresh();
      });
      timeRow.append(
        el2("span", "time-label", `${t().valley} ${t().localTime}`),
        start,
        el2("span", "time-dash", "\u2013"),
        end
      );
      box.append(timeRow);
      const weekend = checkboxRow(t().weekendValley, Boolean(rule.offPeak.weekend));
      weekend.input.addEventListener("change", () => {
        rule.offPeak.weekend = weekend.input.checked;
        scheduleSave();
        scheduleRefresh();
      });
      box.append(weekend.row);
      const holiday = checkboxRow(t().holidayValley, Boolean(rule.offPeak.holidayMode));
      holiday.input.addEventListener("change", () => {
        rule.offPeak.holidayMode = holiday.input.checked;
        if (!holiday.input.checked) rule.offPeak.holidays = [];
        persistSettings();
        renderPrices();
        scheduleRefresh();
      });
      box.append(holiday.row);
      if (rule.offPeak.holidayMode) {
        const holidayInput = el2("input", "holiday-input");
        holidayInput.type = "text";
        holidayInput.spellcheck = false;
        holidayInput.autocomplete = "off";
        holidayInput.placeholder = "2026-10-01, 2026-10-02";
        holidayInput.value = (rule.offPeak.holidays || []).join(", ");
        holidayInput.addEventListener("input", () => {
          rule.offPeak.holidays = sanitizeHolidays(holidayInput.value);
          scheduleSave();
          scheduleRefresh();
        });
        box.append(holidayInput, el2("p", "hint", t().holidayHint));
      }
      const offGrid = el2("div", "grid");
      offGrid.append(
        priceField(rule.offPeak, "input", t().priceInput),
        priceField(rule.offPeak, "output", t().priceOutput),
        priceField(rule.offPeak, "cacheRead", t().priceCacheRead),
        priceField(rule.offPeak, "cacheWrite", t().priceCacheWrite)
      );
      box.append(offGrid);
      body.append(box);
    }
    offToggle.input.addEventListener("change", () => {
      if (offToggle.input.checked) {
        rule.offPeak = {
          start: rule.offPeak?.start || "00:30",
          end: rule.offPeak?.end || "08:30",
          weekend: rule.offPeak?.weekend === true,
          holidayMode: rule.offPeak?.holidayMode === true,
          holidays: rule.offPeak?.holidays || [],
          input: rule.offPeak?.input ?? roundPrice(rule.input * 0.5),
          output: rule.offPeak?.output ?? roundPrice(rule.output * 0.5),
          cacheRead: rule.offPeak?.cacheRead ?? roundPrice(rule.cacheRead * 0.5),
          cacheWrite: rule.offPeak?.cacheWrite ?? roundPrice(rule.cacheWrite * 0.5)
        };
        state.openRules.add(rule.key);
      } else {
        delete rule.offPeak;
      }
      persistSettings();
      renderPrices();
      scheduleRefresh();
    });
    const actions = el2("div", "rule-actions");
    const remove = el2("button", "ghost small danger", t().remove);
    remove.type = "button";
    remove.addEventListener("click", () => {
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
    return Math.round(value * 1e4) / 1e4;
  }
  function priceField(target, field2, label) {
    const wrap = el2("label", "field");
    wrap.append(el2("span", "", label));
    const input = el2("input");
    input.type = "number";
    input.min = "0";
    input.step = "any";
    input.inputMode = "decimal";
    input.value = target[field2] === 0 ? "0" : String(target[field2] ?? 0);
    input.addEventListener("input", () => {
      target[field2] = sanitizeNumber(input.value);
      scheduleSave();
      scheduleRefresh();
    });
    wrap.append(input);
    return wrap;
  }
  function checkboxRow(label, checked) {
    const row = el2("label", "check-row");
    const input = el2("input");
    input.type = "checkbox";
    input.checked = checked;
    row.append(input, el2("span", "", label));
    return { row, input };
  }
  function timeInput(value) {
    const input = el2("input", "time-input");
    input.type = "time";
    input.step = "60";
    input.value = value || "00:30";
    return input;
  }
  function addRule(key, open = true) {
    const existing = state.settings.rules.find((rule2) => rule2.key === key);
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
      cacheWrite: fallback?.cacheWrite ?? 0
    };
    state.settings.rules.push(rule);
    state.openRules.add(key);
    persistNow();
    renderPrices();
  }
  function scheduleSave() {
    persistSettings();
  }
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
      if (event?.phase === "completed" || event?.phase === "failure") {
        void refresh({ quiet: true });
      }
    });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && Date.now() - state.updatedAt > 2e4) {
        void refresh({ quiet: true });
      }
    });
    await refresh();
    if (refreshTimer) clearInterval(refreshTimer);
    refreshTimer = setInterval(() => {
      if (document.visibilityState === "hidden" || state.refreshing) return;
      if (Date.now() - state.updatedAt < 2e4) return;
      void refresh({ quiet: true });
    }, 2e4);
  }
  host.onReady((ctx) => {
    const lang = /^zh/i.test(ctx.locale || "") ? "zh" : "en";
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
})();

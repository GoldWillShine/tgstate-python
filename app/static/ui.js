(function () {
  function getThemePref() {
    try {
      return localStorage.getItem("tgstate_theme_pref") || "system";
    } catch (e) {
      return "system";
    }
  }

  function setThemePref(mode) {
    try {
      localStorage.setItem("tgstate_theme_pref", mode);
    } catch (e) {}
  }

  function computeTheme(mode) {
    if (mode === "system") {
      try {
        return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      } catch (e) {
        return "light";
      }
    }
    return mode === "dark" ? "dark" : "light";
  }

  function applyTheme(mode) {
    var theme = computeTheme(mode);
    document.documentElement.setAttribute("data-ui-mode", mode);
    document.documentElement.setAttribute("data-ui-theme", theme);
  }

  function bindThemeSelect() {
    var sel = document.getElementById("ui-theme");
    if (!sel) return;
    var mode = getThemePref();
    sel.value = mode;
    sel.addEventListener("change", function () {
      var v = sel.value || "system";
      setThemePref(v);
      applyTheme(v);
    });

    try {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      mq.addEventListener("change", function () {
        var cur = getThemePref();
        if (cur === "system") applyTheme("system");
      });
    } catch (e) {}
  }

  function toast(text) {
    if (!text) return;
    var el = document.createElement("div");
    el.className = "ui-toast";
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(function () {
      try {
        el.remove();
      } catch (e) {}
    }, 2600);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
        return true;
      } catch (e2) {
        return false;
      }
    }
  }

  function qs(id) {
    return document.getElementById(id);
  }

  function val(id) {
    var el = qs(id);
    return el ? String(el.value || "") : "";
  }

  function setText(id, text) {
    var el = qs(id);
    if (el) el.textContent = text || "";
  }

  function setPill(id, kind, text) {
    var el = qs(id);
    if (!el) return;
    el.className = "ui-pill" + (kind ? " " + kind : "");
    el.textContent = text || "";
  }

  function normalizeCfg(cfg) {
    var out = cfg || {};
    return {
      botTokenSet: !!out.BOT_TOKEN_SET,
      channelName: out.CHANNEL_NAME || "",
      passSet: !!out.PASS_WORD_SET,
      baseUrl: out.BASE_URL || "",
      apiKeySet: !!out.PICGO_API_KEY_SET,
    };
  }

  function cfgState(c) {
    var any =
      c.botTokenSet || !!c.channelName || c.passSet || !!c.baseUrl || c.apiKeySet;
    var ready = c.botTokenSet && !!c.channelName;
    if (!any) return "未启用";
    if (ready) return "已启用";
    return "部分启用";
  }

  function stepDone(c, idx) {
    if (idx === 1) return c.botTokenSet && !!c.channelName;
    if (idx === 2) return c.passSet || !!c.baseUrl;
    if (idx === 3) return c.apiKeySet;
    return false;
  }

  function updateStepper(c) {
    var done = 0;
    for (var i = 1; i <= 3; i++) {
      var el = qs("step-" + i);
      var ok = stepDone(c, i);
      if (ok) done++;
      if (el) el.setAttribute("data-done", ok ? "1" : "0");
    }
    setText("step-count", done + "/3");
  }

  function validateBotToken(s) {
    var t = (s || "").trim();
    if (!t) return { ok: null, msg: "可跳过，后续可补全" };
    if (t.indexOf(":") > 0 && t.length >= 20) return { ok: true, msg: "格式看起来没问题" };
    return { ok: false, msg: "格式可能不正确（通常包含冒号）" };
  }

  function validateChannel(s) {
    var t = (s || "").trim();
    if (!t) return { ok: null, msg: "可跳过，后续可补全" };
    if (t.startsWith("@") || t.startsWith("-100")) return { ok: true, msg: "格式看起来没问题" };
    return { ok: false, msg: "建议使用 @username 或 -100..." };
  }

  function validateBaseUrl(s) {
    var t = (s || "").trim();
    if (!t) return { ok: null, msg: "可留空（默认使用当前访问来源）" };
    if (t.startsWith("http://") || t.startsWith("https://")) return { ok: true, msg: "格式看起来没问题" };
    return { ok: false, msg: "需要以 http:// 或 https:// 开头" };
  }

  function renderChecks() {
    var v1 = validateBotToken(val("bot-token"));
    var v2 = validateChannel(val("chan-name"));
    var v3 = validateBaseUrl(val("base-url"));

    setPill("bot-token-mark", v1.ok === true ? "ok" : v1.ok === false ? "bad" : "", v1.ok === true ? "✅" : v1.ok === false ? "⚠️" : "—");
    setText("bot-token-help", v1.msg);

    setPill("chan-mark", v2.ok === true ? "ok" : v2.ok === false ? "bad" : "", v2.ok === true ? "✅" : v2.ok === false ? "⚠️" : "—");
    setText("chan-help", v2.msg);

    setPill("base-mark", v3.ok === true ? "ok" : v3.ok === false ? "bad" : "", v3.ok === true ? "✅" : v3.ok === false ? "⚠️" : "—");
    setText("base-help", v3.msg);
  }

  function pickPayload() {
    var payload = {};
    var a = val("bot-token").trim();
    var b = val("chan-name").trim();
    var c = val("pass-word");
    var d = val("base-url").trim();
    var e = val("picgo-key").trim();

    if (a) payload.BOT_TOKEN = a;
    if (b) payload.CHANNEL_NAME = b;
    if (c) payload.PASS_WORD = c;
    if (d) payload.BASE_URL = d;
    if (e) payload.PICGO_API_KEY = e;
    return payload;
  }

  async function apiJson(url, body) {
    var res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body || {}),
    });
    var json = null;
    try {
      json = await res.json();
    } catch (e) {}
    return { ok: res.ok, json: json };
  }

  async function initSettings() {
    var root = qs("ui-settings");
    if (!root) return;

    async function refresh() {
      var res = await fetch("/api/app-config");
      var json = await res.json();
      var c = normalizeCfg(json && json.cfg);

      var state = cfgState(c);
      setPill("cfg-pill", state === "已启用" ? "ok" : state === "未启用" ? "" : "", "配置：" + state);

      var origin = window.location.origin;
      setText("site-origin", origin);

      var bot = (json && json.bot) || {};
      var botText = bot.running ? "Bot：运行中" : bot.ready ? "Bot：未启动" : "Bot：未启动（缺少配置）";
      if (bot && bot.error) botText = "Bot：启动失败";
      setPill("bot-pill", bot.running ? "ok" : bot && bot.error ? "bad" : "", botText);

      setText("chan-saved", c.channelName ? "已保存" : "未保存");
      setText("token-saved", c.botTokenSet ? "已保存" : "未保存");
      setText("pass-saved", c.passSet ? "已保存" : "未保存");
      setText("base-saved", c.baseUrl ? "已保存" : "未保存");
      setText("key-saved", c.apiKeySet ? "已保存" : "未保存");

      var chanEl = qs("chan-name");
      var baseEl = qs("base-url");
      if (chanEl && !chanEl.value) chanEl.value = c.channelName || "";
      if (baseEl && !baseEl.value) baseEl.value = c.baseUrl || "";

      updateStepper(c);
      renderChecks();

      var btnBot = qs("test-bot");
      var btnChan = qs("test-chan");
      var hasToken = !!val("bot-token").trim() || c.botTokenSet;
      var hasChan = !!val("chan-name").trim() || !!c.channelName;
      if (btnBot) btnBot.disabled = !hasToken;
      if (btnChan) btnChan.disabled = !(hasToken && hasChan);
    }

    function bind() {
      var inputs = ["bot-token", "chan-name", "base-url"];
      inputs.forEach(function (id) {
        var el = qs(id);
        if (!el) return;
        el.addEventListener("input", function () {
          renderChecks();
        });
      });

      var btnOrigin = qs("use-origin");
      if (btnOrigin) {
        btnOrigin.addEventListener("click", function () {
          var el = qs("base-url");
          if (el) el.value = window.location.origin;
          renderChecks();
        });
      }

      var btnEye = qs("pass-eye");
      if (btnEye) {
        btnEye.addEventListener("click", function () {
          var el = qs("pass-word");
          if (!el) return;
          el.type = el.type === "password" ? "text" : "password";
        });
      }

      var btnGen = qs("key-gen");
      if (btnGen) {
        btnGen.addEventListener("click", async function () {
          var bytes = new Uint8Array(24);
          try {
            crypto.getRandomValues(bytes);
          } catch (e) {
            for (var i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
          }
          var s = btoa(String.fromCharCode.apply(null, Array.from(bytes)))
            .replace(/\+/g, "-")
            .replace(/\//g, "_")
            .replace(/=+$/g, "");
          var el = qs("picgo-key");
          if (el) el.value = s;
          toast("已生成");
        });
      }

      var btnCopyKey = qs("key-copy");
      if (btnCopyKey) {
        btnCopyKey.addEventListener("click", async function () {
          var s = val("picgo-key").trim();
          if (!s) return;
          var ok = await copyText(s);
          toast(ok ? "已复制" : "复制失败");
        });
      }

      var btnSave = qs("btn-save");
      if (btnSave) {
        btnSave.addEventListener("click", async function () {
          var payload = pickPayload();
          var r = await apiJson("/api/app-config/save", payload);
          toast(r.ok ? "已保存（未应用）" : (r.json && r.json.detail && r.json.detail.message) || "保存失败");
          await refresh();
        });
      }

      var btnApply = qs("btn-apply");
      if (btnApply) {
        btnApply.addEventListener("click", async function () {
          var payload = pickPayload();
          var r = await apiJson("/api/app-config/apply", payload);
          toast(r.ok ? "已保存并应用" : (r.json && r.json.detail && r.json.detail.message) || "操作失败");
          var pw = qs("pass-word");
          var tk = qs("bot-token");
          var pk = qs("picgo-key");
          if (pw) pw.value = "";
          if (tk) tk.value = "";
          if (pk) pk.value = "";
          await refresh();
        });
      }

      var btnReset = qs("btn-reset");
      if (btnReset) {
        btnReset.addEventListener("click", async function () {
          var ok = confirm("确定要重置配置吗？这会清空已保存的内容。");
          if (!ok) return;
          var r = await fetch("/api/reset-config", { method: "POST" });
          var j = null;
          try { j = await r.json(); } catch (e) {}
          toast(r.ok ? "已重置" : (j && j.detail && j.detail.message) || "重置失败");
          await refresh();
        });
      }

      var btnTestBot = qs("test-bot");
      if (btnTestBot) {
        btnTestBot.addEventListener("click", async function () {
          btnTestBot.disabled = true;
          var payload = { BOT_TOKEN: val("bot-token").trim() || null };
          var r = await apiJson("/api/verify/bot", payload);
          var msg = "不可用";
          if (r.json && r.json.available) msg = "可用" + (r.json.bot_username ? " @" + r.json.bot_username : "");
          if (r.json && r.json.message) msg = r.json.message;
          toast(msg);
          btnTestBot.disabled = false;
        });
      }

      var btnTestChan = qs("test-chan");
      if (btnTestChan) {
        btnTestChan.addEventListener("click", async function () {
          btnTestChan.disabled = true;
          var payload = { BOT_TOKEN: val("bot-token").trim() || null, CHANNEL_NAME: val("chan-name").trim() || null };
          var r = await apiJson("/api/verify/channel", payload);
          var msg = r.json && r.json.available ? "可用" : (r.json && r.json.message) || "不可用";
          toast(msg);
          btnTestChan.disabled = false;
        });
      }

      var shareCopy = document.querySelectorAll("[data-ui-copy]");
      shareCopy.forEach(function (btn) {
        btn.addEventListener("click", async function () {
          var targetId = btn.getAttribute("data-ui-copy");
          var el = document.getElementById(targetId);
          if (!el) return;
          var ok = await copyText(el.value || el.textContent || "");
          toast(ok ? "已复制" : "复制失败");
        });
      });
    }

    bind();
    await refresh();
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindThemeSelect();
    initSettings();
  });
})();

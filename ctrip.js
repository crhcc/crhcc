/*
========================================================
  携程旅行 | 会员每日签到 + 滑块验证码自动识别
  作者: ddgksf2013 | 滑块: xzxxn777/ddddocr
========================================================

【QuantumultX 配置】

[rewrite_local]
^https:\/\/m\.ctrip\.com\/restapi\/soa2\/\d+\/[a-zA-Z]+Login(?:$|\?) url script-request-body ctrip.js

[task_local]
15 7,15 * * * ctrip.js, tag=携程签到, enabled=true, img-url=https://raw.githubusercontent.com/Orz-3/mini/master/Color/ctrip.png

[mitm]
hostname = m.ctrip.com

【首次使用】
1. 开启 MitM + 重写，打开携程 App 登录一次，自动保存 Auth
2. 之后每天自动定时签到

【青龙面板环境变量】
CTRIP_AUTH={"account":{"user1":{"auth":"ticket=xxx&uid=xxx"}}}
DDDDOCR_HOST=http://127.0.0.1:8080
CTRIP_BARK_KEY=你的Bark推送Key（可选）
========================================================
*/

// ============================================================
// ★ 配置区
// ============================================================
// 圈X用户：把 YOUR_VPS_IP 替换为你VPS的公网IP
// 青龙用户：设置环境变量 DDDDOCR_HOST 自动覆盖
const DDDDOCR_HOST = (function () {
  try { return process.env.DDDDOCR_HOST || "http://213.35.120.215:8080"; } catch (e) { return "http://213.35.120.215:8080"; }
})();

// 滑块偏移比例校正，通常 1.0 即可，若位置偏差大可试 0.5
const IMG_SCALE = 1.0;
// ============================================================

const $ = new Env("携程签到");
const STORE_KEY = "CTRIP_DAILY_BONUS";

!(async () => {
  try {
    // ── 重写模式：拦截登录请求，保存 Auth ────────────────────
    if (typeof $request !== "undefined") {
      await saveAuth();
      return $.done({});
    }

    // ── 定时任务：执行签到 ───────────────────────────────────
    $.log("脚本启动");

    const stored = $.isNode
      ? (tryGet("CTRIP_AUTH") || "")
      : ($.getdata(STORE_KEY) || "");

    if (!stored) {
      $.notify("携程签到", "⚠️ 未找到认证信息", "请先打开携程App登录触发抓包");
      return $.done();
    }

    // 解析账号（兼容单账号字符串和多账号JSON）
    let accounts = {};
    try {
      const parsed = JSON.parse(stored);
      accounts = parsed.account || {};
    } catch (e) {
      accounts = { 默认账号: { auth: stored } };
    }

    const names = Object.keys(accounts);
    if (names.length === 0) {
      $.notify("携程签到", "❌ 账号为空", "");
      return $.done();
    }

    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      const info = accounts[name] || {};
      if (!info.auth) continue;
      $.log("===== 账号: " + name + " =====");
      await runCheckin(name, info.auth);
      if (i < names.length - 1) await $.wait(2000);
    }

  } catch (e) {
    $.log("脚本异常:", e && e.message ? e.message : String(e));
    $.notify("携程签到", "❌ 脚本异常", e && e.message ? e.message : String(e));
  }

  $.done();
})();

// 安全读取 Node.js 环境变量
function tryGet(key) {
  try { return process.env[key] || ""; } catch (e) { return ""; }
}

// ============================================================
// 单账号签到主流程
// ============================================================
async function runCheckin(name, auth) {
  // 1. 会员积分签到
  const r1 = await checkinWithCaptcha(auth, "signToday",
    "https://m.ctrip.com/restapi/soa2/22769/signToday");
  const msg1 = parseResult(r1);
  $.log("[会员签到] " + msg1);

  // 2. 小程序积分签到
  const r2 = await checkinWithCaptcha(auth, "signInWechatPoint",
    "https://m.ctrip.com/restapi/soa2/14160/signInWechatPoint");
  const msg2 = parseResult(r2);
  $.log("[小程序签到] " + msg2);

  // 3. 查询积分
  const pts = await queryPoints(auth);
  $.log("[积分余额] " + pts);

  const summary = msg1 + "\n" + msg2 + "\n💰 积分: " + pts;
  $.notify("携程签到", "账号: " + name, summary);

  // Bark 推送（仅 Node.js 青龙）
  const barkKey = tryGet("CTRIP_BARK_KEY");
  if (barkKey && $.isNode) {
    const https = require("https");
    https.get("https://api.day.app/" + barkKey + "/携程签到/" + encodeURIComponent(name + "\n" + summary))
      .on("error", function () {});
  }
}

// ============================================================
// 带验证码自动重试的签到
// ============================================================
async function checkinWithCaptcha(auth, tag, url, verifiedToken, retry) {
  retry = retry || 0;
  if (retry >= 3) return { _error: "验证码重试超限" };

  var bodyObj = { head: buildHead() };
  if (verifiedToken) bodyObj.verifiedToken = verifiedToken;

  var resp, data;
  try {
    resp = await $.post({ url: url, headers: buildHeaders(auth), body: JSON.stringify(bodyObj) });
    data = JSON.parse(resp.body);
  } catch (e) {
    $.log("[" + tag + "] 请求异常: " + (e.message || e));
    return null;
  }

  if (needsCaptcha(data)) {
    $.log("[" + tag + "] 🔐 触发验证码 (第" + (retry + 1) + "次)");
    $.log("[" + tag + "] 验证码数据: " + JSON.stringify(data));
    try {
      var token = await handleCaptcha(auth, data);
      if (token) {
        $.log("[" + tag + "] ✅ 验证通过，重新签到...");
        return checkinWithCaptcha(auth, tag, url, token, retry + 1);
      }
    } catch (e) {
      $.log("[" + tag + "] 验证码处理失败: " + (e.message || e));
    }
  }

  return data;
}

// ============================================================
// 查询积分余额
// ============================================================
async function queryPoints(auth) {
  try {
    var resp = await $.post({
      url: "https://m.ctrip.com/restapi/soa2/15634/json/getPointsOrderUserInfo",
      headers: buildHeaders(auth),
      body: JSON.stringify({ head: buildHead() })
    });
    var d = JSON.parse(resp.body);
    return d.memberPoints || d.totalPoints || d.point || "查询失败";
  } catch (e) {
    return "查询异常";
  }
}

// ============================================================
// 判断是否触发了滑块验证码
// ============================================================
function needsCaptcha(data) {
  if (!data) return false;
  var code = String(data.resultCode || data.ResultCode || data.code || "");
  var type = String(data.verifyType || data.captchaType || data.slideType || "").toLowerCase();
  return (
    code === "NEED_CHALLENGE" ||
    code === "NEED_VERIFY" ||
    code === "NeedSlide" ||
    code === "40302" ||
    code === "CAPTCHA_REQUIRED" ||
    type.indexOf("slide") !== -1 ||
    !!data.bizToken ||
    !!data.captchaId ||
    !!data.bgPicUrl ||
    !!data.backgroundImage
  );
}

// ============================================================
// 验证码处理全流程
// ============================================================
async function handleCaptcha(auth, captchaData) {
  var bgSrc  = captchaData.bgPicUrl      || captchaData.backgroundImage || captchaData.bgImg || captchaData.bg  || "";
  var tpSrc  = captchaData.cutPicUrl     || captchaData.slidingImage    || captchaData.slideImg || captchaData.tp || "";
  var bizToken = captchaData.bizToken    || captchaData.captchaId       || captchaData.verifyToken || "";

  if (!bgSrc || !tpSrc) {
    $.log("⚠️ 找不到验证码图片字段，请查看上方完整响应数据确认字段名");
    return null;
  }

  // 调用 ddddocr（直接传 URL，让服务端下载图片）
  var ocrResp, ocrData;
  try {
    ocrResp = await $.post({
      url: DDDDOCR_HOST + "/capcode",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slidingImage: tpSrc,   // 滑块拼图块
        backImage:    bgSrc,   // 背景图（有缺口）
        simpleTarget: false    // 拼图类型用 false
      })
    });
    ocrData = JSON.parse(ocrResp.body);
  } catch (e) {
    $.log("ddddocr 调用失败: " + (e.message || e));
    return null;
  }

  if (ocrData.result === undefined) {
    $.log("ddddocr 无 result 字段: " + ocrResp.body);
    return null;
  }

  var moveX = Math.round(ocrData.result * IMG_SCALE);
  $.log("🎯 识别偏移: " + ocrData.result + "px → 校正后: " + moveX + "px");

  return await submitCaptcha(auth, bizToken, moveX, captchaData);
}

// ============================================================
// 提交滑块答案，返回 verifiedToken
// ============================================================
async function submitCaptcha(auth, bizToken, moveX, captchaData) {
  var verifyUrl = captchaData.verifyUrl || "https://m.ctrip.com/restapi/soa2/22769/verifyCaptcha";
  var duration  = Math.floor(Math.random() * 600) + 800;

  try {
    var resp = await $.post({
      url: verifyUrl,
      headers: buildHeaders(auth),
      body: JSON.stringify({
        head:      buildHead(),
        bizToken:  bizToken,
        captchaId: bizToken,
        moveX:     moveX,
        moveY:     0,
        duration:  duration
      })
    });
    $.log("验证提交响应: " + resp.body);
    var d = JSON.parse(resp.body);
    var token = d.verifiedToken || d.token || (d.data && d.data.verifiedToken) || "";
    if (!token) $.log("⚠️ 未收到 verifiedToken");
    return token || null;
  } catch (e) {
    $.log("提交验证码失败: " + (e.message || e));
    return null;
  }
}

// ============================================================
// 拦截登录请求，提取并保存 Auth
// ============================================================
async function saveAuth() {
  try {
    var body = ($request && $request.body) ? $request.body : "{}";
    var data;
    try { data = JSON.parse(body); } catch (e) { $.log("登录body非JSON"); return; }

    var ticket = data.ticket || data.access_token || data.Token || data.token || "";
    var uid    = data.uid    || data.userId       || data.memberID || data.cuid || "";

    if (!ticket || !uid) {
      $.log("登录请求未含 ticket/uid，字段: " + Object.keys(data).join(", "));
      return;
    }

    var auth  = "ticket=" + ticket + "&uid=" + uid;
    var acctName = "user_" + uid;
    var existing = $.getdata(STORE_KEY) || "{}";
    var store = { account: {} };
    try { store = JSON.parse(existing) || store; } catch (e) {}
    if (!store.account) store.account = {};
    store.account[acctName] = { auth: auth, uid: uid };
    $.setdata(JSON.stringify(store), STORE_KEY);
    $.notify("携程签到", "✅ Auth 已保存", "账号: " + acctName);
    $.log("已保存: " + acctName);
  } catch (e) {
    $.log("saveAuth 异常: " + (e.message || e));
  }
}

// ============================================================
// 解析签到结果
// ============================================================
function parseResult(data) {
  if (!data) return "请求失败";
  if (data._error) return "❌ " + data._error;
  var desc   = data.desc || data.message || data.tips || data.resultDesc || "";
  var points = data.points || data.point || data.earnPoints || "";
  if (desc && points) return desc + "（+" + points + "分）";
  if (desc) return desc;
  if (points) return "+" + points + "分";
  var code = String(data.resultCode || data.code || "");
  if (code === "0" || code === "OK" || code === "SUCCESS") return "✅ 成功";
  return "code=" + code;
}

// ============================================================
// 构建请求头
// ============================================================
function buildHeaders(cookieStr) {
  var ticketMatch = cookieStr.match(/ticket=([^&;]+)/);
  return {
    "Content-Type": "application/json",
    "Cookie":       cookieStr,
    "User-Agent":   "CtripMobile/8.55.0 CFNetwork/1494.0.7 Darwin/23.4.0",
    "cticket":      ticketMatch ? ticketMatch[1] : ""
  };
}

function buildHead() {
  return {
    Locale:    "zh-CN",
    Platform:  "H5",
    Currency:  "CNY",
    TimeZone:  "Asia/Shanghai",
    Extension: [{ name: "protocal", value: "https" }]
  };
}

// ============================================================
// Env 类 — 兼容 QuantumultX / Surge / Loon / Node.js
// ============================================================
function Env(name) {
  var isQX    = typeof $task       !== "undefined";
  var isSurge = typeof $httpClient !== "undefined" && typeof $loon === "undefined";
  var isLoon  = typeof $loon       !== "undefined";
  var isNode  = typeof module      !== "undefined";

  function log() {
    var args = Array.prototype.slice.call(arguments);
    console.log.apply(console, ["[" + name + "]"].concat(args));
  }

  function notify(title, subtitle, body) {
    if      (isQX)              $notify(title, subtitle, body);
    else if (isSurge || isLoon) $notification.post(title, subtitle, body);
    else                        console.log("\n📢 " + title + "\n" + subtitle + "\n" + body);
  }

  function wait(ms) {
    return new Promise(function (resolve) { setTimeout(resolve, ms); });
  }

  function getdata(key) {
    if (isQX)              return $prefs.valueForKey(key);
    if (isSurge || isLoon) return $persistentStore.read(key);
    if (isNode) {
      try { return require("fs").readFileSync("./" + key + ".json", "utf8"); } catch (e) { return ""; }
    }
    return "";
  }

  function setdata(val, key) {
    if (isQX)              return $prefs.setValueForKey(val, key);
    if (isSurge || isLoon) return $persistentStore.write(val, key);
    if (isNode) {
      try { require("fs").writeFileSync("./" + key + ".json", val, "utf8"); return true; } catch (e) { return false; }
    }
    return false;
  }

  function request(method, options) {
    return new Promise(function (resolve, reject) {
      var opts = {
        url:     options.url,
        headers: options.headers || {},
        body:    options.body,
        method:  method.toUpperCase()
      };

      if (isQX) {
        $task.fetch(opts)
          .then(function (r) { resolve({ status: r.statusCode, headers: r.headers, body: r.body }); })
          .catch(reject);

      } else if (isSurge || isLoon) {
        var fn = method.toLowerCase() === "post" ? $httpClient.post : $httpClient.get;
        fn(opts, function (e, r, b) {
          if (e) return reject(e);
          resolve({ status: r.status, headers: r.headers, body: b });
        });

      } else if (isNode) {
        var u   = new URL(options.url);
        var mod = u.protocol === "https:" ? require("https") : require("http");
        var req = mod.request({
          hostname: u.hostname,
          port:     u.port || (u.protocol === "https:" ? 443 : 80),
          path:     u.pathname + u.search,
          method:   method.toUpperCase(),
          headers:  opts.headers
        }, function (res) {
          var chunks = [];
          res.on("data", function (c) { chunks.push(c); });
          res.on("end",  function ()  { resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString("utf8") }); });
        });
        req.on("error", reject);
        if (opts.body) req.write(opts.body);
        req.end();
      } else {
        reject(new Error("未知运行环境"));
      }
    });
  }

  function get(opts)  { return request("get",  opts); }
  function post(opts) { return request("post", opts); }

  function done(v) {
    if (isQX || isSurge || isLoon) $done(v || {});
  }

  return {
    name:    name,
    isNode:  isNode,
    isQX:    isQX,
    isSurge: isSurge,
    isLoon:  isLoon,
    log:     log,
    notify:  notify,
    wait:    wait,
    getdata: getdata,
    setdata: setdata,
    get:     get,
    post:    post,
    done:    done
  };
}

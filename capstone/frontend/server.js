// 커스텀 Next.js 서버 + T-Pot 어택맵 리버스 프록시.
//
// basePath(/threat-console) 하에서도 동작하도록 prefix를 흡수한다.
// - <base>/tpot-map/*  → map_web(:64299)의 /*   (어택맵 UI, HTTP)
// - <base>/websocket   → map_web(:64299)의 /websocket (실시간 피드, WS 업그레이드)
// - 그 외 모든 경로     → Next.js 핸들러(basePath 포함 url 그대로 전달)
//
// Next standalone server.js는 WS 업그레이드 프록시를 못 해서 직접 작성.

const http = require("http");
const next = require("next");
const httpProxy = require("http-proxy");

const port = parseInt(process.env.PORT || "8001", 10);
const BASE = process.env.BASE_PATH || "/threat-console";
const TPOT = process.env.TPOT_MAP_TARGET || "http://map_web:64299";

const app = next({ dev: false });
const handle = app.getRequestHandler();

const proxy = httpProxy.createProxyServer({
  target: TPOT,
  ws: true,
  changeOrigin: true,
  xfwd: true,
});

proxy.on("error", (err, req, res) => {
  console.error("[tpot-map proxy] error:", err.message);
  if (res && typeof res.writeHead === "function" && !res.headersSent) {
    res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("T-Pot 어택맵 연결 실패 — infra_only(map_web) 기동 여부를 확인하세요.\n" + err.message);
  } else if (res && typeof res.destroy === "function") {
    res.destroy();
  }
});

// basePath가 붙어있으면 제거(없으면 그대로) → map/ws 판별·재작성에 사용
function stripBase(url) {
  return url.startsWith(BASE) ? url.slice(BASE.length) || "/" : url;
}
function isMap(url) {
  return stripBase(url).startsWith("/tpot-map");
}
function isWs(url) {
  return stripBase(url).startsWith("/websocket");
}
// map_web은 루트에서 서빙 → basePath와 /tpot-map prefix 모두 제거
function toMapPath(url) {
  const u = stripBase(url).replace(/^\/tpot-map/, "");
  return u === "" ? "/" : u;
}
function toWsPath(url) {
  const u = stripBase(url);
  return u === "" ? "/" : u;
}

app.prepare().then(() => {
  const server = http.createServer((req, res) => {
    const url = req.url || "/";
    if (isMap(url)) {
      req.url = toMapPath(url);
      proxy.web(req, res, { target: TPOT });
      return;
    }
    if (isWs(url)) {
      req.url = toWsPath(url);
      proxy.web(req, res, { target: TPOT });
      return;
    }
    handle(req, res);
  });

  // WebSocket 업그레이드 프록시
  server.on("upgrade", (req, socket, head) => {
    const url = req.url || "";
    if (isWs(url)) {
      req.url = toWsPath(url);
      proxy.ws(req, socket, head, { target: TPOT });
    } else if (isMap(url)) {
      req.url = toMapPath(url);
      proxy.ws(req, socket, head, { target: TPOT });
    } else {
      socket.destroy();
    }
  });

  server.listen(port, "0.0.0.0", () => {
    console.log(`> capstone frontend ready on :${port} basePath=${BASE} (TPOT_MAP_TARGET=${TPOT})`);
  });
});

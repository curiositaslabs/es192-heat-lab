// Tiny static server for the browser tests (textures cannot load from file:// URLs).
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".jpg": "image/jpeg", ".png": "image/png", ".hdr": "application/octet-stream", ".css": "text/css" };
module.exports = () => new Promise(res => {
  const srv = http.createServer((req, rsp) => {
    const p = path.join(ROOT, decodeURIComponent(req.url.split("?")[0]).replace(/\/$/, "/index.html"));
    if (!p.startsWith(ROOT) || !fs.existsSync(p)) { rsp.writeHead(404); rsp.end(); return; }
    rsp.writeHead(200, { "Content-Type": TYPES[path.extname(p)] || "application/octet-stream" }); fs.createReadStream(p).pipe(rsp);
  }).listen(0, () => res({ url: "http://127.0.0.1:" + srv.address().port + "/", close: () => srv.close() }));
});

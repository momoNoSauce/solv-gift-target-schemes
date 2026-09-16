// Static server with SPA fallback: node spa-serve.js <dir> <port>
const http = require('http'), fs = require('fs'), path = require('path');
const [dir, port] = [process.argv[2], Number(process.argv[3] || 8125)];
const types = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.webp': 'image/webp', '.gif': 'image/gif' };
http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  let f = path.join(dir, url);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(dir, 'index.html');
  res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(port);

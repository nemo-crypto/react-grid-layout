const express = require('express');
const fs = require('node:fs');
const path = require('node:path');
const folder = path.resolve(__dirname, '../demo-dist');
if (!fs.existsSync(path.join(folder, 'index.html'))) { console.error('先运行 yarn build:demo'); process.exit(1); }
const app = express(); app.disable('x-powered-by'); app.use(express.static(folder));
const server = app.listen(4175, '127.0.0.1', () => console.log('布局工作台预览：http://127.0.0.1:4175'));
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close());

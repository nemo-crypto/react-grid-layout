const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
fs.rmSync(path.join(root, 'build'), { recursive: true, force: true });
for (const [script, args] of [
  ['@babel/cli/bin/babel.js', ['--out-dir', 'build', 'lib']],
  ['webpack-cli/bin/cli.js', ['--config', 'webpack.config.js']]
]) {
  const result = spawnSync(process.execPath, [require.resolve(script), ...args], { cwd: root, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = __dirname;
const firefoxDir = path.join(rootDir, 'firefox_build');

if (fs.existsSync(firefoxDir)) {
  fs.rmSync(firefoxDir, { recursive: true, force: true });
}
fs.mkdirSync(firefoxDir, { recursive: true });

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    fs.mkdirSync(dest, { recursive: true });
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

['background.js', 'icons', 'content', 'popup'].forEach((item) => {
  const srcPath = path.join(rootDir, item);
  const destPath = path.join(firefoxDir, item);
  if (fs.existsSync(srcPath)) {
    copyRecursiveSync(srcPath, destPath);
  }
});

fs.copyFileSync(
  path.join(rootDir, 'manifest.firefox.json'),
  path.join(firefoxDir, 'manifest.json')
);

// Create POSIX-compliant forward-slash ZIP archives using tar
try {
  const chromeZip = path.join(rootDir, 'admit-plus-chrome.zip');
  const firefoxZip = path.join(rootDir, 'admit-plus-firefox.zip');

  if (fs.existsSync(chromeZip)) fs.unlinkSync(chromeZip);
  if (fs.existsSync(firefoxZip)) fs.unlinkSync(firefoxZip);

  execSync('tar -a -c -f admit-plus-chrome.zip manifest.json background.js icons content popup', {
    cwd: rootDir,
    stdio: 'inherit'
  });

  execSync('tar -a -c -f ../admit-plus-firefox.zip manifest.json background.js icons content popup', {
    cwd: firefoxDir,
    stdio: 'inherit'
  });

  console.log('Build completed: admit-plus-chrome.zip and admit-plus-firefox.zip');
} catch (err) {
  console.error('Error creating zip packages:', err);
}

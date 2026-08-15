/**
 * Admit+ Build & Packaging Script
 * Generates ready-to-use unpacked directories and .zip archives for both Chrome and Firefox
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = __dirname;
const firefoxDir = path.join(rootDir, 'firefox_build');

console.log('🚀 Building Admit+ for Chrome & Firefox...');

// 1. Prepare Firefox Build Directory
if (fs.existsSync(firefoxDir)) {
  fs.rmSync(firefoxDir, { recursive: true, force: true });
}
fs.mkdirSync(firefoxDir, { recursive: true });

// Copy assets and folders
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

// Copy shared extension code to firefox_build
['background.js', 'icons', 'content', 'popup'].forEach((item) => {
  const srcPath = path.join(rootDir, item);
  const destPath = path.join(firefoxDir, item);
  if (fs.existsSync(srcPath)) {
    copyRecursiveSync(srcPath, destPath);
  }
});

// Copy manifest.firefox.json as manifest.json inside firefox_build
fs.copyFileSync(
  path.join(rootDir, 'manifest.firefox.json'),
  path.join(firefoxDir, 'manifest.json')
);

console.log('✅ Firefox build directory created at:', firefoxDir);

// 2. Create ZIP Archives via PowerShell
try {
  // Chrome Zip
  execSync(
    `powershell -Command "Compress-Archive -Path manifest.json, background.js, icons, content, popup -DestinationPath admit-plus-chrome.zip -Force; Copy-Item admit-plus-chrome.zip admit-plus-v1.2.0.zip -Force"`,
    { cwd: rootDir, stdio: 'inherit' }
  );
  console.log('✅ Chrome package built: admit-plus-chrome.zip');

  // Firefox Zip
  execSync(
    `powershell -Command "Compress-Archive -Path manifest.json, background.js, icons, content, popup -DestinationPath ../admit-plus-firefox.zip -Force"`,
    { cwd: firefoxDir, stdio: 'inherit' }
  );
  console.log('✅ Firefox package built: admit-plus-firefox.zip');
} catch (err) {
  console.error('Error creating zip packages:', err);
}

console.log('🎉 All builds completed successfully!');

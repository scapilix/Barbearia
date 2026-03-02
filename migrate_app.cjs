const fs = require('fs');
const path = require('path');

const sourceDir = path.resolve('..', 'Unhas', 'premium-nail-salon');
const destDir = path.resolve(__dirname);

console.log('Source:', sourceDir);
console.log('Destination:', destDir);

// VERY IMPORTANT: We only read from sourceDir. All writes are to destDir.

const dirsToCopy = ['src', 'public'];
const filesToCopy = ['index.html', 'package.json', 'vite.config.js', 'tailwind.config.js'];

// 1. Delete existing dest directories to ensure clean slate
console.log('Cleaning destination directories...');
for (const dir of dirsToCopy) {
  const destPath = path.join(destDir, dir);
  if (fs.existsSync(destPath)) {
    fs.rmSync(destPath, { recursive: true, force: true });
  }
}

// Helper to copy recursively
function copyInteractive(src, dest) {
  if (fs.statSync(src).isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const file of fs.readdirSync(src)) {
      copyInteractive(path.join(src, file), path.join(dest, file));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// 2. Deep copy
console.log('Copying files from Nail Salon...');
for (const dir of dirsToCopy) {
  const srcPath = path.join(sourceDir, dir);
  const destPath = path.join(destDir, dir);
  if (fs.existsSync(srcPath)) {
    copyInteractive(srcPath, destPath);
  } else {
    console.warn(`Source dir missing: ${srcPath}`);
  }
}

for (const file of filesToCopy) {
  const srcPath = path.join(sourceDir, file);
  const destPath = path.join(destDir, file);
  if (fs.existsSync(srcPath)) {
    fs.copyFileSync(srcPath, destPath);
  }
}

// 3. String Replacements in Dest ONLY
console.log('Replacing terminology in Barbearia...');

const replacements = [
  { search: /TOBeauty/g, replace: 'TOBarber' },
  { search: /TO Beauty/g, replace: 'TO Barber' },
  { search: /Premium Nail Salon/g, replace: 'Premium Barbershop' },
  { search: /Unhas/gi, replace: 'Barba' },
  { search: /Nail/gi, replace: 'Barber' },
  { search: /Manicure/gi, replace: 'Corte' },
  { search: /Pedicure/gi, replace: 'Máquina' },
  { search: /Estética/gi, replace: 'Barbearia' },
  { search: /Letícia/g, replace: 'William' },
  { search: /Carla/g, replace: 'Rodrigo' },
  { search: /Ana/g, replace: 'Francisco' }
];

function processDirectoryReplaces(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectoryReplaces(fullPath);
    } else {
      // Only process text files
      const ext = path.extname(fullPath);
      if (['.jsx', '.js', '.html', '.css', '.json'].includes(ext)) {
        let content = fs.readFileSync(fullPath, 'utf8');
        let modified = false;
        
        // Skip modifying package-lock or things we shouldn't touch
        if (file === 'package-lock.json') continue;

        // Custom package.json name change
        if (file === 'package.json') {
           content = content.replace(/"name":\s*"[^"]+"/, '"name": "to-barber"');
           modified = true;
        }

        for (const { search, replace } of replacements) {
          if (content.match(search)) {
            content = content.replace(search, replace);
            modified = true;
          }
        }
        
        if (modified) {
          fs.writeFileSync(fullPath, content, 'utf8');
        }
      }
    }
  }
}

// Process replacements inside destDir's src and public and base files
processDirectoryReplaces(path.join(destDir, 'src'));
processDirectoryReplaces(path.join(destDir, 'public'));
for (const file of filesToCopy) {
  const destPath = path.join(destDir, file);
  if (fs.existsSync(destPath)) {
    let content = fs.readFileSync(destPath, 'utf8');
    for (const { search, replace } of replacements) {
      if (content.match(search)) {
        content = content.replace(search, replace);
      }
    }
    fs.writeFileSync(destPath, content, 'utf8');
  }
}

console.log('Migration and text replacements completed successfully! Original Nails folder is UNTOUCHED.');

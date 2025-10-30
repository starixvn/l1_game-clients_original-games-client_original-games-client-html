const fs = require('fs');
const path = require('path');

function copyDir(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const items = fs.readdirSync(src);
    items.forEach(item => {
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);
        
        if (fs.statSync(srcPath).isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    });
}

// Copy static assets
if (fs.existsSync('.next/static')) {
    console.log('Copying .next/static to .next/standalone/.next/static...');
    copyDir('.next/static', '.next/standalone/.next/static');
}

// Copy public directory
if (fs.existsSync('public')) {
    console.log('Copying public to .next/standalone/public...');
    copyDir('public', '.next/standalone/public');
}

console.log('Standalone assets copied successfully!');

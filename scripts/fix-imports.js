import { readFileSync, writeFileSync, existsSync } from 'fs';
import { glob } from 'glob';
import { dirname, resolve, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '../dist');

// Find all JS files in dist directory
const jsFiles = glob.sync('**/*.js', { cwd: distDir });

jsFiles.forEach(file => {
  const fullPath = join(distDir, file);
  let content = readFileSync(fullPath, 'utf-8');
  
  // Replace imports that don't have extensions
  content = content.replace(/from\s+['"](\.[^'"]*?)['"](?=;)/g, (match, importPath) => {
    // Skip if already has extension
    if (importPath.endsWith('.js') || importPath.endsWith('.json')) {
      return match;
    }
    
    // Check if it's a file or directory
    const resolvedPath = resolve(dirname(fullPath), importPath);
    const jsPath = resolvedPath + '.js';
    const indexPath = resolve(resolvedPath, 'index.js');
    
    if (existsSync(jsPath)) {
      return match.replace(importPath, importPath + '.js');
    } else if (existsSync(indexPath)) {
      return match.replace(importPath, importPath + '/index.js');
    }
    
    return match;
  });
  
  writeFileSync(fullPath, content);
});

console.log('Fixed imports in', jsFiles.length, 'files');
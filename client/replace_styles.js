const fs = require('fs');
const path = require('path');

const replacements = {
  'bg-notion-bg': 'bg-slate-50',
  'bg-notion-card': 'bg-white',
  'border-notion-border': 'border-slate-200',
  'text-notion-text': 'text-slate-900',
  'text-notion-muted': 'text-slate-500',
  'bg-notion-sidebar': 'bg-slate-50',
  'shadow-soft': 'shadow-sm',
  'bg-accent-purple/10': 'bg-slate-100',
  'border-accent-purple/20': 'border-slate-200',
  'bg-accent-purple': 'bg-slate-900',
  'text-accent-purple': 'text-slate-900',
  'border-accent-purple': 'border-slate-900',
  'focus:border-accent-purple': 'focus:border-slate-900',
  'focus:ring-accent-purple': 'focus:ring-slate-900',
  'text-notion-bg': 'text-white',
  'ring-notion-accent': 'ring-slate-900',
  'ring-offset-notion-bg': 'ring-offset-white',
};

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');

files.forEach((file) => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace using word boundaries to avoid partial matches
  for (const [key, value] of Object.entries(replacements)) {
    // Escape forward slashes in keys like bg-accent-purple/10
    const escapedKey = key.replace(/\//g, '\\/');
    // Create a global regex with word boundaries. 
    // Note: tailwind classes can contain hyphens, so we need a boundary that works with them.
    // Instead of \b, we can split by space, quote, or newline and replace.
    // A simpler way: just use global replace because these are highly specific class names.
    const regex = new RegExp(`(?<=[\\s"'\\\`])${escapedKey}(?=[\\s"'\\\`])`, 'g');
    content = content.replace(regex, value);
    
    // Also try without lookbehind/ahead for edge cases just in case, using simple string replacement multiple times
    content = content.split(key).join(value);
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
console.log('Done');

const fs = require('fs');
const path = require('path');

const directories = [
  path.join(__dirname, 'src'),
  path.join(__dirname, 'src', 'components')
];

const replacements = [
  { regex: /bg-\[#0B0A12\]/g, replacement: 'bg-[#FDFCF8] dark:bg-[#0B0A12]' },
  { regex: /(?<!dark:)bg-\[#101010\]/g, replacement: 'bg-[#F3F1ED] dark:bg-[#101010]' },
  { regex: /(?<!dark:)bg-\[#171427\]/g, replacement: 'bg-white dark:bg-[#171427]' },
  { regex: /(?<!dark:)text-white/g, replacement: 'text-slate-900 dark:text-white' },
  { regex: /(?<!dark:)border-white\/10/g, replacement: 'border-slate-200 dark:border-white/10' },
  { regex: /(?<!dark:)border-white\/5/g, replacement: 'border-slate-200 dark:border-white/5' },
  { regex: /(?<!dark:)text-slate-400/g, replacement: 'text-slate-600 dark:text-slate-400' },
  { regex: /(?<!dark:)text-slate-300/g, replacement: 'text-slate-700 dark:text-slate-300' },
  { regex: /(?<!dark:)border-white\/20/g, replacement: 'border-slate-300 dark:border-white/20' },
  { regex: /(?<!dark:)bg-white\/5/g, replacement: 'bg-slate-100 dark:bg-white/5' },
  { regex: /(?<!dark:)bg-white\/10/g, replacement: 'bg-slate-200 dark:bg-white/10' }
];

directories.forEach(dir => {
  fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.tsx')) {
      const filePath = path.join(dir, file);
      let content = fs.readFileSync(filePath, 'utf8');
      
      let modified = false;
      replacements.forEach(({ regex, replacement }) => {
        if (regex.test(content)) {
          content = content.replace(regex, replacement);
          modified = true;
        }
      });
      
      if (modified) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated ${file}`);
      }
    }
  });
});

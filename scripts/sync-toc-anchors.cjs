const fs = require('fs');
const path = require('path');

function getAllFiles(dir, ext = '.md') {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (file !== '.vitepress' && file !== 'node_modules') {
        results = results.concat(getAllFiles(fullPath, ext));
      }
    } else if (file.endsWith(ext)) {
      results.push(fullPath);
    }
  });
  return results;
}

const docsDir = path.join(process.cwd(), 'docs');
const distDir = path.join(docsDir, '.vitepress', 'dist');
const files = getAllFiles(docsDir);

let fixedFiles = 0;

files.forEach(mdFile => {
  let content = fs.readFileSync(mdFile, 'utf8');
  const relPath = path.relative(docsDir, mdFile).replace(/\\/g, '/');
  const htmlFile = path.join(distDir, relPath.replace(/\.md$/, '.html'));
  
  if (!fs.existsSync(htmlFile)) return;
  const html = fs.readFileSync(htmlFile, 'utf8');

  // Extract all h2/h3 tags from HTML: <h2 id="xyz" tabindex="-1">Title <a ...></a></h2>
  const headingRegex = /<h([23])[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/g;
  const htmlHeadings = [];
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    const id = match[2];
    const text = match[3].replace(/<[^>]+>/g, '').trim().replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
    htmlHeadings.push({ id, text });
  }

  // Find TOC links in markdown: [Text](#anchor)
  let changed = false;
  content = content.replace(/\[([^\]]+)\]\(#([^\)]+)\)/g, (fullMatch, linkText, oldAnchor) => {
    // Try to match with an htmlHeading
    const cleanLink = linkText.trim();
    const found = htmlHeadings.find(h => {
      // compare text ignoring punctuation
      const t1 = h.text.replace(/[\s\(\)（）\+、\.\?？:：'"`“”《》]/g, '');
      const t2 = cleanLink.replace(/[\s\(\)（）\+、\.\?？:：'"`“”《》]/g, '');
      return t1 === t2 || h.text === cleanLink || cleanLink.includes(h.text) || h.text.includes(cleanLink);
    });

    if (found && found.id !== oldAnchor) {
      changed = true;
      return `[${linkText}](#${found.id})`;
    }
    return fullMatch;
  });

  if (changed) {
    fs.writeFileSync(mdFile, content, 'utf8');
    fixedFiles++;
    console.log(`Synced TOC anchors in: ${relPath}`);
  }
});

console.log(`Finished! Fixed anchors in ${fixedFiles} files.`);

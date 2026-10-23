const fs = require('fs');

function fixScript(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let lines = content.split('\n');
  let newLines = [];
  let insideTemplate = false;

  for (let line of lines) {
    if (line.startsWith('const art') && line.includes('= `---')) {
      insideTemplate = true;
      newLines.push(line);
      continue;
    }
    if (insideTemplate && line.trim() === '`;') {
      insideTemplate = false;
      newLines.push(line);
      continue;
    }
    if (insideTemplate) {
      // If the line contains raw triple backticks
      if (line.includes('```')) {
        let fixed = line.split('```').join('${b3}');
        newLines.push(fixed);
      } else {
        newLines.push(line);
      }
    } else {
      newLines.push(line);
    }
  }

  fs.writeFileSync(filePath, newLines.join('\n'), 'utf8');
  console.log('Processed:', filePath);
}

fixScript('scripts/expand-devices-remaining.cjs');

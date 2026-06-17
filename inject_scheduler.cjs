const fs = require('fs');

function injectFiles(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (!content.includes('demo_scheduler.css')) {
    content = content.replace('</head>', '  <link rel="stylesheet" href="/demo_scheduler.css" />\n</head>');
  }
  
  if (!content.includes('demo_scheduler.js')) {
    content = content.replace('</body>', '  <script src="/demo_scheduler.js"></script>\n</body>');
  }

  fs.writeFileSync(filePath, content);
}

injectFiles('index.html');
injectFiles('public/subscription.html');
console.log('Injection complete');

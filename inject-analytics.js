const fs = require('fs');
const path = require('path');

const GA_ID = 'G-KHZSJQYYH3';
const CLARITY_ID = 'wb06zpvz96';

const marker = '<!-- analytics-injected -->';

const gaSnippet = `  <!-- Google Analytics -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"><\/script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_ID}');
  <\/script>`;

const claritySnippet = `  <!-- Microsoft Clarity -->
  <script type="text/javascript">
    (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;
      t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];
      y.parentNode.insertBefore(t,y);
    })(window,document,"clarity","script",'${CLARITY_ID}');
  <\/script>`;

function findHtmlFiles(dir) {
  const results = [];
  const skip = ['node_modules', '.git', '.next', 'dist'];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && !skip.includes(entry.name)) {
      results.push(...findHtmlFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push(fullPath);
    }
  }
  return results;
}

const htmlFiles = findHtmlFiles('.');
let injected = 0, skipped = 0;

for (const file of htmlFiles) {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes(marker)) {
    console.log('Skipping (already injected):', file);
    skipped++;
    continue;
  }
  const injection = `\n${marker}\n${gaSnippet}\n${claritySnippet}\n`;
  content = content.replace('</head>', injection + '\n</head>');
  fs.writeFileSync(file, content, 'utf8');
  console.log('Injected:', file);
  injected++;
}

console.log(`\nDone: ${injected} file(s) updated, ${skipped} skipped.`);

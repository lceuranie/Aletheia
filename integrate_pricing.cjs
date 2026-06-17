const fs = require('fs');

const subHtml = fs.readFileSync('public/subscription.html', 'utf8');

const styleMatch = subHtml.match(/<style>([\s\S]*?)<\/style>/);
let styleContent = styleMatch ? styleMatch[1] : '';

// Quick scoping: prefix rules with .pricing-wrapper
styleContent = styleContent.replace(/body\s*\{/g, '.pricing-wrapper {');
styleContent = `\n/* ========================================== \n   PRICING SECTION (imported from subscription.html)\n   ========================================== */\n.pricing-wrapper {\n  background: #F7F5F1; color: #222826;\n  font-family: 'IBM Plex Sans', -apple-system, system-ui, sans-serif;\n  line-height: 1.5;\n  -webkit-font-smoothing: antialiased;\n  padding: 60px 0;\n  margin-top: 100px;\n}\n${styleContent}`;

fs.appendFileSync('src/style.css', styleContent);

const bodyMatch = subHtml.match(/<body>([\s\S]*?)<\/body>/);
let bodyContent = bodyMatch ? bodyMatch[1] : '';

// Remove the standalone Header since we have landing nav
bodyContent = bodyContent.replace(/<header class="top">[\s\S]*?<\/header>\s*<hr class="rule" \/>/, '');

const indexHtml = fs.readFileSync('index.html', 'utf8');
const replacement = `      <!-- PRICING SECTION -->\n      <div class="pricing-wrapper">\n        ${bodyContent}\n      </div>\n    </div>\n\n  </section>`;

const newIndexHtml = indexHtml.replace(/<\/div>\s*<\/section>\s*<!-- ==========================================\s*VIEW 2: PILLARS DASHBOARD/, `${replacement}\n\n      <!-- ==========================================\n           VIEW 2: PILLARS DASHBOARD`);

fs.writeFileSync('index.html', newIndexHtml);

console.log("Pricing section integrated.");

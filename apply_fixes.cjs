const fs = require('fs');

// 1. Modify index.html
let indexHtml = fs.readFileSync('index.html', 'utf8');

// Remove pricing wrapper completely
indexHtml = indexHtml.replace(/<!-- PRICING SECTION -->\s*<div class="pricing-wrapper">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/, `      <!-- Pricing Button Replacement -->\n      <div style="text-align: center; padding: 40px 20px 80px;">\n        <a class="primary-btn outline" href="/subscription.html" style="text-decoration: none;">Product &amp; Services</a>\n      </div>\n    </div>\n  </section>`);

// Remove theme toggle from landing nav
indexHtml = indexHtml.replace(/<nav class="landing-nav">[\s\S]*?<button class="theme-toggle".*?>☀️<\/button>/, (match) => {
    return match.replace(/<button class="theme-toggle".*?>☀️<\/button>/, '');
});

fs.writeFileSync('index.html', indexHtml);

// 2. Modify main.js for auto-login
let mainJs = fs.readFileSync('src/main.js', 'utf8');
mainJs = mainJs.replace(/onAuthStateChanged\(auth, async \(user\) => \{\s*if \(user\) \{\s*await syncUserToFirestore\(user\);\s*renderPillarsDashboard\(\);\s*\}/, `onAuthStateChanged(auth, async (user) => {\n  if (user) {\n    await syncUserToFirestore(user);\n    renderPillarsDashboard();\n    // Auto-navigate to dashboard if they are logged in and on the landing page\n    const activeView = document.querySelector('.view.active');\n    if (activeView && activeView.id === 'view-home') {\n      navigateTo('view-pillars');\n    }\n  }`);
fs.writeFileSync('src/main.js', mainJs);

console.log('Modifications complete.');

const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 400, height: 800 }
  });
  const page = await context.newPage();
  await page.goto('http://localhost:8000/ROXY/roxy.html');
  
  // Wait for the pdf viewer to do something
  await page.waitForTimeout(3000);
  
  const displayCanvas = await page.evaluate(() => {
    const mainCanvas = document.getElementById('pdfCanvas');
    return mainCanvas ? window.getComputedStyle(mainCanvas).display : 'null';
  });
  
  const displayControls = await page.evaluate(() => {
    const controls = document.querySelector('.pdf-controls');
    return controls ? window.getComputedStyle(controls).display : 'null';
  });

  const numWrappers = await page.evaluate(() => {
    return document.querySelectorAll('.pdf-page-wrapper').length;
  });
  
  console.log(`Main Canvas Display: ${displayCanvas}`);
  console.log(`Controls Display: ${displayControls}`);
  console.log(`PDF Wrappers Count: ${numWrappers}`);
  
  await browser.close();
})();

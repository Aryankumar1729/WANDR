const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  
  await page.goto('http://localhost:3000');
  
  // Wait for the UI to load
  await page.waitForTimeout(2000);
  
  // Type in the form or just click search with defaults
  await page.click('button[type="submit"]');
  
  console.log("Searching...");
  // Wait for orchestration to finish (logs say "Completed BudgetAgent" or similar)
  await page.waitForFunction(
    () => document.body.innerText.includes('Completed BudgetAgent') || document.body.innerText.includes('Total orchestration time'),
    { timeout: 180000 }
  );
  
  console.log("Search complete. Navigating to Itinerary...");
  
  // Click on Itinerary link in sidebar
  await page.evaluate(() => {
    const links = Array.from(document.querySelectorAll('a'));
    const itineraryLink = links.find(l => l.innerText.includes('Itinerary'));
    if (itineraryLink) itineraryLink.click();
  });
  
  await page.waitForTimeout(2000);
  
  await page.screenshot({ path: 'itinerary_screenshot.png', fullPage: true });
  console.log("Screenshot saved!");
  
  await browser.close();
})();

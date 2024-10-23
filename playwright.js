/**
 * 1) -----------------------------------------------------------------------------------------------------------
 *      Use playwright navigate to the following urls.
 *      Check response status code (200, 404, 403), proceed only in case of code 200, throw an error in other cases.
 *      Use playwright methods select the country associated with the url.
 *
 *      Using cheerio extract from html:
 *          - fullPrice (it has to be a number)
 *          - discountedPrice (it has to be a number, if it does not exist same as fullPrice)
 *          - currency (written in 3 letters [GBP, USD, EUR...])
 *          - title (product title)
 *
 *      Result example
 *      {
 *          url: ${urlCrawled},
 *          fullPrice: 2000.12,
 *          discountedPrice: 1452.02,
 *          currency: 'GBP',
 *          title: 'Aqualung Computer subacqueo i330R'
 *      }
 * --------------------------------------------------------------------------------------------------------------
 */
// import playwright from "playwright-core";
// import chromium from "@sparticuz/chromium";
import { chromium } from "playwright";

const urls = [
  {
    url: "https://www.selfridges.com/US/en/product/fear-of-god-essentials-camouflage-panels-relaxed-fit-woven-blend-overshirt_R04364969/#colour=WOODLAND%20CAMO",
    country: "GB",
  },
  {
    url: "https://www.selfridges.com/ES/en/product/gucci-interlocking-g-print-crewneck-cotton-jersey-t-shirt_R04247338/",
    country: "US",
  },
  {
    url: "https://www.selfridges.com/US/en/product/fear-of-god-essentials-essentials-cotton-jersey-t-shirt_R04318378/#colour=BLACK",
    country: "IT",
  },
];

async function scrape(urlPayload) {
  const { url, country } = urlPayload;
  //   const exePath = await chromium.executablePath();
  //   const browser = await playwright.chromium.launch({
  //     executablePath: exePath,
  //     headless: true,
  //     args: chromium.args,
  //   });
  const browser = await chromium.launch({ headless: false });

  const page = await browser.newPage();
  await page.goto(url);
  await page.waitForSelector("h1");

  const content = page.content();
  console.log(content);
  await browser.close();
}
scrape(urls[0]);

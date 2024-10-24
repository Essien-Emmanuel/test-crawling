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
import * as cheerio from "cheerio";
import { chromium } from "playwright";
import { saveToFile } from "./util.js";

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

/**
 * The function `closeCookiesBanner` closes a cookies banner on a web page using Puppeteer in
 * JavaScript.
 * @param  @param {import("playwright").Page} page - The `page` parameter is typically a reference to the current page in a Puppeteer
 * browser instance. Puppeteer is a Node library which provides a high-level API to control headless
 * Chrome or Chromium over the DevTools Protocol. The `page` parameter allows you to interact with the
 * webpage, navigate,
 * @returns If the cookie banner element is not found on the page, the function will return without
 * taking any action. If the cookie banner element is found and successfully closed by clicking the
 * accept all button, the function will also return without any specific value.
 */
async function closeCookiesBanner(page) {
  try {
    const selector = ".c-cookie-banner.--open";
    const cookieBanner = await page.$(selector);
    if (!cookieBanner) {
      return;
    }
    await page.waitForSelector(selector, { state: "visible" });
    await page.click(".o-button.c-cookie-banner__accept-all");
  } catch (error) {
    console.log("cookie banner error", error);
  }
}

/**
 * The function `navigateAndSelectCountry` navigates to a country selector on a webpage and selects a
 * specific country based on the provided abbreviation.
 * @param {import("playwright").Page} page - The `page` parameter is typically a reference to the current page in a browser that
 * you are automating using a tool like Puppeteer or Playwright. It allows you to interact with the
 * elements on the page, navigate, click buttons, fill forms, and more programmatically.
 * @param {string} country - Used to specify the country code of the country you want to select in the dropdown menu. For example, if you
 * want to select Canada, you would pass the country code for Canada as the `country` parameter.
 */
async function navigateAndSelectCountry(page, country) {
  try {
    await page.waitForSelector(".translation-country-selector-trigger-flag", {
      state: "visible",
    });

    await page.click(".translation-country-selector-trigger-flag");

    const selector = ".js-custom-select-selected";
    await page.waitForSelector(selector, { state: "attached" });

    const element = await page.$(selector);
    await element.scrollIntoViewIfNeeded();

    await element.click();

    await page.waitForSelector(".js-custom-select-options", {
      state: "visible",
    });

    await page.click(
      `.js-custom-select-option[data-countryabbrev="${country}"]`
    );
  } catch (error) {
    console.log("Select country error", error);
  }
}

/**
 * The function `getDataFromHTML` extracts title, currency, full price, and discounted price
 * information from HTML content using Cheerio.
 * @param {string} content - Takes in as first parameter
 * @param {string} country
 * Takes in as second parameter
 */
function getDataFromHTML(content, country) {
  const res = {};
  const $ = cheerio.load(content);

  const title = $("p.sc-5ec017c-3.hZrRFQ").text().trim();
  const currency = $(`li[data-countryabbrev="${country}"]`)
    .text()
    .split(" ")
    .at(-2);
  const fullPrice = $("div.sc-eb97dd86-1.focev").text().slice(1);

  res["title"] = title;
  res["currency"] = currency;
  res["fullPrice"] = +fullPrice;
  res["discountedPrice"] = +fullPrice;

  return res;
}

async function scrapUrl({ url, country }) {
  console.log(`Crawling >>> ${url}`);

  let result = {
    url,
  };
  try {
    const browser = await chromium.launch({ headless: false });

    const page = await browser.newPage();

    const response = await page.goto(url);

    await page.waitForLoadState("networkidle");

    await closeCookiesBanner(page);

    await navigateAndSelectCountry(page, country);

    const content = await page.content();

    const statusCode = response.status();
    if (statusCode !== 200) {
      throw new Error("An error occurred");
    }

    const res = getDataFromHTML(content, country);

    result = {
      ...result,
      ...res,
    };

    await browser.close();
    return result;
  } catch (error) {
    console.log("error occurred", error);
  }
}

async function scrapUrls(urls) {
  const results = [];
  for (const urlObj of urls) {
    const res = await scrapUrl(urlObj);
    results.push(res);
  }
  await saveToFile("playwrite-and-cheerio-data.json", JSON.stringify(results));
  console.log("FINAL RESULT: ", results);
}

await scrapUrls(urls);

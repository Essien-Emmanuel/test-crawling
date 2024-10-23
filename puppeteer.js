/**
 * 1) -----------------------------------------------------------------------------------------------------------
 *      Use puppeteer navigate to the following urls.
 *      Check response status code (200, 404, 403), proceed only in case of code 200, throw an error in other cases.
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
 *          currency: 'EUR',
 *          title: 'Abito Bianco con Stampa Grafica e Scollo a V Profondo'
 *      }
 * --------------------------------------------------------------------------------------------------------------
 *
 * 2) -----------------------------------------------------------------------------------------------------------
 *      Extract product options (from the select form) and log them
 *      Select/click on the second option (if the second one doesn't exist, select/click the first)
 *
 *      Log options example:
 *      [
 *          {
 *              value: 'Blu - L/XL',
 *              optionValue: '266,1033', // Attribute "value" of option element
 *          }
 *      ]
 * --------------------------------------------------------------------------------------------------------------
 */

import puppeteer from "puppeteer";
import * as cheerio from "cheerio";
import fs from "fs";

const { writeFile } = fs.promises;

const urls = [
  "https://www.outdoorsrlshop.it/catalogo/1883-trekker-rip.html",
  "https://www.outdoorsrlshop.it/catalogo/2928-arco-man-t-shirt.html",
];

async function saveToFile(result) {
  try {
    await writeFile("product-data/puppeteer-and-cheerio-data", result);
  } catch (error) {
    console.log(error);
  }
}

function parsePrice(price) {
  return +price.replace("€", "").replace(",", "");
}

async function scrape(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.setRequestInterception(true);

  page.on("request", (request) => {
    request.continue();
  });

  page.on("response", async (response) => {
    if (response.url().includes(url)) {
      const statusCode = response.status();
      if (statusCode !== 200) {
        throw new Error("An error occured");
      }
    }
  });

  await page.goto(url);

  const html = await page.content();
  const $ = cheerio.load(html);
  const title = $("title").text().trim();
  const price = $("span.fs-3.upyPrezzoFinale").text().trim();

  await browser.close();

  const fullPrice = parsePrice(price);

  const result = {
    url: ` ${url}`,
    fullPrice: fullPrice,
    discountedPrice: fullPrice,
    currency: "EUR",
    title,
  };

  await saveToFile(JSON.stringify(result));

  return result;
}

async function scrapeUrls(urls) {
  const results = [];
  for (const url of urls) {
    results.push(await scrape(url));
  }
  console.log(results);
}
scrapeUrls(urls);

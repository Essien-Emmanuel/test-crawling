/**
 * 1) -----------------------------------------------------------------------------------------------------------
 *      Use got-scraping to crawl in sequence the following urls.
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
 * 2) -----------------------------------------------------------------------------------------------------------
 *      Like the first exercise but the urls must be crawled in parallel
 * --------------------------------------------------------------------------------------------------------------
 */

import { gotScraping } from "got-scraping";
import * as cheerio from "cheerio";

import { saveToFile, parsePrice } from "./util.js";

const urls = [
  "https://www.miinto.it/p-de-ver-s-abito-slip-3059591a-7c04-405c-8015-0936fc8ff9dd",
  "https://www.miinto.it/p-abito-a-spalline-d-jeny-fdac3d17-f571-4b55-8780-97dddf80ef35",
  "https://www.miinto.it/p-abito-bianco-con-stampa-grafica-e-scollo-a-v-profondo-2b03a3d9-fab1-492f-8efa-9151d3322ae7",
];

/**
 * The function `scrapeUrls` asynchronously scrapes data from a list of URLs, processes the information
 * using Cheerio, and saves the results to a JSON file.
 * @param {[string]} urls - Takes in an array of url strings as parameters
 */

async function scrapeUrls(urls) {
  const responsePromises = urls.map((url) => gotScraping(url));

  const results = [];

  try {
    const responses = await Promise.all(responsePromises);
    for (const response of responses) {
      console.log(`Crawling >>> ${response.url}`);

      const status = response.statusCode;

      if (status !== 200) {
        throw new Error("An error occured");
      }
      const $ = cheerio.load(response.body);

      const title = $("h1").text().trim();

      const priceElement = $('[data-testid="product-price"]');
      const prevPriceElement = $('[data-testid="product-previous-price"]');

      const isDiscounted = priceElement
        .attr("class")
        .includes("isDiscounted-true");

      let price;
      let discountedPrice;

      if (isDiscounted && prevPriceElement.length) {
        discountedPrice = priceElement.text().trim();
        price = prevPriceElement.text().trim();
      } else {
        price = priceElement.text().trim();
      }

      const fullPrice = parsePrice(price);
      const parsedDiscountedPrice = discountedPrice
        ? parsePrice(discountedPrice)
        : null;

      const result = {
        url: ` ${response.url}`,
        fullPrice: fullPrice,
        discountedPrice: parsedDiscountedPrice ?? fullPrice,
        currency: "EUR",
        title,
      };
      results.push(result);
    }
    await saveToFile("got-and-cheerio-data.json", JSON.stringify(results));

    console.log("FINAL RESULT:: ", results);
  } catch (error) {
    console.log(error);
  }
}
await scrapeUrls(urls);

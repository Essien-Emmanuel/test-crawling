/**
 * 1) -----------------------------------------------------------------------------------------------------------
 *      Analyze browser Network Tab to find apis of the following urls.
 *      Tips: extract the productId from the url string.
 *      Use gotScraping to make a request to those apis.
 *
 *      Parse the json and extract:
 *          - fullPrice (it has to be a number)
 *          - discountedPrice (it has to be a number, if it does not exist same as fullPrice)
 *          - currency (written in 3 letters [GBP, USD, EUR...])
 *          - title (product title)
 *
 *      Result example
 *      {
 *          url: ${urlCrawled},
 *          apiUrl: ${apiUrl},
 *          fullPrice: 2000.12,
 *          discountedPrice: 1452.02,
 *          currency: 'GBP',
 *          title: 'Aqualung Computer subacqueo i330R'
 *      }
 * --------------------------------------------------------------------------------------------------------------
 */

import { gotScraping } from "got-scraping";

import { saveToFile } from "./util.js";

const urls = [
  "https://www.stoneisland.com/en-it/collection/polos-and-t-shirts/slim-fit-short-sleeve-polo-shirt-2sc17-stretch-organic-cotton-pique-81152SC17A0029.html",
  "https://www.stoneisland.com/en-it/collection/polos-and-t-shirts/short-sleeve-polo-shirt-22r39-50-2-organic-cotton-pique-811522R39V0097.html",
];
const apiProductsBaseUrl =
  "https://www.stoneisland.com/on/demandware.store/Sites-StoneEU-Site/en_IT/ProductApi-Product";

/**
 * The function `extractProductId` takes a URL string as input and extracts the PID (product ID) from it by
 * splitting the URL and returning the last part before the file extension.
 * @param {string} url - pass a url string as parameter
 * @returns {string} - Takes a URL as input, splits it by "-" and then by "." for the last element, and
 * returns the last part of the URL before the ".".
 */
const extractProductId = (url) => {
  const pid = url.split("-").at(-1).split(".")[0];
  return pid;
};

/**
 * The function `scrape` extracts product information from a given URL, processes the data, saves it to
 * a file, and returns the result.
 * @param {string} url - The `url` parameter in the `scrape` function is the URL of the product page that you
 * want to scrape for information.
 * @returns {{
 *  url: string,
 *  apiUrl: string,
 *  fullPrice: number,
 *  discountedPrice: number,
 *  currency: string,
 *  title: string
 * }}
 */
async function scrape(url) {
  console.log(`Crawling >>> ${url}`);

  const pid = extractProductId(url);
  const productUrl = `${apiProductsBaseUrl}?pid=${pid}`;

  try {
    const response = await gotScraping(productUrl);
    if (response.statusCode !== 200) {
      throw new Error("An error occured");
    }
    const data = JSON.parse(response.body);
    const { productName: title, price } = data;
    const { value: fullPrice, currency, discountedPrice } = price.sales;

    const result = {
      url: ` ${url}`,
      apiUrl: ` ${productUrl}`,
      fullPrice: +fullPrice,
      discountedPrice: +discountedPrice ?? +fullPrice,
      currency,
      title,
    };

    return result;
  } catch (err) {
    console.log(err);
  }
}

async function scrapeUrls(urls) {
  const results = [];
  for (const url of urls) {
    results.push(await scrape(url));
  }
  await saveToFile("got-data.json", JSON.stringify(results));
  console.log("FINAL RESULT:: ", results);
}

await scrapeUrls(urls);

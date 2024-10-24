import fs from "fs";

const { writeFile } = fs.promises;

export async function saveToFile(filename, result) {
  try {
    await writeFile(`product-data/${filename}`, result);
  } catch (error) {
    console.log(error);
  }
}

export function parsePrice(priceStr) {
  return +priceStr.replace(/,/g, "").match(/[-+]?[0-9]*\.?[0-9]+/g)[0];
}

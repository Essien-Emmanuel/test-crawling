import fs from "fs";

const { writeFile } = fs.promises;

export async function saveToFile(filename, result) {
  console.log("result ", result);
  try {
    await writeFile(`product-data/${filename}`, result);
  } catch (error) {
    console.log(error);
  }
}

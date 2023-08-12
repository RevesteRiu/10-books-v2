const puppeteer = require("puppeteer");
const fs = require("fs");
const { DateTime } = require("luxon");

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrapeProduct(url) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);

  await delay(1000);

  const txtElement = await page.$("h1");

  if (txtElement) {
    const txtProperty = await txtElement.getProperty("textContent");
    const txtContent = await txtProperty.jsonValue();
    browser.close();

    return txtContent.trim();
  } else {
    console.log("Элемент не найден.");
    browser.close();
    return null;
  }
}

function saveToJsonFile(data, fileName) {
  const jsonData = JSON.stringify(data, null, 2);

  fs.writeFile(fileName, jsonData, "utf8", (err) => {
    if (err) {
      console.error("Ошибка при сохранении в файл:", err);
    } else {
      console.log(`Данные сохранены в файл '${fileName}'.`);
    }
  });
}

function printBooksFromFile(fileName) {
  fs.readFile(fileName, "utf8", (err, data) => {
    if (err) {
      console.error("Ошибка при чтении файла:", err);
    } else {
      try {
        const books = JSON.parse(data);
        console.log("Список книг:");
        books.forEach((book, index) => {
          console.log(`${index + 1}. ${book}`);
        });
      } catch (err) {
        console.error("Ошибка при разборе JSON:", err);
      }
    }
  });
}

async function runMultipleTimes() {
  const results = [];

  for (let i = 0; i < 10; i++) {
    const url = "https://kniga.lv/?random=1";
    const result = await scrapeProduct(url);
    results.push(result);

    await delay(1000);
  }

  results.sort();

  const fileName = `books_${DateTime.now().toFormat("yyyyMMdd_HHmmss")}.json`;

  saveToJsonFile(results, fileName);

  printBooksFromFile(fileName);
}

runMultipleTimes();

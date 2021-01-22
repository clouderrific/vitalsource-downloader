const fs = require('fs');
const path = require('path');
const axios = require('./speed-limiter');
const cheerio = require('cheerio');

// Change to book ID in the URL
const bookID = '';
const baseURL = `https://jigsaw.vitalsource.com`;
const bookIndexURL = `https://jigsaw.vitalsource.com/api/v0/books/${bookID}/pages`;
const fsRelativePath = `./${bookID}/`;

// Copy entire cookie once logged into vitalsource
const globalCookieVal = `https://bookshelf.vitalsource.com/#/books/9781635671865/cfi/18!/4/2@100:0.00`

// Write images to disk
const writeIntoFS = async (filepath, contents) => {
  if (filepath === 'Cover') {
    filepath = 1
  }
  const file = `${fsRelativePath}${filepath}.jpg`
  await fs.promises.mkdir(path.dirname(file), { recursive: true })
  await fs.promises.writeFile(file, contents)
  return file
}

/**
 * Downloads the page image
 * @param {*} imgURL - Absolute path to the page image
 */
const fetchURL = async imgURL => {
  const furl = baseURL + imgURL
  console.log(`Fetching ${furl}`)
  const { data } = await axios.request({
    url: furl,
    method: 'get',
    transformResponse: [d => d],
    responseType: 'arraybuffer',
    headers: { Cookie: globalCookieVal }
  })
  return data
}

/**
 * Method is responsible for fetching image URL from HTML
 * @param {object} page - Individual page object returned by getContainer method.
 */
const getPage = async (page) => {
  await axios({
    url: `${baseURL}${page.absoluteURL}`,
    method: 'GET',
    responseType: 'application/json',
    headers: { 
      Cookie: globalCookieVal,
      Host: 'jigsaw.vitalsource.com'
    }
  }).then((res) => {
    let $ = cheerio.load(res.data);
    page.imgURL = $('#pbk-page').attr('src');
    console.log(page.page,page.imgURL);
  }).catch(err => {
    console.log(err.code);
  })

  return page;
}

/**
 * Method is responsible for fetching to book page metadata
 */
const getContainer = async () => {
  let data;

  await axios({
    url: bookIndexURL,
    method: 'GET',
    responseType: 'application/json',
    headers: { 
      Cookie: globalCookieVal,
      Host: 'jigsaw.vitalsource.com'
    }
  }).then((res) => {
    data = res.data
  }).catch(err => {
    console.log(err.code);
  })
  return data;
}

let completed = 0
let totalToRun = 0

/**
 * 
 * @param {object} page - Individual page object returned by getContainer method.
 */
const getAndSave = async (page) => {
  let bookStack = [];
  await fetchURL(page.imgURL).then(async data => {
    await writeIntoFS(page.page, Buffer.from(data, 'binary'))
    completed += 1
    console.log(`${(completed / totalToRun * 100).toFixed(2)}%\t Saved ${fsRelativePath}${page.page}.jpeg`)
  })
  return bookStack
}

/**
 * 
 * @param {Array} pages - Collection of pages retrieved from the getContainer method.
 */
const recursiveGet = async (pages) => {
  totalToRun = pages.length
  for (let i = 0; i < pages.length; i += 1) {
    getPage(pages[i]).then(getAndSave);
  }
  return true
}


getContainer().then(recursiveGet);

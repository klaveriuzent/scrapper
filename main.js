const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3000;

app.get('/', async (req, res) => {
  try {
    // mengambil halaman web
    const { data } = await axios.get('https://www.detik.com');

    // mengambil judul dan link artikel menggunakan cheerio
    const $ = cheerio.load(data);
    const articles = [];
    $('article.list-content__item').each((index, element) => {
      const title = $(element).find('a.media__link').text().trim();
      const link = $(element).find('a.media__link').attr('href');
      articles.push({ title, link });
    });

    // mengirimkan data yang diambil ke client dalam format JSON
    res.json(articles);
  } catch (error) {
    console.error(error);
  }
});

app.listen(port, () => {
  console.log(`Aplikasi berjalan pada port http://localhost:${port}`);
});
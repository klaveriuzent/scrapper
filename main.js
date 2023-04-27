const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = process.env.PORT || 3000;
const url = process.env.URL || 'https://www.detik.com';
const cacheTime = process.env.CACHE_TIME || 1200000; // 20 menit

let cachedData = null;
let lastUpdated = null;

async function getData() {
  try {
    // mengambil halaman web
    const { data, headers } = await axios.get(url, {
      headers: {
        'If-Modified-Since': lastUpdated || ''
      }
    });

    // cek apakah data telah diperbarui
    if (headers['last-modified'] === lastUpdated) {
      console.log(`[${new Date().toLocaleTimeString()}] Data tidak diperbarui`);
      return cachedData;
    }

    // mengambil judul dan link artikel menggunakan cheerio
    const $ = cheerio.load(data);
    const articles = [];
    $('article.list-content__item').each((index, element) => {
      const title = $(element).find('a.media__link').text().trim();
      const link = $(element).find('a.media__link').attr('href');
      articles.push({ title, link });
    });

    // menampilkan pesan pada console dengan keterangan waktu
    const now = new Date();
    console.log(`[${now.toLocaleTimeString()} - ${now.toLocaleDateString()}] Data berhasil diambil`);

    // menyimpan data yang diambil ke dalam cache
    cachedData = articles;
    lastUpdated = headers['last-modified'];

    // mengirimkan data yang diambil ke client dalam format JSON
    return articles;
  } catch (error) {
    console.error(error);
  }
}

// menjalankan kode getData() setiap cacheTime
setInterval(async () => {
  try {
    const articles = await getData();
  } catch (error) {
    console.error(error);
  }
}, cacheTime);

app.get('/', async (req, res) => {
  try {
    const articles = await getData();
    res.json(articles);
  } catch (error) {
    console.error(error);
  }
});

app.listen(port, () => {
  console.log(`Aplikasi berjalan pada port http://localhost:${port}`);
});
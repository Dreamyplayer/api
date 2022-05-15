import apicache from 'apicache';
import compression from 'compression';
import { config } from 'dotenv';
import express, { json } from 'express';
import logger from 'morgan';
import { cwd, env } from 'node:process';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import { getkey, langs } from '../database/langs.js';
config();

// Database Setup
const db = await open({
  filename: `${cwd()}/database/collections.db`,
  driver: sqlite3.cached.Database,
});

const musicDB = await db.all('SELECT name FROM music');
const animeDB = await db.all('SELECT name FROM anime');

const Music = musicDB.map(row => row.name);
const Anime = animeDB.map(row => row.name);

apicache.options({
  headers: {
    'cache-control': 'no-cache',
  },
}).middleware;

const app = express();

const PORT = env.PORT || 8080;
const NODE_ENV = env.NODE_ENV || 'development';

app.set('port', PORT);
app.set('env', NODE_ENV);
app.set('Cache-Control', 'no-cache');
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, API-Key');
  next();
});

// Compress all HTTP responses
app.use(compression());

app.use(logger('tiny'));
app.use(json());
app.use(apicache.middleware('1 day'));

app.use((req, res, next) => {
  const apiKey = req.get('API-Key');
  if (!apiKey || apiKey !== process.env.API_KEY) {
    res.status(401).json({ error: 'unauthorised' });
  } else {
    next();
  }
});

app.get('/collections/anime', (req, res) => [
  res.status(200).send({
    Anime: Anime,
  }),
  res.end(),
]);

app.get('/collections/music', (req, res) => [
  res.status(200).send({
    Music: Music,
  }),
  res.end(),
]);

app.get('/languages/list', (req, res) => [
  res.status(200).send({
    List: langs,
  }),
  res.end(),
]);

app.get('/languages/:code', (req, res) => [
  res.status(200).send({
    Code: getkey(req.params.code),
  }),
  res.end(),
]);

app.listen(PORT, () => {
  console.log(`Express Server started on Port ${app.get('port')} | Environment : ${app.get('env')}`);
});

// import apicache from 'apicache'; // use apicache to cache & get more faster API responses: current 1.5s per request since this saves in memory avoid cache
import compression from 'compression';
// import { config } from 'dotenv';
import express, { json } from 'express';
import logger from 'morgan';
import { env } from 'node:process';
import { getkey, randomNoRepeats } from './functions.js';
import { Anime, langsDB, list, Music } from './migrations.js';
import { translate } from './translator.js';
// config();

// apicache.options({
//   headers: {
//     'cache-control': 'no-cache',
//   },
// }).middleware;

const app = express();

const PORT = env.PORT || 8080;
const NODE_ENV = env.NODE_ENV || 'development';

app.set('port', PORT);
app.set('env', NODE_ENV);
// app.set('Cache-Control', 'no-cache');
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, API-Key');
  next();
});

// Compress all HTTP responses
app.use(compression());

app.use(logger('tiny'));
app.use(json());
// app.use(apicache.middleware('1 day'));

app.use((req, res, next) => {
  const apiKey = req.get('API-Key');
  if (!apiKey || apiKey !== process.env.API_KEY) {
    res.status(401).json({ error: 'unauthorised' });
  } else {
    next();
  }
});

app.get('/', (req, res) => {
  res.send('Express on Vercel');
});

app.get('/collections/anime', (req, res) => [
  res.status(200).send({
    Anime: randomNoRepeats(Anime),
  }),
  res.end(),
]);

app.get('/collections/music', (req, res) => [
  res.status(200).send({
    Music: randomNoRepeats(Music),
  }),
  res.end(),
]);

app.get('/languages/list', (req, res) => [
  res.status(200).send({
    List: list.replace(/-/g, '`'),
  }),
  res.end(),
]);

app.get('/languages/:code', (req, res) => [
  res.status(200).send({
    Code: getkey(langsDB, req.params.code),
  }),
  res.end(),
]);

app.get('/translate/:text/:to', async (req, res) => {
  const { text, pronunciation } = await translate(req.params.text, {
    from: 'en',
    to: req.params.to,
    autoCorrect: true,
  });

  res.status(200).send({
    Text: text,
    Pronunciation: pronunciation === null ? null : pronunciation.normalize('NFD').replace(/\p{Diacritic}/gu, ''),
  });
  res.end();
});

app.listen(PORT, () => {
  console.log(`Express Server started on Port ${app.get('port')} | Environment : ${app.get('env')}`);
});

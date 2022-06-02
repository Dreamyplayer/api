import apicache from 'apicache';
import cors from 'cors';
import type { Request, Response } from 'express';
import { Router } from 'express';
import { getLangCode, getLangsList } from './routes/lang.controller.js';
import { getAnime, getMusic } from './routes/store.controller.js';
import { getTranslate } from './routes/trans.controller.js';

const router = Router();

apicache.options({
  headers: {
    'cache-control': 'no-cache',
  },
}).middleware;

router.use((_req: Request, res: Response, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, API-Key');
  next();
});
router.use(apicache.middleware('1 day'));

router.use((req: Request, res: Response, next) => {
  const apiKey = req.get('API-Key');

  if (!apiKey || apiKey !== process.env.API_KEY) {
    res.status(401).json({ error: 'unauthorised' });
  } else {
    next();
  }
});

router.use(
  cors({
    methods: ['GET', 'POST'],
  }),
);
router.get('/', (_req: Request, res: Response) => {
  res.status(200).send('API is running');
});

router.route('/store/anime').get(getAnime);
router.route('/store/music').get(getMusic);

router.route('/languages/list').get(getLangsList);
router.route('/languages/:code').get(getLangCode);

router.route('/translator/:text/:to').get(getTranslate);

export default router;

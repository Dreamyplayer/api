import type { Request, Response } from 'express';
import { randomNoRepeats } from '../../functions.js';
import { Anime, Music } from '../../migrations.js';

export const getAnime = (_req: Request, res: Response) => {
  res.status(200).send({
    Anime: randomNoRepeats(Anime),
  });
};

export const getMusic = (_req: Request, res: Response) => {
  res.status(200).send({
    Music: randomNoRepeats(Music),
  });
};

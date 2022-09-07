import type { Request, Response } from 'express';
import { getkey } from '../../functions.js';
import { langsDB, langsList } from '../../migrations.js';

export const getLangsList = (_req: Request, res: Response) => {
  res.status(200).send({
    List: langsList?.list.replace(/-/g, '`'),
  });
};

export const getLangCode = (req: Request, res: Response) => {
  res.status(200).send({
    Code: getkey(langsDB, req.params.code),
  });
};

import type { Request, Response } from 'express';
import { translate } from '../../translator.js';

export const getTranslate = async (req: Request, res: Response) => {
  const { text, pronunciation } = await translate(req.params.text, {
    FROM: 'en',
    TO: req.params.to,
    AUTOCORRECT: true,
  });

  res.status(200).send({
    Text: text,
    Pronunciation: pronunciation === null ? null : pronunciation.normalize('NFD').replace(/\p{Diacritic}/gu, ''),
  });
};

import axios from 'axios';
import { stringify } from 'node:querystring';
import { extract, getCode, isSupported } from './functions.js';

interface TranslateOptions {
  FROM?: string;
  TO: string;
  AUTOCORRECT?: boolean;
  SD?: string;
  TLD?: string;
}

interface resultObj {
  text: string;
  pronunciation: string;
  from: {
    language: {
      didYouMean: boolean;
      iso: string;
      to: string;
    };
    text: {
      autoCorrected: boolean;
      value: string;
      didYouMean: boolean;
    };
  };
  raw: string;
}

export const translate = async (
  text: string,
  {
    FROM: from = 'auto',
    TO: to = 'en',
    AUTOCORRECT: autoCorrect = true,
    SD: sd = 'translate.google',
    TLD: tld,
  }: TranslateOptions,
): Promise<resultObj> => {
  [from, to].forEach(lang => {
    if (lang && !isSupported(lang)) {
      throw new Error(`The language '${lang}' is not supported`);
    }
  });

  const options = { from: getCode(from), to: getCode(to), tld: sd.includes('cloudfront') ? 'net' : tld || 'com' };
  const url = `https://${sd}.${options.tld}`;

  return await axios(url)
    .then(res => {
      const data = {
        rpcids: 'MkEWBc',
        'f.sid': extract('FdrFJe', res),
        bl: extract('cfb2h', res),
        hl: 'en-US',
        'soc-app': 1,
        'soc-platform': 1,
        'soc-device': 1,
        _reqid: Math.floor(1000 + Math.random() * 9000),
        rt: 'c',
      };
      return data;
    })
    .then(async data => {
      const gotopts = {
        url: `${url}/_/TranslateWebserverUi/data/batchexecute?${stringify(data)}`,
        data:
          'f.req=' +
          encodeURIComponent(
            JSON.stringify([
              [['MkEWBc', JSON.stringify([[text, options.from, options.to, autoCorrect], [null]]), null, 'generic']],
            ]),
          ) +
          '&',
        headers: { 'content-type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        method: 'post',
      };
      return await axios(gotopts)
        .then(res => {
          const sep = '######';

          let json = res.data
            .replace(/\n?\n\d*\n/gi, sep)
            .split(sep)
            .find((x: any) => x.startsWith('[['));
          const result = {
            text: '',
            pronunciation: '',
            from: {
              language: {
                didYouMean: false,
                iso: '',
                to: '',
              },
              text: {
                autoCorrected: false,
                value: '',
                didYouMean: false,
              },
            },
            raw: '',
          };

          try {
            json = JSON.parse(json);
            json = JSON.parse(json[0][2]);
            result.raw = json;
          } catch (e) {
            return result;
          }

          if (json[1][0][0][5] === undefined || json[1][0][0][5] === null) {
            result.text = json[1][0][0][0];
          } else {
            result.text = json[1][0][0][5]
              .map((obj: any) => {
                return obj[0];
              })
              .filter(Boolean)
              .join(' ');
          }
          result.pronunciation = json[1][0][0][1];

          // From language
          if (json[0] && json[0][1] && json[0][1][1]) {
            result.from.language.didYouMean = true;
            result.from.language.iso = json[0][1][1][0];
          } else if (json[1][3] === 'auto') {
            result.from.language.iso = json[2];
          } else {
            result.from.language.iso = json[1][3];
            result.from.language.to = json[1][1];
          }

          // Did you mean & autocorrect
          if (json[0] && json[0][1] && json[0][1][0]) {
            let str = json[0][1][0][0][1];

            str = str.replace(/<b>(<i>)?/g, '[');
            str = str.replace(/(<\/i>)?<\/b>/g, ']');

            result.from.text.value = str;

            if (json[0][1][0][2] === 1) {
              result.from.text.autoCorrected = true;
            } else {
              result.from.text.didYouMean = true;
            }
          }

          return result;
        })
        .catch(err => {
          err.message += `\nUrl: ${url}`;
          err.statusCode !== undefined && err.statusCode !== 200
            ? (err.code = 'BAD_REQUEST')
            : (err.code = 'BAD_NETWORK');
          throw err;
        });
    });
};

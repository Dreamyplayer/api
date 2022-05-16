import { cwd } from 'node:process';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const db = await open({
  filename: `${cwd()}/database/collections.db`,
  driver: sqlite3.cached.Database,
});

const langsDB = await db.all('SELECT code, name FROM languages');

const buildObject = arr => {
  const obj = {};
  for (let i = 0; i < arr.length; i++) {
    const { code, name } = arr[i];
    obj[code] = name;
  }
  return obj;
};
const langsObj = buildObject(langsDB);

export function getCode(desiredLang) {
  if (!desiredLang) {
    return false;
  }

  if (langsObj[desiredLang]) {
    return desiredLang;
  }

  var keys = Object.keys(langsObj).filter(function (key) {
    if (typeof langsObj[key] !== 'string') {
      return false;
    }

    return langsObj[key].toLowerCase() === desiredLang.toLowerCase();
  });

  return keys[0] || false;
}

export const isSupported = desiredLang => {
  return Boolean(getCode(desiredLang));
};

export const extract = (key, res) => {
  var re = new RegExp(`"${key}":".*?"`);
  var result = re.exec(res.data);
  if (result !== null) {
    return result[0].replace(`"${key}":"`, '').slice(0, -1);
  }
  return '';
};

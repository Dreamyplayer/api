import { langsObj } from '../database/langs.js';

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

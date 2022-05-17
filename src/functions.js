import { langsDB } from './migrations.js';

export const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

export const getkey = (data, key) => {
  return data.find(lang => lang.name === capitalize(key))?.code;
};

export const randomNoRepeats = arr => {
  let copy = arr.slice(0);
  return (() => {
    if (copy.length < 1) {
      copy = arr.slice(0);
    }
    let index = Math.floor(Math.random() * copy.length);
    let item = copy[index];
    copy.splice(index, 1);
    return item;
  })();
};

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

import { langsDB } from './migrations.js';

export const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);

export const getkey = (data: Array<{ code: string; name: string }>, key: string) => {
  return data.find(lang => lang.name === capitalize(key))?.code;
};

export const randomNoRepeats = (arr: Array<string | number>): string | number => {
  let copy = arr.slice(0);
  return (() => {
    if (copy.length < 1) {
      copy = arr.slice(0);
    }
    const index = Math.floor(Math.random() * copy.length);
    const item = copy[index];
    copy.splice(index, 1);
    return item;
  })();
};

const buildObject = (arr: Array<{ code: string; name: string }>) => {
  const obj: any = {};
  for (let i = 0; i < arr.length; i++) {
    const { code, name } = arr[i];
    obj[code] = name;
  }
  return obj;
};

const langsObj = buildObject(langsDB);

export const getCode = (desiredLang: string): string | false => {
  if (!desiredLang) {
    return false;
  }

  if (langsObj[desiredLang]) {
    return desiredLang;
  }

  const keys = Object.keys(langsObj).filter(key => {
    if (typeof langsObj[key] !== 'string') {
      return false;
    }

    return langsObj[key].toLowerCase() === desiredLang.toLowerCase();
  });

  return keys[0] || false;
};

export const isSupported = (desiredLang: string): boolean => {
  return Boolean(getCode(desiredLang));
};

export const extract = (key: string, res: any): string => {
  const re = new RegExp(`"${key}":".*?"`);
  const result = re.exec(res.data);
  if (result !== null) {
    return result[0].replace(`"${key}":"`, '').slice(0, -1);
  }
  return '';
};

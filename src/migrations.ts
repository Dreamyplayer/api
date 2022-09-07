import { cwd } from 'node:process';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const db = await open({
  filename: `${cwd()}/database/store.db`,
  driver: sqlite3.cached.Database,
});

const musicDB: Array<{ name: string }> = await db.all('SELECT name FROM music');
const animeDB: Array<{ name: string }> = await db.all('SELECT name FROM anime');

export const Music: string[] = musicDB.map(row => row.name);
export const Anime: string[] = animeDB.map(row => row.name);

export const langsDB: Array<{ code: string; name: string }> = await db.all('SELECT code, name FROM languages');
export const langsList: { list: string } | undefined = await db.get('SELECT list FROM Lists');

import { config } from 'dotenv';
import express, { json } from 'express';
import logger from 'morgan';
import compression from 'compression';
import { env } from 'node:process';
import routes from './api/routes.js';
config();

const app = express();

const PORT = env.PORT || 8080;
const NODE_ENV = env.NODE_ENV || 'Development';

app.set('port', PORT);
app.set('env', NODE_ENV);

app.use(logger('tiny'));
app.use(json());
app.use(compression());
app.use('/api/', routes);

app.listen(PORT, () => {
  console.log(`Express Server started on Port ${app.get('port')} | Environment : ${app.get('env')}`);
});

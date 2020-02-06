import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { normalizePort } from './@utils';
import NodeMediaServer from 'node-media-server';
import config from './@configs';
import { Sequelize } from 'sequelize';
import appRootPath from 'app-root-path';
import fs from 'fs';

export const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USERNAME!,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT!,
    dialect: 'postgres',
    logging: log => {
      console.log(log);
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
);

sequelize
  .authenticate()
  .then(() => {
    console.log('Database connected');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

[
  'uploads',
  'uploads/240p',
  'uploads/360p',
  'uploads/480p',
  'uploads/720p',
  'uploads/1080p',
  'uploads/liveMedia',
  'uploads/liveMedia/live',
].map(dirName => {
  const dirFullPath = `${appRootPath}/${dirName}`;
  if (!fs.existsSync(dirFullPath)) {
    fs.mkdirSync(dirFullPath);
  }
});

import AppFactory from './@app';

const appFactory = new AppFactory();
const app = appFactory.app;

const port = normalizePort(process.env.PORT || '4000');
app.set('port', port);
const server = http.createServer(app);
server.listen(+port, '0.0.0.0', 511 /* Default value */, () =>
  console.log(`Server is running on port ${port}`),
);

const nms = new NodeMediaServer(config.nodeMediaServerConfig);
nms.run();

import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { normalizePort } from './@utils';
import NodeMediaServer from 'node-media-server';
import Config from './@configs';
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
    logQueryParameters: true,
    logging: log => console.log(log),
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

Config.requiredDirectories.map(dirName => {
  const dirFullPath = `${appRootPath}/${dirName}`;
  if (!fs.existsSync(dirFullPath)) {
    fs.mkdirSync(dirFullPath);
  }
});

import AppFactory from './@app';

const appFactory = new AppFactory();
const app = appFactory.app;

const port = normalizePort(Config.appPort);
app.set('port', port);

// app.get('/', (_, res) => {
//   res.sendFile(`${appRootPath}/websocket_test.html`);
// });

// app.get('/hitesh.js', (_, res) => {
//   res.sendFile(`${appRootPath}/websocket_test.js`);
// });

export const server = http.createServer(app);

// tslint:disable-next-line: no-var-requires
require('./@sockets');

server.listen(+port, Config.appHost, 511 /* Default value */, () =>
  console.log(`Server is running on ${Config.appHost}:${port}`),
);

const nms = new NodeMediaServer(Config.nodeMediaServerConfig);
nms.run();

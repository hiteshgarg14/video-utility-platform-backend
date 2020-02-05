import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { normalizePort } from './@utils';
import AppFactory from './@app';
import NodeMediaServer from 'node-media-server';
import config from './@configs';
import { Sequelize } from 'sequelize';
import appRootPath from 'app-root-path';

const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USERNAME!,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT!,
    dialect: 'postgres',
    logging: false,
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
    const appFactory = new AppFactory();
    const app = appFactory.app;

    const port = normalizePort(process.env.PORT || '4000');
    app.set('port', port);
    app.get('/', (_, res) => {
      res.sendFile(`${appRootPath}/index.html`);
    });

    const server = http.createServer(app);
    server.listen(+port, '0.0.0.0', 511, () =>
      console.log(`Server is running on port ${port}`),
    );

    const nms = new NodeMediaServer(config.nodeMediaServerConfig);
    nms.run();
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

export default sequelize;

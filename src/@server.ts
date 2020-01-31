import dotenv from 'dotenv';
dotenv.config();

import http from 'http';
import { createConnection } from 'typeorm';
import { normalizePort } from './@utils';
import AppFactory from './@app';

createConnection()
  .then(_ => {
    const appFactory = new AppFactory();
    const app = appFactory.app;

    const port = normalizePort(process.env.PORT || '4000');
    app.set('port', port);

    const server = http.createServer(app);
    server.listen(port, () => console.log(`Server is running on port ${port}`));
  })
  .catch(err => console.log(err));

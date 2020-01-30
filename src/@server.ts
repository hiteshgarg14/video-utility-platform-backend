import http from 'http';
import dotenv from 'dotenv';
import { createConnection } from 'typeorm';
import { normalizePort } from './@utils';
import AppFactory from './@app';

dotenv.config();

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

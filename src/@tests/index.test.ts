process.env.NODE_ENV = 'test';
import dotenv from 'dotenv';
dotenv.config();

import supertest from 'supertest';
import { Application } from 'express';
import { createConnection, ConnectionOptions, Connection } from 'typeorm';
import { createServer, Server as HttpServer } from 'http';
import AppFactory from '../@app';
import { normalizePort } from '../@utils';

export class TestFactory {
  private _app!: Application;
  private _connection!: Connection;
  private _server!: HttpServer;

  private _connectionOptions: ConnectionOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT!,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: `${process.env.DB_NAME}_test`,
    logging: false,
    dropSchema: true,
    entities: ['src/@models/**/*.ts'],
    migrations: ['src/@migrations/**/*.ts'],
    cli: {
      entitiesDir: 'src/@models',
      migrationsDir: 'src/@migrations',
    },
  };

  public get app(): supertest.SuperTest<supertest.Test> {
    return supertest(this._app);
  }

  public get connection(): Connection {
    return this._connection;
  }

  public get server(): HttpServer {
    return this._server;
  }

  public async init(): Promise<void> {
    await this.startup();
  }

  public async close(): Promise<void> {
    this._server.close();
    this._connection.close();
  }

  private async startup(): Promise<void> {
    this._connection = await createConnection(this._connectionOptions);
    this._app = new AppFactory().app;
    this._server = createServer(this._app).listen(
      normalizePort(process.env.PORT || '4001'),
    );
  }
}

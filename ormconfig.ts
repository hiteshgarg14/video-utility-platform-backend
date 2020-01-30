module.exports = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'hiteshgarg14',
  password: '',
  database: 'node_type_orm',
  migrationsRun: true,
  logging: true,
  entities: ['build/src/@models/**/*.js'],
  migrations: ['build/src/@migrations/**/*.js'],
  subscribers: ['build/src/@subscribers/**/*.js'],
  cli: {
    entitiesDir: 'build/src/@models',
    migrationsDir: 'build/src/@migrations',
    subscribersDir: 'build/src/@subscribers',
  },
};

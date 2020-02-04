module.exports = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: true,
  entities: [
    process.env.NODE_ENV === 'development'
      ? 'src/@models/**/*.ts'
      : 'build/src/@models/**/*.js',
  ],
  migrations: [
    process.env.NODE_ENV === 'development'
      ? 'src/@migrations/**/*.ts'
      : 'build/src/@migrations/**/*.js',
  ],
  cli: {
    entitiesDir:
      process.env.NODE_ENV === 'development'
        ? 'src/@models'
        : 'build/src/@models',
    migrationsDir:
      process.env.NODE_ENV === 'development'
        ? 'src/@migrations'
        : 'build/src/@migrations',
  },
};

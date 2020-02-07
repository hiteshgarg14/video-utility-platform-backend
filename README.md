# NodeJS Video Utility Platform

A NodeJS application to upload, watch and stream live videos.

## Installation

- Clone the repository and run following commands:

  - npm install
  - touch .env

- Configure following environment variables in `.env` file:

  - **NODE_ENV** : development / staging / production
  - **PORT** : Port to run the app. (Default: 4000)
  - **DB_USERNAME** : Postgres database username
  - **DB_PASSWORD** : Postgres database password
  - **DB_NAME** : Postgres database name
  - **DB_HOST** : Postgres database host
  - **DB_PORT** : Postgres database port
  - **REDIS_HOST** : Redis database host
  - **REDIS_PORT** : Redis database port
  - **REDIS_PASSWORD** : Redis database password
  - **NMS_RTMP_PORT** : Node media server RTMP port.(Default: 1935)
  - **NMS_HTTP_PORT** : Node media server HTTP port. (Default: 8001)
  - **NMS_HTTP_MEDIA_ROOT** : Root path of video files directory used by Node media server. (Default: `/uploads/liveMedia`)
  - **VIDEO_UPLOAD_BUFFER_SIZE** : Buffer size for uploading videos in chunks. (Default: 2 MiB)
  - **VIDEO_UPLOAD_MAX_FILE_SIZE** : Max video file size to be uploaded. (Default: 10 MiB)
  - **SENTRY_DSN** (_optional_): DSN Url of sentry for error tracking
  - **WS_VIDEO_UPLOAD_BUFFER_SIZE** : Buffer size for uploading videos using websocket. (Default: 10 MiB)
  - **WS_VIDEO_UPLOAD_CHUNK_SIZE** : Chunk size for uploading videos using websocket. (Default: 2 MiB)
  - **MEDIA_UPLOAD_PATH** : Path to save uploaded media files. (Default: `/uploads`)

- Make sure that database has been created with same name as `DB_NAME` mentioned in `.env` file.

- Run following commands
  - npx sequelize-cli db:migrate
  - npm start

## Built With

- [ExpressJS](https://expressjs.com/) : Fast, unopinionated, minimalist web framework for Node.js
- [Sequelize](https://github.com/sequelize/sequelize) : An easy-to-use multi SQL dialect ORM for Node.js
- [Node Media Server](https://github.com/illuspas/Node-Media-Server) : A Node.js implementation of RTMP/HTTP-FLV/WS-FLV/HLS/DASH/MP4 Media Server
- [Typescript](https://www.typescriptlang.org/) : TypeScript is a typed superset of JavaScript that compiles to plain JavaScript
- [
  node-fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg) : A fluent API to [FFMPEG](http://www.ffmpeg.org)
- [connect-busboy](https://github.com/mscdex/connect-busboy) : Connect middleware for [busboy](https://github.com/mscdex/busboy) (A streaming parser for HTML form data for node.js)

## Todos

- Write tests for all APIs, Jobs, Middlewares

- Improve latency in live video streamings

- Move uploads folder to blob storage

- Add user management and authentication functionalities

- Write API, Websocket documentation

- Handle duplicate video upload by name

- Complete all inline `TODO` comments

- ...

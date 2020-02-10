import appRootPath from 'app-root-path';

export default {
  appHost: process.env.HOST || 'localhost',
  appPort: process.env.PORT || '4000',
  mediaUploadPath: process.env.MEDIA_UPLOAD_PATH || `${appRootPath}/uploads`,
  requiredDirectories: [
    'uploads',
    'uploads/240p',
    'uploads/360p',
    'uploads/480p',
    'uploads/720p',
    'uploads/1080p',
    'uploads/liveMedia',
    'uploads/liveMedia/live',
  ],
  awsConfig: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
    s3Bucket: process.env.AWS_S3_BUCKET,
    chunkSize: process.env.AWS_S3_UPLOAD_CHUNK_SIZE
      ? +process.env.AWS_S3_UPLOAD_CHUNK_SIZE
      : undefined || 1024 * 1024 * 5, // Minimum 5MB per chunk (except the last part) http://docs.aws.amazon.com/AmazonS3/latest/API/mpUploadComplete.html
    maxUploadRetries: process.env.AWS_S3_MAX_UPLOAD_Retries
      ? +process.env.AWS_S3_MAX_UPLOAD_Retries
      : undefined || 3,
  },
  defaultRedisConfig: {
    redis: {
      port: +process.env.REDIS_PORT!,
      host: process.env.REDIS_HOST,
      password: process.env.REDIS_PASSWORD,
    },
  },
  busboyConfig: {
    highWaterMark: process.env.VIDEO_UPLOAD_BUFFER_SIZE
      ? +process.env.VIDEO_UPLOAD_BUFFER_SIZE
      : undefined || 2 * 1024 * 1024, // Set 2MiB as default buffer
    fileSize: process.env.VIDEO_UPLOAD_MAX_FILE_SIZE
      ? +process.env.VIDEO_UPLOAD_MAX_FILE_SIZE
      : undefined || 10 * 1024 * 1024, // Set 10MiB as max default file size.
  },
  websocketVideoUploadConfig: {
    bufferSize: process.env.WS_VIDEO_UPLOAD_BUFFER_SIZE
      ? +process.env.WS_VIDEO_UPLOAD_BUFFER_SIZE
      : undefined || 10485760, // 10 MiB
    chunkSize: process.env.WS_VIDEO_UPLOAD_CHUNK_SIZE
      ? +process.env.WS_VIDEO_UPLOAD_CHUNK_SIZE
      : undefined || 524288, // 0.5 MiB
  },
  nodeMediaServerConfig: {
    logType: 3,
    rtmp: {
      // host: process.env.NMS_RTMP_HOST || 'localhost',
      port: process.env.NMS_RTMP_PORT || 1935,
      chunk_size: 4096,
      gop_cache: false,
      ping: 1,
      ping_timeout: 1,
    },
    http: {
      // host: process.env.NMS_HTTP_HOST || 'localhost',
      port: process.env.NMS_HTTP_PORT || 8001,
      allow_origin: '*',
      mediaroot:
        process.env.NMS_HTTP_MEDIA_ROOT || `${appRootPath}/uploads/liveMedia`,
    },
    trans: {
      ffmpeg: '/usr/local/bin/ffmpeg',
      tasks: [
        {
          app: 'live',
          hls: true,
          hlsFlags: '[hls_time=2:hls_list_size=3:hls_flags=delete_segments]',
          dash: true,
          dashFlags: '[f=dash:window_size=3:extra_window_size=5]',
        },
      ],
    },
  },
};

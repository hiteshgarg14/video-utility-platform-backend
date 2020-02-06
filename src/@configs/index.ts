import appRootPath from 'app-root-path';

export default {
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
  nodeMediaServerConfig: {
    logType: 3,
    rtmp: {
      // host: process.env.NMS_RTMP_HOST || 'localhost',
      port: process.env.NMS_RTMP_PORT || 1935,
      chunk_size: 6000,
      gop_cache: false,
      ping: 30,
      ping_timeout: 60,
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

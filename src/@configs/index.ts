export default {
  defaultRedisConfig: {
    redis: {
      port: +process.env.REDIS_PORT!,
      host: process.env.REDIS_HOST,
      password: process.env.REDIS_PASSWORD,
    },
  },
  nodeMediaServerConfig: {
    rtmp: {
      port: 1935,
      chunk_size: 60000,
      gop_cache: true,
      ping: 30,
      ping_timeout: 60,
    },
    http: {
      port: 8001,
      allow_origin: '*',
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

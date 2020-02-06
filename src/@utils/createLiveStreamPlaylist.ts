import fs from 'fs';
import mkdirp from 'mkdirp';
import appRootPath from 'app-root-path';

const template = (name: string) => {
  let line = `#EXTM3U\n#EXT-X-VERSION:3\n`;
  line += `#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360\n./../../hls_360p/${name}/index.m3u8\n`;
  line += `#EXT-X-STREAM-INF:BANDWIDTH=1400000,RESOLUTION=842x480\n./../../hls_480p/${name}/index.m3u8\n`;
  line += `#EXT-X-STREAM-INF:BANDWIDTH=2800000,RESOLUTION=1280x720\n./../../hls_720p/${name}/index.m3u8\n`;
  line += `#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080\n./../../hls_1080p/${name}/index.m3u8`;
  return line;
};

const createPlaylist = (name: string) => {
  const base = `${appRootPath}/uploads/liveMedia/live/${name}`;
  const playlist = `${base}/index.m3u8`;
  mkdirp(base, (err: any) => {
    if (!err) {
      fs.open(playlist, 'r', (error: any, _) => {
        if (error) {
          fs.writeFile(playlist, template(name), writeError => {
            if (writeError) {
              console.log(err);
            }
            console.log('The file was saved!');
          });
        } else {
          console.log('The file exists!');
        }
      });
    }
  });
};

export default createPlaylist;

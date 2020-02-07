import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs';
import VideoModel from '../@models/VideoModel';
import Config from '../@configs';

const supportedResolutions = {
  1080: '1920x1080',
  720: '1280x720',
  480: '640x480',
  360: '480x360',
  240: '352x240',
};

const videoConverterJob = async (data: {
  name: string;
  videoId: string | number;
}): Promise<boolean> => {
  const filePath = `${Config.mediaUploadPath}/${data.name}`;

  ffmpeg.ffprobe(filePath, async (err, metadata) => {
    if (err) {
      console.log(err);
    } else {
      const resolution = metadata.streams[0].height;
      console.log(`Found current resolution: ${resolution}`);
      if (resolution !== undefined) {
        const command = ffmpeg(filePath);

        const allResolutions: string[] = new Array();
        for (const [key] of Object.entries(supportedResolutions)) {
          if (+key < resolution) {
            console.log(`Converting video from ${resolution} to ${key}`);

            // TODO: add catch block for this promise.
            await new Promise((resolve, reject) => {
              command
                .size(
                  supportedResolutions[+key as 1080 | 720 | 480 | 360 | 240],
                )

                .on('error', commandError => {
                  console.log(
                    `Error occured while converting video ${data.name} to ${key}p: ${commandError}`,
                  );
                  reject(err);
                })
                .on('end', () => {
                  // this event may fire multiple times.
                  console.log(`Converted video ${data.name} to ${key}p`);
                  resolve();
                })
                .saveToFile(`${Config.mediaUploadPath}/${key}p/${data.name}`);
            });
            allResolutions.push(key);
          }
        }

        // move current file to respective folder
        const folderName = Object.keys(supportedResolutions).reduce(
          (prev, curr) => {
            return Math.abs(+curr - resolution) < Math.abs(+prev - resolution)
              ? curr
              : prev;
          },
        );
        allResolutions.push(folderName);
        console.log(
          `Moving original file (${data.name}) to ${folderName}p folder`,
        );
        fs.rename(
          `${Config.mediaUploadPath}/${data.name}`,
          `${Config.mediaUploadPath}/${folderName}p/${data.name}`,
          renameError => {
            console.log(renameError);
          },
        );

        VideoModel.update(
          { resolutions: allResolutions },
          { where: { id: data.videoId } },
        );
      } else {
        console.log('Unable to conver video. resolution not found');
      }
    }
  });

  return true;
};

export default videoConverterJob;

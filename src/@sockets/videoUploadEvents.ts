import socketIo from 'socket.io';
import fs from 'fs';
import { server } from '../@server';
import VideoModel from '../@models/VideoModel';
import { videoConverterQueue } from '../@jobs';
import Config from '../@configs';
import AWSMultiPartUpload from '../@utils/awsMultiPartUpload';

interface Ifiles {
  [key: string]: {
    fileSize: number;
    data: string;
    downloaded: number;
    fileHandler?: number;
    awsHandler?: AWSMultiPartUpload;
  };
}
const files: Ifiles = {};

const io = socketIo(server);

io.sockets.on('connection', socket => {
  socket.on('connect', () => console.log('Client connected'));
  socket.on('disconnect', () => console.log('Client disconnected'));

  // This event will be called only once
  // Either while starting the file upload or resuming the file upload
  socket.on('Start', data => {
    const name = data.Name as string;
    const filePath = `${Config.mediaUploadPath}/${name}`;
    files[name] = {
      fileSize: data.Size,
      data: '',
      downloaded: 0,
    };

    let position = 0;
    let percent = 0;
    try {
      const stat = fs.statSync(filePath);
      if (stat.isFile()) {
        files[name].downloaded = stat.size;
        position = stat.size / Config.websocketVideoUploadConfig.chunkSize;
        percent = (files[name].downloaded / files[name].fileSize) * 100;
      }
    } catch {
      console.log('New file detected...');
    }

    fs.open(filePath, 'a', 0o755, (error, fd) => {
      if (error) {
        console.log('Error while opening the file....');
        console.log(error);
      } else {
        files[name].fileHandler = fd; // We store the file handler so we can write to it later
        if (process.env.UPLOAD_FILES_TO_AWS_S3 === 'true') {
          files[name].awsHandler = new AWSMultiPartUpload(
            name,
            'video/mp4',
            files[name].fileSize,
          );
        }
        socket.emit('MoreData', {
          Place: position,
          Percent: percent,
          BufferSize: Config.websocketVideoUploadConfig.bufferSize,
          ChunkSize: Config.websocketVideoUploadConfig.chunkSize,
        });
      }
    });
  });

  socket.on('Upload', data => {
    const name = data.Name;
    files[name].downloaded += data.Data.length;
    files[name].data += data.Data;

    if (files[name].downloaded === files[name].fileSize) {
      // If File is Fully Uploaded
      fs.write(
        files[name].fileHandler!,
        files[name].data,
        null,
        'Binary',
        (_, __) => {
          if (process.env.UPLOAD_FILES_TO_AWS_S3 === 'true') {
            files[name].awsHandler!.startUpload(files[name].data);
          }
          // Get Thumbnail Here
          VideoModel.create({ name }).then(video => {
            videoConverterQueue.add({ name, videoId: video.id });
            socket.emit('Done', { videoId: video.id });
          });
        },
      );
    } else if (
      files[name].data.length > Config.websocketVideoUploadConfig.bufferSize
    ) {
      // If the Data Buffer reaches limit

      fs.write(
        files[name].fileHandler! as number,
        files[name].data,
        null,
        'Binary',
        (_, __) => {
          if (process.env.UPLOAD_FILES_TO_AWS_S3 === 'true') {
            files[name].awsHandler!.startUpload(files[name].data);
          }

          files[name].data = ''; // Reset The Buffer

          const position =
            files[name].downloaded /
            Config.websocketVideoUploadConfig.chunkSize;
          const percent = (files[name].downloaded / files[name].fileSize) * 100;

          socket.emit('MoreData', {
            Place: position,
            Percent: percent,
            BufferSize: Config.websocketVideoUploadConfig.bufferSize,
            ChunkSize: Config.websocketVideoUploadConfig.chunkSize,
          });
        },
      );
    } else {
      const position =
        files[name].downloaded / Config.websocketVideoUploadConfig.chunkSize;
      const percent = (files[name].downloaded / files[name].fileSize) * 100;

      socket.emit('MoreData', {
        Place: position,
        Percent: percent,
        BufferSize: Config.websocketVideoUploadConfig.bufferSize,
        ChunkSize: Config.websocketVideoUploadConfig.chunkSize,
      });
    }
  });
});

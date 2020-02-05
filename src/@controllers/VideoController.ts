import appRoot from 'app-root-path';
import { RequestHandler } from 'express';
import { exec } from 'child_process';
import uuidv1 from 'uuid/v1';
import fs from 'fs';
import { videoConverterQueue } from '../@jobs';
import VideoModel from '../@models/video';

export default class VideoController {
  public upload: RequestHandler = (req, res) => {
    req.pipe(req.busboy); // Pipe it trough busboy

    req.busboy.on('file', (_, file, filename) => {
      // Create a write stream of the new file
      const fstream = fs.createWriteStream(`${appRoot}/uploads/${filename}`);
      // Pipe it trough
      file.pipe(fstream);

      // On finish of the upload
      fstream.on('close', async () => {
        console.log(`Upload of '${filename}' finished`);

        const video = await VideoModel.create({ name: filename });
        videoConverterQueue.add({ name: filename, videoId: video.id });

        res.send({ uploaded: true });
      });
    });
  };

  public getAllVideos: RequestHandler = async (_, res) => {
    const videos = await VideoModel.findAll();
    res.send({ videos });
  };

  public getVideo: RequestHandler = (req, res) => {
    const filePath =
      req.query.resolution !== undefined
        ? `${appRoot}/uploads/${req.query.resolution}p/${req.params.videoName}`
        : `${appRoot}/uploads/${req.params.videoName}`;

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range as string;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      const chunksize = end - start + 1;

      const file = fs.createReadStream(filePath, { start, end });
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(200, head);
      fs.createReadStream(filePath).pipe(res);
    }
  };

  public liveSteramVideo: RequestHandler = (req, res) => {
    const videoName = req.params.videoName;
    const streamingUrl = `rtmp://localhost/live/${uuidv1()}`;
    const process = exec(
      `ffmpeg -re -i ${appRoot}/uploads/${videoName} -c:v libx264 -preset superfast -tune zerolatency -c:a aac -ar 44100 -f flv ${streamingUrl}`,
    );
    console.log(`Live streaming started with PID: ${process.pid}`);
    res.json({ url: streamingUrl });
  };
}

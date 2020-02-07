import { RequestHandler, Request } from 'express';
import { exec } from 'child_process';
import uuidv1 from 'uuid/v1';
import fs from 'fs';
import { videoConverterQueue } from '../@jobs';
import VideoModel from '../@models/VideoModel';
import Configs from '../@configs';

export default class VideoController {
  public upload: RequestHandler = (req, res) => {
    req.pipe(req.busboy); // Pipe it trough busboy

    req.busboy.on('file', (_, file, filename) => {
      // Create a write stream of the new file
      const fstream = fs.createWriteStream(
        `${Configs.mediaUploadPath}/${filename}`,
      );
      // Pipe it trough
      file.pipe(fstream);

      // On finish of the upload
      fstream.on('close', async () => {
        console.log(`Upload of '${filename}' finished`);

        const video = await VideoModel.create({ name: filename });
        videoConverterQueue.add({ name: filename, videoId: video.id });

        res.send({ videoId: video.id });
      });
    });
  };

  public getAllVideos: RequestHandler = async (_, res) => {
    const videos = await VideoModel.findAll();
    res.send({ videos });
  };

  public getVideoDetails: RequestHandler = async (req, res) => {
    const video = await VideoModel.findByPk(req.params.id);

    if (!video) {
      return res.status(404).json({ error: 'Video not found.' });
    }
    return res.json({ video });
  };

  public getVideo: RequestHandler = async (req, res) => {
    const video = await VideoModel.findByPk(req.params.id);

    if (!video || (video && !video.resolutions)) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const requestedResolution = this.getVideoResolution(req, video);
    if (!requestedResolution) {
      return res
        .status(400)
        .json({ error: 'Video not available in request resolution.' });
    }

    const filePath = `${Configs.mediaUploadPath}/${requestedResolution}p/${video.name}`;
    if (!fs.existsSync(filePath)) {
      return res
        .status(500)
        .json({ error: 'Looks like video file has been manually removed.' });
    }
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
      return file.pipe(res);
    } else {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };

      res.writeHead(200, head);
      return fs.createReadStream(filePath).pipe(res);
    }
  };

  public liveSteramVideo: RequestHandler = async (req, res) => {
    const video = await VideoModel.findByPk(req.params.id);

    if (!video || (video && !video.resolutions)) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const requestedResolution = this.getVideoResolution(req, video);
    if (!requestedResolution) {
      return res
        .status(400)
        .json({ error: 'Video not available in request resolution.' });
    }

    const filePath = `${Configs.mediaUploadPath}/${requestedResolution}p/${video.name}`;
    if (!fs.existsSync(filePath)) {
      return res
        .status(500)
        .json({ error: 'Looks like video file has been removed.' });
    }
    const streamKey = uuidv1();
    const rtmpStreamingUrl = `rtmp://localhost/live/${streamKey}`;
    const hlsStreamUrl = `http://localhost:${Configs.nodeMediaServerConfig.http.port}/live/${streamKey}/index.m3u8`;
    const process = exec(
      `ffmpeg -re -i ${filePath} -c:v libx264 -preset superfast -tune zerolatency -c:a aac -ar 44100 -f flv ${rtmpStreamingUrl}`,
    );

    // TODO: save this PID and add an api to stop live stream.
    console.log(`Live streaming started with PID: ${process.pid}`);
    return res.json({ rtmp: rtmpStreamingUrl, hls: hlsStreamUrl });
  };

  private getVideoResolution = (
    req: Request,
    video: VideoModel,
  ): string | undefined => {
    let requestedResolution: string;

    if (!req.query.resolution) {
      requestedResolution = Math.max(
        ...video.resolutions.map(item => +item),
      ).toString();
    } else {
      if (!video.resolutions.includes(req.query.resolution)) {
        return;
      } else {
        requestedResolution = req.query.resolution;
      }
    }
    return requestedResolution;
  };
}

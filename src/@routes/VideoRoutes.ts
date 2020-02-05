// import multer from 'multer';
// import storage from '../@middlewares/videoStorage';
import { Router } from 'express';
import VideoController from '../@controllers/VideoController';

export default class VideUploadRoutes {
  public router: Router;
  public videoController: VideoController = new VideoController();
  // private uploader = multer({ storage, limits: { fileSize: 52428800 } });

  constructor() {
    this.router = Router();
    this.routes();
  }

  private routes() {
    this.router.get('', this.videoController.getAllVideos);
    this.router.post(
      '/upload',
      // this.uploader.single('file'),
      this.videoController.upload,
    );
    this.router.get('/:videoName', this.videoController.getVideo);
    this.router.get('/stream/:videoName', this.videoController.liveSteramVideo);
  }
}

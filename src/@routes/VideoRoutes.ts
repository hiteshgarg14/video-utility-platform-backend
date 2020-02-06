import { Router } from 'express';
import VideoController from '../@controllers/VideoController';

export default class VideUploadRoutes {
  public router: Router;
  public videoController: VideoController = new VideoController();

  constructor() {
    this.router = Router();
    this.routes();
  }

  private routes() {
    this.router.get('', this.videoController.getAllVideos);
    this.router.post('/upload', this.videoController.upload);
    this.router.get('/:id', this.videoController.getVideo);
    this.router.get('/:id/details', this.videoController.getVideoDetails);
    this.router.get('/stream/:id', this.videoController.liveSteramVideo);
  }
}

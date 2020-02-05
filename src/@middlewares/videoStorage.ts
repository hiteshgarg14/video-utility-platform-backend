import appRoot from 'app-root-path';
import multer from 'multer';
import { Request } from 'express';

const storage = multer.diskStorage({
  destination: (_: Request, __, cb) => {
    cb(null, `${appRoot}/uploads`);
  },
  filename: (_: Request, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  },
});

export default storage;

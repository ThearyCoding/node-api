import path from 'path';
import multer from 'multer';
const webp=require('webp-converter');


export default class FileMiddleware {
  public static readonly memoryLoader = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 1073741824,
    },
  });

  public static readonly diskLoader = multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => {
        //cb(null, path.join(__dirname.replace('dist/commons', ''), '/upload/images'));//linux if not work try it
        //cb(null, path.join( 'upload/images'));//windows
        cb(null, path.join(__dirname.replace('dist/app/commons', ''), '/upload/images'));//linux
        
      },
      filename: function (req, file, cb) {
        console.log(file.filename)
        const fileName = Date.now() + Math.floor(Math.random() * 1000) + path.extname(file.originalname);
        if (req.body.images) {
          req.body.images.push(fileName);
        } else {
          req.body.images = [fileName];
        }
        cb(null, fileName);
      },
    }),
    limits: {
      fileSize: 1073741824,
    },
  });

  public static readonly productImage = multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => {
         //cb(null, path.join(__dirname.replace('dist/commons', ''), '/upload/images'));//linux if not work try it
        //cb(null, path.join( 'upload/images'));//windows
        cb(null, path.join(__dirname.replace('dist/app/commons', ''), '/upload/images'));//linux
      },
      filename: function (req, file, cb) {
        const fileName = Date.now() + Math.floor(Math.random() * 1000) + path.extname(file.originalname);

        if (req.body.images) {
          req.body.images = [fileName, ...req.body.images];
        } else {
          req.body.images = [fileName];
        }
        cb(null, fileName);
      },
    }),
    limits: {
      fileSize: 1073741824,
    },
  });

  public static readonly webpImage = multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => {
        //cb(null, path.join(__dirname.replace('dist/commons', ''), '/upload/images'));//linux if not work try it
        //cb(null, path.join( 'upload/images'));//windows
        cb(null, path.join(__dirname.replace('dist/app/commons', ''), '/upload/images'));//linux
      },
      filename: function (req, file, cb) {
        const fileName = Date.now() + Math.floor(Math.random() * 1000) + path.extname(file.originalname);
        if (req.body.images) {
          req.body.images.push(fileName);
        } else {
          req.body.images = [fileName];
        }
        cb(null, fileName);
      },
    }),
    limits: {
      fileSize: 1073741824,
    },
  });
}

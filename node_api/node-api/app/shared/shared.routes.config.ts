import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../services/routes/common.router.config';
import { SharedController } from './controllers/shared.controller';
import FileMiddleware from '../commons/fileupload.middleware';
import { AuthMiddleWare } from '../commons/midleware/admin/auth.midleware';
import { DisableAddDeleteMiddleWare } from '../commons/midleware/admin/disableadddelete.midleware';

export class SharedRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'shared route');
    this.configureRoutes();
  }
  configureRoutes() {
    const sharedController = new SharedController();    
    const authMiddleWare = new AuthMiddleWare();
    const disableAddDelete = new DisableAddDeleteMiddleWare();
    this.app.post('/images', [authMiddleWare.validateAuthorization,disableAddDelete.validateAuthorization,FileMiddleware.diskLoader.single('image'), sharedController.postImage]);
    this.app.put('/images', [authMiddleWare.validateAuthorization, sharedController.updateImageName]);
    this.app.get('/images/:url', [sharedController.getImage]);
    this.app.post('/allimages', [authMiddleWare.validateAuthorization,sharedController.getAllImages]);
    this.app.delete('/images/:url', [authMiddleWare.validateAuthorization,sharedController.deletImage]);
    this.app.post('/home/currenyIcon', [authMiddleWare.validateAuthorization,disableAddDelete.validateAuthorization,sharedController.currenyIcon]);
    this.app.post('/images/:type', [authMiddleWare.validateAuthorization,disableAddDelete.validateAuthorization,FileMiddleware.webpImage.single('image'),sharedController.postImageByType]);
    this.app.post('/images/:type/:name', [authMiddleWare.validateAuthorization,disableAddDelete.validateAuthorization,FileMiddleware.webpImage.array('image'),sharedController.postMultiImagesByType]);
  }
}

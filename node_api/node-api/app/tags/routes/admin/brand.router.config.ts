import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { AuthMiddleWare } from '../../../commons/midleware/admin/auth.midleware';
import { AdminMiddleWare } from '../../../commons/midleware/admin/admin.midlware';
import { TagController } from '../../controller/tag.controller';
import { TagMiddleWare } from '../../midleware/tag.midlware';
import FileMiddleware from '../../../commons/fileupload.middleware';
import { DisableAddDeleteMiddleWare } from '../../../commons/midleware/admin/disableadddelete.midleware';

export class TagRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'TagRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const tagController = new TagController();
    const authMiddleWare = new AuthMiddleWare();
    const tagMiddleWare = new TagMiddleWare();
    const adminMiddleWare = new AdminMiddleWare();
    const disableAddDelete = new DisableAddDeleteMiddleWare();
    this.app.post('/tags', [
      tagMiddleWare.validateTagFields,
      adminMiddleWare.validateAdminUser,
      disableAddDelete.validateAuthorization,
      tagController.createTag,
    ]);
    this.app.put('/tags/:id', [disableAddDelete.validateAuthorization, adminMiddleWare.validateAdminUser, tagController.updateTagById]);
    this.app.post('/alltags', [authMiddleWare.validateAuthorization, tagController.getAllTag]);
    this.app.get('/tags/:id', [authMiddleWare.validateAuthorization, tagController.getTagById]);
    this.app.delete('/tags/:ids', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, tagController.deleteTagById]);
  }
}

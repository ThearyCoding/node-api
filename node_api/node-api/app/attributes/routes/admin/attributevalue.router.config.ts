import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { AttributeValueController } from '../../controller/admin/atttributevalue.controller';
import { AuthMiddleWare } from '../../../commons/midleware/admin/auth.midleware';
import { AttributeValueMiddleWare } from '../../midleware/admin/atributevalue.midleware';
import { AdminMiddleWare } from '../../../commons/midleware/admin/admin.midlware';
import FileMiddleware from '../../../commons/fileupload.middleware';
import { DisableAddDeleteMiddleWare } from '../../../commons/midleware/admin/disableadddelete.midleware';

export class AttributeValuesRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'AttributeRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const attributeValueController = new AttributeValueController();
    const authMiddleWare = new AuthMiddleWare();
    const attributeValueMiddleWare = new AttributeValueMiddleWare();
    const adminMiddleWare = new AdminMiddleWare();
    const disableAddDelete = new DisableAddDeleteMiddleWare();
    this.app.post('/attribute-values', [
      FileMiddleware.diskLoader.single('image'),
      attributeValueMiddleWare.validateAttributeValueFields,
      adminMiddleWare.validateAdminUser,
      disableAddDelete.validateAuthorization,
      attributeValueController.createAttributeValue,
    ]);
    this.app.put('/attribute-values/:id', [
      FileMiddleware.diskLoader.single('image'),
      adminMiddleWare.validateAdminUser,
      disableAddDelete.validateAuthorization,
      attributeValueController.updateAttributeValueById,
    ]);
    this.app.post('/allAttributeValues', [authMiddleWare.validateAuthorization, attributeValueController.getAllAttributeValues]);
    this.app.get('/attribute-values/:id', [authMiddleWare.validateAuthorization, attributeValueController.getAttributeValueById]);
    this.app.delete('/attribute-values/:ids', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, attributeValueController.deleteAttributeValueById]);
  }
}

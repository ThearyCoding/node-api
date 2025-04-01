import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { AuthMiddleWare } from '../../../commons/midleware/admin/auth.midleware';
import { AdminMiddleWare } from '../../../commons/midleware/admin/admin.midlware';
import { AttributeController } from '../../controller/admin/attribute.controller';
import { AttributeMiddleWare } from '../../midleware/admin/attribute.midlware';
import { DisableAddDeleteMiddleWare } from '../../../commons/midleware/admin/disableadddelete.midleware';

export class AttributesRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'AttributeRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const attributeController = new AttributeController();
    const authMiddleWare = new AuthMiddleWare();
    const attributeMiddleWare = new AttributeMiddleWare();
    const adminMiddleWare = new AdminMiddleWare();
    const disableAddDelete = new DisableAddDeleteMiddleWare();
    this.app.post('/attributes', [
      attributeMiddleWare.validateAttributeFields,
      adminMiddleWare.validateAdminUser,
      disableAddDelete.validateAuthorization,
      attributeController.createAttribute,
    ]);
    this.app.put('/attributes/:id', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, attributeController.updateAttributeById]);
    this.app.post('/allAttributes', [authMiddleWare.validateAuthorization, attributeController.getAllAttribute]);
    this.app.get('/allAttributes', [authMiddleWare.validateAuthorization, attributeController.getAllAttributeWithValues]);
    this.app.get('/attributes/:id', [authMiddleWare.validateAuthorization, attributeController.getAttributeById]);
    this.app.delete('/attributes/:ids', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, attributeController.deleteAttributeById]);
  }
}

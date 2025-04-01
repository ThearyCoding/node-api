import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../../services/routes/common.router.config';
import { AdminMiddleWare } from '../../../../commons/midleware/admin/admin.midlware';
import { ContactController } from '../../controllers/admin/contact.controller';
import { DisableAddDeleteMiddleWare } from '../../../../commons/midleware/admin/disableadddelete.midleware';

export class ContactRouters extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'ContactRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const contactController = new ContactController();
    const adminMiddleWare = new AdminMiddleWare();
    const disableAddDelete = new DisableAddDeleteMiddleWare();
    this.app.post('/contact', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, contactController.createContact]);
    this.app.put('/contact/:id', [adminMiddleWare.validateAdminUser,disableAddDelete.validateAuthorization, contactController.updateContactById]);
    this.app.get('/contact', [contactController.getAllContact]);
  }
}

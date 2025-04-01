import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../../services/routes/common.router.config';
import { AdminMiddleWare } from '../../../../commons/midleware/admin/admin.midlware';
import { ContactController } from '../../controllers/admin/contact.controller';
import { DisableAddDeleteMiddleWare } from '../../../../commons/midleware/admin/disableadddelete.midleware';

export class ContactFrontendRouters extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'ContactFrontendRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const contactController = new ContactController();

    this.app.get('/v1/contact', [contactController.getAllContact]);
  }
}

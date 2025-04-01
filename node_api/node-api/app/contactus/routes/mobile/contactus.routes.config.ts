import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { AuthMiddleWare } from '../../../commons/midleware/admin/auth.midleware';
import { ContactUsController } from '../../controllers/mobile/contactus.controller';
import { DisableAddDeleteMiddleWare } from '../../../commons/midleware/admin/disableadddelete.midleware';


export class ContactUsRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'ContactUsRoutes');
    this.configureRoutes();
  }
  configureRoutes() {
    const contactUsController = new ContactUsController();
    const authMiddleWare = new AuthMiddleWare();
    const disableAddDelete = new DisableAddDeleteMiddleWare();
    this.app.post('/contactus', [ authMiddleWare.validateAuthorization,disableAddDelete.validateAuthorization, contactUsController.createContactUs]);

  }
}

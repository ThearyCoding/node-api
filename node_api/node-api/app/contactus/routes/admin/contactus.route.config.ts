import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { AuthMiddleWare } from '../../../commons/midleware/admin/auth.midleware';
import { ContactUsController } from '../../controllers/admin/contactus.controller';


export class ContactUsAdminRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'ContactUsAdminRoutes');
    this.configureRoutes();
  }
  configureRoutes() {
    const contactUsController = new ContactUsController();
    const authMiddleWare = new AuthMiddleWare();
    this.app.post('/allcontactus', [ authMiddleWare.validateAuthorization,  contactUsController.getAllContactUs]);
    this.app.delete('/deletecontact/:ids', [ authMiddleWare.validateAuthorization,  contactUsController.deleteContactUsById]);
  }
}

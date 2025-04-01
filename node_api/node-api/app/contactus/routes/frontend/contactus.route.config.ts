import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { AuthMiddleWare } from '../../../commons/midleware/admin/auth.midleware';
import { ContactUsController } from '../../controllers/mobile/contactus.controller';


export class ContactUsFontendRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'ContactUsFontendRoutes');
    this.configureRoutes();
  }
  configureRoutes() {
    const contactUsController = new ContactUsController();
    const authMiddleWare = new AuthMiddleWare();
    
    this.app.post('/v1/contactus', [  contactUsController.createContactUs]);

  }
}

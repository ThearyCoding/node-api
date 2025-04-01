import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../../services/routes/common.router.config';
import { CompanyDetailsController } from '../../controllers/admin/companydetail.controller';


export class FontentCompanyDeailsRouters extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'FontentCompanyDeailsRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const companyDetailsController = new CompanyDetailsController();


    this.app.get('/v1/company-details', [companyDetailsController.getAllCompanyDetails]);
  }
}

import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../../services/routes/common.router.config';
import { AdminMiddleWare } from '../../../../commons/midleware/admin/admin.midlware';
import { CompanyDetailsController } from '../../controllers/admin/companydetail.controller';
import { DisableAddDeleteMiddleWare } from '../../../../commons/midleware/admin/disableadddelete.midleware';


export class CompanyDeailsRouters extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'CompanyDeailsRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const companyDetailsController = new CompanyDetailsController();
    const adminMiddleWare = new AdminMiddleWare();
    const disableAddDelete = new DisableAddDeleteMiddleWare();
    this.app.post('/company-details', [adminMiddleWare.validateAdminUser, disableAddDelete.validateAuthorization,companyDetailsController.createCompanyDetails]);
    this.app.put('/company-details/:id', [adminMiddleWare.validateAdminUser, disableAddDelete.validateAuthorization,companyDetailsController.updateCompanyDetailsById]);
    this.app.get('/company-details', [companyDetailsController.getAllCompanyDetails]);
  }
}

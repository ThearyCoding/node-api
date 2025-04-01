import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { AuthMiddleWare } from '../../../commons/midleware/admin/auth.midleware';
import { AddressController } from '../../controller/mobile/address.controller';
import { AddressMiddleWare } from '../../midleware/mobile/address.midleware';

export class AddressMobileRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'AddressMobileRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const addressController = new AddressController();
    const authMiddleWare = new AuthMiddleWare();
    const addressMiddleWare = new AddressMiddleWare();
    this.app.post('/account/getAllState', [addressController.getAllState]);
    this.app.post('/account/getAllcontry', [addressController.getAllCountries]);
    this.app.post('/account/addUpdateAddress', [
      addressMiddleWare.validateAddressFields,
      authMiddleWare.validateAuthorization,
      addressController.createAddress,
    ]);
    this.app.post('/account/editAdderss', [
      addressMiddleWare.validateUpdateAddressFields,
      authMiddleWare.validateAuthorization,
      addressController.updateAddressById,
    ]);
    this.app.post('/account/getAddressList', [authMiddleWare.validateAuthorization, addressController.getAllAddressByUser]);
    this.app.post('/account/deleteAdderss', [
      addressMiddleWare.validateUpdateAddressFields,
      authMiddleWare.validateAuthorization,
      addressController.deleteAddressById,
    ]);
  }
}

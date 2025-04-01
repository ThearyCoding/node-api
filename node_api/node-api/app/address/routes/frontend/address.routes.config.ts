import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { AddressController } from '../../controller/frontend/address.controller';
import { AuthMiddleWare } from '../../../commons/midleware/frontend/auth.midleware';
import { AddressMiddleWare } from '../../midleware/admin/address.midleware';

export class AddressFrontendRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'AddressFrontendRoutes');
    this.configureRoutes();
  }
  configureRoutes() {
    const addressController = new AddressController();
    const authMiddleWare = new AuthMiddleWare();
    const addressMiddleWare = new AddressMiddleWare();
    this.app.post('/v1/address', [addressMiddleWare.validateAddressFields, authMiddleWare.validateAuthorization, addressController.createAddress]);
    this.app.put('/v1/address/:id', [authMiddleWare.validateAuthorization,  addressController.updateAddressById]);
    this.app.get('/v1/address', [authMiddleWare.validateAuthorization, addressController.getAllAddressByUser]);
    this.app.get('/v1/address/:id', [authMiddleWare.validateAuthorization, addressController.getAddressById]);
    this.app.delete('/v1/address/:id', [authMiddleWare.validateAuthorization,addressController.deleteAddressById]);
  }
}

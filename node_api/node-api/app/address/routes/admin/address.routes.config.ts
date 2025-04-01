import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../services/routes/common.router.config';
import { AuthMiddleWare } from '../../../commons/midleware/admin/auth.midleware';
import { AddressController } from '../../controller/admin/address.controller';
import { AddressMiddleWare } from '../../midleware/admin/address.midleware';
import { DisableAddDeleteMiddleWare } from '../../../commons/midleware/admin/disableadddelete.midleware';

export class AddressRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'AddressRouters');
    this.configureRoutes();
  }
  configureRoutes() {
    const addressController = new AddressController();
    const authMiddleWare = new AuthMiddleWare();
    const addressMiddleWare = new AddressMiddleWare();
    const disableAddDelete = new DisableAddDeleteMiddleWare();
    this.app.post('/address', [addressMiddleWare.validateAddressFields,disableAddDelete.validateAuthorization, authMiddleWare.validateAuthorization, addressController.createAddress]);
    this.app.put('/address/:id', [authMiddleWare.validateAuthorization, disableAddDelete.validateAuthorization, addressController.updateAddressById]);
    this.app.post('/alladdress', [authMiddleWare.validateAuthorization, addressController.getAllAddressByUser]);
    this.app.get('/address/:id', [authMiddleWare.validateAuthorization, addressController.getAddressById]);
    this.app.delete('/address/:id', [authMiddleWare.validateAuthorization,disableAddDelete.validateAuthorization, addressController.deleteAddressById]);
  }
}

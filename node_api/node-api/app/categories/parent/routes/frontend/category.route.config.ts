import express from 'express';
import { CommonRoutesConfig, configureRoutes } from '../../../../services/routes/common.router.config';
import { CategoryController } from '../../controllers/frontend/categories.controller';

export class CategoryFrontendRoutes extends CommonRoutesConfig implements configureRoutes {
  constructor(app: express.Application) {
    super(app, 'CategoryFrontendRoutes');
    this.configureRoutes();
  }
  configureRoutes() {
    const categoryController = new CategoryController();
    this.app.get('/v1/categories/:limit/:withsubcat', [ categoryController.getCetegory]);
    this.app.get('/v1/categories/:id', [ categoryController.getCategoryById]);
  }
}

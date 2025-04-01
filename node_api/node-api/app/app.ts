import express from 'express';
import * as dotenv from 'dotenv';
import * as http from 'http';
import * as bodyparser from 'body-parser';
import * as winston from 'winston';
import * as expressWinston from 'express-winston';
import { connectDB } from './services/db/db_configs';
import { WebUserRoutes } from './users/routes/admin/user.router.config';
import { UserRoutes } from './users/routes/mobile/user.router.config';
import { AdminUserRoutes } from './users/routes/admin/admin.router.config';
import { CategoryRoutes } from './categories/parent/routes/admin/category.router.config';
import { SubCategoryRoutes } from './categories/sub/routes/admin/subcategory.router.config';
import { BrandRoutes } from './brands/routes/admin/brand.router.config';
import { TagRoutes } from './tags/routes/admin/brand.router.config';
import { AttributesRoutes } from './attributes/routes/admin/attribute.router.config';
import { AttributeValuesRoutes } from './attributes/routes/admin/attributevalue.router.config';
import { ProductValuesRoutes } from './products/routes/admin/product.routes.config';
import { AddressRoutes } from './address/routes/admin/address.routes.config';
import { PromocodeRoutes } from './promocode/routes/admin/promocode.routes.config';
import { BannerRoutes } from './banners/routes/admin/banner.route.config';
import { OfferBannerRoutes } from './offerbanner/routes/admin/banner.route.config';
import { DeliveryBoyRoutes } from './deliveryboy/routes/admin/deliveryboy.route.config';
import { DeliveryChargeRoutes } from './deliverycharge/routes/admin/deliverycharge.router.config';
import { DeliveryTimeRoutes } from './deliverytime/routes/admin/deliverytime.router.config';
import { CartsRoutes } from './carts/routes/admin/cart.router.config';
import { RejectionReasonRouters } from './rejection-reason/routes/admin/rejection.router.config';
import { OrderRoutes } from './orders/routes/admin/order.router.config';
import { GeneralRouters } from './settings/general/routes/admin/general.router.config';
import { MetaContentRouters } from './settings/meta-content/routes/admin/metaconent.router.config';
import { AboutRouters } from './settings/about-us/routes/admin/about.router.config';
import { ContactRouters } from './settings/contact-us/routes/admin/contact.router.config';
import { PolicyRouters } from './settings/policy-managment/routes/admin/policy.router.config';
import { SharedRoutes } from './shared/shared.routes.config';
import { ProductMobileRoutes } from './products/routes/mobile/product.routes.config';
import { CategoryMobileRoutes } from './categories/parent/routes/mobile/category.router.config';
import { AddressMobileRoutes } from './address/routes/mobile/address.routes.config';
import { CartsMobileRoutes } from './carts/routes/mobile/cart.router.config';
import { OrderMobileRoutes } from './orders/routes/mobile/order.router.config';
import { UserRoleRoutes } from './users/routes/admin/role.outer.config';
import { CompanyDeailsRouters } from './settings/company-details/routes/admin/companydetail.router.config';
import { ContactUsRoutes } from './contactus/routes/mobile/contactus.routes.config';
import { FrontendBannerRoutes } from './banners/routes/frontend/banner.route.config';
import { CategoryFrontendRoutes } from './categories/parent/routes/frontend/category.route.config';
import { ProductsFrontendRoutes } from './products/routes/frotend/product.routes.config';
import { MobilePromocodeRoutes } from './promocode/routes/mobile/promocode.routes.config';
import { CartsFrontendRoutes } from './carts/routes/frontend/cart.routes.config';
import { AddressFrontendRoutes } from './address/routes/frontend/address.routes.config';
import { FrontendPromocodeRoutes } from './promocode/routes/frontend/promocode.routes.config';
import { OrderFrontendRoutes } from './orders/routes/frontend/order.router.config';
import { OfferBannerFrontendRoutes } from './offerbanner/routes/frontend/banner.route.config';
import { ContactUsFontendRoutes } from './contactus/routes/frontend/contactus.route.config';
import { ContactUsAdminRoutes } from './contactus/routes/admin/contactus.route.config';
import { FrontendUserRoutes } from './users/routes/fontend/user.router.config';
import { NodeLocalCache } from './commons/node.cache';
import { AboutFrontendRouters } from './settings/about-us/routes/frontend/about.router.config';
import { PolicyFontendRouters } from './settings/policy-managment/routes/frontend/policy.router.config';
import { FontentCompanyDeailsRouters } from './settings/company-details/routes/frontend/conpanydetail.router.config';
import { GeneralFrontendRouters } from './settings/general/routes/frontend/general.router.config';
import { ContactFrontendRouters } from './settings/contact-us/routes/frontend/contact.router.config';
import { MetaContentFrontendRouters } from './settings/meta-content/routes/frontend/metaconent.router.config';

dotenv.config();
const app: express.Application = express();
const server: http.Server = http.createServer(app);
NodeLocalCache.getInstance();
const cache = NodeLocalCache.getCache()
cache.flushAll();
cache.getStats();
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));
 
connectDB();
const index = expressWinston.requestWhitelist.indexOf('headers');
if (index !== -1) expressWinston.requestWhitelist.splice(index, 1);
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Expose-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', req.header('Access-Control-Request-Headers'));
  console.log(req.method,req.url)
  if (req.method === 'OPTIONS') {
    return res.status(200).send();
  } else {
    return next();
  }
});

new UserRoutes(app);
new WebUserRoutes(app);
new AdminUserRoutes(app);
new CategoryRoutes(app);
new SubCategoryRoutes(app);
new BrandRoutes(app);
new TagRoutes(app);
new AttributesRoutes(app);
new AttributeValuesRoutes(app);
new ProductValuesRoutes(app);
new AddressRoutes(app);
new PromocodeRoutes(app);
new BannerRoutes(app);
new OfferBannerRoutes(app);
new DeliveryBoyRoutes(app);
new DeliveryChargeRoutes(app);
new DeliveryTimeRoutes(app);
new CartsRoutes(app);
new RejectionReasonRouters(app);
new OrderRoutes(app);
new GeneralRouters(app);
new MetaContentRouters(app);
new AboutRouters(app);
new ContactRouters(app);
new PolicyRouters(app);
new ProductMobileRoutes(app);
new SharedRoutes(app);
new CategoryMobileRoutes(app);
new AddressMobileRoutes(app);
new CartsMobileRoutes(app);
new OrderMobileRoutes(app);
new UserRoleRoutes(app);
new CompanyDeailsRouters(app);
new ContactUsRoutes(app);
new FrontendUserRoutes(app);
new FrontendBannerRoutes(app);
new CategoryFrontendRoutes(app);
new ProductsFrontendRoutes(app);
new MobilePromocodeRoutes(app);
new CartsFrontendRoutes(app);
new AddressFrontendRoutes(app);
new FrontendPromocodeRoutes(app);
new OrderFrontendRoutes(app);
new OfferBannerFrontendRoutes(app);
new ContactUsFontendRoutes(app);
new ContactUsAdminRoutes(app);
new AboutFrontendRouters(app);
new PolicyFontendRouters(app);
new FontentCompanyDeailsRouters(app);
new GeneralFrontendRouters(app)
new ContactFrontendRouters(app);
new MetaContentFrontendRouters(app)

app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(winston.format.colorize(), winston.format.json()),
  }),
);

app.use(
  expressWinston.logger({
    transports: [new winston.transports.Console()],
    format: winston.format.combine(winston.format.colorize(), winston.format.json()),
  }),
);
app.get('/', (req: express.Request, res: express.Response) => {
  res.status(200).send('Server running at port ${port}');
});

server.listen(4012, () => {});
export default app;

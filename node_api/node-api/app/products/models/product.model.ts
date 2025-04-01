import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export interface Variant {
  int_glCode: string;
  variants: Array<any>;
  price: string;
  selling_price: string;
  stock: string;
}
export interface ProductInterface extends mongoose.Document {
  _id: ObjectId;
  int_glcode: string;
  fk_category: string;
  fk_subcategory: string;
  fk_subcategory2: string;
  fk_brand: string;
  fk_tags: Array<string>;
  var_title: string;
  var_image: string;
  var_slug: string;
  var_gst: string;
  var_short_description: string;
  txt_description: string;
  var_offer: string;
  var_price: string;
  var_quantity: string;
  txt_nutrition: string;
  display_order: string;
  chr_publish: boolean;
  sku_id: string;
  home_display: string;
  chr_delete: boolean;
  wishList: Array<string>;
  reviews: Array<object>;
  dt_createddate: string;
  dt_modifydate: string;
  var_ipaddress: string;
  view_count: number;
  sold_count: number;
  variants: Array<Variant>;
  date: Date;
}
const productSchema = new mongoose.Schema({
  _id: { type: ObjectId, required: true },
  int_glcode: { type: String, required: true },
  fk_category: { type: String, required: true },
  fk_subcategory: { type: String, required: true },
  fk_subcategory2: { type: String, required: false },
  fk_brand: { type: String, required: true },
  fk_tags: { type: Array<string>, require: false },
  var_title: { type: String, required: true },
  var_image: { type: String, required: false },
  var_gst: { type: String, required: false, default: '0' },
  var_short_description: { type: String, required: true },
  txt_description: { type: String, required: true },
  wishList: { type: [String], required: false, default: [] },
  reviews: { type: [Object], required: false, default: [] },
  var_offer: { type: String, required: false },
  var_price: { type: String, required: false, default: '0' },
  var_quantity: { type: String, required: false, default: '1' },
  txt_nutrition: { type: String, required: false, default: '' },
  var_slug: { type: String, required: false, default: '' },
  sku_id: { type: String, required: false, default: '' },
  display_order: { type: String, required: true, default: false },
  chr_publish: { type: Boolean, required: false },
  home_display: { type: String, required: true, default: false },
  chr_delete: { type: Boolean, required: true, default: true },
  dt_createddate: { type: String, required: false },
  dt_modifydate: { type: String, required: false },
  var_ipaddress: { type: String, required: false, default: '' },
  variants: { type: Array<Variant>, required: false, default: [] },
  view_count: { type: Number, required: false, default: 0 },
  sold_count: { type: Number, required: false, default: 0 },
  date: {
    type: Date,
    default: Date.now,
  },
});
const Product = mongoose.model<ProductInterface>('Product', productSchema, 'products');

export default Product;

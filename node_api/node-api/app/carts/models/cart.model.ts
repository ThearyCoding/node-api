import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export interface CartInterface extends mongoose.Document {
  _id: ObjectId;
  int_glcode: string;
  fk_user: string;
  fk_product: string;
  fk_verient: string;
  var_name: string;
  var_quantity: string;
  var_price: string;
  var_unit: number;
  chr_status: string;
  var_ipaddress: string;
  created_date: string;
  updated_date: string;
  is_active: boolean;
}
const cartSchema = new mongoose.Schema({
  _id: { type: ObjectId, required: true },
  int_glcode: { type: String, required: true },
  fk_user: { type: String, required: false },
  fk_product: { type: String, required: true },
  fk_verient: { type: String, required: false },
  var_name: { type: String, required: false },
  var_quantity: { type: String, required: false },
  var_price: { type: String, required: false },
  var_unit: { type: Number, required: true },
  chr_status: { type: String, required: false, default: 'Y' },
  var_ipaddress: { type: String, required: false },
  created_date: { type: String, required: true },
  updated_date: { type: String, required: true },
  is_active: { type: String, required: true },
});
const Cart = mongoose.model<CartInterface>('Cart', cartSchema, 'carts');

export default Cart;

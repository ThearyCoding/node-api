import mongoose, { Date } from 'mongoose';
import { ObjectId } from 'mongodb';

export interface OrderInterface extends mongoose.Document {
  _id: ObjectId;
  int_glcode: string;
  order_id: string;
  fk_user: string;
  fk_delivery: string;
  fk_vendor: string;
  fk_product_arr: Array<any>;
  var_payment_mode: string;
  chr_status: string;
  var_user_address: object;
  var_payment_id: string;
  dt_timeslot: string;
  chr_delivery_status: string;
  dt_delivery_date: string;
  delivery_date1: string;
  delivery_date2: string;
  delivery_date3: string;
  var_alternate_mobile: string;
  register_contact: string;
  var_address_type: string;
  var_delivery_charge: string;
  var_wallet_amount: string;
  var_discount_amount: string;
  var_total_amount: string;
  var_payable_amount: string;
  var_cashback: string;
  var_promocode: string;
  canceled_by: string;
  var_promo_discount :string;
  var_tax: string;
  chr_delete: string;
  dt_createddate: string;
  create_date: Date;
  var_ipaddress: string;
}
const orderSchema = new mongoose.Schema({
  _id: { type: ObjectId, required: true },
  int_glcode: { type: String, required: true },
  order_id: { type: String, required: true },
  fk_user: { type: String, required: true },
  fk_delivery: { type: String, required: false },
  fk_vendor: { type: String, required: false },
  fk_product_arr: { type: Array<any>, required: true },
  var_payment_mode: { type: String, required: true },
  chr_status: { type: String, required: false },
  var_user_address: { type: Object, required: true },
  create_date: { type: Date, required: true },
  dt_timeslot: { type: String, required: false },
  chr_delivery_status: { type: String, required: false },
  dt_delivery_date: { type: String, required: false },
  delivery_date1: { type: String, required: false },
  delivery_date2: { type: String, required: false },
  var_promo_discount :{ type: String, required: false, default:"0.0" },
  delivery_date3: { type: String, required: false },
  var_payment_id: { type: String, required: false, default: '' },
  var_alternate_mobile: { type: String, required: false },
  register_contact: { type: String, required: true },
  var_address_type: { type: String, required: false },
  var_delivery_charge: { type: String, required: false },
  var_wallet_amount: { type: String, required: false },
  var_discount_amount: { type: String, required: false },
  var_tax: { type: String, required: false, default: '0' },
  var_total_amount: { type: String, required: true },
  var_payable_amount: { type: String, required: true },
  var_cashback: { type: String, required: false },
  var_promocode: { type: String, required: false },
  canceled_by: { type: String, required: false },
  chr_delete: { type: String, required: false },
  dt_createddate: { type: String, required: true },
  var_ipaddress: { type: String, required: false },
});
const Order = mongoose.model<OrderInterface>('Order', orderSchema, 'orders');

export default Order;

import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export interface ReturnOrderInterface extends mongoose.Document {
  _id: ObjectId;
  int_glcode: string;
  return_id: string;
  order_id: string;
  fk_user: string;
  order_inglcode: string;
  fk_product_arr: Object;
  chr_status: string;
  var_total_amount: string;
  var_payable_amount: string;
  var_tax: string;
  paid_status: string;
  paid_amount: string;
  customer_comment: string;
  admin_comment: string;
  refund_date: string
  dt_paid: string;
  dt_createddate: string;
  var_ipaddress: string;
  cancel_status: string;
}
const returnOrderSchema = new mongoose.Schema({
  _id: { type: ObjectId, required: true },
  int_glcode: { type: String, required: true },
  order_id: { type: String, required: true },
  fk_user: { type: String, required: true },
  fk_product_arr: { type: Object, required: true },
  return_id: { type: String, required: false },
  chr_status: { type: String, required: false },
  var_tax: { type: String, required: false, default: '0' },
  var_total_amount: { type: String, required: true },
  var_payable_amount: { type: String, required: true },
  paid_status: { type: String, required: true },
  order_inglcode: { type: String, required: true },
  paid_amount:  { type: String, required: false, default:0 },
  dt_paid: { type: String, required: false },
  customer_comment:{ type: String, required: false },
  admin_comment: { type: String, required: false },
  refund_date: { type: String, required: false },
  dt_createddate: { type: String, required: true },
  var_ipaddress: { type: String, required: false },
  cancel_status: { type: String, required: false, default:"N" },
});
const ReturnOrder = mongoose.model<ReturnOrderInterface>('ReturnOrder', returnOrderSchema, 'returnOrder');

export default ReturnOrder;

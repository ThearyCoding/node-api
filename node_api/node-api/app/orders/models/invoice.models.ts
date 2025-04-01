import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export interface InvoiceInterface extends mongoose.Document {
  _id: ObjectId;
  int_glcode: string;
  order_id: string;
  invoice_id: string;
  dt_createddate: string;
  dt_orderdate: string;
  customer: object;
  status: string;
  amount: string;
  payment_method: string;
}
const invoiceSchema = new mongoose.Schema({
  _id: { type: ObjectId, required: true },
  int_glcode: { type: String, required: true },
  order_id: { type: String, required: true },
  invoice_id: { type: String, required: true },
  dt_createddate: { type: String, required: true },
  dt_orderdate: { type: String, required: true },
  customer: { type: Object, required: true },
  status: { type: String, required: true },
  amount: { type: String, required: true },
  payment_method: { type: String, required: true },
});
const Invoice = mongoose.model<InvoiceInterface>('Invoce', invoiceSchema, 'invoices');

export default Invoice;

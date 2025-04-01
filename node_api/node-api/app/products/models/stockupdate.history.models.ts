import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export interface StockHistoryInterface extends mongoose.Document {
  _id: ObjectId;
  int_glcode: string;
  update_date: string;
  email:string;
  variant_id:string;
  product_id:string;
  quantity:string;
  user_id:string;
  name:string;
}
const stockHistorySchema = new mongoose.Schema({
  _id: { type: ObjectId, required: true },
  int_glcode: { type: String, required: false },
  update_date: { type: String, required: true },
  email:{ type: String, required: true },
  quantity:{ type: String, required: true },
  user_id:{ type: String, required: true },
  product_id:{ type: String, required: true },
  variant_id:{ type: String, required: true },
  name:{ type: String, required: true }
});
const StockHistory = mongoose.model<StockHistoryInterface>('StockHistories', stockHistorySchema, 'stock_histories');

export default StockHistory;
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';

export interface CompanyDetailsInterface extends mongoose.Document {
  _id: ObjectId;
  int_glcode: string;
  companyName: string;
	mobile:  string;
	email:  string;
	gst:  string;
	address:  string;
  created_date: string;
  updated_date: string;
  is_active: boolean;
}
const companyDetailsSchema = new mongoose.Schema({
  _id: { type: ObjectId, required: true },
  int_glcode: { type: String, required: true },
  companyName: { type: String, required: false },
  mobile: { type: String, required: false },
  email: { type: String, required: false },
  gst: { type: String, required: false },
  address: { type: String, required: false },
  created_date: { type: String, required: false },
  updated_date: { type: String, required: false },
});
const CompanyDetails = mongoose.model<CompanyDetailsInterface>('CompanyDetails', companyDetailsSchema, 'company_details');

export default CompanyDetails;

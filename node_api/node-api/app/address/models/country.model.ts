import mongoose from 'mongoose';
export interface CountryInterface extends mongoose.Document {
  int_glcode: string;
  code: string;
  name: string;
}
const countrySchema = new mongoose.Schema({
  int_glcode: { type: String, required: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
});
const Country = mongoose.model<CountryInterface>('Country', countrySchema, 'countries');

export default Country;

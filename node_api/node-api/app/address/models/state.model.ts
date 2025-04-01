import mongoose from 'mongoose';
export interface StateInterface extends mongoose.Document {
  id: string;
  state_name: string;
  state_code: string;
  country_code: string;
}
const stateSchema = new mongoose.Schema({
  id: { type: String, required: true },
  state_name: { type: String, required: true },
  state_code: { type: String, required: true },
  country_code: { type: String, required: true },
});
const State = mongoose.model<StateInterface>('State', stateSchema, 'states');

export default State;

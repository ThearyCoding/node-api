import { ObjectId } from "mongodb";
import mongoose from "mongoose";

export interface ContactUsModelInterface extends mongoose.Document {
    _id: ObjectId;
    int_glcode: string;
    var_email: string;
    var_name: string;
    var_mobile: string;
    var_subject: string;
    var_message: string;
    created_date: string;
}
const contactUsSchema = new mongoose.Schema({
    _id: { type: ObjectId, required: true },
    int_glcode: { type: String, required: true },
    var_email: { type: String, required: false },
    var_name: { type: String, required: false },
    var_mobile: { type: String, required: false },
    var_subject: { type: String, required: false },
    var_message: { type: String, required: false },
    created_date: { type: String, required: false }
});
const ContactUs = mongoose.model<ContactUsModelInterface>('ContactUs', contactUsSchema, 'contact_us');

export default ContactUs;
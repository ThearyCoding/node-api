const mongoose = require('mongoose');
export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL as string, {
      dbName: 'dev_esc',
    });
    console.log(`MongoDB Connected: {conn.connection.host}`);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

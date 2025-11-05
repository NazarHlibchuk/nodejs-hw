import mongoose from 'mongoose';

export async function connectMongoDB(uri) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('✅ MongoDB connection established successfully');
}

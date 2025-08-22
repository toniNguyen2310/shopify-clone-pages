// import mongoose from 'mongoose';

// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopify-app';

// export async function connectDB() {
//     if (mongoose.connection.readyState === 1) {
//         return mongoose.connection;
//     }

//     try {
//         await mongoose.connect(MONGODB_URI);
//         console.log('MongoDB connected successfully');
//         return mongoose.connection;
//     } catch (error) {
//         console.error('MongoDB connection error:', error);
//         throw error;
//     }
// }
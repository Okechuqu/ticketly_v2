import mongoose from "mongoose";

let isConnected;

const connectDb = async () => {
  if (isConnected) {
    // Reuse existing connection
    return;
  }

  try {
    const connect = await mongoose.connect(process.env.CONNECTION_STRING);
    isConnected = connect.connections[0].readyState;
    console.log(
      `MongoDB connected, HOST: ${connect.connection.host}, NAME: ${connect.connection.name}`
    );
  } catch (error) {
    console.log("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDb;

const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let dbInstance;

const connectDB = async () => {
  try {
    if (dbInstance) return dbInstance;

    await client.connect();
    
    await client.db("admin").command({ ping: 1 });
    
    dbInstance = client.db("VeridiumDB");
    
    console.log("Successfully connected to MongoDB Atlas!");
    return dbInstance;
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1);
  }
};

module.exports = { connectDB, client };
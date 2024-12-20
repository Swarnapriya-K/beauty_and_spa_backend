const { MongoClient, ObjectId } = require("mongodb");

const data = [
  {
    name: "Deep Tissue Massage",
    serviceProviders: ["Eliana Ivy", "Amelia Ava", "Stella Zoe", "Harper Luna"]
  },
  {
    name: "Detox Therapy Service",
    serviceProviders: ["Elena Naomi", "Harper Luna"]
  },
  {
    name: "Vacuum Suction Therapy",
    serviceProviders: ["Emma Lee", "Stella Zoe", "Harper Luna"]
  },
  {
    name: "Booking Payment Service",
    serviceProviders: ["Amelia Ava", "Olivia John"]
  },
  {
    name: "Face Therapy Service",
    serviceProviders: [
      "Elena Naomi",
      "Emma Lee",
      "Amelia Ava",
      "Olivia John",
      "Riley Zoey"
    ]
  },
  {
    name: "Radio Frequency Service",
    serviceProviders: ["Olivia John", "Riley Zoey"]
  },
  {
    name: "Perfect At-Home Facial",
    serviceProviders: ["Elena Naomi", "Riley Zoey"]
  },
  {
    name: "Wood/Metal Therapy",
    serviceProviders: ["Bella Skyler", "Emma Lee", "Olivia John"]
  },
  {
    name: "Thermal Therapy Service",
    serviceProviders: ["Bella Skyler", "Stella Zoe"]
  }
];

const serviceProviders = data
  .map((d) => {
    return [...d.serviceProviders.map((d2) => d2)];
  })
  .flat();

const uniqueServiceProviders = [...new Set(serviceProviders)];

console.log(uniqueServiceProviders);

const dbData = uniqueServiceProviders.map((item) => ({
  _id: new ObjectId(),
  name: item
}));

// MongoDB URI and Database/Collection Names
const uri = "mongodb://localhost:27017"; // Change this to your MongoDB connection string
const dbName = "beautyandspa";
const collectionName = "serviceProviders";

async function insertData() {
  const client = new MongoClient(uri, { useUnifiedTopology: true });

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Insert Data into the Collection
    const result = await collection.insertMany(dbData);
    console.log(
      `Inserted ${result.insertedCount} documents into the collection`
    );
  } catch (err) {
    console.error("Error inserting data:", err);
  } finally {
    await client.close();
  }
}

insertData();

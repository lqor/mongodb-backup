const { MongoClient } = require('mongodb');

const uri = "mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority";

async function explore() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas\n");

    // List all databases
    const dbs = await client.db().admin().listDatabases();
    console.log("=== DATABASES ===");
    dbs.databases.forEach(db => console.log(`  - ${db.name} (${(db.sizeOnDisk / 1024).toFixed(1)} KB)`));

    // For each non-system database, list collections
    for (const dbInfo of dbs.databases) {
      if (['admin', 'local'].includes(dbInfo.name)) continue;

      const db = client.db(dbInfo.name);
      const collections = await db.listCollections().toArray();

      if (collections.length > 0) {
        console.log(`\n=== DATABASE: ${dbInfo.name} ===`);
        console.log("Collections:");

        for (const col of collections) {
          const collection = db.collection(col.name);
          const count = await collection.countDocuments();
          console.log(`  - ${col.name} (${count} documents)`);

          // Get a sample document
          const sample = await collection.findOne();
          if (sample) {
            console.log(`    Sample document keys: ${Object.keys(sample).join(', ')}`);
          }
        }
      }
    }
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await client.close();
    console.log("\nConnection closed.");
  }
}

explore();

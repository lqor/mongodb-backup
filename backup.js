const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const uri = "mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority";

const BACKUP_DIR = path.join(__dirname, 'backups');
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

async function backupAll() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas\n");

    const databasesToBackup = ['learn-apex', 'learn-lwc', 'lwc-mastery-cohort', 'db-contacts'];

    for (const dbName of databasesToBackup) {
      console.log(`\n========== Backing up: ${dbName} ==========`);
      const db = client.db(dbName);
      const collections = await db.listCollections().toArray();

      const dbBackupDir = path.join(BACKUP_DIR, `${dbName}_${timestamp}`);
      fs.mkdirSync(dbBackupDir, { recursive: true });

      let totalDocs = 0;

      for (const colInfo of collections) {
        const colName = colInfo.name;
        const collection = db.collection(colName);
        const docs = await collection.find({}).toArray();

        const filePath = path.join(dbBackupDir, `${colName}.json`);
        fs.writeFileSync(filePath, JSON.stringify(docs, null, 2));

        totalDocs += docs.length;
        console.log(`  ✓ ${colName}: ${docs.length} documents → ${colName}.json`);
      }

      console.log(`  Total: ${totalDocs} documents backed up for ${dbName}`);
    }

    // Write a manifest
    const manifest = {
      timestamp: new Date().toISOString(),
      databases: databasesToBackup,
      backupDir: BACKUP_DIR,
    };
    fs.writeFileSync(
      path.join(BACKUP_DIR, `manifest_${timestamp}.json`),
      JSON.stringify(manifest, null, 2)
    );

    console.log(`\nBackup complete. Files saved to: ${BACKUP_DIR}`);

  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log("Connection closed.");
  }
}

backupAll();

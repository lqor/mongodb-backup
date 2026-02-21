const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn-apex');

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const dir = path.join(__dirname, `learn-apex_${timestamp}`);
  fs.mkdirSync(dir, { recursive: true });

  const collections = await db.listCollections().toArray();
  let totalDocs = 0;

  for (const col of collections) {
    const name = col.name;
    const docs = await db.collection(name).find({}).toArray();
    fs.writeFileSync(path.join(dir, `${name}.json`), JSON.stringify(docs, null, 2));
    console.log(`  ${name}: ${docs.length} documents`);
    totalDocs += docs.length;
  }

  console.log(`\nBackup complete: ${totalDocs} documents in ${dir}`);
  await client.close();
}

main().catch(console.error);

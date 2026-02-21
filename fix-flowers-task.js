const { MongoClient, ObjectId } = require('mongodb');
const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn-apex');

  const taskId = new ObjectId('667f8e9cb516968c76c2d1c1');

  // ========== PRE-FLIGHT ==========
  console.log('========== PRE-FLIGHT ==========\n');

  const task = await db.collection('tasks').findOne({ _id: taskId });
  if (!task) { console.log('Task not found!'); await client.close(); return; }
  console.log('Task found:', task.description.substring(0, 80));
  console.log('Req count:', task.requirements.length, '| Test count:', task.tests.length);
  console.log('Has System.debug in solution:', task.solution.includes('System.debug'));
  console.log('Has System.debug in preCode:', task.preCode.includes('System.debug'));
  console.log('Test uses System.assertEquals:', task.tests[0].includes('System.assertEquals'));

  // ========== FIX ==========
  console.log('\n========== APPLYING FIXES ==========\n');

  const newDescription = `Create an object of the 'Flowers' class and call the method 'displayFlower'. Save the result into a variable named flowInfo.

What do you think the output will be if you look at the code in the code snippets? Compare it with the real output.`;

  const newSolution = `Flowers flower = new Flowers();
String flowInfo = flower.displayFlower();`;

  const newPreCode = `public class Flowers {
    public String name = 'Daisy';
    public String color = 'Yellow';
    public Decimal price = 3.00;

    public void changeFlower(String name, String color, Decimal price) {
        this.name = name;
        this.color = color;
        this.price = price;
    }

    public String displayFlower() {
        changeFlower('Lily', 'White', 3.50);
        String flowerInfo = this.name + ':' + this.color + ':' + this.price;
        return flowerInfo;
    }
}
`;

  const newTest = `Flowers flowerInstance = new Flowers();
String flowerInfo = flowerInstance.displayFlower();
Assert.areEqual('Lily:White:3.50', flowerInfo, 'displayFlower should return Lily:White:3.50');`;

  const newDelta = [{ insert: newDescription + '\n' }];

  // Verify no System.debug
  if (newSolution.includes('System.debug')) {
    console.log('❌ Solution still has System.debug!'); await client.close(); return;
  }
  if (newPreCode.includes('System.debug')) {
    console.log('❌ PreCode still has System.debug!'); await client.close(); return;
  }

  const result = await db.collection('tasks').updateOne(
    { _id: taskId },
    {
      $set: {
        description: newDescription,
        delta: newDelta,
        solution: newSolution,
        preCode: newPreCode,
        requirements: ["The method 'displayFlower' should be called correctly and the result stored in flowInfo"],
        tests: [newTest]
      }
    }
  );
  console.log('Updated:', result.modifiedCount === 1 ? '✅' : '❌');

  // ========== VERIFICATION ==========
  console.log('\n========== VERIFICATION ==========\n');

  const updated = await db.collection('tasks').findOne({ _id: taskId });
  console.log('No System.debug in solution:', !updated.solution.includes('System.debug') ? '✅' : '❌');
  console.log('No System.debug in preCode:', !updated.preCode.includes('System.debug') ? '✅' : '❌');
  console.log('No System.assertEquals in test:', !updated.tests[0].includes('System.assertEquals') ? '✅' : '❌');
  console.log('Uses Assert.areEqual:', updated.tests[0].includes('Assert.areEqual') ? '✅' : '❌');
  console.log('Delta synced:', updated.delta[0].insert === updated.description + '\n' ? '✅' : '❌');
  console.log('Req count = Test count:', updated.requirements.length === updated.tests.length ? '✅' : '❌',
    `(${updated.requirements.length}/${updated.tests.length})`);

  console.log('\nDone!');
  await client.close();
}

main().catch(console.error);

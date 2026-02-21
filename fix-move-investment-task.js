const { MongoClient, ObjectId } = require('mongodb');
const uri = 'mongodb+srv://wxoox2000:Antihype777@cluster0.o11apbh.mongodb.net/?retryWrites=true&w=majority';

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db('learn-apex');

  const taskId = new ObjectId('66346f7bfd8b0c9b1570786d');
  const taskIdStr = '66346f7bfd8b0c9b1570786d';
  const ifElseTopicLink = 'multiple-if-else';
  const forLoopTopicLink = 'standard-for-loop';

  // ========== PRE-FLIGHT ==========
  console.log('========== PRE-FLIGHT ==========\n');

  const task = await db.collection('tasks').findOne({ _id: taskId });
  if (!task) { console.log('Task not found!'); await client.close(); return; }
  console.log('Task found:', task.description.substring(0, 80) + '...');

  const ifElseTopic = await db.collection('topics').findOne({ link: ifElseTopicLink });
  const forLoopTopic = await db.collection('topics').findOne({ link: forLoopTopicLink });

  // Check what type the task ID is stored as in the topics array
  const taskInArray = ifElseTopic.tasks.find(t => t.toString() === taskIdStr);
  console.log('Task ID type in topics array:', typeof taskInArray, taskInArray);

  const inIfElse = ifElseTopic.tasks.some(t => t.toString() === taskIdStr);
  const inForLoop = forLoopTopic.tasks.some(t => t.toString() === taskIdStr);
  console.log('Currently in if-else topic:', inIfElse);
  console.log('Currently in for-loop topic:', inForLoop);
  console.log('For-loop topic tasks count:', forLoopTopic.tasks.length);

  // Check solution for System.debug
  const hasDebug = task.solution.includes('System.debug');
  console.log('Solution has System.debug:', hasDebug, hasDebug ? '⚠️ will be removed' : '');

  // Check req/test count
  console.log('Requirements:', task.requirements.length, '| Tests:', task.tests.length);

  if (!inIfElse) {
    console.log('❌ Task not found in if-else topic! Aborting.');
    await client.close();
    return;
  }

  // ========== STEP 1: REMOVE FROM IF-ELSE TOPIC ==========
  console.log('\n========== STEP 1: REMOVE FROM IF-ELSE TOPIC ==========\n');

  // Pull using the same type as stored in the array
  const removeResult = await db.collection('topics').updateOne(
    { link: ifElseTopicLink },
    { $pull: { tasks: taskInArray } }
  );
  console.log('Removed from if-else:', removeResult.modifiedCount === 1 ? '✅' : '❌');

  // ========== STEP 2: ADD TO FOR-LOOP TOPIC (as string) ==========
  console.log('\n========== STEP 2: ADD TO FOR-LOOP TOPIC ==========\n');

  // For-loop topic stores tasks as ObjectIds (not strings), so push as ObjectId
  const addResult = await db.collection('topics').updateOne(
    { link: forLoopTopicLink },
    { $push: { tasks: taskId } }
  );
  console.log('Added to for-loop:', addResult.modifiedCount === 1 ? '✅' : '❌');

  // ========== STEP 3: UPDATE TASK ==========
  console.log('\n========== STEP 3: UPDATE TASK ==========\n');

  const newDescription = `InvestPro is developing an investment calculation tool. Create a class called InvestmentCalculator with a method called calculateInvestmentValue that calculates the future value of an investment using compound interest.

The method should accept three parameters: initialAmount (Decimal), annualInterestRate (Decimal), and years (Integer).

Use a for loop to iterate through each year. In each iteration, increase the current amount by the annual interest using the += operator (currentAmount += currentAmount * annualInterestRate / 100).

Return the final investment value after all years are calculated.`;

  const newSolution = `public class InvestmentCalculator {
    public Decimal calculateInvestmentValue(Decimal initialAmount, Decimal annualInterestRate, Integer years) {
        Decimal currentAmount = initialAmount;
        for (Integer i = 1; i <= years; i++) {
            currentAmount += currentAmount * (annualInterestRate / 100);
        }
        return currentAmount;
    }
}`;

  const newRequirements = [
    'With initial amount of 1000, annual interest rate of 5% and 3 years the method must return 1157.625',
    'With an initial amount of 5000, the annual interest rate of 3.5%, and 5 years the method must return 5938.43',
    'With an initial amount of 2500, the annual interest rate of 7.25%, and 10 years the method must return 5034.00'
  ];

  const newDelta = [{ insert: newDescription + '\n' }];

  // Verify no System.debug in new solution
  if (newSolution.includes('System.debug')) {
    console.log('❌ New solution still has System.debug! Aborting.');
    await client.close();
    return;
  }

  const updateResult = await db.collection('tasks').updateOne(
    { _id: taskId },
    {
      $set: {
        description: newDescription,
        delta: newDelta,
        solution: newSolution,
        requirements: newRequirements,
        ref: forLoopTopic._id.toString()
      },
      $unset: { order: '' }
    }
  );
  console.log('Task updated:', updateResult.modifiedCount === 1 ? '✅' : '❌');

  // ========== VERIFICATION ==========
  console.log('\n========== VERIFICATION ==========\n');

  const updatedIfElse = await db.collection('topics').findOne({ link: ifElseTopicLink });
  const updatedForLoop = await db.collection('topics').findOne({ link: forLoopTopicLink });
  const updatedTask = await db.collection('tasks').findOne({ _id: taskId });

  const stillInIfElse = updatedIfElse.tasks.some(t => t.toString() === taskIdStr);
  const nowInForLoop = updatedForLoop.tasks.some(t => t.toString() === taskIdStr);

  console.log('Removed from if-else:', !stillInIfElse ? '✅' : '❌');
  console.log('Added to for-loop:', nowInForLoop ? '✅' : '❌');
  console.log('If-else tasks count:', updatedIfElse.tasks.length, '(was', ifElseTopic.tasks.length + ')');
  console.log('For-loop tasks count:', updatedForLoop.tasks.length, '(was', forLoopTopic.tasks.length + ')');
  console.log('Description updated:', updatedTask.description !== task.description ? '✅' : '❌');
  console.log('Delta synced:', updatedTask.delta[0].insert === updatedTask.description + '\n' ? '✅' : '❌');
  console.log('No System.debug:', !updatedTask.solution.includes('System.debug') ? '✅' : '❌');
  console.log('No comments:', !updatedTask.solution.includes('//') ? '✅' : '❌');
  console.log('Req 2 fixed:', updatedTask.requirements[1].includes('5938.43') ? '✅' : '❌');
  console.log('Req 3 fixed:', updatedTask.requirements[2].includes('5034.00') ? '✅' : '❌');
  console.log('Req count = Test count:', updatedTask.requirements.length === updatedTask.tests.length ? '✅' : '❌',
    `(${updatedTask.requirements.length}/${updatedTask.tests.length})`);
  console.log('Ref updated:', updatedTask.ref);
  console.log('Order removed:', updatedTask.order === undefined ? '✅' : '❌');

  console.log('\nDone!');
  await client.close();
}

main().catch(console.error);

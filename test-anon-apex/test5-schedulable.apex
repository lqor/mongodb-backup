// TEST 5: Can we define a Schedulable class in anonymous Apex?
// This tests if the Batch + Scheduled tasks could work as website tasks

public class TestBatch implements Database.Batchable<sObject> {
    public Database.QueryLocator start(Database.BatchableContext context) {
        return Database.getQueryLocator([SELECT Id FROM Account LIMIT 1]);
    }
    public void execute(Database.BatchableContext context, List<Account> scope) {
    }
    public void finish(Database.BatchableContext context) {
    }
}

public class TestScheduler implements Schedulable {
    public void execute(SchedulableContext context) {
        TestBatch batch = new TestBatch();
        Database.executeBatch(batch, 200);
    }
}

TestScheduler scheduler = new TestScheduler();
System.debug('Schedulable class defined successfully!');

// TEST 1: Can we DEFINE a class in anonymous Apex?
// This is what the "write a batch class" tasks would need

public class SimpleBatch implements Database.Batchable<sObject> {
    public Database.QueryLocator start(Database.BatchableContext context) {
        return Database.getQueryLocator([SELECT Id, Description FROM Account LIMIT 1]);
    }

    public void execute(Database.BatchableContext context, List<Account> scope) {
        for (Account account : scope) {
            account.Description = 'Tested';
        }
        update scope;
    }

    public void finish(Database.BatchableContext context) {
    }
}

SimpleBatch batch = new SimpleBatch();
Database.executeBatch(batch);
System.debug('Class defined and batch executed!');

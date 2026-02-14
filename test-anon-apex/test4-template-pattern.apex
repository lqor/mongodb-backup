// TEST 4: The exact template pattern from the old Batchable Interface tasks
// These had preCode defining the class and a template with blanks
// Can the user fill in the execute method body in anonymous Apex
// if the class is defined via preCode?

// === This part would be the preCode (injected by platform) ===
public class AccountBatch implements Database.Batchable<sObject> {
    public Database.QueryLocator start(Database.BatchableContext context) {
        return Database.getQueryLocator([SELECT Id, Description FROM Account LIMIT 1]);
    }

    public void execute(Database.BatchableContext context, List<Account> scope) {
        // USER WRITES THIS PART:
        for (Account account : scope) {
            account.Description = 'Processed by batch';
        }
        update scope;
    }

    public void finish(Database.BatchableContext context) {
    }
}
// === End of combined preCode + user code ===

AccountBatch batch = new AccountBatch();
Database.executeBatch(batch);

// TEST 2: Can we EXECUTE an already-existing batch class from anonymous Apex?
// This is what the deleted d314, d315, d316 tasks were doing (fill-in-the-blank)
// Assumes SimpleAccountBatch already exists in the org

SimpleAccountBatch batch = new SimpleAccountBatch();
Database.executeBatch(batch);

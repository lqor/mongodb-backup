// TEST 3: Execute with custom batch size (like d315 was testing)
// Assumes LeadCleanupBatch already exists in the org

LeadCleanupBatch batch = new LeadCleanupBatch();
Database.executeBatch(batch, 100);

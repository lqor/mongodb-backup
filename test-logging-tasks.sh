#!/bin/bash
# Test all simple-logging and nebula-logger tasks against trailhead org
# This script tests each task's solution + tests as the platform would execute them

RESULTS_FILE="/Users/igorkudryk/Salesforce/JSProjects/mongodb-rework/test-results.txt"
> "$RESULTS_FILE"

run_test() {
    local task_name="$1"
    local test_num="$2"
    local code="$3"

    echo "Testing: $task_name test[$test_num]..."
    result=$(echo "$code" | sf apex run --target-org trailhead 2>&1)

    if echo "$result" | grep -q "Compiled successfully" && echo "$result" | grep -q "Executed successfully"; then
        echo "  PASS"
        echo "PASS | $task_name | test[$test_num]" >> "$RESULTS_FILE"
    else
        error=$(echo "$result" | grep -E "(Error|FATAL)" | head -3)
        echo "  FAIL: $error"
        echo "FAIL | $task_name | test[$test_num] | $error" >> "$RESULTS_FILE"
    fi
}

echo "=========================================="
echo "SIMPLE-LOGGING TASK 1 (Setup - Log_Entry__c)"
echo "=========================================="

# Task 1 tests are self-contained (orgCode:true, tests run standalone)
run_test "SL-1" "0" "Log_Entry__c log1 = new Log_Entry__c(Error_Message__c = 'Test');
insert log1;
Assert.isNotNull(log1.Id, 'Error_Message__c field should exist');
delete log1;"

run_test "SL-1" "1" "Log_Entry__c log2 = new Log_Entry__c(Comment__c = 'Test');
insert log2;
Assert.isNotNull(log2.Id, 'Comment__c field should exist');
delete log2;"

run_test "SL-1" "2" "Log_Entry__c log3 = new Log_Entry__c(Error_Class__c = 'Test');
insert log3;
Assert.isNotNull(log3.Id, 'Error_Class__c field should exist');
delete log3;"

run_test "SL-1" "3" "Log_Entry__c log4 = new Log_Entry__c(Context_Type__c = 'Test');
insert log4;
Assert.isNotNull(log4.Id, 'Context_Type__c field should exist');
delete log4;"

run_test "SL-1" "4" "Log_Entry__c log5 = new Log_Entry__c(Stack_Trace__c = 'Test');
insert log5;
Assert.isNotNull(log5.Id, 'Stack_Trace__c field should exist');
delete log5;"

run_test "SL-1" "5" "Log_Entry__c log6 = new Log_Entry__c(Keep_Long_Term__c = true);
insert log6;
Assert.isNotNull(log6.Id, 'Keep_Long_Term__c field should exist');
delete log6;"

echo ""
echo "=========================================="
echo "SIMPLE-LOGGING TASK 2 (ErrorLogger class)"
echo "=========================================="
# orgCode:true - the class already deployed. Tests use preCode to call and assert.
# Platform sends: test[i] only for orgCode:true

# First test: preCode calls ErrorLogger.logError(...) then tests assert on insertedLog
# BUT the tests reference 'insertedLog' which is defined in preCode!
# For orgCode:true, platform should only send test[i], not preCode+test[i]
# This means: tests[0-4] reference insertedLog -> WILL FAIL without preCode

# Let's test BOTH ways: with and without preCode

echo "--- Without preCode (as platform would run for orgCode:true) ---"
run_test "SL-2-noPreCode" "0" "Assert.areEqual('Test Error', insertedLog.Error_Message__c, 'Error_Message__c should be Test Error');
delete insertedLog;"

echo "--- With preCode (as platform would run for orgCode:false) ---"
run_test "SL-2-withPreCode" "0" "ErrorLogger.logError('Test Error', 'Test Comment', 'Trigger', 'AccountService', 'Line 10');
Log_Entry__c insertedLog = [SELECT Id, Error_Message__c, Comment__c, Context_Type__c, Error_Class__c, Stack_Trace__c FROM Log_Entry__c WHERE Error_Message__c = 'Test Error' LIMIT 1];
Assert.areEqual('Test Error', insertedLog.Error_Message__c, 'Error_Message__c should be Test Error');
delete insertedLog;"

run_test "SL-2-withPreCode" "1" "ErrorLogger.logError('Test Error', 'Test Comment', 'Trigger', 'AccountService', 'Line 10');
Log_Entry__c insertedLog = [SELECT Id, Error_Message__c, Comment__c, Context_Type__c, Error_Class__c, Stack_Trace__c FROM Log_Entry__c WHERE Error_Message__c = 'Test Error' LIMIT 1];
Assert.areEqual('Test Comment', insertedLog.Comment__c, 'Comment__c should be Test Comment');
delete insertedLog;"

run_test "SL-2-withPreCode" "2" "ErrorLogger.logError('Test Error', 'Test Comment', 'Trigger', 'AccountService', 'Line 10');
Log_Entry__c insertedLog = [SELECT Id, Error_Message__c, Comment__c, Context_Type__c, Error_Class__c, Stack_Trace__c FROM Log_Entry__c WHERE Error_Message__c = 'Test Error' LIMIT 1];
Assert.areEqual('Trigger', insertedLog.Context_Type__c, 'Context_Type__c should be Trigger');
delete insertedLog;"

run_test "SL-2-withPreCode" "3" "ErrorLogger.logError('Test Error', 'Test Comment', 'Trigger', 'AccountService', 'Line 10');
Log_Entry__c insertedLog = [SELECT Id, Error_Message__c, Comment__c, Context_Type__c, Error_Class__c, Stack_Trace__c FROM Log_Entry__c WHERE Error_Message__c = 'Test Error' LIMIT 1];
Assert.areEqual('AccountService', insertedLog.Error_Class__c, 'Error_Class__c should be AccountService');
delete insertedLog;"

run_test "SL-2-withPreCode" "4" "ErrorLogger.logError('Test Error', 'Test Comment', 'Trigger', 'AccountService', 'Line 10');
Log_Entry__c insertedLog = [SELECT Id, Error_Message__c, Comment__c, Context_Type__c, Error_Class__c, Stack_Trace__c FROM Log_Entry__c WHERE Error_Message__c = 'Test Error' LIMIT 1];
Assert.areEqual('Line 10', insertedLog.Stack_Trace__c, 'Stack_Trace__c should be Line 10');
delete insertedLog;"

echo ""
echo "=========================================="
echo "SIMPLE-LOGGING TASK 3 (ErrorLogger + Exception overload)"
echo "=========================================="

echo "--- Without preCode (orgCode:true) ---"
run_test "SL-3-noPreCode" "0" "Assert.isTrue(insertedLog.Error_Message__c.contains('Divide by 0'), 'Error_Message__c should contain Divide by 0');
delete insertedLog;"

echo "--- With preCode ---"
run_test "SL-3-withPreCode" "0" "try {
    Integer result = 1 / 0;
} catch (Exception e) {
    ErrorLogger.logError(e);
}
Log_Entry__c insertedLog = [SELECT Id, Error_Message__c, Comment__c, Context_Type__c, Stack_Trace__c FROM Log_Entry__c WHERE Error_Message__c LIKE '%Divide by 0%' LIMIT 1];
Assert.isTrue(insertedLog.Error_Message__c.contains('Divide by 0'), 'Error_Message__c should contain Divide by 0');
delete insertedLog;"

run_test "SL-3-withPreCode" "1" "try {
    Integer result = 1 / 0;
} catch (Exception e) {
    ErrorLogger.logError(e);
}
Log_Entry__c insertedLog = [SELECT Id, Error_Message__c, Comment__c, Context_Type__c, Stack_Trace__c FROM Log_Entry__c WHERE Error_Message__c LIKE '%Divide by 0%' LIMIT 1];
Assert.isTrue(insertedLog.Comment__c.length() > 0, 'Comment__c should contain the line number');
delete insertedLog;"

run_test "SL-3-withPreCode" "2" "try {
    Integer result = 1 / 0;
} catch (Exception e) {
    ErrorLogger.logError(e);
}
Log_Entry__c insertedLog = [SELECT Id, Error_Message__c, Comment__c, Context_Type__c, Stack_Trace__c FROM Log_Entry__c WHERE Error_Message__c LIKE '%Divide by 0%' LIMIT 1];
Assert.areEqual('', insertedLog.Context_Type__c, 'Context_Type__c should be empty');
delete insertedLog;"

run_test "SL-3-withPreCode" "3" "try {
    Integer result = 1 / 0;
} catch (Exception e) {
    ErrorLogger.logError(e);
}
Log_Entry__c insertedLog = [SELECT Id, Error_Message__c, Comment__c, Context_Type__c, Stack_Trace__c FROM Log_Entry__c WHERE Error_Message__c LIKE '%Divide by 0%' LIMIT 1];
Assert.isTrue(insertedLog.Stack_Trace__c.length() > 0, 'Stack_Trace__c should not be empty');
delete insertedLog;"

echo ""
echo "=========================================="
echo "SIMPLE-LOGGING TASK 4 (ErrorLogger 3-param overload)"
echo "=========================================="

echo "--- With preCode ---"
run_test "SL-4-withPreCode" "0" "try {
    Integer result = 1 / 0;
} catch (Exception e) {
    ErrorLogger.logError(e, 'Integration', 'PaymentService');
}
Log_Entry__c insertedLog = [SELECT Id, Error_Message__c, Context_Type__c, Error_Class__c FROM Log_Entry__c WHERE Error_Class__c = 'PaymentService' LIMIT 1];
Assert.isTrue(insertedLog.Error_Message__c.contains('Divide by 0'), 'Error_Message__c should contain Divide by 0');
delete insertedLog;"

run_test "SL-4-withPreCode" "1" "try {
    Integer result = 1 / 0;
} catch (Exception e) {
    ErrorLogger.logError(e, 'Integration', 'PaymentService');
}
Log_Entry__c insertedLog = [SELECT Id, Error_Message__c, Context_Type__c, Error_Class__c FROM Log_Entry__c WHERE Error_Class__c = 'PaymentService' LIMIT 1];
Assert.areEqual('Integration', insertedLog.Context_Type__c, 'Context_Type__c should be Integration');
delete insertedLog;"

run_test "SL-4-withPreCode" "2" "try {
    Integer result = 1 / 0;
} catch (Exception e) {
    ErrorLogger.logError(e, 'Integration', 'PaymentService');
}
Log_Entry__c insertedLog = [SELECT Id, Error_Message__c, Context_Type__c, Error_Class__c FROM Log_Entry__c WHERE Error_Class__c = 'PaymentService' LIMIT 1];
Assert.areEqual('PaymentService', insertedLog.Error_Class__c, 'Error_Class__c should be PaymentService');
delete insertedLog;"

echo ""
echo "=========================================="
echo "SIMPLE-LOGGING TASK 5 (try-catch with ErrorLogger)"
echo "=========================================="

# Task 5 is orgCode:true, solution is anonymous Apex code (not a class!)
# The solution creates variables and calls ErrorLogger
# preCode is just whitespace
# Tests query Log_Entry__c records

# For orgCode:true, platform runs test[i] only
# But the solution needs to run first to create the log records that tests check
# For this task, the solution IS what creates the data, and tests check it

# Wait - the tests reference 'logRecord' which they declare themselves, so they're self-contained
# But the test assumes ErrorLogger.logError was already called (by the solution code)
# If orgCode:true only runs test[i], the solution code never ran, so no Log_Entry__c records exist

# Actually, for this task, since the solution is anonymous Apex (not a class),
# the user would need to write code in... the website? Or their org?
# orgCode:true means "write in org" but anonymous Apex isn't org code...
# This might be a conceptual bug - orgCode should be false for this task

# Let's test it with the full flow: solution + test[i]
echo "--- With solution (as platform would run for orgCode:false) ---"
run_test "SL-5-withSolution" "0" "List<Account> accounts = [SELECT Id, Name FROM Account WHERE Name = 'NonExistentAccount12345'];
try {
    String name = accounts[0].Name;
} catch (Exception e) {
    ErrorLogger.logError(e, 'Trigger', 'AccountProcessor');
}
Log_Entry__c logRecord = [SELECT Id, Context_Type__c FROM Log_Entry__c WHERE Error_Class__c = 'AccountProcessor' LIMIT 1];
Assert.areEqual('Trigger', logRecord.Context_Type__c, 'Context_Type__c should be Trigger');
delete logRecord;"

run_test "SL-5-withSolution" "1" "List<Account> accounts = [SELECT Id, Name FROM Account WHERE Name = 'NonExistentAccount12345'];
try {
    String name = accounts[0].Name;
} catch (Exception e) {
    ErrorLogger.logError(e, 'Trigger', 'AccountProcessor');
}
Log_Entry__c logRecord = [SELECT Id, Error_Class__c FROM Log_Entry__c WHERE Error_Class__c = 'AccountProcessor' LIMIT 1];
Assert.areEqual('AccountProcessor', logRecord.Error_Class__c, 'Error_Class__c should be AccountProcessor');
delete logRecord;"

run_test "SL-5-withSolution" "2" "List<Account> accounts = [SELECT Id, Name FROM Account WHERE Name = 'NonExistentAccount12345'];
try {
    String name = accounts[0].Name;
} catch (Exception e) {
    ErrorLogger.logError(e, 'Trigger', 'AccountProcessor');
}
Log_Entry__c logRecord = [SELECT Id, Error_Message__c FROM Log_Entry__c WHERE Error_Class__c = 'AccountProcessor' LIMIT 1];
Assert.isTrue(logRecord.Error_Message__c.contains('List index out of bounds'), 'Error_Message__c should contain List index out of bounds');
delete logRecord;"

echo ""
echo "Done. Results saved to $RESULTS_FILE"
cat "$RESULTS_FILE"

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Goal = require('./models/Goal');
const User = require('./models/User');

dotenv.config();

/**
 * FLOW VALIDATION TEST
 * 1. Admin creates Company Goal
 * 2. Manager creates Team Goal (linked to Company Goal)
 * 3. Employee creates Individual Goal (Subtasks + Draft status)
 * 4. Manager reviews & approves (Sets Weightage + Deadlines)
 */

async function runTest() {
  console.log('--- STARTING GOAL FLOW VALIDATION ---');
  
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    // Mock Users
    const manager = await User.findOne({ role: 'Manager' });
    const employee = await User.findOne({ role: 'Employee' });
    const admin = await User.findOne({ role: 'Admin' }) || manager; // Fallback to manager if no admin

    if (!manager || !employee) {
       console.error('Error: Need at least one Manager and one Employee in DB to run this test.');
       process.exit(1);
    }

    // CLEANUP: Remove old test goals
    await Goal.deleteMany({ title: { $regex: 'TESTFLOW:' } });

    // STEP 3: Admin Sets Company Goals
    console.log('\n[STEP 3] Admin: Setting Company Goals...');
    const companyGoal = await Goal.create({
      title: 'TESTFLOW: 2026 Expansion Initiative',
      description: 'Expand to 3 new regions by Q4.',
      ownerId: admin._id,
      type: 'Company',
      status: 'Active'
    });
    console.log('CREATED:', companyGoal.title, `(${companyGoal._id})`);

    // STEP 2: Manager Cascades to Team
    console.log('\n[STEP 3 CASCADE] Manager: Cascading to Team Goal...');
    const teamGoal = await Goal.create({
      title: 'TESTFLOW: APAC Region Launch',
      description: 'Sales team focus on APAC hiring and outreach.',
      ownerId: manager._id,
      type: 'Team',
      status: 'Active',
      parentGoalId: companyGoal._id
    });
    console.log('CREATED:', teamGoal.title, `(Parent: ${teamGoal.parentGoalId})`);

    // STEP 1: Employee Creates Goals Draft (with Subtasks)
    console.log('\n[STEP 1] Employee: Creating Individual Goal Draft...');
    const individualGoal = await Goal.create({
      title: 'TESTFLOW: Localize Checkout for APAC',
      description: 'Implement currency conversion and local gateways.',
      ownerId: employee._id,
      type: 'Individual',
      status: 'Pending Approval',
      parentGoalId: teamGoal._id,
      subtasks: [
        { title: 'Research local Gateways', isCompleted: false },
        { title: 'Currency Conversion logic', isCompleted: false }
      ]
    });
    console.log('CREATED:', individualGoal.title, `(Status: ${individualGoal.status})`);
    console.log('SUBTASKS COUNT:', individualGoal.subtasks.length);

    // STEP 2: Manager Reviews & Approves (Set Weightage + Deadline)
    console.log('\n[STEP 2] Manager: Reviewing & Approving individual goal...');
    const approvedGoal = await Goal.findByIdAndUpdate(individualGoal._id, {
      status: 'Active',
      weightage: 25,
      deadline: new Date('2026-10-31'),
      cycle: 'Q3 2026'
    }, { new: true });
    
    console.log('UPDATED:', approvedGoal.title);
    console.log('FINAL STATUS:', approvedGoal.status);
    console.log('WEIGHTAGE:', approvedGoal.weightage + '%');
    console.log('DEADLINE:', approvedGoal.deadline.toDateString());

    // FINAL VERIFICATION
    console.log('\n--- VERIFICATION SUMMARY ---');
    const fullChain = await Goal.findById(approvedGoal._id).populate({
      path: 'parentGoalId',
      populate: { path: 'parentGoalId' }
    });

    if (fullChain && 
        fullChain.parentGoalId.title.includes('APAC Region Launch') && 
        fullChain.parentGoalId.parentGoalId.title.includes('Expansion Initiative')) {
      console.log('✅ CASCADE CHAIN VERIFIED: Individual -> Team -> Company');
    } else {
      console.log('❌ CASCADE CHAIN BROKEN');
    }

    if (fullChain.subtasks.length === 2 && fullChain.weightage === 25) {
      console.log('✅ METADATA VERIFIED: Subtasks and Weightage correctly stored.');
    } else {
      console.log('❌ METADATA MISSING');
    }

    console.log('\n--- TEST COMPLETED SUCCESSFULLY ---');
    process.exit(0);

  } catch (err) {
    console.error('TEST FAILED:', err);
    process.exit(1);
  }
}

runTest();

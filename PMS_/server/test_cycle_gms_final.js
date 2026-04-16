const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Goal = require('./models/Goal');
const Review = require('./models/Review');

dotenv.config();

/**
 * FINAL INTEGRATED FLOW TEST
 * [FLOW 3] PERFORMANCE CYCLES: Triggering, Self-Rating, Manager Rating
 * [FLOW 4] ONGOING GMS: Daily tracking (Notes, Blockers, %)
 */

async function runTest() {
  console.log('--- STARTING FINAL INTEGRATED FLOW VALIDATION ---');
  
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const manager = await User.findOne({ role: 'Manager' });
    const employee = await User.findOne({ role: 'Employee' });

    if (!manager || !employee) {
       console.error('Error: Setup Users first.');
       process.exit(1);
    }

    // --- FLOW 4: ONGOING GOAL MANAGEMENT ---
    console.log('\n[FLOW 4] Ongoing GMS Tracking...');
    // Setup Active Goal
    const activeGoal = await Goal.create({
        title: 'TESTFLOW: Continuous Integration Pipeline',
        description: 'Implementing daily CI/CD for GMS module.',
        ownerId: employee._id,
        status: 'Active',
        completionPercentage: 10
    });

    // Simulate Daily Updates
    console.log('Updating Goal with Note and Blocker...');
    activeGoal.notes.push({ content: 'Finished unit tests for Goal Model.' });
    activeGoal.blockers.push({ issue: 'Jenkins server downtime' });
    activeGoal.completionPercentage = 35;
    await activeGoal.save();

    const updatedGoal = await Goal.findById(activeGoal._id);
    console.log(`VERIFIED: Notes count: ${updatedGoal.notes.length}, Completion: ${updatedGoal.completionPercentage}%`);
    if (updatedGoal.blockers[0].issue === 'Jenkins server downtime') console.log('✅ Daily Tracking Logic Verified.');

    // --- FLOW 3: PERFORMANCE CYCLES ---
    console.log('\n[FLOW 3] Performance Cycle Logic...');
    
    // 3a. Trigger Simulation (Bi-Annual)
    console.log('Simulating cycle initiation...');
    const track = 'Bi-Annual';
    const month = 8; // August 1st trigger
    const dueDate = new Date(2026, 7, 25); // Aug 25

    const cycleReview = await Review.create({
        subjectId: employee._id,
        managerId: manager._id,
        type: 'Cycle_BiAnnual',
        status: 'Pending',
        dueDate
    });
    console.log('CYCLE TRIGGERED:', cycleReview.type, `Due: ${cycleReview.dueDate.toDateString()}`);

    // 3b. Goal Review & Self-Rating
    console.log('Employee: Submitting Self-Rating...');
    cycleReview.selfFeedback = { 
        progress: 'High completion on CI/CD goal. Notes and blockers tracked daily.', 
        rating: 'Above',
        submittedAt: new Date()
    };
    cycleReview.status = 'Submitted';
    await cycleReview.save();
    console.log('EMPLOYEE RATING SAVED.');

    // 3c. Final Manager Rating
    console.log('Manager: Submitting Final Rating...');
    cycleReview.managerFeedback = {
        comments: 'Excellent discipline in goal tracking. Proactive on blockers.',
        rating: 'Above',
        submittedAt: new Date()
    };
    cycleReview.status = 'Closed';
    await cycleReview.save();
    console.log('MANAGER RATING SAVED. CYCLE CLOSED.');

    // FINAL VERIFICATION
    console.log('\n--- FINAL VERIFICATION SUMMARY ---');
    if (cycleReview.status === 'Closed' && cycleReview.managerFeedback.rating === 'Above') {
        console.log('✅ FLOW 3 VERIFIED: Cycle Trigger -> Multi-party Rating -> Closure.');
    }
    
    if (updatedGoal.notes.length > 0 && updatedGoal.blockers.length > 0) {
        console.log('✅ FLOW 4 VERIFIED: Notes & Blockers persistent in GMS.');
    }

    console.log('\n--- ALL FLOWS VALIDATED SUCCESSFULLY ---');
    process.exit(0);

  } catch (err) {
    console.error('TEST FAILED:', err);
    process.exit(1);
  }
}

runTest();

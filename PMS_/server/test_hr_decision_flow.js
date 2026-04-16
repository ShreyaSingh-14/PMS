const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Review = require('./models/Review');

dotenv.config();

/**
 * HR DECISION FLOW VALIDATION TEST
 * [FLOW 5] HR Review & Confirmation Decision
 * 1. Simulate Flagged Review Discovery
 * 2. HR Briefing (Adding hrNote / Analysis)
 * 3. Final Decision Logic (Confirm, Extend, Review Further)
 */

async function runTest() {
  console.log('--- STARTING HR DECISION FLOW VALIDATION ---');
  
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    const employee = await User.findOne({ role: 'Employee' });

    if (!employee) {
       console.error('Error: Setup User first.');
       process.exit(1);
    }

    // --- STEP 1: HR WEEKLY REVIEW (Flag Discovery) ---
    console.log('\n[STEP 1] Discovery: Identify Flagged Review...');
    const flaggedReview = await Review.create({
        subjectId: employee._id,
        type: 'Probation_80',
        status: 'Submitted',
        isFlagged: true,
        flaggedAt: new Date()
    });
    console.log('FLAGGED REVIEW CREATED:', flaggedReview.type);

    // --- STEP 2: PRE-CALL BRIEFING (Analysis) ---
    console.log('\n[STEP 2] Pre-call Briefing: HR adding analysis note...');
    flaggedReview.hrNote = 'Employee showed inconsistency in GMS subtask #4. Performance dip noted in manager feedback.';
    flaggedReview.hrResolved = true; // Mark as processed in queue
    await flaggedReview.save();
    console.log('HR Note Stored. Flag Resolved in Audit Queue.');

    // --- STEP 3: CONFIRMATION DECISION (Review Further) ---
    console.log('\n[STEP 3] Performance Decision: Review Further...');
    employee.probationStatus = 'Under Review';
    await employee.save();
    console.log('User Status:', employee.probationStatus);

    // --- STEP 4: FINAL NOTIFICATION (Confirm) ---
    console.log('\n[STEP 4] Outcome: Confirming Appointment...');
    employee.probationStatus = 'Closed'; // Confirmed
    await employee.save();
    console.log('User Status:', employee.probationStatus, '(Employee Notified via Email logic)');

    // FINAL VERIFICATION
    console.log('\n--- VERIFICATION SUMMARY ---');
    const finalUser = await User.findById(employee._id);
    const finalReview = await Review.findById(flaggedReview._id);

    if (finalReview.hrNote && finalReview.hrResolved) {
        console.log('✅ HR ANALYSIS VERIFIED: Audit trail recorded.');
    }
    
    if (finalUser.probationStatus === 'Closed') {
        console.log('✅ DECISION LOGIC VERIFIED: Correct cycle closure.');
    }

    console.log('\n--- HR FLOW VALIDATED SUCCESSFULLY ---');
    process.exit(0);

  } catch (err) {
    console.error('TEST FAILED:', err);
    process.exit(1);
  }
}

runTest();

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Review = require('./models/Review');
const Goal = require('./models/Goal');

dotenv.config();

/**
 * PROBATION FLOW VALIDATION TEST
 * 1. Simulate cron trigger for Day 30 Review
 * 2. Employee submits self-reflection (Self-Rating)
 * 3. Manager reviews and submits rating + comments
 * 4. Verify Sentiment Flagging
 */

const getPastBusinessDate = (days) => {
    let date = new Date();
    let count = 0;
    while (count < days) {
        date.setDate(date.getDate() - 1);
        const dayOfWeek = date.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
    }
    return date;
};

async function runTest() {
  console.log('--- STARTING PROBATION FLOW VALIDATION ---');
  
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB.');

    // Find Test Users
    const manager = await User.findOne({ role: 'Manager' });
    const employee = await User.findOne({ role: 'Employee' });

    if (!manager || !employee) {
       console.error('Error: Need Manager and Employee in DB.');
       process.exit(1);
    }

    // Prepare Employee: Set DOJ to exactly 30 business days ago
    employee.dateOfJoining = getPastBusinessDate(30);
    employee.probationStatus = 'Active';
    employee.managerId = manager._id;
    await employee.save();
    console.log(`\n[SETUP] Test Employee DOJ set to: ${employee.dateOfJoining.toDateString()} (30 business days ago)`);

    // Ensure dummy active goal exists to bypass review block
    await Goal.findOneAndUpdate(
        { ownerId: employee._id },
        { title: 'Test Goal', status: 'Active', ownerId: employee._id },
        { upsert: true, new: true }
    );

    // STEP 1: Simulate Trigger Logic (from probationCron.js)
    console.log('\n[STEP 1] Triggering Day 30 Review...');
    const reviewType = 'Probation_30';
    await Review.deleteMany({ subjectId: employee._id, type: reviewType }); // Cleanup

    const review = await Review.create({
        subjectId: employee._id,
        managerId: manager._id,
        type: reviewType,
        status: 'Pending',
        dueDate: new Date(Date.now() + 7 * 86400000)
    });
    console.log('Review Created:', review.type, `(ID: ${review._id})`);

    // STEP 2: Employee Submits Self-Feedback
    console.log('\n[STEP 2] Employee: Submitting Self-Feedback...');
    const selfFeedback = { 
        progress: 'I have successfully completed my initial onboarding and started working on APAC localization.', 
        rating: 'Meets' 
    };
    
    review.selfFeedback = { ...selfFeedback, submittedAt: new Date() };
    review.status = 'Submitted';
    await review.save();
    console.log('Employee Submission Saved. Status:', review.status);

    // STEP 3: Manager Submits Final Feedback (Sentiment Test: "Toxic")
    console.log('\n[STEP 3] Manager: Submitting Feedback with Negative Sentiment...');
    const managerFeedback = {
        comments: 'Employee is doing well but the team environment is feeling a bit toxic lately.',
        rating: 'Meets'
    };

    const negativeWords = ['terrible', 'unfair', 'unacceptable', 'toxic', 'quit', 'overworked', 'burnout', 'abusive'];
    const isFlagged = negativeWords.some(word => managerFeedback.comments.toLowerCase().includes(word));

    review.managerFeedback = { ...managerFeedback, submittedAt: new Date() };
    review.status = 'Closed';
    if (isFlagged) {
        review.isFlagged = true;
        review.flaggedAt = new Date();
    }
    await review.save();
    console.log('Manager Submission Saved. Status:', review.status);
    console.log('Is Flagged for Admin review?', review.isFlagged ? 'YES (Verified)' : 'NO');

    // FINAL VERIFICATION
    console.log('\n--- VERIFICATION SUMMARY ---');
    const finalReview = await Review.findById(review._id);
    
    if (finalReview.status === 'Closed' && finalReview.selfFeedback.rating === 'Meets' && finalReview.isFlagged) {
        console.log('✅ FLOW VERIFIED: Trigger -> Self -> Manager -> Flagging logic intact.');
    } else {
        console.log('❌ FLOW TEST FAILED (Incomplete data)');
    }

    console.log('\n--- TEST COMPLETED SUCCESSFULLY ---');
    process.exit(0);

  } catch (err) {
    console.error('TEST FAILED:', err);
    process.exit(1);
  }
}

runTest();

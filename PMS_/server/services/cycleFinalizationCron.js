const cron = require('node-cron');
const Cycle = require('../models/Cycle');
const Review = require('../models/Review');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

const scheduleCycleFinalization = () => {
  // Runs daily at 3:00 AM to check for cycles needing finalization
  cron.schedule('0 3 * * *', async () => {
    console.log('Running Cycle Finalization Engine...');
    
    const today = new Date();
    const dayOfMonth = today.getDate();
    
    // Finalize on 26th (Bi-Annual) and 16th (Quarterly)
    const biAnnualFinalizeDay = 26;
    const quarterlyFinalizeDay = 16;
    
    // Check for bi-annual cycles needing finalization
    if (dayOfMonth === biAnnualFinalizeDay) {
      await finalizeCycles('Bi-Annual', today);
    }
    
    // Check for quarterly cycles needing finalization
    if (dayOfMonth === quarterlyFinalizeDay) {
      await finalizeCycles('Quarterly', today);
    }
  });
};

const finalizeCycles = async (type, today) => {
  try {
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    
    // Find cycle that should be finalized
    const cycle = await Cycle.findOne({
      type,
      month,
      year,
      status: 'Closed' // Should have been set by close process
    });
    
    if (!cycle) return;
    
    console.log(`Finalizing ${type} cycle for ${month}/${year}`);
    
    // Get all reviews for this cycle
    const reviews = await Review.find({
      cycleId: cycle._id
    }).populate('subjectId managerId');
    
    // Get unsubmitted reviews
    const unsubmittedReviews = reviews.filter(r => 
      r.status !== 'Closed' && r.status !== 'Waived' && r.status !== 'Extended'
    );
    
    // Build unsubmitted list
    const unsubmittedList = unsubmittedReviews.map(r => ({
      reviewId: r._id,
      employeeName: r.subjectId.name,
      employeeId: r.subjectId._id,
      reviewType: r.type,
      dueDate: r.dueDate,
      action: 'Pending'
    }));
    
    // Update cycle with stats
    cycle.totalSubmitted = reviews.filter(r => r.status === 'Closed').length;
    cycle.totalFlagged = reviews.filter(r => r.isFlagged).length;
    cycle.totalWaived = reviews.filter(r => r.status === 'Waived').length;
    cycle.totalExtended = reviews.filter(r => r.status === 'Extended').length;
    cycle.unsubmittedReviews = unsubmittedList;
    cycle.status = 'Finalized';
    cycle.finalizedAt = new Date();
    
    await cycle.save();
    
    // Notify all Admins with unsubmitted list
    const admins = await User.find({ role: 'Admin' });
    
    for (let admin of admins) {
      const unsubmittedCount = unsubmittedList.length;
      const summaryHtml = `
        <p>The ${type} cycle for ${month}/${year} has been finalized.</p>
        <h3>Summary:</h3>
        <ul>
          <li>Total Eligible: ${cycle.totalEligible}</li>
          <li>Submitted: ${cycle.totalSubmitted}</li>
          <li>Flagged: ${cycle.totalFlagged}</li>
          <li>Waived: ${cycle.totalWaived}</li>
          <li>Extended: ${cycle.totalExtended}</li>
          <li><strong>Unsubmitted: ${unsubmittedCount}</strong></li>
        </ul>
        <p>Log in to the Admin dashboard to take action on unsubmitted reviews (extend, waive, or escalate).</p>
      `;
      
      await sendEmail({
        email: admin.email,
        subject: `${type} Cycle Finalized - ${unsubmittedCount} Unsubmitted Review(s)`,
        html: summaryHtml
      });
    }
    
    console.log(`Finalization complete. ${unsubmittedList.length} unsubmitted reviews reported to admins.`);
    
  } catch (error) {
    console.error('Cycle finalization error:', error.message);
  }
};

module.exports = scheduleCycleFinalization;

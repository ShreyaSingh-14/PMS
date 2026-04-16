const cron = require('node-cron');
const User = require('../models/User');
const Review = require('../models/Review');
const Cycle = require('../models/Cycle');
const sendEmail = require('../utils/sendEmail');

const scheduleCycleTriggers = () => {
  // PART 1: Trigger cycles on 1st of each month at 12:05 AM
  cron.schedule('5 0 1 * *', async () => {
    console.log('Running P1/P2 Integrated Cycle Engine...');
    
    const today = new Date();
    const month = today.getMonth() + 1; 
    const year = today.getFullYear();
    
    let cyclesToTrigger = [];

    // Bi-Annual Logic (Feb 1, Aug 1)
    if (month === 2 || month === 8) cyclesToTrigger.push('Bi-Annual');
    // Quarterly Logic (Jan 1, Apr 1, Jul 1, Oct 1)
    if ([1, 4, 7, 10].includes(month)) cyclesToTrigger.push('Quarterly');

    if (cyclesToTrigger.length === 0) return;

    for (let track of cyclesToTrigger) {
      // P0: Create cycle record for tracking state
      const stopDay = track === 'Quarterly' ? 15 : 25;
      const finalizeDay = stopDay + 1;
      
      const closeDate = new Date(year, month - 1, stopDay);
      const finalizeDate = new Date(year, month - 1, finalizeDay);
      
      let existingCycle = await Cycle.findOne({ 
        type: track, 
        month, 
        year 
      });
      
      let cycleRecord;
      if (!existingCycle) {
        cycleRecord = await Cycle.create({
          type: track,
          month,
          year,
          triggerDate: today,
          closeDate,
          finalizeDate,
          status: 'Open'
        });
      } else {
        cycleRecord = existingCycle;
      }
      
      // Find eligible users
      const eligibilityCutoff = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
      
      const users = await User.find({ 
        reviewTrack: track, 
        dateOfJoining: { $lte: eligibilityCutoff } 
      });

      console.log(`Triggering ${track} cycle for ${users.length} eligible users.`);

      let createdCount = 0;
      for (let user of users) {
        const reviewType = `Cycle_${track}_M${month}`;
        
        let dueDate = new Date(year, month - 1, stopDay);

        // Check for existing review in this cycle
        const existing = await Review.findOne({
          subjectId: user._id,
          cycleId: cycleRecord._id,
          type: track === 'Bi-Annual' ? 'Cycle_BiAnnual' : 'Cycle_Quarterly'
        });
        
        if (existing) {
          console.log(`Skipped duplicate for ${user.name}`);
          continue;
        }

        const newReview = await Review.create({
          subjectId: user._id,
          managerId: user.managerId,
          cycleId: cycleRecord._id,
          type: track === 'Bi-Annual' ? 'Cycle_BiAnnual' : 'Cycle_Quarterly',
          status: 'Pending',
          dueDate
        });

        createdCount++;

        await sendEmail({
          email: user.email,
          subject: `ACTION REQUIRED: ${track} Performance Cycle Initiated`,
          html: `<p>Hi ${user.name}, your ${track} review cycle is now open. Due: ${dueDate.toDateString()}.</p>`
        });
      }
      
      // Update cycle stats
      cycleRecord.totalEligible = users.length;
      await cycleRecord.save();
      
      console.log(`Created ${createdCount} reviews for ${track} cycle`);
    }
  });

  // PART 2: Finalize cycles on closeDate and finalizeDate at 10 AM daily
  cron.schedule('0 10 * * *', async () => {
    console.log('Running cycle finalization checks...');
    
    const now = new Date();
    
    try {
      // Find cycles that should be closed today
      const closingCycles = await Cycle.find({
        status: 'Open',
        closeDate: {
          $lte: now,
          $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
        }
      });
      
      for (let cycle of closingCycles) {
        console.log(`Closing cycle: ${cycle.name || `${cycle.type} ${cycle.month}/${cycle.year}`} (${cycle._id})`);
        
        // Calculate final stats
        const reviews = await Review.find({ cycleId: cycle._id });
        const submitCount = reviews.filter(r => r.status === 'Closed').length;
        const submitPercentage = reviews.length > 0 
          ? Math.round((submitCount / reviews.length) * 100) 
          : 0;
        
        cycle.status = 'Closed';
        cycle.statistics = {
          totalReviews: reviews.length,
          submittedReviews: submitCount,
          submitPercentage: submitPercentage,
          flaggedReviews: reviews.filter(r => r.isFlagged).length,
          waivedReviews: reviews.filter(r => r.status === 'Waived').length,
          extendedReviews: reviews.filter(r => r.status === 'Extended').length
        };
        cycle.actualCloseDate = new Date();
        await cycle.save();
        
        // Notify all managers
        const managers = new Set();
        reviews.forEach(r => {
          if (r.managerId) managers.add(r.managerId.toString());
        });
        
        for (let managerId of managers) {
          const manager = await User.findById(managerId);
          if (manager && manager.email) {
            await sendEmail({
              email: manager.email,
              subject: `Performance Review Cycle Closed: ${cycle.name || `${cycle.type} ${cycle.month}/${cycle.year}`}`,
              html: `
                <h2>Review Cycle Closed</h2>
                <p>The performance review cycle <strong>${cycle.name || `${cycle.type} ${cycle.month}/${cycle.year}`}</strong> has been closed.</p>
                <p><strong>Final Statistics:</strong></p>
                <ul>
                  <li>Total Reviews: ${cycle.statistics.totalReviews}</li>
                  <li>Submitted: ${cycle.statistics.submittedReviews} (${cycle.statistics.submitPercentage}%)</li>
                  <li>Flagged: ${cycle.statistics.flaggedReviews}</li>
                  <li>Waived: ${cycle.statistics.waivedReviews}</li>
                  <li>Extended: ${cycle.statistics.extendedReviews}</li>
                </ul>
                <p>Please review and complete any remaining actions before finalization.</p>
              `
            });
          }
        }
      }
      
      // Find cycles that should be finalized today
      const finalizingCycles = await Cycle.find({
        status: 'Closed',
        finalizeDate: {
          $lte: now,
          $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
        }
      });
      
      for (let cycle of finalizingCycles) {
        console.log(`Finalizing cycle: ${cycle.name || `${cycle.type} ${cycle.month}/${cycle.year}`} (${cycle._id})`);
        
        cycle.status = 'Finalized';
        cycle.actualFinalizeDate = new Date();
        await cycle.save();
        
        // Notify HR
        const hrUsers = await User.find({ role: 'HR' });
        for (let hr of hrUsers) {
          if (hr.email) {
            await sendEmail({
              email: hr.email,
              subject: `Performance Review Cycle Finalized: ${cycle.name || `${cycle.type} ${cycle.month}/${cycle.year}`}`,
              html: `
                <h2>Review Cycle Finalized</h2>
                <p>The performance review cycle <strong>${cycle.name || `${cycle.type} ${cycle.month}/${cycle.year}`}</strong> has been finalized and archived.</p>
                <p>Final review results are now locked and available for HR actions.</p>
              `
            });
          }
        }
      }
      
      console.log('Cycle finalization checks completed successfully');
    } catch (error) {
      console.error('Error in cycle finalization:', error);
    }
  });
};

module.exports = scheduleCycleTriggers;

const cron = require('node-cron');
const User = require('../models/User');
const Review = require('../models/Review');
const sendEmail = require('../utils/sendEmail');

const scheduleCycleTriggers = () => {
  // Logic runs on the 1st of every month at 12:05 AM
  cron.schedule('5 0 1 * *', async () => {
    console.log('Running P1/P2 Integrated Cycle Engine...');
    
    const today = new Date();
    const month = today.getMonth() + 1; 
    
    let cyclesToTrigger = [];

    // Bi-Annual Logic (Feb 1, Aug 1)
    if (month === 2 || month === 8) cyclesToTrigger.push('Bi-Annual');
    // Quarterly Logic (Jan 1, Apr 1, Jul 1, Oct 1)
    if ([1, 4, 7, 10].includes(month)) cyclesToTrigger.push('Quarterly');

    if (cyclesToTrigger.length === 0) return;

    for (let track of cyclesToTrigger) {
      // Find eligible users
      // Eligibility: Joined > 60 days before cycle close (Close is 15th/25th, so approx 60 days before that)
      const eligibilityCutoff = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
      
      const users = await User.find({ 
        reviewTrack: track, 
        dateOfJoining: { $lte: eligibilityCutoff } 
      });

      console.log(`Triggering ${track} cycle for ${users.length} eligible users.`);

      for (let user of users) {
        // P2: Dual-track deduplication
        // If user is quarterly but this is a bi-annual run, and they are ONLY quarterly, skip.
        // Handled by reviewTrack: track query.
        
        const reviewType = `Cycle_${track}_M${month}`;
        
        // Due Date logic: Quarterly closes 15th, Bi-Annual closes 25th
        let stopDay = track === 'Quarterly' ? 15 : 25;
        const dueDate = new Date(today.getFullYear(), today.getMonth(), stopDay);

        const newReview = await Review.create({
          subjectId: user._id,
          managerId: user.managerId,
          type: reviewType === `Cycle_Bi-Annual_M${month}` ? 'Cycle_BiAnnual' : 'Cycle_Quarterly',
          status: 'Pending',
          dueDate
        });

        await sendEmail({
          email: user.email,
          subject: `ACTION REQUIRED: ${track} Performance Cycle Initiated`,
          html: `<p>Hi ${user.name}, your ${track} review cycle is now open. Due: ${dueDate.toDateString()}.</p>`
        });
      }
    }
  });
};

module.exports = scheduleCycleTriggers;

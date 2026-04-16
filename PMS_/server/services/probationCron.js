const cron = require('node-cron');
const User = require('../models/User');
const Review = require('../models/Review');
const sendEmail = require('../utils/sendEmail');

const getBusinessDaysCount = (startDate, endDate) => {
    let count = 0;
    let curDate = new Date(startDate.getTime());
    while (curDate <= endDate) {
        const dayOfWeek = curDate.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) count++;
        curDate.setDate(curDate.getDate() + 1);
    }
    return count;
};

const scheduleProbationChecks = () => {
  cron.schedule('0 0 * * *', async () => {
    console.log('Running section 6 compliant probation trigger engine...');
    
    const users = await User.find({ probationStatus: 'Active' });
    const today = new Date();
    
    for (let user of users) {
      if (!user.dateOfJoining) continue;

      // P0: Calculate BUSINESS days since joining
      const businessDays = getBusinessDaysCount(user.dateOfJoining, today);
      const milestones = [30, 60, 80];
      
      if (milestones.includes(businessDays)) {
        const reviewType = `Probation_${businessDays}`;
        const existing = await Review.findOne({ subjectId: user._id, type: reviewType });
        if (existing) continue;

        if (!user.managerId) {
            // Alert Admin of blocked trigger
            continue;
        }

        await Review.create({
          subjectId: user._id,
          managerId: user.managerId,
          type: reviewType,
          status: 'Pending',
          dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
        });

        const notify = [user.email];
        const mgr = await User.findById(user.managerId);
        if (mgr) notify.push(mgr.email);

        for (let email of notify) {
            await sendEmail({
              email,
              subject: `Action Required: Day ${businessDays} Review Initiated`,
              html: `<p>A new probation review has been triggered for Day ${businessDays}.</p>`
            });
        }
      }
    }
  });
};

module.exports = scheduleProbationChecks;

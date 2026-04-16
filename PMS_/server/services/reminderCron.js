const cron = require('node-cron');
const Review = require('../models/Review');
const Goal = require('../models/Goal');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// Helper to calculate business days passed since a date
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

const scheduleReminderChecks = () => {
    // Run Daily at 2:00 AM
    cron.schedule('0 2 * * *', async () => {
        const today = new Date();
        const dayOfMonth = today.getDate();
        const admins = await User.find({ role: 'Admin' });

        console.log('Running Section 6: Automation Rules Engine...');

        // 1. Cycle Reminders (5th, 15th, 22nd)
        if ([5, 15, 22].includes(dayOfMonth)) {
            const cycleReviews = await Review.find({ 
                type: { $in: ['Cycle_BiAnnual', 'Cycle_Quarterly'] },
                status: { $ne: 'Closed' }
            }).populate('subjectId managerId');

            for (let rev of cycleReviews) {
                const recipients = [rev.subjectId];
                if (rev.managerId) recipients.push(rev.managerId);

                for (let user of recipients) {
                    if (dayOfMonth === 5) {
                        await sendEmail({ email: user.email, subject: 'Cycle Reminder (5th)', html: '<p>Gentle nudge.</p>' });
                    } else if (dayOfMonth === 15) {
                        await sendEmail({ email: user.email, subject: 'Cycle URGENT (15th)', html: '<p>Urgent submission required.</p>' });
                    }
                }
                
                if (dayOfMonth === 22) {
                    rev.isFlagged = true;
                    await rev.save();
                    for (let admin of admins) {
                        await sendEmail({ email: admin.email, subject: 'Cycle Escalation (22nd)', html: `<p>User ${rev.subjectId.name} escalated.</p>` });
                    }
                }
            }
        }

        // 2. Probation Reminders (+2, +4, +6, +7) 
        const probReviews = await Review.find({ type: { $regex: 'Probation' }, status: { $ne: 'Closed' } }).populate('subjectId managerId');
        for (let prob of probReviews) {
            const ageDays = getBusinessDaysCount(prob.createdAt, today);
            
            // +2d, +4d, +6d Reminders
            if ([2, 4, 6].includes(ageDays)) {
                const targets = [prob.subjectId];
                if (prob.managerId) targets.push(prob.managerId);
                for (let t of targets) {
                    await sendEmail({ email: t.email, subject: `Probation Reminder (+${ageDays}d)`, html: '<p>Completion required.</p>' });
                }
            }
            // +7d Admin Escalation
            if (ageDays >= 7 && !prob.isFlagged) {
                prob.isFlagged = true;
                await prob.save();
                for (let admin of admins) {
                    await sendEmail({ email: admin.email, subject: `Probation ESCALATION (+7d) - ${prob.subjectId.name}`, html: '<p>Overdue milestone escalation.</p>' });
                }
            }
        }

        // 3. Goal Approval Escalation (5 business days)
        const pendingGoals = await Goal.find({ status: 'Pending Approval' }).populate('ownerId');
        for (let goal of pendingGoals) {
            const waitDays = getBusinessDaysCount(goal.updatedAt, today);
            if (waitDays >= 5) {
                for (let admin of admins) {
                    await sendEmail({ email: admin.email, subject: `Goal Auto-Escalation - ${goal.ownerId.name}`, html: `<p>Goal "${goal.title}" has been pending for 5+ business days.</p>` });
                }
                console.log(`Goal for ${goal.ownerId.name} auto-escalated to Admin.`);
            }
        }
    });
};

module.exports = scheduleReminderChecks;

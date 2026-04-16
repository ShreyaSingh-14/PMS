require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

const setupSwagger = require('./config/swagger');

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/goals', require('./routes/goalRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/admin', require('./routes/adminCycleRoutes'));

// Setup Swagger Docs
setupSwagger(app);

app.get('/', (req, res) => {
  res.send('PMS API is actively running.');
});

// Initialize Cron Jobs
const scheduleProbationChecks = require('./services/probationCron');
const scheduleReminderChecks = require('./services/reminderCron');
const scheduleCycleTriggers = require('./services/cycleCron');
scheduleProbationChecks();
scheduleReminderChecks();
scheduleCycleTriggers();

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));

const mongoUri = process.env.MONGO_URI?.replace(/^"|"$/g, '') || 'mongodb://127.0.0.1:27017/expense-manager';
console.log("MONGO_URI is:", mongoUri);

// Connect to MongoDB with retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection error:', err);
    console.log('Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000);
  }
};

connectDB();

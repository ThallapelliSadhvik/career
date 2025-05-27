const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://127.0.0.1:27017/authDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashed });
    await user.save();

    res.json({ message: 'Signup successful!' });
  } catch (err) {
    res.status(500).json({ message: 'Error during signup', error: err.message });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.json({ message: 'Incorrect password' });

    res.json({ success: true, message: 'Login successful!' });

  } catch (err) {
    res.status(500).json({ message: 'Error during login', error: err.message });
  }
});

app.listen(5000, () => {
  console.log('Server running on port 5000');
});

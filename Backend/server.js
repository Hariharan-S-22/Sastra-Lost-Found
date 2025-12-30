
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// 1. Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 2. Request Logging
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// 3. Schema & Model Definitions
const UserSchema = new mongoose.Schema({
  id: String,
  name: String,
  email: { type: String, unique: true },
  registrationNumber: String,
  profilePicture: String,
  trustScore: Number,
  resolvedCount: Number,
  branch: String,
  yearOfStudy: String,
  residency: String,
  onboarded: Boolean,
  theme: String
});

const ItemSchema = new mongoose.Schema({
  id: String,
  title: String,
  category: String,
  type: String, 
  description: String,
  location: String,
  imagePaths: [String],
  reporterId: String,
  reporterName: String,
  date: String,
  status: { type: String, default: 'NEW' },
  messages: Array,
  reports: [String]
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Item = mongoose.models.Item || mongoose.model('Item', ItemSchema);

// 4. MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://hariharans220507_db_user:KNznCQFumG9h29Yn@cluster0.0zgnly4.mongodb.net/sastra_registry?retryWrites=true&w=majority';

console.log('Connecting to SASTRA Cloud Registry...');
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Connection Established Successfully'))
  .catch(err => {
    console.error('❌ MongoDB Connection Failed:', err.message);
  });

// 5. API ROUTES
app.get('/api/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  let userCount = 0;
  let itemCount = 0;
  
  if (dbStatus === 'connected') {
    try {
      userCount = await User.countDocuments();
      itemCount = await Item.countDocuments();
    } catch (e) {}
  }

  res.json({ 
    status: 'active', 
    database: dbStatus,
    stats: { users: userCount, items: itemCount },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find().sort({ name: 1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Database query failed' });
  }
});

app.get('/api/users/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { email, id, ...userData } = req.body;
    const lowerEmail = email.toLowerCase();
    const user = await User.findOneAndUpdate(
      { email: lowerEmail },
      { $set: { ...userData, id, email: lowerEmail } },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Identity synchronization failed' });
  }
});

app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find().sort({ _id: -1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Cloud Registry Sync Error' });
  }
});

app.post('/api/items', async (req, res) => {
  try {
    const newItem = new Item(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/items/:id/status', async (req, res) => {
  try {
    const item = await Item.findOneAndUpdate({ id: req.params.id }, { status: req.body.status }, { new: true });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/items/:id/messages', async (req, res) => {
  try {
    const item = await Item.findOneAndUpdate({ id: req.params.id }, { $push: { messages: req.body } }, { new: true });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  try {
    await Item.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 404 Catch-All to debug proxy mismatches
app.use((req, res) => {
  console.warn(`[404] Route Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ error: 'Route not found in Registry API' });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 SASTRA Backend Active on 127.0.0.1:${PORT}`);
});

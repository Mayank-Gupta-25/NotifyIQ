const connectDB = require('../config/db');
const User = require('../models/User');
const Rule = require('../models/Rule');
const Notification = require('../models/Notification');
const BehaviorLog = require('../models/BehaviorLog');
const Digest = require('../models/Digest');
const { defaultRules } = require('../data/defaultRules');

const seedData = async () => {
  try {
    console.log('⏳ Connecting to database...');
    await connectDB();
    
    console.log('🧹 Wiping existing data...');
    await Promise.all([
      User.deleteMany({}),
      Rule.deleteMany({}),
      Notification.deleteMany({}),
      BehaviorLog.deleteMany({}),
      Digest.deleteMany({})
    ]);

    console.log('👤 Creating default test user...');
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com'
    });

    console.log('📜 Injecting default classification rules...');
    const rulesToInsert = defaultRules.map(rule => ({
      ...rule,
      userId: user._id
    }));
    await Rule.insertMany(rulesToInsert);

    console.log('✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();

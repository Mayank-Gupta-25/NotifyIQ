const classificationEngine = require('../services/classificationEngine');
const { notificationTemplates } = require('../data/sampleNotifications');
const { defaultRules } = require('../data/defaultRules');

const runTest = async () => {
  console.log('🧠 Testing Classification Engine...\n');
  
  // Pick a mix of notifications to test all layers
  const testSet = [
    notificationTemplates.find(n => n.title === 'Suspicious login detected'), // Expect: CRITICAL (Rule/Keyword)
    notificationTemplates.find(n => n.title === 'Mega Sale Live!'),           // Expect: LOW (Category/Keyword)
    notificationTemplates.find(n => n.title === 'Rahul Sharma'),              // Expect: IMPORTANT (Rule)
    { sourceApp: 'RandomApp', category: 'other', title: 'We miss you!', body: 'Come back and play.' }, // Expect: NOISE (Keyword Rule)
    { sourceApp: 'BossMail', category: 'productivity', title: 'Urgent: Server down', body: 'Please fix immediately.' } // Expect: CRITICAL (Keyword)
  ];

  for (const notif of testSet) {
    const result = await classificationEngine.classify(notif, defaultRules);
    
    // Add color formatting for the terminal output
    let color = '\x1b[37m'; // white
    if (result.priority === 'critical') color = '\x1b[31m'; // red
    if (result.priority === 'important') color = '\x1b[33m'; // yellow
    if (result.priority === 'low') color = '\x1b[34m'; // blue
    if (result.priority === 'noise') color = '\x1b[90m'; // gray

    console.log(`${color}[${result.priority.toUpperCase()}] Score: ${result.score}\x1b[0m`);
    console.log(`App: ${notif.sourceApp} | Category: ${notif.category}`);
    console.log(`"${notif.title}" - ${notif.body}\n`);
  }
};

runTest();

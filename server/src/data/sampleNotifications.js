const { SIMULATED_APPS } = require('../../../shared/constants');

const notificationTemplates = [
  // Critical / Important
  { sourceApp: SIMULATED_APPS.BANKX.name, icon: SIMULATED_APPS.BANKX.icon, category: 'security', title: 'Suspicious login detected', body: 'Someone logged into your account from Mumbai. Review activity immediately.' },
  { sourceApp: SIMULATED_APPS.BANKX.name, icon: SIMULATED_APPS.BANKX.icon, category: 'finance', title: 'Payment Failed', body: 'Your auto-pay for Netflix failed due to insufficient funds.' },
  { sourceApp: SIMULATED_APPS.CHATAPP.name, icon: SIMULATED_APPS.CHATAPP.icon, category: 'messaging', title: 'Rahul Sharma', body: 'Are we still on for dinner tonight?' },
  { sourceApp: SIMULATED_APPS.WORKMAIL.name, icon: SIMULATED_APPS.WORKMAIL.icon, category: 'productivity', title: 'Meeting in 15 mins', body: 'Weekly Sync with Design Team starts soon.' },
  
  // Low (Digest Material)
  { sourceApp: SIMULATED_APPS.SHOPKART.name, icon: SIMULATED_APPS.SHOPKART.icon, category: 'marketing', title: 'Mega Sale Live!', body: 'Up to 70% off on electronics. Offer ends at midnight.' },
  { sourceApp: SIMULATED_APPS.SHOPKART.name, icon: SIMULATED_APPS.SHOPKART.icon, category: 'orders', title: 'Out for Delivery', body: 'Your order of Sony Headphones will arrive today by 9 PM.' },
  { sourceApp: SIMULATED_APPS.CHATAPP.name, icon: SIMULATED_APPS.CHATAPP.icon, category: 'social', title: 'College Group', body: 'Neha added 5 new photos.' },
  { sourceApp: SIMULATED_APPS.HEALTHFIT.name, icon: SIMULATED_APPS.HEALTHFIT.icon, category: 'health', title: 'Time to hydrate! 💧', body: 'You haven\'t logged any water intake in 4 hours.' },
  { sourceApp: SIMULATED_APPS.NEWSFLASH.name, icon: SIMULATED_APPS.NEWSFLASH.icon, category: 'news', title: 'Breaking News', body: 'Global stock markets surge after recent policy changes.' },
  { sourceApp: SIMULATED_APPS.FOODDASH.name, icon: SIMULATED_APPS.FOODDASH.icon, category: 'food', title: 'Hungry?', body: 'Get 50% off your next meal using code BINGE50.' },
  { sourceApp: SIMULATED_APPS.GAMEZONE.name, icon: SIMULATED_APPS.GAMEZONE.icon, category: 'entertainment', title: 'Your energy is full! ⚡', body: 'Jump back in and defeat the final boss.' }
];

module.exports = { notificationTemplates };

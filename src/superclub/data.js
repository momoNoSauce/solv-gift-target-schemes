// Mock payloads shaped exactly like the SuperClub API responses.
// Endpoints (CONF.BASE_END_POINT = "/super-club/", from all.1.0.75.min.js):
//   GET  points/{bzid}            -> { currentBalance, memberType, subscriptionStartDate, subscriptionEndDate }
//   GET  message?bzid&currentTime -> { title, description, messageType, showImage, imageUrl }
//   GET  target-milestone?bzid&currentTime -> { targetBOs: [...] }
//   GET  rewards                  -> { rewards: [...] }
//   GET  target-applicable-for/{targetId} -> { products: [...] }
//   POST claim-new                <- { productId, businessId, pointsRedeemed, transactionType: "Claimed" }
//   GET  claimed/{bzid}           -> { redeemedRewards: [...] }
//   GET  transactions/{bzid}      -> { transactions: [...] }

const DAY = 86400000;
// Fixed "now" so the prototype renders the same numbers every run.
export const NOW = Date.UTC(2026, 7, 20);

// $root state that AppCtrl / DealsCtrl fill in from the query string and /points
export const ROOT = {
  bzId: 'BZID-1042219',
  businessName: 'Sri Lakshmi Stores',
  customerType: 'GOLD',            // memberType: GOLD | SILVER
  availablePoints: 1240,           // currentBalance
  subscriptionStartDate: Date.UTC(2026, 4, 12),
  subscriptionEndDate: Date.UTC(2027, 4, 11),
};

// GET message
// messageType selects assets/img/<type>.png. The site ships only info.png and
// success.png, so any other value shows a broken image.
export const MESSAGE = {
  title: 'Jumbocoins expire on 11 May 2027',
  description: 'Redeem the coins before the membership ends.',
  messageType: 'info',
  showImage: false,
  imageUrl: '',
};

// GET target-milestone -> targetBOs
export const TARGETS = [
  {
    targetId: 'TGT-90114',
    title: 'Monthly purchase target',
    targetType: 'AMOUNT',
    maxValue: 50000,
    maxPoints: 600,
    applicableTo: NOW + 11 * DAY,
    applicableOn: true,
    milestones: [
      { atValue: 15000, totalPoints: 100 },
      { atValue: 30000, totalPoints: 300 },
      { atValue: 50000, totalPoints: 600 },
    ],
    customerTargetBO: { currentValue: 22400 },
  },
  {
    targetId: 'TGT-90115',
    title: 'Order 12 times this month',
    targetType: 'COUNT',
    maxValue: 12,
    maxPoints: 250,
    applicableTo: NOW + 11 * DAY,
    applicableOn: false,
    milestones: [
      { atValue: 4, totalPoints: 50 },
      { atValue: 8, totalPoints: 120 },
      { atValue: 12, totalPoints: 250 },
    ],
    customerTargetBO: { currentValue: 5 },
  },
  {
    targetId: 'TGT-90116',
    title: 'Personal care target',
    targetType: 'AMOUNT',
    maxValue: 8000,
    maxPoints: 150,
    applicableTo: NOW + 3 * DAY,
    applicableOn: true,
    milestones: [
      { atValue: 4000, totalPoints: 60 },
      { atValue: 8000, totalPoints: 150 },
    ],
    customerTargetBO: { currentValue: 8600 },
  },
];

// e.goldRewards, hard-coded in DealsCtrl
export const GOLD_REWARDS = [
  { image: 'free_credit', text: '15 Days Interest Free credit ', subText: '*If eligible' },
  { image: 'free_delivery', text: 'Free Delivery', subText: 'Place order on Friday, Saturday & Sunday' },
  { image: 'free_target', text: 'Special Target Schemes', subText: 'Get more jumbocoins!' },
];

// GET rewards -> rewards
export const PRODUCTS = [
  { id: 'RWD-2001', title: 'Prestige 3 Litre Pressure Cooker', imageURL: '', points: 900 },
  { id: 'RWD-2002', title: 'Butterfly Mixer Grinder 750W', imageURL: '', points: 1200 },
  { id: 'RWD-2003', title: 'Milton Thermosteel Flask 1 L', imageURL: '', points: 450 },
  { id: 'RWD-2004', title: 'Digital Weighing Scale 30 kg', imageURL: '', points: 1500 },
  { id: 'RWD-2005', title: 'Wall Clock', imageURL: '', points: 250 },
  { id: 'RWD-2006', title: 'Steel Dinner Set 24 Pieces', imageURL: '', points: 2000 },
];

// GET target-applicable-for/{targetId} -> products
export const TARGET_PRODUCTS = {
  'TGT-90114': [
    { title: 'Fortune Sunlite Refined Sunflower Oil 1 L', imurl: '' },
    { title: 'Aashirvaad Atta 10 kg', imurl: '' },
    { title: 'Tata Salt 1 kg', imurl: '' },
  ],
  'TGT-90116': [
    { title: 'Lux Soap 100 g', imurl: '' },
    { title: 'Clinic Plus Shampoo 175 ml', imurl: '' },
  ],
};

// GET claimed/{bzid} -> redeemedRewards
export const CLAIMED = [
  {
    rewardsBO: { title: 'Milton Thermosteel Flask 1 L', imageURL: '' },
    createdTime: Date.UTC(2026, 6, 28),
    pointsRedeemed: 450,
    transactionType: 'SHIPPED',
  },
  {
    rewardsBO: { title: 'Wall Clock', imageURL: '' },
    createdTime: Date.UTC(2026, 5, 9),
    pointsRedeemed: 250,
    transactionType: 'DELIVERED',
  },
  {
    rewardsBO: { title: 'Butterfly Mixer Grinder 750W', imageURL: '' },
    createdTime: Date.UTC(2026, 4, 2),
    pointsRedeemed: 1200,
    transactionType: 'CANCELLED',
  },
];

// GET transactions/{bzid} -> transactions
export const TRANSACTIONS = [
  {
    pointsTitle: 'Monthly purchase target milestone 2',
    createdTime: Date.UTC(2026, 7, 14),
    points: 300,
    transactionType: 'CREDIT',
    description: 'Milestone of ₹30,000 reached on the monthly purchase target.',
  },
  {
    pointsTitle: 'Redeemed against Milton Thermosteel Flask 1 L',
    createdTime: Date.UTC(2026, 6, 28),
    points: 450,
    transactionType: 'DEBIT',
    description: '',
  },
  {
    pointsTitle: 'Order 12 times milestone 1',
    createdTime: Date.UTC(2026, 6, 11),
    points: 50,
    transactionType: 'CREDIT',
    description: '4 orders placed between 1 Jul and 11 Jul.',
  },
  {
    pointsTitle: 'Diwali bonus',
    createdTime: Date.UTC(2026, 5, 30),
    points: 500,
    transactionType: 'CREDIT',
    description: '',
  },
];

// POST claim-new — the web app leaves the balance untouched and the server adds a
// CLAIMED row, which the Rewards Claimed screen picks up on its next load.
export function claimProduct(product) {
  CLAIMED.unshift({
    rewardsBO: { title: product.title, imageURL: product.imageURL },
    createdTime: NOW,
    pointsRedeemed: product.points,
    transactionType: 'CLAIMED',
  });
}

// Angular filter: currency:"₹":0
export function rupees(value) {
  const n = Math.round(Number(value) || 0);
  return '₹' + n.toLocaleString('en-US');
}

// Angular filter: date:"dd MMM yyyy" and date:"dd, MMM yyyy"
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function ddMMMyyyy(ms, comma = false) {
  const d = new Date(ms);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${dd}${comma ? ',' : ''} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

// MilestoneActivityCtrl: parseInt((applicableTo - now) / 864e5)
export function daysLeft(applicableTo) {
  return parseInt((applicableTo - NOW) / DAY, 10);
}

// CONF.LEFT_MENU
export const LEFT_MENU = [
  { display: 'Redeem Jumbocoins', img: 'deals', id: 'deals', link: '/superclub', title: null },
  { display: 'Rewards Claimed', img: 'claimed', id: 'rewards-claimed', link: '/superclub/claimed', title: 'Rewards Claimed' },
  { display: 'Transaction History', img: 'history', id: 'transaction-history', link: '/superclub/history', title: 'Transaction History' },
];

export const SUPPORT_NUMBER = '+91-8045654565';

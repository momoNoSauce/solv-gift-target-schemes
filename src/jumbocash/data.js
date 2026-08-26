// Mock payloads shaped like the Jumbocash ledger API models
// (jumbocashledger/models/JumboCashDetails.kt, JumboCashTransactionDetails.kt,
//  JumboCashLedgerOtpLayout.kt, JumboCashPolicy.kt).

// GET jumbocash details
export const JC_DETAILS = {
  jumboCashIconUrl: '',
  totalBalance: 1875,
  dateTimeText: 'As on 20 Aug 2026, 11:42 AM',
  conversionInfo: '1 Jumbocash = ₹1. Jumbocash is used automatically on your next order.',
  knowMoreInfo: { text: 'Know More', isVisible: true, color: '#2C552D' },
  pendingInfoIconUrl: '',
  pendingInfo: 'Pending Jumbocash is credited after the return window closes.',
  pendingTotalAmount: '₹250 pending',
  status: {
    text: 'Pending',
    iconUrl: '',
    backgroundColor: '#FFF4E5',
    borderColor: '#E59529',
  },
};

// OtpLayout — activeOtpExists switches the card between the two states
export const JC_OTP = {
  activeOtpExists: true,
  otpAvailableLayout: {
    title: 'Jumbocash payment OTP',
    otpValue: 4821,
    otpText: '₹500 will be paid using Jumbocash',
    description: 'Share this OTP with the delivery executive to use your Jumbocash on this order.',
    showRefreshButton: true,
    refreshButtonText: 'REFRESH',
    otpAvailableIconUrl: '',
  },
  otpUnavailableLayout: {
    title: 'No active Jumbocash OTP',
    headerDescription: 'You have no order using Jumbocash right now',
    headerText: 'Place an order and choose Jumbocash at checkout to get an OTP.',
    showRefreshButton: false,
    refreshButtonText: '',
    otpUnAvailableIconUrl: '',
  },
};

export const JC_OTP_VALID_TEXT = 'Valid for 09:58';

// GET transactions -> { transactionDetails, nextPageNumber }
export const JC_TRANSACTIONS = [
  {
    cardIconUrl: '',
    cardTitle: 'Cashback on order JT-90417',
    beforeBalance: '₹1,375',
    amount: { value: '+ ₹500', color: '#58a159' },
    afterBalance: '₹1,875',
    date: '18 Aug 2026',
    time: '4:12 PM',
    status: { text: 'Credited', iconUrl: '', backgroundColor: '#EAF4E9', borderColor: '#58a159' },
  },
  {
    cardIconUrl: '',
    cardTitle: 'Target scheme payout — Garnier',
    beforeBalance: '₹1,335',
    amount: { value: '+ ₹40', color: '#58a159' },
    afterBalance: '₹1,375',
    date: '16 Aug 2026',
    time: '9:03 AM',
    status: { text: 'Credited', iconUrl: '', backgroundColor: '#EAF4E9', borderColor: '#58a159' },
  },
  {
    cardIconUrl: '',
    cardTitle: 'Used on order JT-90288',
    beforeBalance: '₹1,585',
    amount: { value: '- ₹250', color: '#cb0f26' },
    afterBalance: '₹1,335',
    date: '12 Aug 2026',
    time: '6:47 PM',
    status: { text: 'Debited', iconUrl: '', backgroundColor: '#FDECEE', borderColor: '#cb0f26' },
  },
  {
    cardIconUrl: '',
    cardTitle: 'Return adjustment JT-90101',
    beforeBalance: '₹1,585',
    amount: { value: '+ ₹250', color: '#58a159' },
    afterBalance: '₹1,585',
    date: '8 Aug 2026',
    time: '11:20 AM',
    status: { text: 'Pending', iconUrl: '', backgroundColor: '#FFF4E5', borderColor: '#E59529' },
  },
];

// GET policies -> JumboCashPolicy list, rendered by jumbocash_policy_item.xml (accordion)
export const JC_POLICIES = [
  {
    header: 'What is Jumbocash?',
    body: 'Jumbocash is money credited to your Jumbotail account. 1 Jumbocash equals ₹1 and is used on your next order automatically.',
  },
  {
    header: 'How do I earn Jumbocash?',
    body: 'You earn Jumbocash from target schemes, cashback offers, scratch cards and returns adjustments.',
  },
  {
    header: 'When does pending Jumbocash get credited?',
    body: 'Pending Jumbocash is credited after the return window of the order closes, usually within 7 days of delivery.',
  },
  {
    header: 'Does Jumbocash expire?',
    body: 'Jumbocash does not expire. It stays in your account until it is used on an order.',
  },
];

// res/xml/en_messages.xml
export const JM = {
  _jumbocash: 'Jumbocash',
  _transaction_history: 'Transaction History',
  _description: 'Description',
  _before_balance: 'Before Balance',
  _amount: 'Amount',
  _after_balance: 'After Balance',
  _know_more: 'Know More',
  about_jumbocash: 'About Jumbocash',
  _jumbocash_tnc_title: 'Jumbocash Terms & Conditions',
};

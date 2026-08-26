// Colours for the Jumbocoins earning surfaces (CDC quiz, JIX survey).
// res/values/colors.xml
export const Q = {
  black: '#000000',
  white: '#ffffff',
  black10: 'rgba(0,0,0,0.10)',   // black_10pc, the sheet handle
  textBlue: '#3BABEA',           // text_blue, Close / Continue
  blue4: '#568AD9',              // blue_4, Previous / Next question
  grey9: '#8f8f8f',              // grey_9
  greyMineShaft: '#222222',      // grey_mine_shaft, question text
  brandGreen: '#2c552d',
  lightGreen: '#58a159',
  lightGrey: '#d6d6d6',
  shireGreen: '#61891A',         // shire_green, survey CTA
  defaultBg: '#F7F7F7',
};

// res/xml/en_messages.xml
export const QM = {
  _quiz_completed_text: 'Quiz Completed  🎉',
  _total_jumbocoins_earned_text: 'Total JumboCoins you have earned',
  _jumbocoins_owned_text: 'Available Jumbocoins',
  _close_text: 'Close',
  _continue_text: 'Continue',
  _previous_question: 'Previous Question',
  _next_question: 'Next Question',
  _jix_survey_title: 'Share your feedback',
  _jix_survey_input_hint: 'Type your answer',
  _survey_completed_text: 'Survey Completed',
  _survey_completion_thanks: 'Thanks for sharing your feedback!',
  _survey_completion_header: 'Completion',
  _survey_earned_text: 'You have earned %s Jumbocoins',
  _survey_total_in_account: 'Total Jumbocoins in your account %s',
  _done: 'Done',
};

// Mock quiz payload (cdc/model)
export const QUIZ = {
  title: 'Kirana knowledge quiz',
  coinsPerQuestion: 5,
  questions: [
    {
      text: 'Which category sells the most during Diwali?',
      options: ['Sweets and dry fruits', 'Detergents', 'Beverages', 'Personal care'],
      answerIndex: 0,
    },
    {
      text: 'What does MRP stand for?',
      options: ['Maximum Retail Price', 'Market Rate Price', 'Minimum Retail Price', 'Merchant Rate Plan'],
      answerIndex: 0,
    },
    {
      text: 'How many days is the return window on staples?',
      options: ['2 days', '7 days', '15 days', '30 days'],
      answerIndex: 1,
    },
  ],
  earnedCoins: 15,
  ownedCoins: 1240,
};

// Mock JIX survey payload
export const SURVEY = {
  rewardsLabel: 'Answer 3 questions and earn 30 Jumbocoins',
  questions: [
    { title: 'How was the delivery experience on your last order?', reward: 'Earn 10 Jumbocoins', options: ['Very good', 'Good', 'Average', 'Poor'] },
    { title: 'Which category do you want more brands in?', reward: 'Earn 10 Jumbocoins', options: ['Staples', 'Beverages', 'Home care', 'Personal care'] },
    { title: 'Anything else you would like us to improve?', reward: 'Earn 10 Jumbocoins', input: true },
  ],
  earned: 30,
  total: 1270,
};

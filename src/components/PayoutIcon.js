// Jumbocash and Jumbocoins are different currencies, so they use different artwork:
//   Jumbocash  -> ic_jumbocash_icon (green banknote), rupee values
//   Jumbocoins -> ic_jumbo_coins (gold coin), SuperClub points, never rupees
// PayoutBO.getDrawable() returns ic_jumbo_coins only for payoutMode JUMBOCOIN; the live
// screens load displayData.payoutModeIcon / milestone.payoutIcon from the API.
import React from 'react';
import { IconJumboCash, IconJumboCoins } from '../icons';

export default function PayoutIcon({ name, width }) {
  if (name === 'jumbocoins') return <IconJumboCoins size={width} />;
  return <IconJumboCash width={width} />;
}

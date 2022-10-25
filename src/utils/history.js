import { ethers } from 'ethers';
import { getBlockFromExplorer } from './blockscout';
import { TOKENS, TOKEN_SWAP_CONTRACT } from '../constants';

// Subtract (offset * multiplier) from ts
export const offsetTimestampByInterval = (ts, offset, multiplier) => {
  const d = new Date(ts);
  d.setHours(d.getHours() - offset * multiplier);
  return Math.trunc(d.getTime() / 1000);
};

// Basic conversion of transaction type for history page
export const getTransactionType = (account, from, to) => {
  if (from.toLowerCase() === ethers.constants.AddressZero) {
    return 'Mint';
  } else if (to.toLowerCase() === ethers.constants.AddressZero) {
    return 'Burn';
  } else {
    if (from.toLowerCase() === account.toLowerCase()) {
      return 'Transfer - OUT';
    } else if (to.toLowerCase() === account.toLowerCase()) {
      return 'Transfer - IN';
    } else {
      return 'Transfer';
    }
  }
};

// Generates an array of block numbers in which to begin searching for events
// STARTING_VALUE sets initial offset (hours)
// MAX_MULTIPLIER is number of intervals to attempt
// e.g. 32 will create offsets of [1, 2, 4, 8, 16, 32] * STARTING_VALUE
export const getStartingIntervals = async (start) => {
  const STARTING_INTERVAL = 24;
  const MAX_MULTIPLIER = 32;

  const output = [];
  for (let i = 1; i <= MAX_MULTIPLIER; i = i * 2) {
    let targetBlock = await getBlockFromExplorer(
      offsetTimestampByInterval(start, STARTING_INTERVAL, i)
    );
    output.push(targetBlock);
  }
  output.push(0);
  return [...new Set(output)];
};

export const updateSwapEvent = (action, toAddress, fromAddress) => {
  let token;
  if (action === 'Mint') {
    fromAddress = toAddress;
    token = 'NOK -> NOK-S';
  } else {
    toAddress = fromAddress;
    token = 'NOK-S -> NOK';
  }
  action = 'Swap';

  return { token, action, toAddress, fromAddress };
};

export const getTokenType = (address) => {
  return address.toLowerCase() === TOKENS.NOK.address.toLowerCase() ? 'NOK' : 'NOK-S';
};

export const isSwapContract = (from, to) => {
  return (
    from.toLowerCase() === TOKEN_SWAP_CONTRACT.toLowerCase() ||
    to === TOKEN_SWAP_CONTRACT.toLowerCase()
  );
};

export const isTokenSwap = (token, action) => {
  return token === 'NOK-S' && (action === 'Mint' || action === 'Burn');
};

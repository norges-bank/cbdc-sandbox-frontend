import { ethers } from 'ethers';
import { createGlobalState } from 'react-hooks-global-state';
import { getTokenBalance, getTokenSupply } from '../hooks/useContract';
import { displayAsCurrency } from '../utils/format';
import TOKEN_ABI from '../abis/CBToken.json';
import CBS_TOKEN_ABI from '../abis/ERC1400.json';
import { CBS_TOKEN, CB_TOKEN, connectionInfo, NOK_NUM_DECIMALS } from '../constants';

const { setGlobalState, useGlobalState } = createGlobalState({
  account: '',
  addressBook: [],
  balance: displayAsCurrency('0'),
  noksBalance: displayAsCurrency('0'),
  loading: false,
  locale: 'en',
  totalSupply: displayAsCurrency('0'),
  totalNoksSupply: displayAsCurrency('0'),
  wallets: [],
  provider: new ethers.providers.JsonRpcProvider(connectionInfo),
  signer: null,
  transactionHistory: {
    transactions: [],
    toBlock: 'latest',
    toBlockTimestamp: '',
    latestBlock: ''
  }
});

const updateBalance = (account, provider) => {
  getTokenBalance(CB_TOKEN, TOKEN_ABI, account, provider).then((userBalance) => {
    if (userBalance.toString() === '0') {
      setGlobalState('balance', displayAsCurrency('0'));
    } else {
      setGlobalState('balance', displayAsCurrency(userBalance.toString(), NOK_NUM_DECIMALS));
    }
  });
};

const updateNoksBalance = (account, provider) => {
  getTokenBalance(CBS_TOKEN, CBS_TOKEN_ABI, account, provider).then((noksBalance) => {
    if (noksBalance.toString() === '0') {
      setGlobalState('noksBalance', displayAsCurrency('0'));
    } else {
      setGlobalState('noksBalance', displayAsCurrency(noksBalance.toString(), NOK_NUM_DECIMALS));
    }
  });
};

const updateTotalSupply = (provider) => {
  getTokenSupply(CB_TOKEN, TOKEN_ABI, provider).then((s) => {
    setGlobalState('totalSupply', displayAsCurrency(s.toString(), NOK_NUM_DECIMALS));
  });
};

const updateNoksTotalSupply = (provider) => {
  getTokenSupply(CBS_TOKEN, CBS_TOKEN_ABI, provider).then((s) => {
    setGlobalState('totalNoksSupply', displayAsCurrency(s.toString(), NOK_NUM_DECIMALS));
  });
};

const setTransactionHistory = (history) => {
  setGlobalState('transactionHistory', history);
};

export {
  setGlobalState,
  useGlobalState,
  updateBalance,
  updateTotalSupply,
  updateNoksBalance,
  updateNoksTotalSupply,
  setTransactionHistory
};

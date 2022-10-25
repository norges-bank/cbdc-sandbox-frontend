import TOKEN_ABI from '../abis/CBToken.json';
import SWAP_ABI from '../abis/TokenSwap.json';
import CBS_TOKEN_ABI from '../abis/ERC1400.json';
import { DISPERSE_CONTRACT, CBS_TOKEN, TOKEN_SWAP_CONTRACT, CB_TOKEN } from '../constants';
import { useMemo } from 'react';
import { getContract } from '../utils/contract';
import { isAddress } from '../utils/address';
import { updateBalance, updateNoksBalance, updateTotalSupply } from '../state';

export const useContract = (address, ABI) => {
  // TODO: Retrieve provider, account and chainId from hook
  const { provider, chainId } = null;

  // const { account } = useWeb3React()

  return useMemo(() => {
    if (!address || !ABI || !provider || !chainId) return null;

    try {
      return getContract(address, ABI, provider);
    } catch (error) {
      console.error('Contract retrieval error: ', error);
      return null;
    }
  }, [address, ABI, provider, chainId]);
};

export const getTokenSupply = (address, abi, provider) => {
  const contract = getContract(address, abi, provider);
  const supply = contract.totalSupply();
  return supply;
};

export const getTokenBalance = async (address, abi, account, provider) => {
  if (!isAddress(account)) {
    return 0;
  }
  const contract = getContract(address, abi, provider);
  const balance = await contract.balanceOf(account);
  return balance;
};

export const approveDisperseContract = async (address, abi, amount, signer) => {
  const contract = getContract(address, abi, signer);
  const approve = await contract.approve(DISPERSE_CONTRACT, amount);
  return approve;
};

export const approveSwapContract = async (amount, signer) => {
  const contract = getContract(CB_TOKEN, TOKEN_ABI, signer);
  const approve = await contract.approve(TOKEN_SWAP_CONTRACT, amount);
  return approve;
};

export const swapNokToNoks = async (partition, amount, operatorData, signer) => {
  const contract = getContract(TOKEN_SWAP_CONTRACT, SWAP_ABI, signer);
  const result = await contract.swapCbToCbs(partition, amount, operatorData, {
    gasLimit: 10000000
  });
  return result;
};

export const authorizeOperator = async (partition, operator, signer) => {
  const contract = getContract(CBS_TOKEN, CBS_TOKEN_ABI, signer);
  const authorized = await contract.authorizeOperatorByPartition(partition, operator);
  return authorized;
};

export const swapNoksToNok = async (partition, amount, operatorData, signer) => {
  const contract = getContract(TOKEN_SWAP_CONTRACT, SWAP_ABI, signer);
  const result = await contract.swapCbsToCb(partition, amount, operatorData, {
    gasLimit: 10000000
  });
  return result;
};

export const transferTokens = async (token, abi, addressTo, amount, signer) => {
  const contract = getContract(token, abi, signer);
  const transfer = await contract.transfer(addressTo, amount);
  return transfer;
};

export const mintTokens = async (address, amount, signer) => {
  const contract = getContract(CB_TOKEN, TOKEN_ABI, signer);
  const minted = await contract.mint(address, amount);
  return minted;
};

export const burnTokens = async (address, amount, signer) => {
  const contract = getContract(CB_TOKEN, TOKEN_ABI, signer);
  const burned = await contract.burn(address, amount);
  return burned;
};

export const hasRole = async (address, role, provider) => {
  const contract = getContract(CB_TOKEN, TOKEN_ABI, provider);
  const isRole = await contract.hasRole(role, address);
  return isRole;
};

export const getTokenContract = (provider) => {
  return getContract(CB_TOKEN, TOKEN_ABI, provider);
};

export const listenToContract = (account, provider) => {
  getTokenContract(provider).on('Transfer', () => {
    updateTotalSupply(provider);
    if (account !== '') {
      updateBalance(account, provider);
      updateNoksBalance(account, provider);
    }
  });
};

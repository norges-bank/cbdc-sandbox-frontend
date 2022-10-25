import { ethers } from 'ethers';
import TOKEN_ABI from '../abis/CBToken.json';
import CBS_TOKEN_ABI from '../abis/ERC1400.json';

export const SUPPORTED_NETWORK = {
  chainId: '0x6C1',
  chainName: window.__RUNTIME_CONFIG__.REACT_APP_NETWORK,
  blockExplorerUrl: `https://blockscout.${window.__RUNTIME_CONFIG__.REACT_APP_NETWORK}.nahmii.io/`,
  rpcUrl: `https://rpc.${window.__RUNTIME_CONFIG__.REACT_APP_NETWORK}.nahmii.io/`
};

export const connectionInfo = {
  url: SUPPORTED_NETWORK.rpcUrl,
  user: window.__RUNTIME_CONFIG__.REACT_APP_RPC_AUTH_USERNAME,
  password: window.__RUNTIME_CONFIG__.REACT_APP_RPC_AUTH_PASSWORD
};

export const CONTRACT_CALL_SIGNATURE = {
  burn: '0x9dc29fac',
  transfer: '0xa9059cbb',
  mint: '0x40c10f19'
};

// export const TOKEN_ADDRESS = '0x6749374B18A571193138251EB52f7a9B4fC5524e'
export const TRANSFER_TOPIC = window.__RUNTIME_CONFIG__.REACT_APP_TRANSFER_TOPIC;

// export const DISPERSE_CONTRACT = '0x69414b811f7625C41c993301bAC455Ef86eEB3Db'

// "CB_TOKEN" : "abcdefghijklmnop0xAAdF806EDcbdA69D745a0fBaa03c80ea26aB0198qrstuvwxyz"
// "CBS_TOKEN" : "abcdefghijklmnop0x0b6A5f0Be3857b6026B4F32179dd40FFaE14BFd5qrstuvwxyz"
// "TOKEN_SWAP" : "abcdefghijklmnop0x8F39617924f67FB4E7f02499C9b84B703d5B2701qrstuvwxyz"

//bodo
export const DISPERSE_CONTRACT = window.__RUNTIME_CONFIG__.REACT_APP_DISPERSE_CONTRACT;
export const CB_TOKEN = window.__RUNTIME_CONFIG__.REACT_APP_CB_TOKEN;
export const CBS_TOKEN = window.__RUNTIME_CONFIG__.REACT_APP_CBS_TOKEN;
export const TOKEN_SWAP_CONTRACT = window.__RUNTIME_CONFIG__.REACT_APP_TOKEN_SWAP;

// RBAC roles on the token contract
export const BURNER_ROLE = ethers.utils.id('BURNER_ROLE');
export const MINTER_ROLE = ethers.utils.id('MINTER_ROLE');

// NOK Decimal resolution
export const NOK_NUM_DECIMALS = 4;

//NO and EN placeholder
export const NOK_DECIMAL_PLACEHOLDER = '0,0000';
export const DECIMAL_PLACEHOLDER = '0.0000';

export const TOKENS = {
  NOK: {
    address: CB_TOKEN,
    label: `NOK TOKEN`,
    decimal: NOK_NUM_DECIMALS,
    abi: TOKEN_ABI,
    key: 'NOK'
  },
  NOK_S: {
    address: CBS_TOKEN,
    label: `NOK-S TOKEN`,
    decimal: NOK_NUM_DECIMALS,
    abi: CBS_TOKEN_ABI,
    key: 'NOK_S'
  }
};

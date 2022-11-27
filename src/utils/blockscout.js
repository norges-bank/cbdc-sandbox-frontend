import { connectionInfo, SUPPORTED_NETWORK, TRANSFER_TOPIC } from '../constants';
import { encode } from 'base-64';

const BLOCKSCOUT_API_URL = `${SUPPORTED_NETWORK.blockExplorerUrl}api?`;

const BLOCKSCOUT_HEADER = new Headers({
  Authorization: 'Basic ' + encode(connectionInfo.user + ':' + connectionInfo.password),
  'Content-Type': 'application/json'
});

export const getBlockFromExplorer = async (timestamp) => {
  const params = new URLSearchParams({
    module: 'block',
    action: 'getblocknobytime',
    timestamp: timestamp,
    closest: 'before'
  });

  const response = await fetch(BLOCKSCOUT_API_URL + params, {
    headers: BLOCKSCOUT_HEADER
  });

  const { result } = await response.json();

  return (result && result.blockNumber) || '0';
};

export const getEventsFromExplorer = async (fromBlock, toBlock) => {
  const params = new URLSearchParams({
    module: 'logs',
    action: 'getLogs',
    fromBlock: fromBlock,
    toBlock: toBlock,
    topic0: TRANSFER_TOPIC
  });

  const response = await fetch(BLOCKSCOUT_API_URL + params, {
    headers: BLOCKSCOUT_HEADER
  });

  const { result } = await response.json();

  return result;
};

import React, { useState, useEffect } from 'react';
import { getCurrentWalletConnected } from '../../utils/interact';
import { setGlobalState, updateBalance, useGlobalState } from '../../state';

const ConnectButton = (props) => {
  const [account] = useGlobalState('account');
  const [, setStatus] = useState('');

  useEffect(() => {
    async function fetchWallet() {
      const { address, status } = await getCurrentWalletConnected();
      setGlobalState('account', address);
      updateBalance();
      setStatus(status);
      addWalletListener();
    }
    fetchWallet();
  }, []);

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setGlobalState('account', accounts[0]);
          updateBalance();
          setStatus('👆🏽 Write a message in the text-field above.');
        } else {
          setGlobalState('account', '');
          setStatus('🦊 Connect to Metamask using the top right button.');
        }
      });
    } else {
      setStatus(
        <p>
          {' '}
          🦊{' '}
          <a target="_blank" rel="noopener noreferrer" href={`https://metamask.io/download.html`}>
            You must install Metamask, a virtual Ethereum wallet, in your browser.
          </a>
        </p>
      );
    }
  }

  const { onClick } = props;

  return (
    <>
      <h6 className="wallet-address" style={{ cursor: 'pointer' }} onClick={onClick}>
        {account.length > 0 ? (
          'Connected: ' + String(account).substring(0, 10) + '...' + String(account).substring(38)
        ) : (
          <span>Connect Wallet</span>
        )}
      </h6>
    </>
  );
};

export default ConnectButton;

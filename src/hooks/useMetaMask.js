import { useState, useEffect, useMemo, useCallback } from 'react';
import { injected } from '../utils/injected';
import { useWeb3React } from '@web3-react/core';
import Swal from 'sweetalert2';

export const useMetaMask = () => {
  const { activate, account, active, deactivate } = useWeb3React();

  const [isActive, setIsActive] = useState(false);
  const [shouldDisable, setShouldDisable] = useState(false); // Should disable connect button while connecting to MetaMask
  const [isLoading, setIsLoading] = useState(true);

  const [isLoaded, setIsLoaded] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false); //this helps

  const { ethereum } = window;
  // Init Loading
  useEffect(() => {
    setIsLoaded(true);
    if (window.ethereum) {
      handleEthereum();
    } else {
      window.addEventListener('ethereum#initialized', handleEthereum, {
        once: true
      });

      // If the event is not dispatched by the end of the timeout,
      // the user probably doesn't have MetaMask installed.
      setTimeout(handleEthereum, 3000); // 3 seconds
    }

    async function handleEthereum() {
      // Access the decentralized web!

      connect().then(() => {
        setIsLoading(false);
      });
    }
  }, []);

  // Check when App is Connected or Disconnected to MetaMask
  const handleIsActive = useCallback(() => {
    console.log('App is connected with MetaMask ', active);
    setIsActive(active);
  }, [active]);

  useEffect(() => {
    handleIsActive();
    if (isLoaded) {
      setIsPageLoaded(true);
    }
  }, [handleIsActive, isLoaded]);

  const addBergenNetwork = async () => {
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x6C1' }]
      });
      window.location.reload();
    } catch (switchError) {
      // This error code indicates that the chain has not been added to MetaMask.
      if (switchError.code === 4902) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: '0x6C1',
                chainName: 'Bergen',
                rpcUrls: ['https://rpc.bergen.nahmii.io'] /* ... */,
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18
                },
                blockExplorerUrls: ['https://blockscout.bergen.nahmii.io/'],
                iconUrls: ''
              }
            ]
          });
        } catch (addError) {
          // handle "add" error
          console.error(addError);
        }
      }
      // handle other "switch" errors
    }
  };

  // Connect to MetaMask wallet
  const connect = async () => {
    console.log('Connecting to MetaMask...');
    setShouldDisable(true);
    try {
      if (ethereum && ethereum.isMetaMask) {
        await activate(injected, (error) => {
          if (error) {
            Swal.fire({
              title: 'Oops!',
              text: 'Please connect your wallet to Bergen network!',
              confirmButtonText: 'Click to add automatically',
              footer:
                '<a target="_blank" rel="noreferrer noopener" href="https://rpc.info/">or click here to add manually</a>'
            }).then((result) => {
              if (result.isConfirmed) {
                addBergenNetwork();
              }
            });
          }
        });
      } else {
        if (isPageLoaded) {
          Swal.fire({
            title: 'Oops!',
            text: 'Metamask is needed to proceed',
            confirmButtonText: 'Download and Install now'
          }).then((result) => {
            if (result.isConfirmed) {
              window.open('https://metamask.io/download/', '_blank');
            }
          });
        }
      }
    } catch (error) {
      console.log('Error on connecting: ', error);
    }
  };

  // Disconnect from Metamask wallet
  const disconnect = async () => {
    console.log('Disconnecting wallet from App...');
    try {
      await deactivate();
    } catch (error) {
      console.log('Error on disconnnect: ', error);
    }
  };

  const getCurrentWalletConnected = async () => {
    try {
      if (window.ethereum) {
        if (account) {
          return account;
        } else {
          Swal.fire({
            title: 'Oops!',
            text: 'Metamask is needed to access this site',
            confirmButtonText: 'Download now'
          }).then((result) => {
            if (result.isConfirmed) {
              window.open('https://metamask.io/download/', '_blank');
            }
          });
        }
      } else {
        console.log('Install Metamask');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const values = useMemo(
    () => ({
      isActive,
      account,
      isLoading,
      connect,
      disconnect,
      getCurrentWalletConnected,
      shouldDisable
    }),
    [isActive, isLoading, shouldDisable, account]
  );

  return values;
};

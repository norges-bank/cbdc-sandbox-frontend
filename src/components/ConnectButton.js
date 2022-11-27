import React, { useState, useEffect, useRef } from 'react';
import { useWeb3React } from '@web3-react/core';
import Swal from 'sweetalert2';
import { useMetaMask } from '../hooks/useMetaMask';
import { useGlobalState } from '../state';
import { lookupAddressName } from '../utils/address';
import { Tooltip, Typography, Stack, Box } from '@mui/material';
import SelectWalletModal from '../views/auth/elements/SelectWalletModal';
import Image from './elements/Image';
import { ContentCopyOutlined } from '@mui/icons-material';

const ConnectButton = () => {
  const [, setWallet] = useState('');
  const [, setStatus] = useState('');

  // handle modal
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [addressBook] = useGlobalState('addressBook');

  const [openTooltip, setOpenTooltip] = useState(false);
  const timeout = useRef(null);

  const copyAddress = () => {
    setOpenTooltip(true);
    navigator.clipboard.writeText(account);
    timeout.current = setTimeout(() => {
      setOpenTooltip(false);
    }, 750);
  };

  const { account } = useWeb3React();
  const { disconnect } = useMetaMask();

  useEffect(() => {
    async function fetchWallet() {
      addWalletListener();
    }
    fetchWallet();
  }, []);

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setWallet(accounts[0]);
          setStatus('👆🏽 Write a message in the text-field above.');
        } else {
          console.log('Please connect to Nahmii network');
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

  // eslint-disable-next-line no-unused-vars
  const disconnectWallet = () => {
    Swal.fire({
      title: 'Warning!',
      text: 'Disconnect?',
      confirmButtonText: "Yes, I'm sure!"
    }).then((result) => {
      console.log(result);
      if (result.isConfirmed) {
        disconnect();
        Swal.fire('Success!', 'Disconnected successfully!', 'success');
      }
    });
  };

  return (
    <div className="center">
      {open ? <SelectWalletModal open={open} onClose={handleClose} /> : null}
      <Stack direction="row">
        <Image
          className="wallet-image"
          src={`https://avatars.dicebear.com/api/jdenticon/${account}.svg?r=50`}
          style={{ marginTop: '10px', cursor: 'pointer', paddingRight: '16px', width: '56px' }}
          onClick={handleOpen}
        />
        <Box>
          <Typography
            variant="p"
            color="text.secondary"
            sx={{ fontSize: 12, cursor: 'pointer' }}
            onClick={handleOpen}>
            WALLET
          </Typography>
          <Stack direction="row" spacing={1}>
            <Typography
              sx={{ cursor: 'pointer' }}
              className="card-text"
              variant="h6"
              onClick={handleOpen}>
              {account === '' ? 'Connect wallet' : `${lookupAddressName(account, addressBook)}`}
            </Typography>
            {account === '' ? (
              ''
            ) : (
              <Tooltip
                arrow
                title="Copied!"
                open={openTooltip}
                disableFocusListener
                disableHoverListener
                disableTouchListener>
                <ContentCopyOutlined
                  style={{ marginTop: '-8px', marginBottom: '8px' }}
                  sx={{ cursor: 'pointer' }}
                  onClick={copyAddress}></ContentCopyOutlined>
              </Tooltip>
            )}
          </Stack>
        </Box>
      </Stack>
    </div>
  );
};

export default ConnectButton;

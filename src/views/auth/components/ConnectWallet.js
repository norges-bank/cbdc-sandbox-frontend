import React, { useState, useRef } from 'react';
import Image from '../../../components/elements/Image';
import { Stack, Typography, Tooltip, Box } from '@mui/material';
import { useGlobalState } from '../../../state';
import { lookupAddressName } from '../../../utils/address';
import { ContentCopyOutlined } from '@mui/icons-material';

const ConnectWallet = ({ onClick }) => {
  // handle modal

  const [account] = useGlobalState('account');
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

  return (
    <Stack direction="row" spacing={2} alignItems="center">
      <Stack direction="row" onClick={onClick}>
        <Image
          className="wallet-image"
          src={`https://avatars.dicebear.com/api/jdenticon/${account}.svg?r=50`}
          style={{ marginTop: '10px', cursor: 'pointer', paddingRight: '16px', width: '56px' }}
        />
        <Box>
          <Typography variant="p" color="text.secondary" sx={{ fontSize: 12, cursor: 'pointer' }}>
            WALLET
          </Typography>
          <Stack direction="row" spacing={1}>
            <Typography sx={{ cursor: 'pointer' }} className="card-text" variant="h6">
              {account === '' ? 'Connect wallet' : `${lookupAddressName(account, addressBook)}`}
            </Typography>
          </Stack>
        </Box>
      </Stack>
      <Stack direction="row">
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
              style={{ marginBottom: '-5px' }}
              sx={{ cursor: 'pointer' }}
              onClick={copyAddress}></ContentCopyOutlined>
          </Tooltip>
        )}
      </Stack>
    </Stack>
  );
};

export default ConnectWallet;

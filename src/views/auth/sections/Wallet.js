import React, { useState } from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import SelectWalletModal from '../elements/SelectWalletModal';
import { useGlobalState } from '../../../state';
import ConnectWallet from '../components/ConnectWallet';

const cardStyle = {
  boxShadow: 0,
  borderRadius: 0,
  height: '100%'
};

const Wallet = () => {
  // handle modal
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [balance] = useGlobalState('balance');

  return (
    <Card sx={cardStyle}>
      {open ? <SelectWalletModal open={open} onClose={handleClose} /> : null}
      <CardContent>
        <Grid container spacing={2} sx={{ mb: -1 }}>
          <Grid item xs={12} sm={7} md={7}>
            <ConnectWallet onClick={handleOpen} />
          </Grid>
          <Grid item xs={12} sm={5} md={5}>
            <Typography variant="p" color="text.secondary" sx={{ fontSize: 12 }}>
              BALANCE
            </Typography>
            <Typography className="card-text" variant="h6">
              {balance} NOK
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Wallet;

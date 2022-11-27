import React, { useState } from 'react';
import SelectWalletModal from '../../elements/SelectWalletModal';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { useGlobalState } from '../../../../state';
import ConnectWallet from '../../components/ConnectWallet';

const cardStyle = {
  boxShadow: 0,
  borderRadius: 0,
  height: '100%'
};

const Balance = () => {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [balance] = useGlobalState('balance');
  const [noksBalance] = useGlobalState('noksBalance');

  return (
    <Card sx={cardStyle}>
      {open ? <SelectWalletModal open={open} onClose={handleClose} /> : null}
      <CardContent>
        <Grid container spacing={3}>
          <Grid item sm={12} md={12} xs={12}>
            <ConnectWallet onClick={handleOpen} />
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <div className="border-right">
              <Typography variant="p" color="text.secondary" sx={{ fontSize: 12 }}>
                NOK BALANCE
              </Typography>
              <Typography variant="h6" className="card-text">
                {balance} NOK
              </Typography>
            </div>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Typography variant="p" color="text.secondary" sx={{ fontSize: 12 }}>
              NOK-S BALANCE
            </Typography>
            <Typography variant="h6" className="card-text">
              {noksBalance} NOK-S
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Balance;

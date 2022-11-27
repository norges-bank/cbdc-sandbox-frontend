import React, { useEffect } from 'react';
import LayoutDefault from '../../layouts/LayoutDefault';
import { Box, Grid } from '@mui/material';
import Supply from './sections/swap/Supply';
import Balance from './sections/swap/Balance';
import SwapTokens from './sections/swap/SwapTokens';

import {
  useGlobalState,
  updateBalance,
  updateNoksBalance,
  updateNoksTotalSupply,
  updateTotalSupply
} from '../../state';

const Swap = () => {
  const [account] = useGlobalState('account');
  const [provider] = useGlobalState('provider');

  useEffect(() => {
    updateBalance(account, provider);
    updateNoksBalance(account, provider);

    updateTotalSupply(provider);
    updateNoksTotalSupply(provider);
    provider.removeAllListeners();

    return () => {
      provider.removeAllListeners();
    };
  }, [account]);

  return (
    <LayoutDefault>
      <div style={{ marginTop: '100px' }}>
        <Box className="container" sx={{ mt: 8, mb: 10 }}>
          <Grid container spacing={3} sx={{ mt: 5, mb: 5 }}>
            <Grid item xs={12} md={6} sm={6}>
              <Balance />
            </Grid>
            <Grid item xs={12} md={6} sm={6}>
              <Supply />
            </Grid>
            <Grid item xs={12} sm={12} md={12}>
              <SwapTokens />
            </Grid>
          </Grid>
        </Box>
      </div>
    </LayoutDefault>
  );
};

export default Swap;

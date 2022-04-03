import React, { useState } from 'react';
import { Card, Grid, Box, CardContent, Typography } from '@mui/material';
import LayoutDefault from '../../layouts/LayoutDefault';

import Supply from './sections/Supply'
import Wallet from './sections/Wallet';
import MintTokens from './sections/MintTokens'
import BurnTokens from './sections/BurnTokens'
import TransferTokens from './sections/TransferTokens'

import SelectWalletModal from './components/SelectWalletModal'

const Dashboard = () => {
     // handle modal
     const [open, setOpen] = useState(false);
     const handleOpen = () => setOpen(true);
     const handleClose = () => setOpen(false);
    

    return (
        <LayoutDefault>
            { open ? (
                <SelectWalletModal open={handleOpen} onClose={handleClose} />
            ) : null }
            <Box className='container' sx={{mt: 10, mb: 10}}>
                <Grid container spacing={3} sx={{mt: 5, mb: 5}}>
                    <Grid item xs={12} md={4} sm={4}>
                        <Supply/>
                    </Grid>
                    <Grid item xs={12} md={8} sm={8}>
                        <Wallet />
                        
                    </Grid>
                    <Grid item xs={12} md={6} sm={6}>
                        <Box sx={{mb: 3}}>
                            <MintTokens/>
                        </Box>
                        <BurnTokens/>
                    </Grid>
                    <Grid item xs={12} md={6} sm={6}>
                        <TransferTokens/>
                    </Grid>
                </Grid>
            </Box>
        </LayoutDefault>
    )
}

export default Dashboard
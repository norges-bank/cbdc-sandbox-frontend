import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { useGlobalState } from '../../../../state';

const cardStyle = {
  boxShadow: 0,
  borderRadius: 0,
  padding: 0.5,
  height: '100%'
};

const Supply = () => {
  const [totalSupply] = useGlobalState('totalSupply');
  const [totalNoksSupply] = useGlobalState('totalNoksSupply');

  return (
    <Card sx={cardStyle}>
      <CardContent>
        <Grid container spacing={4.4}>
          <Grid item sm={12} md={12} xs={12}>
            <Typography variant="h6">CIRCULATING SUPPLY</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <div className="border-right">
              <Typography variant="p" color="text.secondary" sx={{ fontSize: 12 }}>
                NOK BALANCE
              </Typography>
              <Typography variant="h6" className="card-text">
                {totalSupply} NOK
                {/* {Number(totalSupply.replace(/,/g, '')).toFixed(4)} NOK */}
              </Typography>
            </div>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Typography variant="p" color="text.secondary" sx={{ fontSize: 12 }}>
              NOK-S BALANCE
            </Typography>
            <Typography variant="h6" className="card-text">
              {totalNoksSupply} NOK-S
              {/* {parseFloat(totalNoksSupply).toFixed(4)} NOK-S */}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default Supply;

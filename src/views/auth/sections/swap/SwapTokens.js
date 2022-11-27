import React, { useState } from 'react';
import { ethers } from 'ethers';
import Image from '../../../../components/elements/Image';
import Button from '../../../../components/elements/Button';
import SwapRight from '../../../../assets/images/swap.svg';
import SwapLeft from '../../../../assets/images/swap-left.svg';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Snackbar
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import {
  useGlobalState,
  updateBalance,
  updateNoksBalance,
  updateTotalSupply,
  updateNoksTotalSupply
} from '../../../../state';
import {
  approveSwapContract,
  swapNokToNoks,
  swapNoksToNok,
  authorizeOperator
} from '../../../../hooks/useContract';

import { NOK_NUM_DECIMALS, TOKEN_SWAP_CONTRACT } from '../../../../constants';
import { limitDecimalPlaces, localePlaceholder } from '../../../../utils/format';

const cardStyle = {
  boxShadow: 0,
  borderRadius: 0
};

const inputProps = {
  backgroundColor: '#F2F8FA',
  border: 'none',
  height: '50px',
  outline: 'none',
  ariaLabel: 'weight',
  fontSize: '95%'
};

const SwapTokens = () => {
  const [nokAmount, setNokAmount] = useState('');
  const [noksAmount, setNoksAmount] = useState('');
  const [toText, setToText] = useState('TO');
  const [fromText, setFromText] = useState('FROM');
  const [isSwitched, setIsSwitch] = useState(false);

  const [balance] = useGlobalState('balance');
  const [noksBalance] = useGlobalState('noksBalance');

  const [account] = useGlobalState('account');
  const [provider] = useGlobalState('provider');
  const [signer] = useGlobalState('signer');

  const [btnText, setBtnText] = useState('SWAP');

  const [placeholder] = useState(localePlaceholder);

  // handle modal
  const handleClose = () => setOpen(false);

  //Snackbar alert parameter
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [, setError] = useState(false);

  const partition = window.__RUNTIME_CONFIG__.REACT_APP_PARTITION1;
  const operatorData = window.__RUNTIME_CONFIG__.REACT_APP_OPERATOR_DATA;

  const operator = TOKEN_SWAP_CONTRACT;

  const handleSwitch1 = () => {
    setIsSwitch(!isSwitched);
    setToText('FROM');
    setFromText('TO');
  };
  const handleSwitch2 = () => {
    setIsSwitch(!isSwitched);
    setToText('TO');
    setFromText('FROM');
  };

  const handleSwapNokToNoks = async () => {
    try {
      setSuccess(false);
      setOpen(false);
      setError(false);
      if (signer == null) {
        setOpen(true);
        setError(true);
        setMsg('Please connect a wallet.');
        return;
      }

      if (nokAmount <= 0 || nokAmount <= '0.0000' || nokAmount <= '0' || nokAmount === '') {
        setOpen(true);
        setError(true);
        setMsg('Cannot swap 0 NOK or less!');
        return;
      } else if (nokAmount > Number(balance.replace(/,/g, ''))) {
        setOpen(true);
        setError(true);
        setMsg('Insufficient balance!');
        return;
      } else {
        setBtnText('APPROVING...');
        const approve = await approveSwapContract(
          ethers.utils.parseUnits(String(nokAmount), NOK_NUM_DECIMALS),
          signer
        );
        await approve.wait();

        setBtnText('SWAPPING...');
        const swap = await swapNokToNoks(
          partition,
          ethers.utils.parseUnits(String(nokAmount), NOK_NUM_DECIMALS),
          operatorData,
          signer
        );
        await swap.wait();

        updateBalance(account, provider);
        updateNoksBalance(account, provider);

        updateTotalSupply(provider);
        updateNoksTotalSupply(provider);

        setBtnText('SWAP');
        setNokAmount('');

        setOpen(true);
        setSuccess(true);
        setMsg(`Swapped ${nokAmount} NOK to NOK-S successfully!`);
      }
    } catch (error) {
      console.error(error);
      setOpen(true);
      setError(true);
      setMsg('An unexpected error happened!');
      setBtnText('SWAP');
    }
  };

  const handleSwapNoksToNok = async () => {
    try {
      setSuccess(false);
      setOpen(false);
      setError(false);
      if (signer == null) {
        setOpen(true);
        setError(true);
        setMsg('Please connect a wallet.');
        return;
      }
      if (noksAmount <= 0 || noksAmount <= '0.0000' || noksAmount <= '0' || noksAmount === '') {
        setOpen(true);
        setError(true);
        setMsg('Cannot swap 0 NOK or less!');
        return;
      } else if (noksAmount > Number(balance.replace(/,/g, ''))) {
        setOpen(true);
        setError(true);
        setMsg('Insufficient balance!');
        return;
      } else {
        setBtnText('AUTHORIZING...');
        const isAuthorized = await authorizeOperator(partition, operator, signer);

        if (isAuthorized) {
          setBtnText('SWAPPING...');
          const swap = await swapNoksToNok(
            partition,
            ethers.utils.parseUnits(String(noksAmount), NOK_NUM_DECIMALS),
            operatorData,
            signer
          );
          await swap.wait();

          updateBalance(account, provider);
          updateNoksBalance(account, provider);

          updateTotalSupply(provider);
          updateNoksTotalSupply(provider);

          setBtnText('SWAP');
          setNoksAmount('');

          setOpen(true);
          setSuccess(true);
          setMsg(`Swapped ${noksAmount} NOK-S to NOK successfully!`);
        } else {
          setOpen(true);
          setError(true);
          setMsg('Operator not recognized!');
        }
      }
    } catch (error) {
      console.error(error);
      setOpen(true);
      setError(true);
      setMsg('An unexpected error happened!');
      setBtnText('SWAP');
    }
  };

  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  const handleInput = (event) => {
    limitDecimalPlaces(event, NOK_NUM_DECIMALS);
  };

  return (
    <Card sx={cardStyle}>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        <Alert
          onClose={handleClose}
          severity={success ? 'success' : 'error'}
          sx={{ width: '100%' }}>
          {msg}
        </Alert>
      </Snackbar>
      <CardContent>
        <Grid item sm={12} md={12} xs={12}>
          <Typography variant="h6">SWAP</Typography>
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={5.5} md={5.5}>
            <Typography variant="p" color="text.secondary" sx={{ fontSize: 12 }}>
              {fromText} <span style={{ float: 'right' }}>BALANCE: {balance}</span>
            </Typography>
            <TextField
              className="no-border"
              id="outlined-start-adornment"
              placeholder={noksAmount > 0 ? noksAmount : placeholder}
              value={nokAmount}
              onChange={(e) => setNokAmount(e.target.value)}
              onInput={handleInput}
              disabled={noksAmount > 0 ? true : false}
              sx={{ width: '100%' }}
              inputMode="decimal"
              InputProps={{
                type: 'number',
                endAdornment: <InputAdornment position="end">NOK</InputAdornment>,
                style: inputProps
              }}
            />
          </Grid>
          <Grid item xs={12} sm={1} md={1} style={{ cursor: 'pointer' }}>
            {!isSwitched ? (
              <Image
                src={SwapRight}
                style={{ marginTop: '30px', marginLeft: '10px' }}
                onClick={handleSwitch1}
              />
            ) : (
              <Image
                src={SwapLeft}
                style={{ marginTop: '30px', marginLeft: '10px' }}
                onClick={handleSwitch2}
              />
            )}
          </Grid>
          <Grid item xs={12} sm={5.5} md={5.5}>
            <Typography variant="p" color="text.secondary" sx={{ fontSize: 12 }}>
              {toText} <span style={{ float: 'right' }}>BALANCE: {noksBalance}</span>
            </Typography>
            <TextField
              className="no-border"
              id="outlined-start-adornment"
              placeholder={nokAmount > 0 ? nokAmount : placeholder}
              value={noksAmount}
              disabled={nokAmount > 0 ? true : false}
              onChange={(e) => setNoksAmount(e.target.value)}
              sx={{ width: '100%' }}
              onInput={handleInput}
              inputMode="decimal"
              InputProps={{
                type: 'number',
                endAdornment: <InputAdornment position="end">NOK-S</InputAdornment>,
                style: inputProps
              }}
            />
          </Grid>
          <Grid item xs={12} sm={12} md={12}>
            {!isSwitched ? (
              <Button
                style={{ color: 'white', float: 'right' }}
                onClick={handleSwapNokToNoks}
                className="button swap-button button-primary button-wide-mobile">
                {btnText}
              </Button>
            ) : (
              <Button
                style={{ color: 'white', float: 'right' }}
                onClick={handleSwapNoksToNok}
                className="button swap-button button-primary button-wide-mobile">
                {btnText}
              </Button>
            )}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default SwapTokens;

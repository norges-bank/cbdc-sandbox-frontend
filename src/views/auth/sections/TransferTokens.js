import React, { useState, useEffect } from 'react';
import {
  Card,
  Box,
  CardContent,
  Stack,
  Typography,
  TextField,
  Snackbar,
  MenuItem,
  Select
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import Button from '../../../components/elements/Button';
import Image from '../../../components/elements/Image';
import { transferTokens } from '../../../hooks/useContract';
import { isAddress, parseUnits } from 'ethers/lib/utils';
import { displayAsCurrency, limitDecimalPlaces, localePlaceholder } from '../../../utils/format';
import { useGlobalState, updateBalance, updateNoksBalance, setGlobalState } from '../../../state';
import { lookupAddressName } from '../../../utils/address';
import { TOKENS, NOK_NUM_DECIMALS } from '../../../constants';

const cardStyle = {
  boxShadow: 0,
  borderRadius: 0,
  height: '100%'
};

const inputProps = {
  backgroundColor: '#F2F8FA',
  border: 'none',
  height: '50px',
  outline: 'none',
  ariaLabel: 'weight',
  fontSize: '95%'
};

const TOKEN_LIST = Object.values(TOKENS);

const TransferTokens = () => {
  //Snackbar alert parameter
  const [open, setOpen] = useState(false);

  const handleClose = (_, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  const [account] = useGlobalState('account');
  const [addressBook] = useGlobalState('addressBook');
  const [balance] = useGlobalState('balance');
  const [noksBalance] = useGlobalState('noksBalance');
  const [provider] = useGlobalState('provider');
  const [signer] = useGlobalState('signer');
  const [amountToTransfer, setAmountToTransfer] = useState('');
  const [address, setAddress] = useState('');
  const [isMalformedAddress, setIsMalformedAddress] = useState(false);
  const [addressHelperText, setAddressHelperText] = useState('');
  const [msg, setMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [, setError] = useState(false);
  const [disableBtn, setDisableBtn] = useState(false);
  const [transferBtnText, setTransferBtnText] = useState('TRANSFER TOKENS');
  const [placeholder] = useState(localePlaceholder);
  const [walletBalance, setWalletBalance] = useState('0.0000');

  const [tokenAddress, setTokenAddress] = useState(TOKENS.NOK.address);
  const [tokenSymbol, setTokenSymbol] = useState('NOK');

  const [isNok, setIsNok] = useState(true);
  const [isNoks, setIsNoks] = useState(false);

  useEffect(() => {
    updateBalance(account, provider);
    updateNoksBalance(account, provider);
    provider.removeAllListeners();

    return () => {
      provider.removeAllListeners();
    };
  }, [account]);

  useEffect(() => {
    setWalletBalance(balance);
  }, [balance, noksBalance]);

  const handleChange = (event) => {
    event.preventDefault();
    setTokenAddress(event.target.value);
    if (tokenAddress === TOKENS.NOK_S.address) {
      setIsNoks(false);
      setIsNok(true);
      updateBalance(account, provider);
      setWalletBalance(balance);
      setTokenSymbol('NOK');
      return;
    }

    if (tokenAddress === TOKENS.NOK.address) {
      setIsNok(false);
      setIsNoks(true);
      updateNoksBalance(account, provider);
      setWalletBalance(noksBalance);
      setTokenSymbol('NOK-S');
      return;
    }
  };

  const handleClick = async () => {
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
      if (isAddress(address)) {
        if (isNok && isNoks === false) {
          if (amountToTransfer > Number(balance.replace(/,/g, ''))) {
            setOpen(true);
            setError(true);
            setMsg('Balance too low.');
          } else if (amountToTransfer > 0) {
            setGlobalState('loading', true);
            setDisableBtn(true);
            setTransferBtnText('TRANSFERRING TOKENS');

            const transactionResponse = await transferTokens(
              TOKENS.NOK.address,
              TOKENS.NOK.abi,
              address,
              parseUnits(amountToTransfer, NOK_NUM_DECIMALS),
              signer
            );
            await transactionResponse.wait();

            setOpen(true);
            setSuccess(true);
            setMsg(`Transferred ${amountToTransfer} NOK tokens successfully!`);
            updateBalance(account, provider);
            setGlobalState('loading', false);
            setDisableBtn(false);
            setTransferBtnText('TRANSFER TOKENS');
            setAddress('');
            setAmountToTransfer('');
          } else {
            setOpen(true);
            setError(true);
            setMsg('Cannot transfer 0 tokens.');
          }
          return;
        }

        if (isNoks && isNok === false) {
          if (amountToTransfer > Number(noksBalance.replace(/,/g, ''))) {
            setOpen(true);
            setError(true);
            setMsg('Balance too low.');
          } else if (amountToTransfer > 0) {
            setGlobalState('loading', true);
            setDisableBtn(true);
            setTransferBtnText('TRANSFERRING TOKENS');

            const transactionResponse = await transferTokens(
              TOKENS.NOK_S.address,
              TOKENS.NOK_S.abi,
              address,
              parseUnits(amountToTransfer, NOK_NUM_DECIMALS),
              signer
            );
            await transactionResponse.wait();

            setOpen(true);
            setSuccess(true);
            setMsg(`Transferred ${amountToTransfer} NOK-S tokens successfully!`);
            updateBalance(account, provider);
            setGlobalState('loading', false);
            setDisableBtn(false);
            setTransferBtnText('TRANSFER TOKENS');
            setAddress('');
            setAmountToTransfer('');
          } else {
            setOpen(true);
            setError(true);
            setMsg('Cannot transfer 0 tokens.');
          }
          return;
        }
      } else {
        setOpen(true);
        setError(true);
        setMsg('Malformed address. Please check again.');
        setIsMalformedAddress(true);
      }
    } catch (e) {
      setDisableBtn(false);
      setTransferBtnText('TRANSFER TOKENS');
      setGlobalState('loading', false);
    }
  };

  const handleTransferAmountChange = (event) => {
    setAmountToTransfer(event.target.value);
  };

  const handleAddressChange = (event) => {
    setAddress(event.target.value);
  };

  const handleTransferAmountInput = (event) => {
    limitDecimalPlaces(event, NOK_NUM_DECIMALS);
  };

  const handleAddressInput = () => {
    setAddressHelperText('');
    setIsMalformedAddress(false);
  };

  const handleAddressName = (_address) => {
    return lookupAddressName(_address, addressBook);
  };

  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

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
      <CardContent
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
        <Typography variant="h6" color="text.secondary" sx={{ fontSize: 18, color: '#153443' }}>
          TRANSFER TOKENS
        </Typography>

        <Box sx={{ mt: 3 }}>
          <Stack direction="row" spacing={2}>
            <Image
              className="wallet-image"
              src={`https://avatars.dicebear.com/api/jdenticon/${account}.svg?r=50`}
            />
            <Box className="neg-mt">
              <Typography variant="p" color="text.secondary" sx={{ fontSize: 12 }}>
                SEND FROM
              </Typography>
              <Typography className="card-text" variant="h6">
                {account ? handleAddressName(account) : '-'}
                <span style={{ position: 'absolute' }}></span>
              </Typography>
            </Box>
          </Stack>
        </Box>
        <Box sx={{ mt: 3 }}>
          <Stack direction="row" spacing={2}>
            <Box className="neg-mt">
              <Typography variant="p" color="text.secondary" sx={{ fontSize: 12 }}>
                SEND TO
              </Typography>
            </Box>
          </Stack>
          <TextField
            className="no-border"
            label="Address"
            id="outlined-start-adornment"
            value={address}
            onInput={handleAddressInput}
            onChange={handleAddressChange}
            error={isMalformedAddress}
            helperText={addressHelperText}
            sx={{ width: '100%' }}
            InputProps={{
              style: inputProps
            }}
          />
        </Box>
        <Stack
          component="form"
          sx={{
            '& .MuiTextField-root': { width: '100%' }
          }}
          noValidate
          autoComplete="off"
          display="flex"
          gap="1rem"
          direction="row">
          <Box>
            <Typography variant="p" color="text.secondary" sx={{ fontSize: 12 }}>
              SELECT TOKEN
            </Typography>
            <Select
              id="outlined-select-currency"
              placeholder="Select token"
              value={tokenAddress}
              onChange={handleChange}
              style={{ width: '100%', height: '50px' }}
              MenuProps={{ disableScrollLock: true }}
              size="small">
              {TOKEN_LIST.map((option) => (
                <MenuItem key={option.key} value={option.address}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Box>
            <Typography variant="p" color="text.secondary" sx={{ fontSize: 12 }}>
              ENTER AMOUNT
            </Typography>
            <TextField
              placeholder={placeholder}
              className="no-border"
              id="outlined-start-adornment"
              value={amountToTransfer}
              onChange={handleTransferAmountChange}
              onInput={handleTransferAmountInput}
              inputMode="decimal"
              InputProps={{
                type: 'number',
                style: inputProps
              }}
            />
          </Box>
        </Stack>

        <Box sx={{ mt: 3, mb: 3 }} display="flex" flexDirection="row">
          <div style={{ marginLeft: '1%', width: '50%' }}>
            <Typography variant="p" color="text.secondary" sx={{ fontSize: 10 }}>
              BALANCE &nbsp;{signer === null ? '' : `( ${tokenSymbol} )`}
            </Typography>
            <Typography className="card-text" variant="h6">
              {walletBalance}
            </Typography>
          </div>
          <div style={{ width: '50%', marginLeft: '5%' }}>
            <Typography variant="p" color="text.secondary" sx={{ fontSize: 10 }}>
              FEE
            </Typography>
            <Typography className="card-text" variant="h6">
              {displayAsCurrency('0')}
            </Typography>
          </div>
        </Box>
        <Button
          disabled={disableBtn}
          style={{ color: 'white', alignSelf: 'end' }}
          className="button button-primary button-wide-mobile"
          wide
          onClick={handleClick}>
          {transferBtnText}
        </Button>
      </CardContent>
    </Card>
  );
};

export default TransferTokens;

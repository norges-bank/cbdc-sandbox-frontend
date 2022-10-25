import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
// import { useWeb3React } from '@web3-react/core';
import LayoutDefault from '../../layouts/LayoutDefault';
import Button from '../../components/elements/Button';
// import PropTypes from 'prop-types'
import TOKEN_ABI from '../../abis/CBToken.json';
import CBS_TOKEN_ABI from '../../abis/ERC1400.json';
import DISPERSE_ABI from '../../abis/multi-transfer.json';
import SelectWalletModal from './elements/SelectWalletModal';
import { DISPERSE_CONTRACT, CB_TOKEN, NOK_NUM_DECIMALS, CBS_TOKEN, TOKENS } from '../../constants';
import { getContract } from '../../utils/contract';
import { Box, TextField, MenuItem, Grid, Snackbar, Select, Typography } from '@mui/material';
import { useGlobalState, updateBalance, updateNoksBalance } from '../../state';
import { isAddress, shortenAddress } from '../../utils/address';
import { commify } from '../../utils/format';
import { approveDisperseContract } from '../../hooks/useContract';

import ClearIcon from '@mui/icons-material/Clear';

import MuiAlert from '@mui/material/Alert';
import ConnectWallet from './components/ConnectWallet';

const TOKEN_LIST = Object.values(TOKENS);
const REFERENCE_LIMIT = 30;

const MultiTransfer = () => {
  const [tokenAddress, setTokenAddress] = useState(TOKENS.NOK.address);
  const [load, setLoad] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [recepientsAddress, setRecepientsAddress] = useState([]);
  const [invalidInput, setInvalidInput] = useState(false);
  const [amount, setAmount] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentRef, setPaymentRef] = useState('');
  const [buttonText, setButtonText] = useState('SEND TOKEN');

  const [walletBalance, setWalletBalance] = useState('');
  const [tokenSymbol, setTokenSymbol] = useState('');

  const [isNok, setIsNok] = useState(false);
  const [isNoks, setIsNoks] = useState(false);

  const [open, setOpen] = useState(false);
  // handle modal
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [account] = useGlobalState('account');
  const [balance] = useGlobalState('balance');
  const [noksBalance] = useGlobalState('noksBalance');

  //Snackbar alert parameter
  const handleCloseSnack = () => setOpenSnack(false);

  const [openSnack, setOpenSnack] = useState(false);
  const [msg, setMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [, setError] = useState(false);

  const [provider] = useGlobalState('provider');
  const [signer] = useGlobalState('signer');

  useEffect(() => {
    // false == retain current user input on edit
    clearParsedMultisendData(false);

    handleMultisendInput();
    calculateBalance();
  }, [textInput]);

  useEffect(() => {
    updateBalance(account, provider);
    updateNoksBalance(account, provider);
    provider.removeAllListeners();

    return () => {
      provider.removeAllListeners();
    };
  }, [account]);

  useEffect(() => {
    calculateTotal();
  }, [amount]);

  const clearParsedMultisendData = (clearUserText = true) => {
    if (clearUserText) setTextInput('');
    setInvalidInput(false);
    setAmount([]);
    setRecepientsAddress([]);
    setTotalAmount(0);
    setButtonText('SEND TOKEN');
    setPaymentRef('');
  };

  const getBalance = async (e) => {
    e.preventDefault();
    if (tokenAddress === TOKENS.NOK.address) {
      setTokenSymbol('NOK');
      setIsNoks(false);
      setIsNok(true);
      await updateBalance(account, provider);
      setWalletBalance(balance);
    }

    if (tokenAddress === TOKENS.NOK_S.address) {
      setTokenSymbol('NOK-S');
      setIsNok(false);
      setIsNoks(true);
      await updateNoksBalance(account, provider);
      setWalletBalance(noksBalance);
    }

    setLoad(true);
    return null;
  };

  const calculateBalance = () => {
    if (isNok && isNoks === false) {
      const theBalance = Number(balance.replace(/,/g, '')) - totalAmount;
      return commify(theBalance.toFixed(NOK_NUM_DECIMALS).toString());
    } else {
      const theBalance = Number(noksBalance.replace(/,/g, '')) - totalAmount;
      return commify(theBalance.toFixed(NOK_NUM_DECIMALS).toString());
    }
  };

  const handleChangeToken = (event) => {
    setTokenAddress(event.target.value);
  };

  const handleChangePaymentRef = (event) => {
    const limitRef = event.target.value.slice(0, REFERENCE_LIMIT);
    setPaymentRef(limitRef);
  };

  const onChange = async (e) => {
    setTextInput(e.target.value);
  };

  // Remove whitespace, split by newline, split by comma
  const parseMulitsendLines = (text) => {
    return text
      .replaceAll(' ', '')
      .split(/\r?\n/)
      .map((line) => line.split(','));
  };

  // Split array of n into format [ [d1, d2, ..., d(batchSize-1)], .... ]
  const splitMultisendBatches = (arr) => {
    const batchSize = window.__RUNTIME_CONFIG__.REACT_APP_DISPERSE_BATCH_SIZE;
    if (!batchSize) throw new Error('Batching: batch size not set');

    return arr.reduce((res, item, index) => {
      const chunkIndex = Math.floor(index / batchSize);

      if (!res[chunkIndex]) res[chunkIndex] = [];
      res[chunkIndex].push(item);

      return res;
    }, []);
  };

  const handleMultisendInput = () => {
    if (!textInput) return;

    const splitLines = parseMulitsendLines(textInput);

    const batchAddresses = [];
    const batchValues = [];

    // splitlines in format [ [addr1, val1], [addr2,val2] ]
    splitLines.every((line, index) => {
      // ignore spaces between lines
      const ignoreEmptyLine = line.length === 1 && line[0] === '';
      if (ignoreEmptyLine) return true;

      // Catch rows with too many commas
      if (line.length !== 2) {
        setInvalidInput(true);
        setOpenSnack(true);
        setError(true);
        setMsg(`Invalid data on line ${index + 1}`);
        return false;
      }

      const [address, value] = line;

      const isValidAddress = isAddress(address);
      const isValidValue = !isNaN(value) && roundFloat(value, NOK_NUM_DECIMALS) > 0;

      // Catch rows with invalid values
      if (!isValidAddress || !isValidValue) {
        setInvalidInput(true);
        setOpenSnack(true);
        setError(true);
        setMsg(`Invalid data on line ${index + 1}`);
        return false;
      }

      // Round value to 4dp
      const formattedValue = roundFloat(value, NOK_NUM_DECIMALS).toString();

      batchAddresses.push(address);
      batchValues.push(formattedValue);

      return true;
    });

    // Split address/value arrays into predefined chunk size
    const addressChunks = splitMultisendBatches(batchAddresses);
    const valueChunks = splitMultisendBatches(batchValues);

    setRecepientsAddress(addressChunks);
    setAmount(valueChunks);
  };

  const roundFloat = (num, digits) => {
    const precision = 10 ** digits;
    const rounded = Math.round(num * precision) / precision;
    if (isNaN(rounded)) throw Error('Rounding : Invalid function input');
    return rounded;
  };

  const calculateTotal = async () => {
    let total = 0;

    try {
      if (amount.length === 0) return totalAmount;
      const sum = amount.flat().reduce((agg, n) => agg + parseFloat(n), 0);
      total = roundFloat(sum, NOK_NUM_DECIMALS);
      setTotalAmount(total);
      // eslint-disable-next-line no-unsafe-finally
      return total;
    } catch (error) {
      console.error('This error: ', error);
    }
  };

  const handleDisperse = async (e) => {
    e.preventDefault();
    try {
      if (totalAmount > Number(balance.replace(/,/g, ''))) {
        setOpenSnack(true);
        setError(true);
        setMsg('Insufficient balance!');
      } else {
        setButtonText('APPROVING FUNDS...');
        if (isNok && isNoks === false) {
          const approve = await approveDisperseContract(
            CB_TOKEN,
            TOKEN_ABI,
            ethers.utils.parseUnits(String(totalAmount), NOK_NUM_DECIMALS),
            signer
          );
          await approve.wait();

          setButtonText('SENDING NOK TOKENS...');
          const amountInDecimalsArr = amount.map((subArray) =>
            subArray.map((elem) => ethers.utils.parseUnits(String(elem), NOK_NUM_DECIMALS))
          );

          const contract = getContract(DISPERSE_CONTRACT, DISPERSE_ABI, signer);
          const paymentBytes = ethers.utils.formatBytes32String(paymentRef);

          for (const [index, address] of recepientsAddress.entries()) {
            const amount = amountInDecimalsArr[index];
            const dispersed = await contract.disperseTokenWithDataSimple(
              CB_TOKEN,
              address,
              amount,
              paymentBytes
            );
            await dispersed.wait();
            const lastArrIndex = recepientsAddress.length - 1;
            if (index === lastArrIndex) {
              setOpenSnack(true);
              setSuccess(true);
              setMsg(`Sent ${totalAmount} NOK tokens successfully!`);
              await updateBalance(account, provider);
              clearParsedMultisendData();
            }
          }
        }
        if (isNoks && isNok === false) {
          const approve = await approveDisperseContract(
            CBS_TOKEN,
            CBS_TOKEN_ABI,
            ethers.utils.parseUnits(String(totalAmount), NOK_NUM_DECIMALS),
            signer
          );
          await approve.wait();

          setButtonText('SENDING NOK-S TOKENS...');
          const amountInDecimalsArr = amount.map((subArray) =>
            subArray.map((elem) => ethers.utils.parseUnits(String(elem), NOK_NUM_DECIMALS))
          );

          const contract = getContract(DISPERSE_CONTRACT, DISPERSE_ABI, signer);
          const paymentBytes = ethers.utils.formatBytes32String(paymentRef);

          for (const [index, address] of recepientsAddress.entries()) {
            const amount = amountInDecimalsArr[index];
            const dispersed = await contract.disperseTokenWithDataSimple(
              CBS_TOKEN,
              address,
              amount,
              paymentBytes
            );
            await dispersed.wait();
            const lastArrIndex = recepientsAddress.length - 1;
            if (index === lastArrIndex) {
              setOpenSnack(true);
              setSuccess(true);
              setMsg(`Sent ${totalAmount} NOK-S tokens successfully!`);
              await updateNoksBalance(account, provider);
              clearParsedMultisendData();
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
      setOpenSnack(true);
      setError(true);
      setMsg('Something unexpected happened, try again!');
      clearParsedMultisendData();
      setButtonText('SEND TOKEN');
    }
  };

  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  // If error is found during parsing, set flag to block UI summary & send
  const validMultisendData = amount.length > 0 && !invalidInput;

  return (
    <LayoutDefault>
      <Snackbar open={openSnack} autoHideDuration={5000} onClose={handleCloseSnack}>
        <Alert
          onClose={handleCloseSnack}
          severity={success ? 'success' : 'error'}
          sx={{ width: '100%' }}>
          {msg}
        </Alert>
      </Snackbar>
      <div className="" style={{ marginTop: '100px' }}>
        {/* <Banner/> */}
        <Grid container spacing={3}>
          <Grid item xs={12} md={3} sm={3}></Grid>
          <Grid item xs={12} md={6} sm={6}>
            <div style={{ marginBottom: '2rem' }}>
              {open ? <SelectWalletModal open={open} onClose={handleClose} /> : null}
              <ConnectWallet onClick={handleOpen} />
            </div>

            {account ? (
              <Box>
                <span>
                  <Box
                    component="form"
                    sx={{
                      '& .MuiTextField-root': { mb: 1, mr: 2, width: '80%' }
                    }}
                    noValidate
                    autoComplete="off">
                    <Typography variant="p" color="text.secondary" sx={{ fontSize: 12 }}>
                      SELECT TOKEN
                    </Typography>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <Select
                        id="outlined-select-currency"
                        value={tokenAddress}
                        onChange={handleChangeToken}
                        style={{ width: '100%', height: '50px' }}
                        MenuProps={{ disableScrollLock: true }}
                        size="small">
                        {TOKEN_LIST.map((option) => (
                          <MenuItem key={option.address} value={option.address}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                      <Button className="load-btn button button-primary" onClick={getBalance}>
                        LOAD
                      </Button>
                    </div>
                    {load ? (
                      <span>
                        Balance: {walletBalance} {tokenSymbol} &nbsp;
                      </span>
                    ) : (
                      ''
                    )}
                  </Box>
                </span>
                <br />

                {load ? (
                  <span>
                    <h5>Recipients and amounts</h5>
                    <p>
                      Enter one address and amount in {tokenSymbol} on each line. Separate with
                      comma.
                    </p>
                    <Box
                      component="form"
                      sx={{
                        '& .MuiTextField-root': { m: 1, width: '100%' }
                      }}
                      noValidate
                      autoComplete="off"
                      className="">
                      <div>
                        <TextField
                          id="outlined-multiline-static"
                          multiline
                          value={textInput}
                          onChange={onChange}
                          placeholder="0xa7c8319a80445343d668966e52a9f9f410e53fc,1434.1111"
                          rows={4}
                        />
                      </div>
                      <br />

                      {validMultisendData ? (
                        <Box>
                          <h5>Transaction details</h5>
                          <Grid container>
                            <Grid item xs={4}>
                              <p style={{ fontWeight: 'bold' }}>Address</p>
                              <p>
                                {recepientsAddress.map((subArr) =>
                                  subArr.map((address, index) => (
                                    <span key={index}>
                                      {isAddress(address) ? (
                                        `${shortenAddress(address)}`
                                      ) : (
                                        <span>
                                          {address}{' '}
                                          <ClearIcon
                                            fontSize="small"
                                            style={{ position: 'absolute', marginTop: '3px' }}
                                            sx={{ color: 'red', mt: 2 }}
                                          />
                                        </span>
                                      )}
                                      <br />
                                    </span>
                                  ))
                                )}
                              </p>
                            </Grid>
                            <Grid item xs={8}>
                              <p style={{ textAlign: 'right', fontWeight: 'bold' }}>
                                Amount ( {tokenSymbol} )
                              </p>
                              <p style={{ textAlign: 'right' }}>
                                {amount.map((subArr) =>
                                  subArr.map((value, index) => (
                                    <span key={index}>
                                      {isNaN(value) ? (
                                        <span>
                                          {value}{' '}
                                          <ClearIcon
                                            fontSize="small"
                                            style={{ position: 'absolute', marginTop: '3px' }}
                                            sx={{ color: 'red', mt: 2 }}
                                          />{' '}
                                        </span>
                                      ) : (
                                        commify(value.toString())
                                      )}
                                      <br />
                                    </span>
                                  ))
                                )}
                              </p>
                            </Grid>
                            <Box
                              style={{
                                borderTop: '1px solid #babfc0',
                                width: '100%',
                                textAlign: 'right'
                              }}>
                              <p
                                style={{
                                  marginTop: '16px',
                                  marginBottom: '5px',
                                  fontWeight: 'bold'
                                }}>
                                Total amount
                              </p>
                              <p style={{ margin: 0 }}>
                                {commify(totalAmount.toFixed(NOK_NUM_DECIMALS).toString())}{' '}
                                {tokenSymbol}
                              </p>
                              <p
                                style={{
                                  marginTop: '16px',
                                  marginBottom: '5px',
                                  fontWeight: 'bold'
                                }}>
                                Remaining balance
                              </p>
                              <p style={{ margin: 0 }}>
                                {calculateBalance()} {tokenSymbol}
                              </p>
                            </Box>
                          </Grid>
                          <br />
                          <Box>
                            {validMultisendData ? (
                              <>
                                <Typography
                                  variant="p"
                                  color="text.secondary"
                                  sx={{ fontSize: 12 }}>
                                  REFERENCE (MAX {`${REFERENCE_LIMIT}`} CHARACTERS)
                                </Typography>
                                <TextField value={paymentRef} onChange={handleChangePaymentRef} />
                                <h5>Confirm transaction</h5>
                                {/* <p>Allow smart contract to transfer token on your behalf</p> */}
                                <Button
                                  onClick={handleDisperse}
                                  className="conn-btn button button-primary">
                                  {buttonText}
                                </Button>
                              </>
                            ) : (
                              ''
                            )}
                          </Box>
                        </Box>
                      ) : (
                        ''
                      )}
                    </Box>
                  </span>
                ) : (
                  ''
                )}
              </Box>
            ) : (
              ''
            )}
          </Grid>
        </Grid>
      </div>
    </LayoutDefault>
  );
};

MultiTransfer.propTypes = {};

export default MultiTransfer;

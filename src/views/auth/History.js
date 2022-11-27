import React, { useEffect, useState } from 'react';
import { Typography, Box, Card, CardContent, Snackbar, CircularProgress } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import MuiAlert from '@mui/material/Alert';
// import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import ReplayIcon from '@mui/icons-material/Replay';
import LayoutDefault from '../../layouts/LayoutDefault';
import { SUPPORTED_NETWORK } from '../../constants';
import { useGlobalState, setTransactionHistory } from '../../state';
import { BigNumber, ethers } from 'ethers';
import { timestampToDateTime, bigNumberToNumber } from '../../utils/format';
import { lookupAddressName } from '../../utils/address';
import { getLang } from '../../utils/intl';
import { getEventsFromExplorer } from '../../utils/blockscout';
import { storeItem, retrieveItem } from '../../utils/localStorage';
import {
  getTransactionType,
  getStartingIntervals,
  updateSwapEvent,
  getTokenType,
  isTokenSwap,
  isSwapContract
} from '../../utils/history';

const cardStyle = {
  boxShadow: 0,
  borderRadius: 0,
  p: 2
};

const History = () => {
  const [account] = useGlobalState('account');
  const [addressBook] = useGlobalState('addressBook');
  //Snackbar alert parameter
  const [openSnack, setOpenSnack] = useState(false);
  const [msg, setMsg] = useState('');
  const [success, setSuccess] = useState(false);

  // global historic state
  const [transactionHistory] = useGlobalState('transactionHistory');

  // Deconstruct state object
  const { transactions, toBlock, toBlockTimestamp } = transactionHistory;

  // Paginate state
  const [page, setPage] = useState(0);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [inRefresh, setInRefresh] = useState(false);

  const [error, setError] = useState(false);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  // constants
  const PAGE_SIZE = 10;
  const PAGE_BEFORE_END_PRELOAD = 5;
  const HISTORY_MIN_EVENT_SIZE = 500;
  const HISTORY_EVENT_OVERFLOW = 1000;
  const NO_HISTORY_EVENTS = 0;

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const storeTransactionHistory = (history) => {
    setTransactionHistory(history);

    // Store maximum of HISTORY_MIN_EVENT_SIZE entires in localstorage
    const historySliceIndex =
      history.transactions.length >= HISTORY_MIN_EVENT_SIZE
        ? HISTORY_MIN_EVENT_SIZE
        : history.transactions.length;
    const historySlice = history.transactions.slice(0, historySliceIndex);

    // Update cache values for newly sliced data
    const { blockNumber, blockTimestamp } = historySlice[historySliceIndex - 1];

    const cachedHistory = {
      ...history,
      transactions: historySlice,
      toBlock: blockNumber - 1,
      toBlockTimestamp: blockTimestamp
    };
    storeItem('history', cachedHistory);
  };

  const handleCloseAlert = (_, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnack(false);
    setSuccess(false);
  };

  // useEffect to trigger loading of new data when user
  // reaches end of paged table
  useEffect(() => {
    const extendTransactionHistory = async () => {
      await getEventHistory();
    };

    const currentPageRange = page * PAGE_SIZE + PAGE_SIZE;
    const preloadPageOffset = transactions.length - PAGE_BEFORE_END_PRELOAD * PAGE_SIZE;
    const smallTransactionCount = PAGE_SIZE >= transactions.length;

    const userOnFinalPage = currentPageRange >= preloadPageOffset && transactions.length > 0;

    // ignore trigger is currently loading or small tx count
    if ((userOnFinalPage || smallTransactionCount) && !pagesLoading) extendTransactionHistory();
  }, [page]);

  useEffect(() => {
    const extendTransactionHistory = async () => {
      await getEventHistory();
    };

    const updateCachedHistory = async (history) => {
      await refreshEventHistory(history, true);
    };

    setError(null);

    // Check if first entry to history
    if (transactions.length === 0 && !pagesLoading) {
      const cachedHistory = retrieveItem('history');
      // If history exists in localstorage, load and update from that point
      if (cachedHistory) {
        setTransactionHistory(cachedHistory);
        updateCachedHistory(cachedHistory);
        return;
      }

      // If no cached data, start full load
      extendTransactionHistory();
      return;
    }

    // Refresh history if data is already present
    updateCachedHistory(transactionHistory);
  }, []);

  // Format event log into history row
  const createEventRows = (events) => {
    let historyRows = [];

    for (const item of events) {
      let fromAddress = `0x${item.topics[1].slice(-40)}`;
      let toAddress = `0x${item.topics[2].slice(-40)}`;

      // Ignore swap contract transactions
      if (isSwapContract(fromAddress, toAddress)) continue;

      let token = getTokenType(item.address);
      let action = getTransactionType(account, fromAddress, toAddress);

      // If token swap, update event details to correctly display
      if (isTokenSwap(token, action)) {
        ({ token, action, fromAddress, toAddress } = updateSwapEvent(
          action,
          toAddress,
          fromAddress
        ));
      }

      historyRows.push({
        timestamp: timestampToDateTime(BigNumber.from(item.timeStamp).toNumber()),
        amount: new Intl.NumberFormat(getLang(), { minimumFractionDigits: 4 }).format(
          ethers.utils.formatUnits(BigNumber.from(item.data), 4)
        ),
        type: action,
        from: fromAddress,
        to: toAddress,
        currency: token,
        transactionHash: item.transactionHash,
        key: item.transactionHash + item.logIndex.toString(),
        blockNumber: bigNumberToNumber(item.blockNumber),
        blockTimestamp: bigNumberToNumber(item.timeStamp)
      });
    }

    return historyRows.reverse();
  };

  // Get event history from blockscout and parse into rows
  // NOTE: Blockscout can only return maximum of 1000 event logs, from earlier to latest.
  //       We also do not know the distribution of events so cannot precisely pick a starting point.
  //       This code sets a number of starting points from the last log received and
  //       attempts to fill a suitable buffer of data (HISTORY_MIN_EVENT_SIZE) without
  //       hitting this maximum limit.
  //       When user reaches near the end of the current range, this code is rerun from the last
  //       block received.
  // TODO: Refactor once indexing is available
  const getEventHistory = async () => {
    let events = [];

    setPagesLoading(true);
    if (transactions.length > 0) setInRefresh(true);

    try {
      const targetTimestamp = toBlockTimestamp ? toBlockTimestamp : new Date().getTime();
      const targetIntervals = await getStartingIntervals(targetTimestamp);

      for (const interval of targetIntervals) {
        events = await getEventsFromExplorer(interval, toBlock);
        if (events.length === HISTORY_EVENT_OVERFLOW) {
          let nextFromBlock = 0;
          do {
            events = await getEventsFromExplorer(nextFromBlock, toBlock);
            if (events.length === NO_HISTORY_EVENTS) return;
            nextFromBlock = bigNumberToNumber(events[events.length - 1].blockNumber);
          } while (events.length === HISTORY_EVENT_OVERFLOW);
          break;
        }

        if (events.length > HISTORY_MIN_EVENT_SIZE) break;
        if (interval === 0) break;
      }

      if (events.length === NO_HISTORY_EVENTS) return;

      const earliestEvent = events[0];
      const { blockNumber, timeStamp } = earliestEvent;

      const formattedData = createEventRows(events);
      const concatHistory = [...transactions, ...formattedData];

      storeTransactionHistory({
        transactions: concatHistory,
        toBlock: bigNumberToNumber(blockNumber) - 1,
        toBlockTimestamp: bigNumberToNumber(timeStamp) * 1000,
        latestBlock: bigNumberToNumber(concatHistory[0].blockNumber)
      });
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
      setError(true);
      setOpenSnack(true);
      setMsg(`Unable to load history`);
    } finally {
      setPagesLoading(false);
      if (transactions.length > 0) setInRefresh(false);
    }
  };

  // Update transactions with new data (if available)
  // NOTE: See getEventHistory() note for design decision
  // TODO: Refactor once indexing is available
  const refreshEventHistory = async (history, onPageLoad = false) => {
    let events = [];

    const { latestBlock } = history;
    let nextFromBlock = latestBlock + 1;

    setPagesLoading(true);
    setInRefresh(true);

    try {
      do {
        events = [...events, ...(await getEventsFromExplorer(nextFromBlock, 'latest'))];
        if (events.length === NO_HISTORY_EVENTS) {
          if (!onPageLoad) {
            setSuccess(true);
            setOpenSnack(true);
            setMsg(`History is up to date`);
          }
          return;
        }
        nextFromBlock = bigNumberToNumber(events[events.length - 1].blockNumber);
      } while (events.length % HISTORY_EVENT_OVERFLOW === 0);

      const formattedData = createEventRows(events);

      storeTransactionHistory({
        ...history,
        transactions: [...formattedData, ...transactions],
        latestBlock: bigNumberToNumber(events[events.length - 1].blockNumber)
      });

      setPage(0);
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
      setOpenSnack(true);
      setMsg(`Unable to update history`);
    } finally {
      setPagesLoading(false);
      setInRefresh(false);
    }
  };

  const refreshHistory = () => {
    !pagesLoading && refreshEventHistory(transactionHistory);
  };

  const columns = [
    { field: 'timestamp', headerName: 'Timestamp', width: 180, headerClassName: 'primary-color' },
    {
      field: 'from',
      headerName: 'From',
      width: 140,
      cellClassName: 'primary-color',
      renderCell: (params) => {
        return (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`${SUPPORTED_NETWORK.blockExplorerUrl}address/${params.row.from}`}>
            {lookupAddressName(params.row.from, addressBook)}
          </a>
        );
      }
    },
    {
      field: 'to',
      headerName: 'To',
      width: 140,
      cellClassName: 'primary-color',
      renderCell: (params) => {
        return (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`${SUPPORTED_NETWORK.blockExplorerUrl}address/${params.row.to}`}>
            {lookupAddressName(params.row.to, addressBook)}
          </a>
        );
      }
    },
    { field: 'type', headerName: 'Type', width: 100 },
    { field: 'amount', headerName: 'Amount', width: 160, cellClassName: 'primary-color' },
    {
      field: 'currency',
      headerName: 'Currency',
      width: 140,
      sortable: false
    },
    {
      field: 'transactionHash',
      headerName: ' ',
      cellClassName: 'primary-color',
      width: 150,
      sortable: false,
      renderCell: (params) => {
        return (
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`${SUPPORTED_NETWORK.blockExplorerUrl}tx/${params.row.transactionHash}`}>
            VIEW MORE
          </a>
        );
      }
    }
  ];

  const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });

  return (
    <LayoutDefault>
      <Box className="container" sx={{ mt: 12, mb: 10 }}>
        <Card sx={cardStyle}>
          <Snackbar open={openSnack} autoHideDuration={6000} onClose={handleCloseAlert}>
            <Alert
              onClose={handleCloseAlert}
              severity={success ? 'success' : 'error'}
              sx={{ width: '100%' }}>
              {msg}
            </Alert>
          </Snackbar>
          <CardContent>
            <Box display="flex">
              <Typography
                id="modal-modal-title"
                variant="p"
                sx={{ fontWeight: 'bold', fontSize: '14px', width: '90%' }}
                aria-controls={open ? 'basic-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                onClick={handleClick}>
                ALL TRANSACTIONS
                {/* <span style={{ position: 'absolute' }}>
                                <KeyboardArrowDownIcon />
                            </span> */}
              </Typography>
              <Typography
                id="modal-modal-title"
                variant="p"
                sx={{ fontWeight: 'bold', fontSize: '14px', color: '#0078A0', cursor: 'pointer' }}
                onClick={refreshHistory}>
                <span style={{ float: 'right' }}>
                  <span style={{ position: 'absolute', marginLeft: '-30px' }}>
                    <ReplayIcon />
                  </span>
                  Update
                </span>
              </Typography>
              {inRefresh && <CircularProgress sx={{ marginLeft: '2%' }} size={28} />}
            </Box>

            <Box
              component="form"
              sx={{
                '& .MuiTextField-root': { width: '100%' }
              }}
              noValidate
              autoComplete="off"
              style={{ marginTop: '20px', marginBottom: '20px' }}>
              <div className={'history-table'} style={{ height: 670, width: '100%' }}>
                <DataGrid
                  rows={transactions}
                  getRowId={(row) => row.key}
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[10]}
                  pagination
                  page={page}
                  onPageChange={(newPage) => setPage(newPage)}
                  loading={transactions.length === 0}
                  error={error}
                  sx={{
                    '& .MuiTablePagination-displayedRows': {
                      opacity: 0
                    }
                  }}
                />
              </div>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </LayoutDefault>
  );
};

export default History;

import React from 'react';
import { Card, Box, CardContent, Stack, Typography, TextField, InputProps, OutlinedInput, InputAdornment, FormControl, FilledInput, FormHelperText } from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Button from '../../../components/elements/Button'
import Image from '../../../components/elements/Image'
import WalletFace from '../../../assets/images/Wallet-Face.png'

const cardStyle = {
    boxShadow: 0, 
    borderRadius: 0,
}


const inputProps = {
    backgroundColor: "#F2F8FA", 
    border: "none", 
    height: "50px",
    outline: "none",
    ariaLabel: 'weight',
}

const TransferTokens = () => {
    return (
        <Card sx={cardStyle}>
            <CardContent>
                <Typography variant="h6" color="text.secondary" sx={{ fontSize: 18, color: "#153443" }}>
                    TRANSFER TOKENS
                </Typography>

                <Box sx={{mt: 3}}>
                    <Stack direction="row" spacing={2}>
                        <Image className="wallet-image" src={WalletFace} width="50" />
                        <Box>
                            <Typography variant="p" color="text.secondary" sx={{ fontSize: 10 }}>
                                SEND FROM
                            </Typography>
                            <Typography className="card-text" variant="h6">
                                0xE5aafC325cC5aafC325cC5aafC325cC5C325CTR4D6...<span style={{position: "absolute"}}><KeyboardArrowDownIcon /></span>
                            </Typography>
                            {/* <KeyboardArrowDownIcon sx={{mt: 1}} /> */}
                        </Box>
                    </Stack> 
                </Box>
                <Box sx={{mt: 3}}>
                    <Stack direction="row" spacing={2}>
                        <Image className="wallet-image" src={WalletFace} width="50" />
                        <Box>
                            <Typography variant="p" color="text.secondary" sx={{ fontSize: 10 }}>
                                SEND TO
                            </Typography>
                            <Typography className="card-text" variant="h6">
                                0xE5aafC325cC5aafC325cC5aafC325cC5C325CTRGH6...<span style={{position: "absolute"}}><KeyboardArrowDownIcon /></span>
                            </Typography>
                        </Box>
                    </Stack> 
                </Box>
                <Box sx={{mt: 3}}>
                    <Typography variant="p" color="text.secondary" sx={{ fontSize: 10 }}>
                        TOKEN TYPE
                    </Typography>
                    <Typography className="card-text" variant="h6">
                        NII <span style={{position: "absolute"}}><KeyboardArrowDownIcon /></span>
                    </Typography>
                </Box>

                <Box
                    component="form"
                    sx={{
                    '& .MuiTextField-root': { width: '100%' },
                    }}
                    noValidate
                    autoComplete="off"
                    style={{marginTop: "20px", marginBottom: "20px"}}
                >
                    <TextField
                        className='no-border'
                        label="Amount"
                        id="outlined-start-adornment"
                        value="0.0"
                        sx={{ width: '100%' }}
                        InputProps={{
                            endAdornment: <InputAdornment position="end">NOK</InputAdornment>,
                            style: inputProps
                        }}
                    />
                </Box>

                <Box sx={{mt: 3, mb: 3}}>
                    <Typography variant="p" color="text.secondary" sx={{ fontSize: 10 }}>
                        FEE
                    </Typography>
                    <Typography className="card-text" variant="h6">
                        0.25
                    </Typography>
                </Box>

                <Button className="button button-primary button-wide-mobile" wide>TRANSFER TOKENS</Button>
            </CardContent>
        </Card>
    )
}

export default TransferTokens
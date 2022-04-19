import React, { useEffect, useState } from 'react';
import { Stepper, Card, Box, Typography, Step, StepButton } from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff'
import SelectFile from '../components/SelectFile';
import EnterPassword from '../components/EnterPassword';
import { ethers } from 'ethers';
import { setGlobalState, useGlobalState } from '../../../state';

const steps = [1, 2]

const KeystoreWallet = (props) => {
    const { onClose, open, onBack } = props
    const [provider] = useGlobalState('provider')
    const [activeStep, setActiveStep] = useState(0)
    const [completed, setCompleted] = useState({})
    const [encryptedWallet, setEncryptedWallet] = useState(null)

    const totalSteps = () => {
        return steps.length
    }

    const allStepsCompleted = () => {
        return completedSteps() === totalSteps()
    }

    const completedSteps = () => {
        return Object.keys(completed).length
    }

    const onReceiveFile = (text) => {
        setEncryptedWallet(text)
        // TODO: Check if the passed file is actually a JSON file AND conforms to the keystore file standard.
        // TODO: Retrieve address from cipher.
        // TODO: store cipher data in local storage, make the address the key.
        setActiveStep(1)
    }

    const onDecryptWallet = async (password) => {
        try {
            let unlockedWallet = await ethers.Wallet.fromEncryptedJson(encryptedWallet, password)
            unlockedWallet = unlockedWallet.connect(provider)
            setGlobalState('account', await unlockedWallet.getAddress())
            setGlobalState('signer', unlockedWallet)
            onClose()
        } catch (error) {
            // TODO: Handle if a user fills in the wrong password.
            // Either propagate back to the password field that the password is wrong.
            console.log(error)
        }
    }

    return (
        <Card className=''>
                <Box sx={{ mt: 2, p: 2, borderBottom: "1px solid #CBE5EE"}}>
                    <Typography id='modal-modal-title' variant='p' sx={{ pl: 2, fomtSize: "12px" }}>
                        ACCESS WALLET WITH KEYSTORE FILE <span style={{ float: 'right' }}><HighlightOffIcon onClick={onClose} /></span>
                    </Typography>
                </Box>
                <Box sx={{ mt: 3 }}>
                    <Stepper nonLinear activeStep={activeStep} alternativeLabel>
                        {steps.map((label, index) => (
                            <Step key={label} completed={completed[index]}>
                                <StepButton color='#0078A0'>
                                </StepButton>
                            </Step>
                        ))}
                    </Stepper>
                    <Box sx={{}}>
                        {allStepsCompleted() ? (
                            <React.Fragment>
                                <p>All finished</p>
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <Typography variant='p' color='text.secondary' sx={{ mt: 2, pl: 3, fontSize: '12px' }}>Step {activeStep + 1}</Typography>
                                <Box>
                                    {(() => {
                                        switch (activeStep) {
                                            case 0:
                                                return <SelectFile onReceiveFile={onReceiveFile} onBack={onBack} />
                                            case 1:
                                                return <EnterPassword onDecryptWallet={onDecryptWallet} />
                                            default:
                                                return null
                                        }
                                    })()}
                                </Box>
                            </React.Fragment>
                        )}
                    </Box>
                </Box>
            </Card>
    )
}

export default KeystoreWallet
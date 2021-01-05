import { Container, Grid, Typography, AppBar, Box } from '@material-ui/core';
import Step from '@material-ui/core/Step/Step';
import StepLabel from '@material-ui/core/StepLabel/StepLabel';
import Stepper from '@material-ui/core/Stepper/Stepper';
import { SnackbarProvider } from 'notistack';
import React, { useEffect } from 'react';
import { Accounts } from 'src/containers/Accounts';
import { getContractInstance } from './utils/getContractInstance';

const voteSteps = ['test', 'yolo', 'troll', 'jerry'];

function App() {
  const [activeStep, setActiveStep] = React.useState<number>(0);

  async function getVoteStatus() {
    const instance = await getContractInstance();
    const lol = await instance.methods.workflowStatus().call();
    console.log('Jerry', lol);
  }

  useEffect(() => {
    getVoteStatus();
  }, []);

  return (
    <SnackbarProvider maxSnack={3} anchorOrigin={{ horizontal: 'right', vertical: 'top' }}>
      <AppBar position="static">
        <Box p={2}>
          <Typography variant="h4" align="center">
            Voting system
          </Typography>
        </Box>
      </AppBar>
      <Box mt={4}>
        <Container maxWidth="xl">
          <Grid container spacing={4}>
            <Grid item xs={8}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {voteSteps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Grid>
            <Grid item xs={4}>
              <Accounts />
            </Grid>
          </Grid>
        </Container>
      </Box>
    </SnackbarProvider>
  );
}

export default App;

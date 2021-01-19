import { Container, Typography, AppBar, Box } from '@material-ui/core';
import { SnackbarProvider } from 'notistack';
import React from 'react';
import { Web3Container } from './containers/Web3';

function App() {
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
          <Web3Container />
        </Container>
      </Box>
    </SnackbarProvider>
  );
}

export default App;

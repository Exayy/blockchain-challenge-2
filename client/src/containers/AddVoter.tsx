import { Box, BoxProps, Typography, TextField, Button } from '@material-ui/core';
import { useSnackbar } from 'notistack';
import React, { FC, useCallback, useState } from 'react';
import { Account } from 'src/constants/account';

type Props = {
  account: Account;
  contractInstance: any;
} & BoxProps;

export const AddVoterContainer: FC<Props> = ({ account, contractInstance, ...boxProps }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [addressInputValue, setAddressInputValue] = useState<string>('');
  const [isAddVoterPending, setIsAddVoterPending] = useState<boolean>(false);

  const addVoter = useCallback(
    async (address: string) => {
      setIsAddVoterPending(true);
      try {
        await contractInstance.methods.addVoter(address).send({ from: account.address });
        enqueueSnackbar('Votant ajouté avec succès', {
          variant: 'success',
        });
      } catch (e) {
        enqueueSnackbar("Erreur lors de l'ajout du votant", {
          variant: 'error',
        });
      } finally {
        setIsAddVoterPending(false);
      }
    },
    [setIsAddVoterPending, enqueueSnackbar, contractInstance, account]
  );

  return (
    <Box p={2} bgcolor="white" {...boxProps}>
      <Typography variant="h6">Ajouter un votant</Typography>
      <Box my={1}>
        <Typography variant="body1">
          Indiquez l'adresse d'une personne à ajouter comme votant
        </Typography>
      </Box>
      <Box mb={2}>
        <TextField
          label="Addresse du votant"
          fullWidth
          onChange={(e) => {
            setAddressInputValue(e.target.value);
          }}
        />
      </Box>
      <Button
        variant="contained"
        color="primary"
        disabled={!addressInputValue || isAddVoterPending}
        onClick={() => {
          addVoter(addressInputValue);
        }}
      >
        Valider
      </Button>
    </Box>
  );
};

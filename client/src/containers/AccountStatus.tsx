import { Box, BoxProps, Typography } from '@material-ui/core';
import { FC } from 'react';
import { Account, AccountsStatusLabel, AccountStatus } from 'src/constants/account';
import { VoteStatus } from 'src/constants/voteStatus';

type Props = {
  account: Account;
  voteStatus: VoteStatus;
} & BoxProps;

export const AccountStatusContainer: FC<Props> = ({ account, voteStatus, ...boxProps }) => {
  return (
    <Box p={2} bgcolor="white" {...boxProps}>
      <Typography variant="h6">Votre compte</Typography>
      <Box my={1}>
        <Typography variant="body1">Statut : {AccountsStatusLabel[account.status]}</Typography>
      </Box>
      <Box my={1}>
        <Typography variant="body1">Addresse : {account.address}</Typography>
      </Box>
      {voteStatus === VoteStatus.RegisteringVoters && account.status === AccountStatus.Unknown && (
        <Typography>
          Pour participer au vote, l'administrateur du vote doit vous ajouter.
        </Typography>
      )}
    </Box>
  );
};

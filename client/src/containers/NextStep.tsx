import React, { FC, useCallback, useState } from 'react';
import { VoteStatus } from 'src/constants/voteStatus';
import { Account } from 'src/constants/account';
import { useSnackbar } from 'notistack';
import { Box, BoxProps, Button, Typography } from '@material-ui/core';

type Props = {
  contractInstance: any;
  voteStatus: VoteStatus;
  account: Account;
} & BoxProps;

export const NextStepContainer: FC<Props> = ({
  contractInstance,
  voteStatus,
  account,
  ...boxProps
}) => {
  const [isUpdatingVoteStatus, setIsUpdatingVoteStatus] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();

  const updateVoteStatus = useCallback(async () => {
    setIsUpdatingVoteStatus(true);
    try {
      if (voteStatus === VoteStatus.RegisteringVoters) {
        await contractInstance.methods.startProposalsRegistration().send({ from: account.address });
      } else if (voteStatus === VoteStatus.ProposalsRegistrationStarted) {
        await contractInstance.methods.endProposalsRegistration().send({ from: account.address });
      } else if (voteStatus === VoteStatus.ProposalsRegistrationEnded) {
        await contractInstance.methods.startVotingSession().send({ from: account.address });
      } else if (voteStatus === VoteStatus.VotingSessionStarted) {
        await contractInstance.methods.endVotingSession().send({ from: account.address });
      } else if (voteStatus === VoteStatus.VotingSessionEnded) {
        await contractInstance.methods.tally().send({ from: account.address });
      } else {
        throw new Error('INVALID_VOTE_STATUS_UPDATE');
      }
    } catch (e) {
      enqueueSnackbar("Erreur : le vote n'a pas pu être mis à l'étape suivante", {
        variant: 'error',
      });
    } finally {
      setIsUpdatingVoteStatus(false);
    }
  }, [voteStatus, contractInstance, account, enqueueSnackbar]);

  return (
    <Box p={2} bgcolor="white" {...boxProps}>
      <Typography variant="h6">Aller à l'étape suivante du vote</Typography>
      <Box my={1}>
        <Typography variant="body1">
          En tant qu'administrateur c'est vous qui devez activer la prochaine étape du vote
        </Typography>
      </Box>
      <Button
        variant="contained"
        color="primary"
        disabled={isUpdatingVoteStatus}
        onClick={updateVoteStatus}
      >
        Valider
      </Button>
    </Box>
  );
};

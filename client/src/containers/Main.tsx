import { Box, Step, StepLabel, Stepper, Grid } from '@material-ui/core';
import { useSnackbar } from 'notistack';
import React, { FC, useCallback, useEffect, useState } from 'react';
import { Loader } from 'src/components/Loader';
import { Account, AccountStatus } from 'src/constants/account';
import { VoteStatus, VoteStatusLabel } from 'src/constants/voteStatus';
import { AccountStatusContainer } from './AccountStatus';
import { AddVoterContainer } from './AddVoter';
import { NextStepContainer } from './NextStep';
import { ProposalContainer } from './Proposal';

type Props = {
  account: Account;
  contractInstance: any;
};

export const MainContainer: FC<Props> = ({ account, contractInstance }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [voteStatus, setVoteStatus] = useState<VoteStatus | null>(null);

  const fetchVoteStatus = useCallback(async () => {
    try {
      const response = await contractInstance.methods.workflowStatus().call();
      setVoteStatus(parseInt(response));
    } catch {
      enqueueSnackbar("Erreur lors de la récupération de l'étape du vote", {
        variant: 'error',
      });
    }
  }, [contractInstance, enqueueSnackbar]);

  useEffect(() => {
    fetchVoteStatus();
  }, [fetchVoteStatus]);

  // Listen for vote status update
  useEffect(() => {
    contractInstance.events.WorkflowStatusChange(async function (error: any, event: any) {
      if (error) {
        enqueueSnackbar('Erreur lors de la mise à jour du status du vote, songez à recharger', {
          variant: 'error',
        });
        return;
      }
      setVoteStatus(parseInt(event.returnValues.newStatus));
    });
  }, [contractInstance, enqueueSnackbar]);

  if (voteStatus === null) {
    return <Loader message="Récupération de l'étape du vote ... Veuillez patienter ..." />;
  }

  return (
    <>
      <Box mb={4}>
        <Stepper activeStep={voteStatus !== null ? voteStatus : -1} alternativeLabel>
          {Object.values(VoteStatus)
            .filter((k) => typeof k !== 'string')
            .map((k: any) => {
              return (
                <Step key={k}>
                  <StepLabel>{VoteStatusLabel[k as VoteStatus]}</StepLabel>
                </Step>
              );
            })}
        </Stepper>
      </Box>
      <Grid container spacing={4}>
        <Grid item xs={6}>
          <AccountStatusContainer account={account} voteStatus={voteStatus} />
          {voteStatus === VoteStatus.RegisteringVoters &&
            account.status === AccountStatus.Administrator && (
              <AddVoterContainer mt={4} account={account} contractInstance={contractInstance} />
            )}
          {voteStatus !== VoteStatus.VotesTallied &&
            account.status === AccountStatus.Administrator && (
              <NextStepContainer
                mt={4}
                account={account}
                contractInstance={contractInstance}
                voteStatus={voteStatus}
              />
            )}
        </Grid>
        <Grid item xs={6}>
          <ProposalContainer
            account={account}
            contractInstance={contractInstance}
            voteStatus={voteStatus}
          />
        </Grid>
      </Grid>
    </>
  );
};

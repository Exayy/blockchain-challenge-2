import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  TextField,
  Button,
} from '@material-ui/core';
import React, { FC, useState, useCallback, useEffect } from 'react';
import HowToVoteIcon from '@material-ui/icons/HowToVote';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import { useSnackbar } from 'notistack';
import { VoteStatus } from 'src/constants/voteStatus';
import { Account, AccountStatus } from 'src/constants/account';

interface Proposal {
  description: string;
  voteCount: number;
  proposalId: string;
}

type Props = {
  voteStatus: VoteStatus;
  contractInstance: any;
  account: Account;
};

export const ProposalContainer: FC<Props> = ({ voteStatus, account, contractInstance }) => {
  const [proposals, setProposals] = useState<Array<Proposal>>([]);
  const [proposalInputValue, setProposalInputValue] = useState<string>('');
  const [isAddProposalPending, setIsAddProposalPending] = useState<boolean>(false);
  const [isVoting, setIsVoting] = useState<boolean>(false);
  const { enqueueSnackbar } = useSnackbar();

  const fetchProposals = useCallback(
    async (refreshAll: boolean = false) => {
      try {
        const proposalsLength = await contractInstance.methods.getProposalCount().call();
        const promises = [];
        // Proposal[0] is a fake proposal to avoid false winning proposal (check contract for extra details)
        for (let i = 1; i <= proposalsLength; i++) {
          promises.push(contractInstance.methods.proposals(i).call());
        }
        const res = await Promise.all(promises);
        const fetchedProposals: Array<Proposal> = res.map((r, index) => ({
          description: r.description,
          voteCount: parseInt(r.voteCount),
          proposalId: (index + 1).toString(),
        }));
        setProposals(fetchedProposals);
      } catch (e) {
        enqueueSnackbar('Erreur lors de la récupération des propositions', {
          variant: 'error',
        });
      }
    },
    [contractInstance, enqueueSnackbar]
  );

  const addProposal = async () => {
    setIsAddProposalPending(true);
    try {
      await contractInstance.methods
        .addProposal(proposalInputValue)
        .send({ from: account.address });
      enqueueSnackbar('Proposition ajoutée avec succès', {
        variant: 'success',
      });
    } catch (e) {
      enqueueSnackbar("Erreur lors de l'ajout de la proposition", {
        variant: 'error',
      });
    } finally {
      setIsAddProposalPending(false);
    }
  };

  const vote = async (proposalId: string) => {
    setIsVoting(true);
    try {
      await contractInstance.methods.vote(proposalId).send({ from: account.address });
      enqueueSnackbar('Vote effectué avec succès', {
        variant: 'success',
      });
    } catch (e) {
      enqueueSnackbar('Erreur lors du vote', {
        variant: 'error',
      });
    } finally {
      setIsVoting(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  // Listen for added proposal
  useEffect(() => {
    contractInstance.events.ProposalRegistered(async function (error: any, event: any) {
      if (error) {
        enqueueSnackbar("Erreur lors de l'ajout d'une nouvelle proposition, songez à recharger", {
          variant: 'error',
        });
        return;
      }
      const newProposal = await contractInstance.methods
        .proposals(event.returnValues.proposalId)
        .call();
      setProposals((currentProposals) => [
        ...currentProposals,
        {
          description: newProposal.description,
          voteCount: parseInt(newProposal.voteCount),
          proposalId: event.returnValues.proposalId,
        },
      ]);
    });
  }, [contractInstance, enqueueSnackbar]);

  // maximum vote count for one proposal
  const maxVoteCount = proposals.reduce((acc, p) => (p.voteCount > acc ? p.voteCount : acc), 0);
  const winningProposals = proposals.filter((p) => p.voteCount === maxVoteCount);

  // Listen for vote on proposal
  useEffect(() => {
    contractInstance.events.Voted(async function (error: any, event: any) {
      if (error) {
        enqueueSnackbar(
          'Erreur lors de la mise à jour des propositions suite à un vote, songez à recharger la page',
          {
            variant: 'error',
          }
        );
        return;
      }
      console.log('nice', event);
      setProposals((currentProposals) => {
        return currentProposals.map((proposal) => {
          return {
            ...proposal,
            voteCount:
              proposal.proposalId === event.returnValues.proposalId
                ? event.returnValues.totalVoteCount
                : proposal.voteCount,
          };
        });
      });
    });
  }, [contractInstance, enqueueSnackbar]);

  return (
    <>
      <Box bgcolor="white" p={2}>
        <Box mb={2}>
          <Typography variant="h6">Les propositions</Typography>
        </Box>

        {proposals.length === 0 ? (
          <Typography>Aucune proposition pour le moment</Typography>
        ) : (
          <TableContainer>
            <Table aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Nb de votes</TableCell>
                  <TableCell align="right"></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {proposals.map((proposal) => (
                  <TableRow key={proposal.proposalId}>
                    <TableCell component="th" scope="row">
                      {proposal.description}
                    </TableCell>
                    <TableCell align="right">{proposal.voteCount}</TableCell>
                    <TableCell align="right">
                      {account.status === AccountStatus.Voter &&
                        account.votedProposalId === proposal.proposalId && (
                          <CheckCircleIcon color="primary" />
                        )}
                      {(account.status !== AccountStatus.Voter ||
                        account.votedProposalId === '0') && (
                        <IconButton
                          disabled={
                            account.status !== AccountStatus.Voter ||
                            voteStatus !== VoteStatus.VotingSessionStarted ||
                            isVoting
                          }
                          onClick={() => {
                            vote(proposal.proposalId);
                          }}
                        >
                          <HowToVoteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {voteStatus === VoteStatus.VotingSessionStarted &&
              account.status === AccountStatus.Voter &&
              (account.votedProposalId === '0' ? (
                <Box bgcolor="orange" color="white" mt={2} p={2}>
                  C'est le moment de voter !
                </Box>
              ) : (
                <Box bgcolor="green" color="white" mt={2} p={2}>
                  Vous avez voté
                </Box>
              ))}
          </TableContainer>
        )}
      </Box>

      {voteStatus === VoteStatus.ProposalsRegistrationStarted &&
        account.status === AccountStatus.Voter && (
          <Box mt={4} bgcolor="white" p={2}>
            <Typography variant="h6">Ajouter une proposition</Typography>
            <Box my={3}>
              <Typography variant="body1">
                Durant cette étape du vote, vous pouvez en tant que votant faire des propositions
                qui pourront être voté lors de la phase de vote à proprement parlé.
              </Typography>
            </Box>
            <TextField
              label="Proposition"
              fullWidth
              onChange={(e) => {
                setProposalInputValue(e.target.value);
              }}
            />
            <Box mt={2}>
              <Button
                variant="contained"
                color="primary"
                disabled={!proposalInputValue || isAddProposalPending}
                onClick={async () => {
                  addProposal();
                }}
              >
                Ajouter
              </Button>
            </Box>
          </Box>
        )}

      {voteStatus === VoteStatus.VotesTallied && (
        <Box mt={4} bgcolor="white" p={2}>
          <Typography variant="h6">Résultats</Typography>
          <Box mt={2}>
            <Typography>
              {winningProposals.length === 1
                ? `Victoire de la proposition : ${winningProposals[0].description}`
                : `Egalité entre les propositions suivantes : ${winningProposals
                    .map((p) => p.description)
                    .join(', ')}`}
            </Typography>
          </Box>
        </Box>
      )}
    </>
  );
};

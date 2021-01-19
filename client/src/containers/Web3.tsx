import { useSnackbar } from 'notistack';
import { FC, useCallback, useEffect, useState } from 'react';
import { Loader } from 'src/components/Loader';
import { Account, AccountStatus } from 'src/constants/account';
import { getContractInstance } from 'src/utils/getContractInstance';
import { getWeb3 } from 'src/utils/web3';
import Web3 from 'web3';
import { MainContainer } from './Main';

export const Web3Container: FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [contractInstance, setContractInstance] = useState<any>(null);
  const [contractOwnerAddress, setContractOwnerAddress] = useState<string | null>(null);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [account, setAccount] = useState<Account | null>(null);

  const init = useCallback(async () => {
    try {
      const web3 = await getWeb3();
      const contractInstance = await getContractInstance(web3);
      const ownerAddress = await contractInstance.methods.owner().call();
      setWeb3(web3);
      setContractInstance(contractInstance);
      setContractOwnerAddress(ownerAddress);
    } catch (e) {
      enqueueSnackbar(
        "Erreur lors de l'initialisation de Web3, vérifiez votre connexion métamask",
        {
          variant: 'error',
        }
      );
    }
  }, [enqueueSnackbar]);

  const refreshAccountStatus = useCallback(async () => {
    if (!accountAddress) {
      return;
    }
    try {
      // case isn't consistent
      // but 'a' and 'A' it's the same for network
      if (
        contractOwnerAddress &&
        accountAddress.toLowerCase() === contractOwnerAddress.toLowerCase()
      ) {
        setAccount({
          status: AccountStatus.Administrator,
          address: accountAddress,
        });
        return;
      }
      const res = await contractInstance.methods.voters(accountAddress).call();
      if (res.isRegistered) {
        setAccount({
          status: AccountStatus.Voter,
          votedProposalId: res.votedProposalId,
          address: accountAddress,
        });
      } else {
        setAccount({
          status: AccountStatus.Unknown,
          address: accountAddress,
        });
      }
    } catch (e) {
      enqueueSnackbar('Erreur lors de récupération des détails du compte', {
        variant: 'error',
      });
    }
  }, [accountAddress, contractOwnerAddress, contractInstance, enqueueSnackbar]);

  // 1 - Initialize Web3 and Contract instances
  useEffect(() => {
    init();
  }, [init]);

  // 2 - Handle metamask accounts and change event
  useEffect(() => {
    if (!web3) {
      return;
    }

    // Get current accounts
    web3.eth
      .getAccounts()
      .then((accounts: Array<string>) => {
        setAccountAddress(accounts[0]);
      })
      .catch(() => {
        enqueueSnackbar('Erreur lors de la récupération du compte activé sur Metamask', {
          variant: 'error',
        });
      });

    // Registering for account change
    (window as any).ethereum.on('accountsChanged', (accounts: Array<string>) => {
      enqueueSnackbar('Changement de compte détecté, mise à jour en cours ...', {
        variant: 'info',
      });
      setAccountAddress(accounts[0]);
    });
  }, [web3, enqueueSnackbar]);

  // 3 - Get account details
  useEffect(() => {
    refreshAccountStatus();
  }, [refreshAccountStatus]);

  // Listen for account vote action
  useEffect(() => {
    if (!contractInstance) {
      return;
    }
    contractInstance.events.Voted(async function (error: any, event: any) {
      if (error) {
        enqueueSnackbar(
          "Erreur : Un vote a eu lieu mais nous n'avons pas réussi à déterminer si il s'agissait du vote, si tel est le cas songez à recharger la page.",
          {
            variant: 'error',
          }
        );
        return;
      }
      setAccount((currentAccount) => {
        if (
          currentAccount &&
          currentAccount.address.toLowerCase() === event.returnValues.voter.toLowerCase()
        ) {
          return {
            ...currentAccount,
            votedProposalId: event.returnValues.proposalId,
          };
        }
        return currentAccount;
      });
    });
  }, [contractInstance, enqueueSnackbar]);

  if (!web3 || !contractInstance || !contractOwnerAddress) {
    return (
      <Loader message="Initialisation de web3... Veuillez activer votre compte Metamask et patienter..." />
    );
  }

  if (!account) {
    return <Loader message="Récupération des données de votre compte... Veuillez patienter..." />;
  }

  return <MainContainer account={account} contractInstance={contractInstance} />;
};

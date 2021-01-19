import Voting from 'src/contracts/Voting.json';
import Web3 from 'web3';

export const getContractInstance = async (web3: Web3) => {
  const networkId: any = await web3.eth.net.getId();
  const deployedNetwork = Voting.networks[networkId as '5777'];
  return new web3.eth.Contract(Voting.abi as any, deployedNetwork && deployedNetwork.address);
};

import { getWeb3 } from 'src/utils/web3';
import Voting from 'src/contracts/Voting.json';

export const getContractInstance = async () => {
  const web3 = await getWeb3();

  const networkId: any = await web3.eth.net.getId();
  // TODO: try to find a better way to type this
  const deployedNetwork = Voting.networks[networkId as '5777'];

  // TODO: is instance should be create only once ?
  // TODO: try to find a better way to type this
  return new web3.eth.Contract(Voting.abi as any, deployedNetwork && deployedNetwork.address);
};

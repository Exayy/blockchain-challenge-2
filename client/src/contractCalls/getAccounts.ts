import { getWeb3 } from 'src/utils/web3';

export const getAccounts = async () => {
  const web3 = await getWeb3();

  return await web3.eth.getAccounts();
};

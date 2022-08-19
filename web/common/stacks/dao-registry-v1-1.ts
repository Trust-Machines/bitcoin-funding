import { stacksNetwork } from '../constants';
import { decodeBtcAddressToBuffer, getNonce } from './utils'
import {
  callReadOnlyFunction,
  makeContractCall,
  broadcastTransaction,
  cvToJSON,
  uintCV,
  bufferCV,
  AnchorMode
} from '@stacks/transactions';

const contractAddress = process.env.APP_ADDRESS as string;
const contractName = "dao-registry-v1-1";
const userAddress = process.env.USER_ADDRESS as string;
const userPrivateKey = process.env.USER_PRIVATE_KEY as string;

export async function getDaoCount(): Promise<number> {
  const call = await callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: 'get-dao-count',
    functionArgs: [],
    senderAddress: contractAddress,
    network: stacksNetwork,
  });

  const result = cvToJSON(call).value.value;
  return result;
}

export async function getDaoById(id: number): Promise<any> {
  const call = await callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: 'get-dao-by-id',
    functionArgs: [
      uintCV(id)
    ],
    senderAddress: contractAddress,
    network: stacksNetwork,
  });

  const result = cvToJSON(call).value;
  return result;
}

export async function getDaoIdByAddress(address: string): Promise<any> {
  const call = await callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: 'get-dao-id-by-address',
    functionArgs: [
      bufferCV(decodeBtcAddressToBuffer(address))
    ],
    senderAddress: contractAddress,
    network: stacksNetwork,
  });

  const result = cvToJSON(call).value;
  return result;
}

export async function isDaoRegistered(address: string): Promise<any> {
  const call = await callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: 'is-dao-registered',
    functionArgs: [
      bufferCV(decodeBtcAddressToBuffer(address))
    ],
    senderAddress: contractAddress,
    network: stacksNetwork,
  });

  const result = cvToJSON(call).value;
  return result;
}

export async function registerDao(address: string): Promise<any> {

  const nonce = await getNonce(userAddress)
  const txOptions = {
    contractAddress,
    contractName,
    functionName: "register-dao",
    functionArgs: [
      bufferCV(decodeBtcAddressToBuffer(address))
    ],
    senderKey: userPrivateKey,
    nonce: nonce,
    postConditionMode: 1,
    fee: (0.01 * 1000000),
    network: stacksNetwork,
    anchorMode: AnchorMode.Any
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction(transaction, stacksNetwork);
  return result;
}

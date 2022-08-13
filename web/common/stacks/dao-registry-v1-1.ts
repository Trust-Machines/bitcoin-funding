import { stacksNetwork } from '../constants';
import { getNonce } from './utils'
import { hexToBytes } from '../utils';
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

  const result = cvToJSON(call).value;
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

export async function getDaoByPublicKey(publicKey: string): Promise<any> {
  const call = await callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: 'get-dao-id-by-public-key',
    functionArgs: [
      bufferCV(Buffer.from(hexToBytes(publicKey)))
    ],
    senderAddress: contractAddress,
    network: stacksNetwork,
  });

  const result = cvToJSON(call).value;
  return result;
}

export async function isDaoRegistered(publicKey: string): Promise<any> {
  const call = await callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: 'is-dao-registered',
    functionArgs: [
      bufferCV(Buffer.from(hexToBytes(publicKey)))
    ],
    senderAddress: contractAddress,
    network: stacksNetwork,
  });

  const result = cvToJSON(call).value;
  return result;
}

export async function registerDao(publicKey: string): Promise<any> {
  const nonce = await getNonce(userAddress)
  const txOptions = {
    contractAddress,
    contractName,
    functionName: "register-dao",
    functionArgs: [
      bufferCV(Buffer.from(hexToBytes(publicKey)))
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

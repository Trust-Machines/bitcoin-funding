require('dotenv').config({ path: '../../.env' });
import { stacksNetwork } from '../constants';
import { getNonce } from './utils'
import { decodeBtcAddressToBuffer } from '../bitcoin/encoding';
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
const managerAddress = process.env.MANAGER_ADDRESS as string;
const managerPrivateKey = process.env.MANAGER_PRIVATE_KEY as string;

export async function getDaoCount(): Promise<number> {
  const call = await callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: 'get-dao-count',
    functionArgs: [],
    senderAddress: managerAddress,
    network: stacksNetwork,
  });

  const result = cvToJSON(call).value.value;
  return result;
}

export async function getDaoById(id: number): Promise<any> {
  const call = await callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: 'get-dao-address-by-id',
    functionArgs: [
      uintCV(id)
    ],
    senderAddress: managerAddress,
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
    senderAddress: managerAddress,
    network: stacksNetwork,
  });

  const result = cvToJSON(call).value.value;
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
    senderAddress: managerAddress,
    network: stacksNetwork,
  });

  const result = cvToJSON(call).value.value;
  return result;
}

export async function registerDao(address: string): Promise<any> {
  const nonce = await getNonce(managerAddress)

  const txOptions = {
    contractAddress,
    contractName,
    functionName: "register-dao",
    functionArgs: [
      bufferCV(decodeBtcAddressToBuffer(address))
    ],
    senderKey: managerPrivateKey,
    nonce: nonce,
    postConditionMode: 1,
    fee: (0.001 * 1000000),
    network: stacksNetwork,
    anchorMode: AnchorMode.Any
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction(transaction, stacksNetwork);
  return result;
}

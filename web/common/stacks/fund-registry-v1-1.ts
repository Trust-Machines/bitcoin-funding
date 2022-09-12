require('dotenv').config({ path: '../../.env' });
import { STACKS_NETWORK } from '../constants';
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
const contractName = "fund-registry-v1-1";
const managerAddress = process.env.MANAGER_ADDRESS as string;
const managerPrivateKey = process.env.MANAGER_PRIVATE_KEY as string;

export async function getFundCount(): Promise<number> {
  const call = await callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: 'get-fund-count',
    functionArgs: [],
    senderAddress: managerAddress,
    network: STACKS_NETWORK,
  });

  const result = cvToJSON(call).value.value;
  return result;
}

export async function getFundById(id: number): Promise<any> {
  const call = await callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: 'get-fund-address-by-id',
    functionArgs: [
      uintCV(id)
    ],
    senderAddress: managerAddress,
    network: STACKS_NETWORK,
  });

  const result = cvToJSON(call).value;
  return result;
}

export async function getFundIdByAddress(address: string): Promise<any> {
  const call = await callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: 'get-fund-id-by-address',
    functionArgs: [
      bufferCV(decodeBtcAddressToBuffer(address))
    ],
    senderAddress: managerAddress,
    network: STACKS_NETWORK,
  });

  const result = cvToJSON(call).value.value;
  return result;
}

export async function isFundRegistered(address: string): Promise<any> {
  const call = await callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: 'is-fund-registered',
    functionArgs: [
      bufferCV(decodeBtcAddressToBuffer(address))
    ],
    senderAddress: managerAddress,
    network: STACKS_NETWORK,
  });

  const result = cvToJSON(call).value.value;
  return result;
}

export async function registerFund(address: string): Promise<any> {
  const nonce = await getNonce(managerAddress)

  const txOptions = {
    contractAddress,
    contractName,
    functionName: "register-fund",
    functionArgs: [
      bufferCV(decodeBtcAddressToBuffer(address))
    ],
    senderKey: managerPrivateKey,
    nonce: nonce,
    postConditionMode: 1,
    fee: (0.001 * 1000000),
    network: STACKS_NETWORK,
    anchorMode: AnchorMode.Any
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction(transaction, STACKS_NETWORK);
  return result;
}

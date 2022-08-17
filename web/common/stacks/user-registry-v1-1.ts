import { stacksNetwork } from '../constants';
import { getNonce } from './utils'
import { hexToBytes } from '../utils';
import {
  callReadOnlyFunction,
  makeContractCall,
  broadcastTransaction,
  cvToJSON,
  bufferCV,
  standardPrincipalCV,
  AnchorMode,
} from '@stacks/transactions';

const contractAddress = process.env.APP_ADDRESS as string;
const contractName = "user-registry-v1-1";
const userAddress = process.env.USER_ADDRESS as string;
const userPrivateKey = process.env.USER_PRIVATE_KEY as string;

export async function getStxToBtc(address: string): Promise<any> {
  const call = await callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: 'get-stx-to-btc',
    functionArgs: [
      standardPrincipalCV(address)
    ],
    senderAddress: contractAddress,
    network: stacksNetwork,
  });

  const result = cvToJSON(call).value;
  return result;
}

export async function registerUser(publicKey: string): Promise<any> {
  const nonce = await getNonce(userAddress)
  const txOptions = {
    contractAddress,
    contractName,
    functionName: "register-user",
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
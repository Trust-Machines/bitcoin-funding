import { stacksNetwork } from '../constants';
import { getNonce } from './utils'
import { decodeBtcAddressToBuffer } from '../bitcoin/encoding';
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
const managerAddress = process.env.MANAGER_ADDRESS as string;
const managerPrivateKey = process.env.MANAGER_PRIVATE_KEY as string;

export async function getStxToBtc(address: string): Promise<any> {
  const call = await callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: 'get-stx-to-btc',
    functionArgs: [
      standardPrincipalCV(address)
    ],
    senderAddress: managerAddress,
    network: stacksNetwork,
  });

  const result = cvToJSON(call).value;
  return result;
}

export async function registerUser(address: string): Promise<any> {
  const nonce = await getNonce(managerAddress)
  const txOptions = {
    contractAddress,
    contractName,
    functionName: "register-user",
    functionArgs: [
      bufferCV(decodeBtcAddressToBuffer(address))
    ],
    senderKey: managerPrivateKey,
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

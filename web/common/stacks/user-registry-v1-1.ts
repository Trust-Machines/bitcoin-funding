require('dotenv').config({ path: '../../.env' });
import { STACKS_NETWORK } from '../constants';
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
    network: STACKS_NETWORK,
  });

  const result = cvToJSON(call).value;
  return result;
}

export async function registerUser(stxAddress: string, btcAddress: string, nonce: number | null = null): Promise<any> {
  let txNonce = nonce;
  if (txNonce == null) {
    txNonce = await getNonce(managerAddress)
  }

  console.log("NONCE:", nonce);

  const txOptions = {
    contractAddress,
    contractName,
    functionName: "register-user",
    functionArgs: [
      standardPrincipalCV(stxAddress),
      bufferCV(decodeBtcAddressToBuffer(btcAddress))
    ],
    senderKey: managerPrivateKey,
    nonce: txNonce,
    postConditionMode: 1,
    fee: (0.001 * 1000000),
    network: STACKS_NETWORK,
    anchorMode: AnchorMode.Any
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction(transaction, STACKS_NETWORK);

  if ((result.reason as string) == "ConflictingNonceInMempool") {
    return await registerUser(stxAddress, btcAddress, (txNonce as number) + 1);
  }
  return result;
}

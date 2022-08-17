import { stacksNetwork } from '../constants';
import { getNonce } from './utils'
import { hexToBytes } from '../utils';
import {
  callReadOnlyFunction,
  cvToJSON,
  uintCV,
  bufferCV,
  tupleCV,
  listCV,
  makeContractCall,
  broadcastTransaction,
  AnchorMode
} from '@stacks/transactions';

const contractAddress = process.env.APP_ADDRESS as string;
const contractName = "dao-funding-v1-1";
const userAddress = process.env.USER_ADDRESS as string;
const userPrivateKey = process.env.USER_PRIVATE_KEY as string;

export async function getUserDaoFunding(daoId: number, userPublicKey: string): Promise<any> {
  const call = await callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: 'get-user-dao-funding',
    functionArgs: [
      uintCV(daoId),
      bufferCV(Buffer.from(hexToBytes(userPublicKey)))
    ],
    senderAddress: contractAddress,
    network: stacksNetwork,
  });

  const result = cvToJSON(call).value;
  return result;
}

export async function getTotalDaoFunding(daoId: number): Promise<any> {
  const call = await callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: 'get-total-dao-funding',
    functionArgs: [
      uintCV(daoId),
    ],
    senderAddress: contractAddress,
    network: stacksNetwork,
  });

  const result = cvToJSON(call).value;
  return result;
}

export async function addUserFunding(
  blockHeader: string,
  blockHeight: number,
  prevBlocks: string[],
  txHex: string,
  proofTxIndex: number,
  proofHashes: string[],
  proofTreeDepth: number,
  senderIndex: number,
  receiverIndex: number,
  senderPublicKey: string,
  receiverPublicKey: string
): Promise<any> {
  const nonce = await getNonce(userAddress)
  const txOptions = {
    contractAddress,
    contractName,
    functionName: "add-user-funding",
    functionArgs: [
      tupleCV({
        "header": bufferCV(Buffer.from(hexToBytes(blockHeader))),
        "height": uintCV(blockHeight)
      }),
      listCV(prevBlocks.map(hash => bufferCV(Buffer.from(hexToBytes(hash))))),
      bufferCV(Buffer.from(hexToBytes(txHex))),
      tupleCV({
        "tx-index": uintCV(proofTxIndex),
        "hashes": listCV(proofHashes.map(hash => bufferCV(Buffer.from(hexToBytes(hash))))),
        "tree-depth": uintCV(proofTreeDepth)
      }),
      uintCV(senderIndex),
      uintCV(receiverIndex),
      bufferCV(Buffer.from(hexToBytes(senderPublicKey))),
      bufferCV(Buffer.from(hexToBytes(receiverPublicKey)))
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

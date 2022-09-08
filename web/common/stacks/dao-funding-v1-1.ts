require('dotenv').config({ path: '../../.env' });
import { stacksNetwork } from '../constants';
import { getNonce } from './utils'
import { decodeBtcAddressToBuffer } from '../bitcoin/encoding';
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
  AnchorMode,
  contractPrincipalCV
} from '@stacks/transactions';

const contractAddress = process.env.APP_ADDRESS as string;
const contractName = "dao-funding-v1-1";
const managerAddress = process.env.MANAGER_ADDRESS as string;
const managerPrivateKey = process.env.MANAGER_PRIVATE_KEY as string;

export async function getUserDaoFunding(daoId: number, userAddress: string): Promise<any> {
  const call = await callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: 'get-user-dao-funding',
    functionArgs: [
      uintCV(daoId),
      bufferCV(decodeBtcAddressToBuffer(userAddress))
    ],
    senderAddress: managerAddress,
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
    senderAddress: managerAddress,
    network: stacksNetwork,
  });

  const result = cvToJSON(call).value;
  return result;
}

export async function getTransactionParsed(txHex: string): Promise<any> {
  const call = await callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: 'get-tx-parsed',
    functionArgs: [
      bufferCV(Buffer.from(hexToBytes(txHex))),
    ],
    senderAddress: managerAddress,
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
  senderAddress: string,
  receiverAddress: string
): Promise<any> {
  const nonce = await getNonce(managerAddress)
  const txOptions = {
    contractAddress,
    contractName,
    functionName: "add-user-funding",
    functionArgs: [
      contractPrincipalCV(contractAddress, "dao-registry-v1-1"),
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
      bufferCV(decodeBtcAddressToBuffer(senderAddress)),
      bufferCV(decodeBtcAddressToBuffer(receiverAddress))
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

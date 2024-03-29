require('dotenv').config({ path: '../../.env' });
import { STACKS_NETWORK } from '../constants';
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
const contractName = "fund-funding-v1-1";
const managerAddress = process.env.MANAGER_ADDRESS as string;
const managerPrivateKey = process.env.MANAGER_PRIVATE_KEY as string;

export async function getUserFundFunding(fundId: number, userAddress: string): Promise<any> {
  const call = await callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: 'get-user-fund-funding',
    functionArgs: [
      uintCV(fundId),
      bufferCV(decodeBtcAddressToBuffer(userAddress))
    ],
    senderAddress: managerAddress,
    network: STACKS_NETWORK,
  });

  const result = cvToJSON(call).value;
  return result;
}

export async function getTotalFundFunding(fundId: number): Promise<any> {
  const call = await callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: 'get-total-fund-funding',
    functionArgs: [
      uintCV(fundId),
    ],
    senderAddress: managerAddress,
    network: STACKS_NETWORK,
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
    network: STACKS_NETWORK,
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
  receiverAddress: string,
  nonce: number | null = null
): Promise<any> {
  let txNonce = nonce;
  if (txNonce == null) {
    txNonce = await getNonce(managerAddress)
  }

  const txOptions = {
    contractAddress,
    contractName,
    functionName: "add-user-funding",
    functionArgs: [
      contractPrincipalCV(contractAddress, "fund-registry-v1-1"),
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
    nonce: txNonce,
    postConditionMode: 1,
    fee: (0.01 * 1000000),
    network: STACKS_NETWORK,
    anchorMode: AnchorMode.Any
  };

  const transaction = await makeContractCall(txOptions);
  const result = await broadcastTransaction(transaction, STACKS_NETWORK);

  if ((result.reason as string) == "ConflictingNonceInMempool") {
    return await addUserFunding( 
      blockHeader,
      blockHeight,
      prevBlocks,
      txHex,
      proofTxIndex,
      proofHashes,
      proofTreeDepth,
      senderIndex,
      receiverIndex,
      senderAddress,
      receiverAddress,
      (txNonce as number) + 1
    );
  }
  return result;
}

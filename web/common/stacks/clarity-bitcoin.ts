require('dotenv').config({ path: '../../.env' });
import { STACKS_NETWORK } from '../constants';
import { hexToBytes } from '../utils';
import {
  callReadOnlyFunction,
  cvToJSON,
  uintCV,
  bufferCV,
  tupleCV,
  listCV,
} from '@stacks/transactions';

const contractAddress = process.env.APP_ADDRESS as string;
const contractName = "clarity-bitcoin";

export async function verifyBlockHeader(headerbuff: string, expectedBlockHeight: number): Promise<any> {
  const call = await callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: 'verify-block-header',
    functionArgs: [
      bufferCV(Buffer.from(hexToBytes(headerbuff))),
      uintCV(expectedBlockHeight)
    ],
    senderAddress: contractAddress,
    network: STACKS_NETWORK,
  });

  const result = cvToJSON(call).value;
  return result;
}

export async function parseTx(tx: string): Promise<any> {
  const call = await callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: 'parse-tx',
    functionArgs: [
      bufferCV(Buffer.from(hexToBytes(tx))),
    ],
    senderAddress: contractAddress,
    network: STACKS_NETWORK,
  });

  const result = cvToJSON(call);
  return result;
}

export async function getTxId(tx: string): Promise<any> {
  const call = await callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: 'get-txid',
    functionArgs: [
      bufferCV(Buffer.from(hexToBytes(tx))),
    ],
    senderAddress: contractAddress,
    network: STACKS_NETWORK,
  });

  const result = cvToJSON(call);
  return result;
}

export async function wasTxMinedPrev(
  blockHeader: string,
  blockHeight: number,
  prevBlocks: string[],
  txHex: string,
  proofTxIndex: number,
  proofHashes: string[],
  proofTreeDepth: number,
): Promise<any> {

  const call = await callReadOnlyFunction({
    contractAddress,
    contractName,
    functionName: 'was-tx-mined-prev?',
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
    ],
    senderAddress: contractAddress,
    network: STACKS_NETWORK,
  });

  const result = cvToJSON(call).value.value;
  return result;
}

require('dotenv').config({ path: '../../.env' });
import { STACKS_NETWORK } from '../constants';
import { hexToBytes } from '../utils';
import {
  callReadOnlyFunction,
  cvToJSON,
  uintCV,
  bufferCV,
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

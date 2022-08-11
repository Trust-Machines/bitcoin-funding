import { Transaction } from 'bitcoinjs-lib';
import { stacksNetwork } from '../constants';
import {
  callReadOnlyFunction,
  cvToJSON,
  bufferCV,
} from '@stacks/transactions';


export async function parseTx(txHex: string): Promise<any> {

  const tx = Transaction.fromHex(txHex);

  const call = await callReadOnlyFunction({
    contractAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    contractName: 'clarity-bitcoin',
    functionName: 'parse-tx',
    functionArgs: [
      bufferCV(tx.toBuffer()),
    ],
    senderAddress: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    network: stacksNetwork,
  });

  const result = cvToJSON(call);
  return result;
}

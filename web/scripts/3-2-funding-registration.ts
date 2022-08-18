// require('dotenv').config({ path: '../.env' });

import axios from 'axios';
import { appApiUrl } from '../common/constants';
import { addUserFunding } from '../common/stacks/dao-funding-v1-1';

export async function start() {
  const txId = process.argv.slice(2)[0];
  const senderPublicKey = process.argv.slice(2)[1];
  const receiverPublicKey = process.argv.slice(2)[2];
  if (txId == undefined) {
    console.log("[FUNDING] Add transaction ID as parameter");
    return;
  }
  if (txId == undefined) {
    console.log("[FUNDING] Add transaction ID as parameter");
    return;
  }
  if (txId == undefined) {
    console.log("[FUNDING] Add transaction ID as parameter");
    return;
  }

  const responseTxInfo = await axios({
    method: 'GET',
    url: appApiUrl + '/transaction/info',
    params: {
      txId: txId,
      senderPublicKey: senderPublicKey,
      receiverPublicKey: receiverPublicKey
    }
  });
  const txInfo = responseTxInfo.data;
  console.log("[FUNDING] Transaction data to verify:", txInfo);

  // Save funding on chain
  const parseResult = await addUserFunding(
    txInfo.blockHeader,
    txInfo.blockHeight,
    txInfo.prevBlocks,
    txInfo.txHex,
    txInfo.proofTxIndex,
    txInfo.proofHashes,
    txInfo.proofTreeDepth,
    txInfo.senderIndex,
    txInfo.receiverIndex,
    senderPublicKey,
    receiverPublicKey
  )
  console.log("[FUNDING] On-chain verification result:", parseResult);
}

export async function run() {
  try {
    await start();
  } catch (error) {
    console.log("[FUNDING] ERROR:", error);
  }
}
run();

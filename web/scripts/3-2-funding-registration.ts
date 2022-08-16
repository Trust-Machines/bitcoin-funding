// require('dotenv').config({ path: '../.env' });

import axios from 'axios';
import { appApiUrl } from '../common/constants';
import { addUserFunding, parseAndValidateTx } from '../common/stacks/dao-funding-v1-1';

export async function start() {
  const txId = process.argv.slice(2)[0];
  if (txId == undefined) {
    console.log("[FUNDING] Add transaction ID as parameter")
    return;
  }

  // TODO - Add as script parameter
  const senderPublicKey = "03738bd4a4b87cbe0c751e9e01d9a226b528176d4b93bf0fdc796b7ea88b695035";
  const receiverPublicKey = "0200fcab3adf951b19b7fb709ff07a6a91cf2a61ac0b80f62761ad64b4f98b5157";
  
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

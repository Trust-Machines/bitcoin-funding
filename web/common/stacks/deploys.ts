import { STACKS_API_URL, STACKS_NETWORK } from '../constants';
import { getNonce } from './utils';
import { broadcastTransaction, ContractDeployOptions, makeContractDeploy } from '@stacks/transactions';
import { AnchorMode } from 'micro-stacks/transactions';
import fs from "fs";

export type ContractDeploy = {
  name: string
  file: string
}

export async function deployContractBatch(contracts: ContractDeploy[], sender: string, privateKey: string) {
  var nonce = await getNonce(sender);

  var txId;
  for (const contract of contracts) {
    txId = await deployContractHelper(contract.name, contract.file, privateKey, nonce);
    nonce += 1;
  }

  let transactionResult = await waitForTransactionCompletion(txId as string);
  return transactionResult;
}

async function deployContractHelper(contractName: string, contractFile: string, privateKey: string, nonce: number) {

  const source = fs.readFileSync("../../../clarity/contracts/" + contractFile).toString('utf8');

  const txOptions: ContractDeployOptions = {
    contractName: contractName,
    codeBody: source,
    senderKey: privateKey,
    nonce: nonce,
    network: STACKS_NETWORK,
    fee: (0.1 * 1000000),
    anchorMode: AnchorMode.Any
  };

  const transaction = await makeContractDeploy(txOptions);
  await broadcastTransaction(transaction, STACKS_NETWORK);
  return transaction.txid();
}

async function waitForTransactionCompletion(transactionId: string) {

  const url = `${STACKS_API_URL}/extended/v1/tx/${transactionId}`;
  console.log('\x1b[1m', "\nWaiting on transaction: ", "\x1b[0m");
  console.log(" - " + url);
  process.stdout.write(" - Pending ")

  return new Promise((resolve, reject) => {
    const poll = async function() {
      var result = await fetch(url);
      var value = await result.json();
      
      if (value.tx_status === "success") {
        console.log('\x1b[32m', '\n - Success', "\x1b[0m");
        resolve(true);
      } else if (value.tx_status === "pending") {
        process.stdout.write(".")
        setTimeout(poll, 10000);
      } else {
        console.log('\x1b[31m\x1b[1m', "\n - Failed with error: " + value.error + " - status: " + value.tx_status, "\x1b[0m");
        resolve(false);
      }
    }
    setTimeout(poll, 5000);
  })
}

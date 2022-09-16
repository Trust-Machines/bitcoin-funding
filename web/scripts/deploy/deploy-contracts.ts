require('dotenv').config({ path: '../../.env' });
import { deployContractBatch } from "@/common/stacks/deploys";

const contractAddress = process.env.APP_ADDRESS as string;
const contractPrivateKey = process.env.APP_PRIVATE_KEY as string;

export async function deployAll() {

  const contracts1 = [
    { name: "clarity-bitcoin", file: "clarity-bitcoin.clar"},
    { name: "fund-registry-trait-v1-1", file: "fund-registry-trait-v1-1.clar"},
    { name: "main", file: "main.clar"},
  ]

  const contracts2 = [
    { name: "user-registry-v1-1", file: "user-registry-v1-1.clar"},
    { name: "fund-registry-v1-1", file: "fund-registry-v1-1.clar"},
  ]

  const contracts3 = [
    { name: "fund-funding-v1-1", file: "fund-funding-v1-1.clar"},
  ]

  await deployContractBatch(contracts1, contractAddress, contractPrivateKey);
  await deployContractBatch(contracts2, contractAddress, contractPrivateKey);
  await deployContractBatch(contracts3, contractAddress, contractPrivateKey);

  console.log("Deployed all")
}

deployAll();

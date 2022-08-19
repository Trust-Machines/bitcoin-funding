import axios from 'axios';
import { appApiUrl } from '@/common/constants';

export async function start() {
  const daoAddress = process.argv.slice(2)[0];
  if (daoAddress == undefined) {
    console.log("[DAO] Add the DAO address as parameter")
    return;
  }
  console.log("[DAO] Check SC registration for DAO with address:", daoAddress)

  const response = await axios({
    method: 'POST',
    url: appApiUrl + '/dao/verify',
    data: {
      address: daoAddress
    }
  });
  console.log("[DAO] registration verify API result:", response.data);
}

export async function run() {
  try {
    await start();
  } catch (error) {
    console.log("[DAO] ERROR:", error);
  }
}
run();

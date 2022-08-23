import axios from 'axios';
import { appApiUrl } from '@/common/constants';

export async function start() {
  const daoSlug = process.argv.slice(2)[0];
  if (daoSlug == undefined) {
    console.log("[DAO] Add the DAO slug as parameter")
    return;
  }
  console.log("[DAO] Check SC registration for DAO with slug:", daoSlug)

  const response = await axios({
    method: 'POST',
    url: appApiUrl + '/dao/' + daoSlug + '/verify',
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

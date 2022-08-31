import axios from 'axios';
import { appApiUrl } from '@/common/constants';
import { Dao } from '@prisma/client';

export async function start() {

  // Get unverified
  const unverified = (await axios({
    method: 'GET',
    url: appApiUrl + '/dao/unverified',
  })).data as Dao[];

  console.log("[VERIFY DAOS] unverified daos:", unverified.length);

  // Try to verify
  for (const dao of unverified) {
    const response = await axios({
      method: 'POST',
      url: appApiUrl + '/dao/' + dao.slug + '/verify',
    });
    console.log("[VERIFY DAOS] verification response:", response.data);
  }
}

export async function run() {
  try {
    await start();
  } catch (error) {
    console.log("[VERIFY DAOS] ERROR:", error);
  }
}
run();

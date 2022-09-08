import axios from 'axios';
import { appApiUrl } from '@/common/constants';
import { Dao } from '@prisma/client';

export async function start() {

  // Get unregistered
  const unregistered = (await axios({
    method: 'GET',
    url: appApiUrl + '/dao/unregistered',
  })).data as Dao[];

  console.log("[REGISTER DAOS] unregistered daos:", unregistered.length);

  // Register on chain
  for (const dao of unregistered) {
    try {
      const response = await axios({
        method: 'POST',
        url: appApiUrl + '/dao/' + dao.slug + '/register',
      });
      console.log("[REGISTER DAOS] registration response:", response.data);
    } catch (error) {
      console.log("[REGISTER DAOS] ERROR:", error);
    }
  }
}

export async function run() {
  try {
    await start();
  } catch (error) {
    console.log("[REGISTER DAOS] ERROR:", error);
  }
}
run();

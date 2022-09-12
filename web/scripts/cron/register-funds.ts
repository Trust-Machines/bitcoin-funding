import axios from 'axios';
import { API_URL } from '@/common/constants';
import { Fund } from '@prisma/client';

export async function start() {

  // Get unregistered
  const unregistered = (await axios({
    method: 'GET',
    url: API_URL + '/fund/unregistered',
  })).data as Fund[];

  console.log("[REGISTER FUNDS] unregistered funds:", unregistered.length);

  // Register on chain
  for (const fund of unregistered) {
    try {
      const response = await axios({
        method: 'POST',
        url: API_URL + '/fund/' + fund.slug + '/register',
      });
      console.log("[REGISTER FUNDS] registration response:", response.data);
    } catch (error) {
      console.log("[REGISTER FUNDS] ERROR:", error);
    }
  }
}

export async function run() {
  try {
    await start();
  } catch (error) {
    console.log("[REGISTER FUNDS] ERROR:", error);
  }
}
run();

import axios from 'axios';
import { API_URL } from '@/common/constants';
import { Fund } from '@prisma/client';

export async function start() {

  // Get unverified
  const unverified = (await axios({
    method: 'GET',
    url: API_URL + '/fund/unverified',
  })).data as Fund[];

  console.log("[VERIFY FUNDS] unverified funds:", unverified.length);

  // Try to verify
  for (const fund of unverified) {
    try {
      const response = await axios({
        method: 'POST',
        url: API_URL + '/fund/' + fund.slug + '/verify',
      });
      console.log("[VERIFY FUNDS] verification response:", response.data);
    } catch (error) {
      console.log("[VERIFY FUNDS] ERROR:", error);
    }
  }
}

export async function run() {
  try {
    await start();
  } catch (error) {
    console.log("[VERIFY FUNDS] ERROR:", error);
  }
}
run();

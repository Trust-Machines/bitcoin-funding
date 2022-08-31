import axios from 'axios';
import { appApiUrl } from '@/common/constants';
import { User } from '@prisma/client';

export async function start() {

  // Get unverified
  const unverified = (await axios({
    method: 'GET',
    url: appApiUrl + '/user/unverified',
  })).data as User[];

  console.log("[VERIFY USERS] unverified users:", unverified.length);

  // Try to verify
  for (const user of unverified) {
    const response = await axios({
      method: 'POST',
      url: appApiUrl + '/user/verify',
      data: {
        appPrivateKey: user.appPrivateKey
      }
    });
    console.log("[VERIFY USERS] verification response:", response.data);
  }
}

export async function run() {
  try {
    await start();
  } catch (error) {
    console.log("[VERIFY USERS] ERROR:", error);
  }
}
run();

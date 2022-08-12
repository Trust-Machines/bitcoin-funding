require('dotenv').config({ path: '../.env' });

import axios from 'axios';

export async function start() {
  const daoPublicKey = process.argv.slice(2)[0];
  if (daoPublicKey == undefined) {
    console.log("[DAO] Add the DAO public key as parameter")
    return;
  }
  console.log("[DAO] Check SC registration for DAO with public key: ", daoPublicKey)

  const url = `http://localhost:3000/api/dao/dao`;
  const response = await axios({
    method: 'PUT',
    url: url,
    data: {
      publicKey: daoPublicKey
    }
  });
  console.log("[DAO] registration TX result: ", response.data);

}

start();

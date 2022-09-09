import { API_URL } from './constants';
import redstone from 'redstone-api';

export const getBtcPrice = async () => {
  const price = await redstone.getPrice("BTC");
  return price.value;
};

export const saveSession = async (dehydratedState: string) => {
  return await fetch(API_URL + '/session/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dehydratedState }),
  });
};
 
export const destroySession = async () => {
  try {
    await fetch(API_URL + '/session/destroy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: null,
    });
  } catch (e) {
    console.log('ERROR:', e);
  }
};

export const createfund = async (formData: FormData) => {
  return await fetch(API_URL + '/fund/create', {
    method: 'POST',
    body: formData,
  });
};

export const findfund = async (slug: string) => {
  const res = await fetch(API_URL + '/fund/' + slug, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  const json = await res.json();
  return json;
};

export const isfundAdmin = async (slug: string, dehydratedState: string) => {
  if (dehydratedState == null) {
    return false;
  }
  const res = await fetch(API_URL + '/fund/' + slug + "/is-admin?dehydratedState=" + dehydratedState, {
    method: 'GET',
    headers: {'Content-Type': 'application/json'},
  });
  const json = await res.json();
  return json;
};

export const findfundFundingTransactions = async (slug: string, page: number) => {
  const res = await fetch(API_URL + '/fund/' + slug + "/transactions?page=" + page, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const json = await res.json();
  return json;
};

export const verifyfund = async (slug: string) => {
  const res = await fetch(API_URL + '/fund/' + slug + '/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({slug: slug}),
  });
  const json = await res.json();
  return json;
};

export const findAllfunds = async (page: Number) => {
  const res = await fetch(API_URL + '/fund/all?page=' + page, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  const json = await res.json();
  return json;
};

export const updatefund = async (slug: string, formData: FormData) => {
  return await fetch(API_URL + '/fund/' + slug + '/update', {
    method: 'PATCH',
    body: formData
  });
};

export const findUser = async (appPrivateKey: string) => {
  const res = await fetch(API_URL + '/user/info?appPrivateKey=' + appPrivateKey, {
    method: 'GET',
  });
  const json = await res.json();

  return json;
};

export const getUserBalance = async (appPrivateKey: string) => {
  return await fetch(API_URL + '/user/balance?appPrivateKey=' + appPrivateKey, {
    method: 'GET',
  });
};

export const registerUser = async (appPrivateKey: string) => {
  return await fetch(API_URL + '/user/register', {
    method: 'POST',
    body: JSON.stringify({ appPrivateKey: appPrivateKey })
  });
};

export const forwardUserFunds = async (appPrivateKey: string, sats: number, fundAddress: string) => {
  return await fetch(API_URL + '/user/forward', {
    method: 'POST',
    body: JSON.stringify({ appPrivateKey: appPrivateKey, sats: sats, fundAddress: fundAddress })
  });
};

export const getTransaction = async (txId: string) => {
  const res = await fetch(API_URL + '/transaction/' + txId, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  const json = await res.json();
  return json;
};

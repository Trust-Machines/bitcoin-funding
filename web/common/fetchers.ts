import { API_URL } from './constants';
import redstone from 'redstone-api';

export const getBtcPrice = async () => {
  const price = await redstone.getPrice("BTC");
  return price.value;
};

export const saveSession = async (dehydratedState: string) => {
  return await fetch(API_URL + '/api/session/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dehydratedState }),
  });
};
 
export const destroySession = async () => {
  try {
    await fetch(API_URL + '/api/session/destroy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: null,
    });
  } catch (e) {
    console.log('ERROR:', e);
  }
};

export const createDao = async (formData: FormData) => {
  return await fetch(API_URL + '/api/dao/create', {
    method: 'POST',
    body: formData,
  });
};

export const findDao = async (slug: string) => {
  const res = await fetch(API_URL + '/api/dao/' + slug, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  const json = await res.json();

  return json;
};

export const findDaoFundingTransactions = async (slug: string) => {
  const res = await fetch(API_URL + '/api/dao/' + slug + "/transactions", {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const json = await res.json();

  return json;
};

export const verifyDao = async (slug: string) => {
  const res = await fetch(API_URL + '/api/dao/' + slug + '/verify', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({slug: slug}),
  });
  const json = await res.json();

  return json;
};

export const findAllDaos = async (slug: string) => {
  const res = await fetch(API_URL + '/api/dao/all', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });
  const json = await res.json();

  return json;
};

export const updateDao = async (slug: string, formData: object, dehydratedState: string) => {
  return await fetch(API_URL + '/api/dao/' + slug + '/update', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ dao: formData, dehydratedState })
  });
};

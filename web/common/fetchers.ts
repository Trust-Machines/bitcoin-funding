import { API_URL } from './constants';
 
export const saveSession = async (dehydratedState: string) => {
  await fetch(API_URL + '/api/session/save', {
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

export const createDao = async (formData: Object) => {
  return await fetch(API_URL + '/api/dao/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
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

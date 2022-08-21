import { API_URL } from './constants';
 
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

export const createDao = async (formData: Object, dehydratedState: string) => {
  console.log(dehydratedState)
  console.log(JSON.stringify(formData));
  return await fetch(API_URL + '/api/dao/create', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      dao: JSON.stringify(formData),
      session: JSON.stringify({ dehydratedState }),
    }
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

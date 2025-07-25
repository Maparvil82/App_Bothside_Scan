import axios from 'axios';
import OAuth from 'oauth-1.0a';
import { 
  DISCOGS_CONSUMER_KEY, 
  DISCOGS_CONSUMER_SECRET, 
  DISCOGS_REQUEST_TOKEN_URL, 
  DISCOGS_AUTHORIZE_URL, 
  DISCOGS_ACCESS_TOKEN_URL, 
  DISCOGS_CALLBACK_URL 
} from './DiscogsAuthConfig';
import * as CryptoJS from 'crypto-js';

function hash_function_sha1(base_string: string, key: string) {
  return CryptoJS.HmacSHA1(base_string, key).toString(CryptoJS.enc.Base64);
}

const oauth = new OAuth({
  consumer: { key: DISCOGS_CONSUMER_KEY, secret: DISCOGS_CONSUMER_SECRET },
  signature_method: 'HMAC-SHA1',
  hash_function: hash_function_sha1,
});

export async function getRequestToken() {
  const request_data = {
    url: DISCOGS_REQUEST_TOKEN_URL,
    method: 'POST',
    data: { oauth_callback: DISCOGS_CALLBACK_URL },
  };
  const headers = oauth.toHeader(oauth.authorize(request_data));
  const response = await axios.post(DISCOGS_REQUEST_TOKEN_URL, null, {
    headers: {
      ...headers,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    params: { oauth_callback: DISCOGS_CALLBACK_URL },
  });
  return response.data;
}

export function getAuthorizeUrl(oauth_token: string) {
  return `${DISCOGS_AUTHORIZE_URL}?oauth_token=${oauth_token}`;
}

export async function getAccessToken(oauth_token: string, oauth_token_secret: string, oauth_verifier: string) {
  const request_data = {
    url: DISCOGS_ACCESS_TOKEN_URL,
    method: 'POST',
  };
  const token = { key: oauth_token, secret: oauth_token_secret };
  const headers = oauth.toHeader(oauth.authorize(request_data, token));
  const response = await axios.post(DISCOGS_ACCESS_TOKEN_URL, null, {
    headers: {
      ...headers,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    params: { oauth_verifier },
  });
  return response.data;
} 
// lib/api.test.js
// Covers the refresh interceptor and the best-effort logout in lib/api.js.
// axios is replaced by a callable fake instance; localStorage is jsdom's.

import axios from 'axios';
import api, { performLogout } from '@/lib/api';
import { API } from '@/lib/constants';

const mockLogout = jest.fn();
const mockUpdateTokens = jest.fn();

jest.mock('axios', () => {
  const instance = jest.fn();
  instance.interceptors = { request: { use: jest.fn() }, response: { use: jest.fn() } };
  return { __esModule: true, default: { create: jest.fn(() => instance), post: jest.fn() } };
});

jest.mock('@/store/authStore', () => ({
  __esModule: true,
  default: { getState: () => ({ logout: mockLogout, updateTokens: mockUpdateTokens }) },
}));

// Captured at import time, before any beforeEach clears the mock calls
const onRejected = api.interceptors.response.use.mock.calls[0][1];

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

const unauthorized = (token = 'old-access') => ({
  config: { headers: { Authorization: `Bearer ${token}` } },
  response: { status: 401 },
});

const refreshReply = (data) => ({ data: { data } });

/** A promise whose resolve/reject are exposed, to hold a refresh in flight. */
function deferred() {
  const d = {};
  d.promise = new Promise((resolve, reject) => {
    d.resolve = resolve;
    d.reject = reject;
  });
  return d;
}

beforeEach(() => {
  jest.clearAllMocks();
  localStorage.clear();
  localStorage.setItem('apnabot_access_token', 'old-access');
  localStorage.setItem('apnabot_refresh_token', 'old-refresh');
  api.mockResolvedValue('retried');
  global.fetch = jest.fn().mockResolvedValue({ ok: true });
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('refresh interceptor', () => {
  it('sends one refresh for parallel 401s and retries each request', async () => {
    const pending = deferred();
    axios.post.mockReturnValue(pending.promise);

    const calls = [1, 2, 3].map(() => onRejected(unauthorized()));
    pending.resolve(refreshReply({ accessToken: 'new-access', refreshToken: 'new-refresh' }));

    await expect(Promise.all(calls)).resolves.toEqual(['retried', 'retried', 'retried']);
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(api).toHaveBeenCalledTimes(3);
  });

  it('retries with the current token, without refreshing, when the sent one is stale', async () => {
    localStorage.setItem('apnabot_access_token', 'new-access');

    await onRejected(unauthorized('old-access'));

    expect(axios.post).not.toHaveBeenCalled();
    const retried = api.mock.calls[0][0];
    expect(retried.headers.Authorization).toBe('Bearer new-access');
  });

  it('saves the rotated refresh token before the retry is sent', async () => {
    axios.post.mockResolvedValue(
      refreshReply({ accessToken: 'new-access', refreshToken: 'new-refresh' })
    );
    let storedAtRetry;
    api.mockImplementation(() => {
      storedAtRetry = localStorage.getItem('apnabot_refresh_token');
      return Promise.resolve('retried');
    });

    await onRejected(unauthorized());

    expect(storedAtRetry).toBe('new-refresh');
    expect(mockUpdateTokens).toHaveBeenCalledWith('new-access', 'new-refresh');
  });

  it.each([401, 403])('logs out when the refresh endpoint answers %i', async (status) => {
    axios.post.mockRejectedValue({ response: { status } });

    await expect(onRejected(unauthorized())).rejects.toBeDefined();

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['network error', {}],
    ['5xx', { response: { status: 503 } }],
    ['timeout', { code: 'ECONNABORTED', message: 'timeout of 15000ms exceeded' }],
  ])('keeps the session on a refresh %s', async (_name, failure) => {
    axios.post.mockRejectedValue(failure);

    await expect(onRejected(unauthorized())).rejects.toBeDefined();

    expect(mockLogout).not.toHaveBeenCalled();
    expect(localStorage.getItem('apnabot_refresh_token')).toBe('old-refresh');
  });

  it('puts a 15 second timeout on the refresh call', async () => {
    axios.post.mockResolvedValue(refreshReply({ accessToken: 'new-access' }));

    await onRejected(unauthorized());

    const [url, body, options] = axios.post.mock.calls[0];
    expect(url).toContain(API.REFRESH);
    expect(body).toEqual({ refreshToken: 'old-refresh' });
    expect(options).toEqual({ timeout: 15000 });
  });
});

describe('performLogout', () => {
  it('posts the refresh token in the body with no Authorization header', async () => {
    const clearSession = jest.fn();

    await performLogout(clearSession);

    const [url, init] = global.fetch.mock.calls[0];
    expect(url).toContain(API.LOGOUT);
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({ refreshToken: 'old-refresh' });
    expect(Object.keys(init.headers).map((h) => h.toLowerCase())).not.toContain('authorization');
    expect(clearSession).toHaveBeenCalledTimes(1);
  });

  it('waits for an in-flight refresh and sends the rotated token', async () => {
    const pending = deferred();
    axios.post.mockReturnValue(pending.promise);
    const refreshing = onRejected(unauthorized());
    const clearSession = jest.fn();

    const loggingOut = performLogout(clearSession);
    await flush();
    expect(global.fetch).not.toHaveBeenCalled();

    pending.resolve(refreshReply({ accessToken: 'new-access', refreshToken: 'new-refresh' }));
    await Promise.all([refreshing, loggingOut]);

    expect(JSON.parse(global.fetch.mock.calls[0][1].body)).toEqual({
      refreshToken: 'new-refresh',
    });
    expect(clearSession).toHaveBeenCalledTimes(1);
  });

  it('still clears the session when the network fails', async () => {
    global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));
    const clearSession = jest.fn();

    await performLogout(clearSession);

    expect(clearSession).toHaveBeenCalledTimes(1);
  });

  it('aborts after 3 seconds and still clears the session', async () => {
    jest.useFakeTimers();
    global.fetch.mockImplementation(
      (_url, { signal }) =>
        new Promise((_resolve, reject) => {
          signal.addEventListener('abort', () => reject(new Error('aborted')));
        })
    );
    const clearSession = jest.fn();

    const loggingOut = performLogout(clearSession);
    await jest.advanceTimersByTimeAsync(3000);
    await loggingOut;

    expect(global.fetch.mock.calls[0][1].signal.aborted).toBe(true);
    expect(clearSession).toHaveBeenCalledTimes(1);
  });

  it('skips the server call without a token but still clears the session', async () => {
    localStorage.removeItem('apnabot_refresh_token');
    const clearSession = jest.fn();

    await performLogout(clearSession);

    expect(global.fetch).not.toHaveBeenCalled();
    expect(clearSession).toHaveBeenCalledTimes(1);
  });
});

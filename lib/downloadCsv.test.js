// lib/downloadCsv.test.js

import api from '@/lib/api';
import { downloadCsv } from '@/lib/downloadCsv';

jest.mock('@/lib/api', () => ({ __esModule: true, default: { get: jest.fn() } }));

describe('downloadCsv', () => {
  let blobs;
  let clicked;

  beforeEach(() => {
    jest.clearAllMocks();
    blobs = [];
    clicked = [];
    URL.createObjectURL = jest.fn((blob) => { blobs.push(blob); return 'blob:csv'; });
    URL.revokeObjectURL = jest.fn();
    jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function click() {
      clicked.push({ href: this.href, download: this.download });
    });
  });

  afterEach(() => jest.restoreAllMocks());

  it('requests the CSV as a blob with the given params and a long timeout', async () => {
    api.get.mockResolvedValue({ data: 'a,b\n' });
    await downloadCsv('/x.csv', { search: 'r' }, 'out.csv');
    expect(api.get).toHaveBeenCalledWith('/x.csv', { params: { search: 'r' }, responseType: 'blob', timeout: 60000 });
  });

  it('saves the file under the given name, with a UTF-8 BOM, then frees the object URL', async () => {
    api.get.mockResolvedValue({ data: 'a,b\n' });
    await downloadCsv('/x.csv', {}, 'out.csv');
    expect(clicked).toEqual([{ href: 'blob:csv', download: 'out.csv' }]);
    expect(blobs[0].type).toBe('text/csv;charset=utf-8');
    expect(blobs[0].size).toBe(Buffer.byteLength('﻿a,b\n'));
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:csv');
    expect(document.querySelector('a[download]')).toBeNull();
  });

  it('rejects with the request error and saves nothing', async () => {
    api.get.mockRejectedValue(new Error('boom'));
    await expect(downloadCsv('/x.csv', {}, 'out.csv')).rejects.toThrow('boom');
    expect(clicked).toEqual([]);
  });
});

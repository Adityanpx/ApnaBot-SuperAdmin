// lib/appVersion.test.js

import {
  isValidVersion, compareVersions, isValidPlayStoreUrl, validateAppConfig, warningFlags,
  PLAY_STORE_PREFIX, normalizeSupportNumber, supportTestLink,
} from '@/lib/appVersion';

const good = {
  androidMinVersion: '1.2.0',
  androidLatestVersion: '1.4.0',
  forceUpdate: false,
  maintenanceMode: false,
  translateMonthlyCharCap: 20000,
  translateGlobalMonthlyCap: 1800000,
  playStoreUrl: `${PLAY_STORE_PREFIX}com.apnabot.app`,
};

describe('isValidVersion', () => {
  it('accepts x.y.z only', () => {
    expect(isValidVersion('1.0.0')).toBe(true);
    expect(isValidVersion(' 10.20.30 ')).toBe(true);
    ['1.0', '1.0.0.1', 'v1.0.0', '1.a.0', '', '1..0'].forEach((v) => {
      expect(isValidVersion(v)).toBe(false);
    });
    expect(isValidVersion(null)).toBe(false);
  });
});

describe('compareVersions', () => {
  it('compares numerically, not as text', () => {
    expect(compareVersions('1.10.0', '1.9.0')).toBeGreaterThan(0);
    expect(compareVersions('1.0.0', '1.0.1')).toBeLessThan(0);
    expect(compareVersions('2.0.0', '2.0.0')).toBe(0);
  });
});

describe('isValidPlayStoreUrl', () => {
  it('requires the Play Store prefix and a package id', () => {
    expect(isValidPlayStoreUrl(good.playStoreUrl)).toBe(true);
    expect(isValidPlayStoreUrl(PLAY_STORE_PREFIX)).toBe(false);
    expect(isValidPlayStoreUrl('http://play.google.com/store/apps/details?id=a.b')).toBe(false);
    expect(isValidPlayStoreUrl('https://example.com')).toBe(false);
  });
});

describe('validateAppConfig', () => {
  it('returns no errors for valid input, including min equal to latest', () => {
    expect(validateAppConfig(good)).toEqual({});
    expect(validateAppConfig({ ...good, androidMinVersion: '1.4.0' })).toEqual({});
  });

  it('flags a bad version and a bad URL', () => {
    const errors = validateAppConfig({ ...good, androidLatestVersion: '1.4', playStoreUrl: 'x' });
    expect(Object.keys(errors).sort()).toEqual(['androidLatestVersion', 'playStoreUrl']);
  });

  it('flags min above latest on the min field', () => {
    const errors = validateAppConfig({ ...good, androidMinVersion: '2.0.0' });
    expect(errors.androidMinVersion).toMatch(/higher than the latest/);
  });
});

describe('normalizeSupportNumber', () => {
  it('keeps digits with a country code and drops separators and +', () => {
    expect(normalizeSupportNumber('+91 98765-43210')).toBe('919876543210');
    expect(normalizeSupportNumber('919876543210')).toBe('919876543210');
  });

  it('puts 91 in front of a 10-digit number, like the server', () => {
    expect(normalizeSupportNumber('98765 43210')).toBe('919876543210');
  });

  it('allows empty (hides the button) and rejects bad values', () => {
    expect(normalizeSupportNumber('  ')).toBe('');
    expect(normalizeSupportNumber('12345')).toBeNull();
    expect(normalizeSupportNumber('1'.repeat(16))).toBeNull();
    expect(normalizeSupportNumber('98765abcde')).toBeNull();
  });
});

describe('supportTestLink', () => {
  it('opens wa.me with the message and sample values for the marks', () => {
    const link = supportTestLink('9876543210', 'Help for {{businessName}} ({{email}})');
    expect(link.startsWith('https://wa.me/919876543210?text=')).toBe(true);
    expect(decodeURIComponent(link.split('text=')[1])).toBe('Help for Test Business (test@example.com)');
  });

  it('is null without a valid number', () => {
    expect(supportTestLink('', 'hi')).toBeNull();
    expect(supportTestLink('123', 'hi')).toBeNull();
  });
});

describe('validateAppConfig support fields', () => {
  it('accepts an empty or valid number and a message up to 500 characters', () => {
    expect(validateAppConfig({ ...good, supportWhatsappNumber: '', supportMessage: 'Hi' })).toEqual({});
    expect(validateAppConfig({ ...good, supportWhatsappNumber: '919876543210', supportMessage: 'x'.repeat(500) })).toEqual({});
  });

  it('flags a bad number and a blank or too long message', () => {
    const errors = validateAppConfig({ ...good, supportWhatsappNumber: '123', supportMessage: '  ' });
    expect(errors.supportWhatsappNumber).toBeDefined();
    expect(errors.supportMessage).toBeDefined();
    expect(validateAppConfig({ ...good, supportMessage: 'x'.repeat(501) }).supportMessage).toBeDefined();
  });
});

describe('warningFlags', () => {
  it('warns when force update is turned on', () => {
    expect(warningFlags(good, { ...good, forceUpdate: true }).blocksOldVersions).toBe(true);
  });

  it('warns when maintenance is turned on', () => {
    expect(warningFlags(good, { ...good, maintenanceMode: true }).maintenance).toBe(true);
  });

  it('warns when min is raised while force update is on', () => {
    const saved = { ...good, forceUpdate: true };
    const next = { ...saved, androidMinVersion: '1.3.0' };
    expect(warningFlags(saved, next).blocksOldVersions).toBe(true);
  });

  it('does not warn for other saves', () => {
    const saved = { ...good, forceUpdate: true, maintenanceMode: true };
    const lowered = { ...saved, androidMinVersion: '1.1.0' };
    expect(warningFlags(saved, lowered)).toEqual({ blocksOldVersions: false, maintenance: false });
    const raisedNoForce = { ...good, androidMinVersion: '1.3.0' };
    expect(warningFlags(good, raisedNoForce).blocksOldVersions).toBe(false);
    expect(warningFlags(saved, { ...saved, forceUpdate: false }).blocksOldVersions).toBe(false);
  });
});

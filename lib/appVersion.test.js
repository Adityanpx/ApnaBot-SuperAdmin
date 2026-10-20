// lib/appVersion.test.js

import {
  isValidVersion, compareVersions, isValidPlayStoreUrl, validateAppConfig, warningFlags,
  PLAY_STORE_PREFIX,
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

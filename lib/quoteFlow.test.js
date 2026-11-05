import {
  blockersOf, canEnable, enableBody, installStatus, isProtected, isQuoteCategory, requiredAcknowledgement, sortedItems, switchError,
} from './quoteFlow';

const item = (key, status) => ({ key, status, title: key, detail: '' });
const base = {
  ready: true,
  enabled: false,
  installed: { state: 'not_installed' },
  acknowledgements: [{ key: 'round_trip_to_team', text: 'Round Trip goes to my team', required: false }],
  items: [item('category', 'ok'), item('routes_one_way', 'block'), item('advance', 'warn')],
};

describe('quoteFlow', () => {
  it('only travels and cab get the card', () => {
    expect(isQuoteCategory('travels')).toBe(true);
    expect(isQuoteCategory('cab')).toBe(true);
    expect(isQuoteCategory('salon')).toBe(false);
  });

  it('sorts blocking, warnings, ok', () => {
    expect(sortedItems(base.items).map((i) => i.key)).toEqual(['routes_one_way', 'advance', 'category']);
  });

  it('knows a protected business and lists blockers', () => {
    expect(isProtected({ items: [item('not_protected', 'block')] })).toBe(true);
    expect(isProtected(base)).toBe(false);
    expect(blockersOf(base).map((i) => i.key)).toEqual(['routes_one_way']);
  });

  it('Enable needs a ready checklist, not protected, not already on; the acknowledgement only when required', () => {
    expect(canEnable(base, false)).toBe(true);
    expect(canEnable({ ...base, ready: false }, false)).toBe(false);
    expect(canEnable({ ...base, items: [item('not_protected', 'block')] }, false)).toBe(false);
    expect(canEnable({ ...base, enabled: true }, false)).toBe(false);
    const required = { ...base, acknowledgements: [{ key: 'round_trip_to_team', text: 't', required: true }] };
    expect(requiredAcknowledgement(required).key).toBe('round_trip_to_team');
    expect(canEnable(required, false)).toBe(false);
    expect(canEnable(required, true)).toBe(true);
    expect(requiredAcknowledgement({ ...required, installed: { state: 'installed' } })).toBeNull();
  });

  it('sends only the allowed body fields', () => {
    expect(enableBody(base, ' Fare ', true)).toEqual({ keyword: 'fare' });
    const required = { ...base, acknowledgements: [{ key: 'round_trip_to_team', text: 't', required: true }] };
    expect(enableBody(required, '', true)).toEqual({ keyword: 'quote', acknowledgeRoundTripTeam: true });
    expect(enableBody({ ...base, installed: { state: 'installed' } }, 'x', false)).toEqual({});
  });

  it('reads message, code and readiness out of a refusal', () => {
    const info = switchError({ response: { data: { message: 'Not ready', errors: { code: 'NOT_READY', readiness: base } } } });
    expect(info).toEqual({ message: 'Not ready', code: 'NOT_READY', readiness: base });
    expect(switchError({ message: 'Network Error' })).toEqual({ message: 'Network Error', code: null, readiness: null });
  });

  it('treats dormant as installed-but-not-active: Enable stays available, steps exist', () => {
    const dormant = { ...base, installed: { state: 'dormant' } };
    expect(installStatus(dormant)).toMatchObject({ state: 'dormant', label: 'Installed, not active yet', variant: 'neutral', hasSteps: true });
    expect(canEnable(dormant, false)).toBe(true);
    expect(canEnable({ ...dormant, ready: false }, false)).toBe(false);
  });

  it('falls back safely for an unknown or missing install state', () => {
    for (const installed of [{ state: 'something_new' }, {}, undefined]) {
      const r = { ...base, installed };
      expect(installStatus(r)).toMatchObject({ label: 'Install status unknown', variant: 'neutral', hasSteps: false });
      expect(canEnable(r, false)).toBe(true);
      expect(enableBody(r, 'quote', false)).toEqual({ keyword: 'quote' });
    }
    expect(installStatus(null).label).toBe('Install status unknown');
  });
});

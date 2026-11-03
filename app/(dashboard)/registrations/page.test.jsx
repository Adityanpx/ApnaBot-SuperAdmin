// app/(dashboard)/registrations/page.test.jsx

import { toast } from 'sonner';
import RegistrationsPage from '@/app/(dashboard)/registrations/page';
import { useRegistrations } from '@/hooks/useRegistrations';
import { downloadCsv } from '@/lib/downloadCsv';
import { API } from '@/lib/constants';
import { mount, click, type, flush, buttonByText } from '@/tests/helpers/dom';

jest.mock('@/hooks/useRegistrations', () => ({ useRegistrations: jest.fn() }));
jest.mock('@/lib/downloadCsv', () => ({ downloadCsv: jest.fn() }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));

const hook = (over) => ({
  registrations: [], total: 0, loading: false, error: null, refetch: jest.fn(), ...over,
});
const lastQuery = () => useRegistrations.mock.calls[useRegistrations.mock.calls.length - 1][0];

describe('RegistrationsPage', () => {
  beforeEach(() => { jest.clearAllMocks(); useRegistrations.mockReturnValue(hook()); });

  it('asks for the first page with no filters', () => {
    const { unmount } = mount(<RegistrationsPage />);
    expect(lastQuery()).toEqual({ search: '', page: 1, includeInactive: false, unverifiedOnly: false });
    unmount();
  });

  it('shows the server error with a retry instead of the table', () => {
    const refetch = jest.fn();
    useRegistrations.mockReturnValue(hook({ error: 'Forbidden', refetch }));
    const { container, unmount } = mount(<RegistrationsPage />);
    expect(container.textContent).toContain('Could not load registrations');
    expect(container.textContent).toContain('Forbidden');
    unmount();
  });

  it('a filter switch is passed to the hook and goes back to page 1', () => {
    const { container, unmount } = mount(<RegistrationsPage />);
    click(container.querySelector('button[aria-label="Unverified only"]'));
    expect(lastQuery()).toMatchObject({ unverifiedOnly: true, page: 1 });
    click(container.querySelector('button[aria-label="Show inactive"]'));
    expect(lastQuery()).toMatchObject({ includeInactive: true, unverifiedOnly: true });
    unmount();
  });

  it('exports the CSV with the current filters', async () => {
    downloadCsv.mockResolvedValue();
    const { container, unmount } = mount(<RegistrationsPage />);
    click(container.querySelector('button[aria-label="Unverified only"]'));
    click(buttonByText(container, 'Export CSV'));
    await flush();
    expect(downloadCsv).toHaveBeenCalledWith(
      API.REGISTRATIONS_NO_BUSINESS_CSV, { unverifiedOnly: 'true' }, 'registered-no-business.csv'
    );
    unmount();
  });

  it('toasts when the export fails', async () => {
    downloadCsv.mockRejectedValue(new Error('boom'));
    const { container, unmount } = mount(<RegistrationsPage />);
    click(buttonByText(container, 'Export CSV'));
    await flush();
    expect(toast.error).toHaveBeenCalledWith('Could not export the CSV');
    unmount();
  });

  it('keeps typed search in the box', () => {
    const { container, unmount } = mount(<RegistrationsPage />);
    type(container.querySelector('input'), 'ravi');
    expect(container.querySelector('input').value).toBe('ravi');
    unmount();
  });
});

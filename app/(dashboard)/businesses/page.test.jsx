// app/(dashboard)/businesses/page.test.jsx

import { toast } from 'sonner';
import BusinessesPage from '@/app/(dashboard)/businesses/page';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useCategorySummary } from '@/hooks/useCategorySummary';
import { downloadCsv } from '@/lib/downloadCsv';
import { API } from '@/lib/constants';
import { mount, click, flush, buttonByText } from '@/tests/helpers/dom';

jest.mock('@/hooks/useBusinesses', () => ({ useBusinesses: jest.fn() }));
jest.mock('@/hooks/useCategorySummary', () => ({ useCategorySummary: jest.fn() }));
jest.mock('@/hooks/useCategoryOptions', () => ({
  useCategoryOptions: () => ({ categories: [], labelOf: (v) => v }),
}));
jest.mock('@/lib/downloadCsv', () => ({ downloadCsv: jest.fn() }));
jest.mock('sonner', () => ({ toast: { success: jest.fn(), error: jest.fn() } }));
jest.mock('next/navigation', () => ({ useRouter: () => ({ push: jest.fn() }) }));

const hook = (over) => ({
  businesses: [], pagination: { total: 0, pages: 1 }, loading: false, page: 1, limit: 15,
  search: '', isActive: '', businessType: '', connected: '',
  handleSearchChange: jest.fn(), handleActiveChange: jest.fn(), handleTypeChange: jest.fn(),
  handleConnectedChange: jest.fn(), handlePageChange: jest.fn(), toggleBusiness: jest.fn(), deleteBusiness: jest.fn(),
  ...over,
});
const summary = { total: 6, categories: [{ value: 'salon', label: 'Salon', count: 2 }], loading: false };

describe('BusinessesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useBusinesses.mockReturnValue(hook());
    useCategorySummary.mockReturnValue(summary);
  });

  it('shows the category summary strip and a chip filters the list by category', () => {
    const handleTypeChange = jest.fn();
    useBusinesses.mockReturnValue(hook({ handleTypeChange }));
    const { container, unmount } = mount(<BusinessesPage />);
    expect(container.textContent).toContain('All 6');
    click(buttonByText(container, 'Salon 2'));
    expect(handleTypeChange).toHaveBeenCalledWith('salon');
    unmount();
  });

  it('exports the CSV with the filters the list is showing', async () => {
    downloadCsv.mockResolvedValue();
    useBusinesses.mockReturnValue(hook({
      search: 'ravi', isActive: 'true', businessType: 'salon', connected: 'false',
    }));
    const { container, unmount } = mount(<BusinessesPage />);
    click(buttonByText(container, 'Export CSV'));
    await flush();
    expect(downloadCsv).toHaveBeenCalledWith(
      API.BUSINESSES_CSV,
      { search: 'ravi', isActive: 'true', businessCategory: 'salon', connected: 'false' },
      'businesses.csv'
    );
    unmount();
  });

  it('exports with no params when no filter is set', async () => {
    downloadCsv.mockResolvedValue();
    const { container, unmount } = mount(<BusinessesPage />);
    click(buttonByText(container, 'Export CSV'));
    await flush();
    expect(downloadCsv).toHaveBeenCalledWith(API.BUSINESSES_CSV, {}, 'businesses.csv');
    unmount();
  });

  it('toasts when the export fails', async () => {
    downloadCsv.mockRejectedValue(new Error('boom'));
    const { container, unmount } = mount(<BusinessesPage />);
    click(buttonByText(container, 'Export CSV'));
    await flush();
    expect(toast.error).toHaveBeenCalledWith('Could not export the CSV');
    unmount();
  });
});

import type { FilterStatusOption } from '../components/molecules/FilterStatusPopover';

export const ACTIVE_STATUS_FILTER_OPTIONS: FilterStatusOption[] = [
  {
    key: 'aktif',
    label: 'Aktif',
    pillClass: 'bg-[#E4F6EC] text-[#0B7A4E]',
    dotClass: 'bg-[#12A06B]',
  },
  {
    key: 'nonaktif',
    label: 'Nonaktif',
    pillClass: 'bg-[#FDECEC] text-[#B42318]',
    dotClass: 'bg-[#E5484D]',
  },
];

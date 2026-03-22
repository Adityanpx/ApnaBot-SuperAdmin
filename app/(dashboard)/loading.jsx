// app/(dashboard)/loading.jsx
// Next.js uses this automatically as the Suspense fallback
// while a page segment is loading

import Spinner from '@/components/ui/Spinner';

export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Spinner size="lg" />
    </div>
  );
}

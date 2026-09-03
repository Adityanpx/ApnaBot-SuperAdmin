// app/(dashboard)/businesses/[id]/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ToggleLeft, ToggleRight, RefreshCcw, CreditCard, Trash2, ShieldCheck, Eye } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import { summarizeDeletedCounts } from '@/hooks/useBusinesses';
import BusinessDetailCard from '@/components/businesses/BusinessDetailCard';
import BusinessSubscriptionCard from '@/components/businesses/BusinessSubscriptionCard';
import SubscriptionHistoryCard from '@/components/businesses/SubscriptionHistoryCard';
import Button from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';

// These modals are built in Step 10
import ToggleBusinessModal    from '@/components/businesses/ToggleBusinessModal';
import ChangePlanModal        from '@/components/businesses/ChangePlanModal';
import ExtendSubModal         from '@/components/businesses/ExtendSubModal';
import GrantSubscriptionModal from '@/components/businesses/GrantSubscriptionModal';
import GrantPreviewCreditsModal from '@/components/businesses/GrantPreviewCreditsModal';
import DeleteBusinessModal    from '@/components/businesses/DeleteBusinessModal';

export default function BusinessDetailPage() {
  const { id }    = useParams();
  const router    = useRouter();

  const [business,     setBusiness]     = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [plan,         setPlan]         = useState(null);
  const [staffCount,   setStaffCount]   = useState(0);
  const [subHistory,   setSubHistory]   = useState([]);
  const [loading,      setLoading]      = useState(true);

  // Modal state
  const [toggleModal, setToggleModal]  = useState(false);
  const [planModal,   setPlanModal]    = useState(false);
  const [extendModal, setExtendModal]  = useState(false);
  const [grantModal,  setGrantModal]   = useState(false);
  const [creditsModal, setCreditsModal] = useState(false);
  const [deleteModal, setDeleteModal]  = useState(false);

  // ── Delete business (permanent — removes all related data) ─────────────
  const handleDeleteBusiness = async (businessId) => {
    try {
      const res = await api.delete(API.BUSINESS_BY_ID(businessId));
      const { businessName, deleted } = res.data.data;

      toast.success(`${businessName} deleted`, {
        description: `Removed ${summarizeDeletedCounts(deleted)}.`,
      });
      router.replace('/businesses');
      return true;
    } catch (err) {
      toast.error(err.userMessage || 'Failed to delete business');
      return false;
    }
  };

  // ── Fetch business data ──────────────────────────────────────────────────
  const fetchBusiness = async () => {
    try {
      setLoading(true);
      const res = await api.get(API.BUSINESS_BY_ID(id));
      const { business, subscription, plan, staffCount } = res.data.data;
      setBusiness(business);
      setSubscription(subscription);
      setPlan(plan);
      setStaffCount(staffCount);
    } catch (err) {
      toast.error(err.userMessage || 'Failed to load business');
      router.replace('/businesses');
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch subscription history ──────────────────────────────────────────
  const fetchSubHistory = async () => {
    try {
      const res = await api.get(API.BUSINESS_SUBSCRIPTION_HISTORY(id));
      setSubHistory(res.data.data.subscriptions);
    } catch (err) {
      toast.error(err.userMessage || 'Failed to load subscription history');
    }
  };

  useEffect(() => { fetchBusiness(); fetchSubHistory(); }, [id]);

  // ── Render ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 max-w-screen-lg">
        <SkeletonCard className="h-16" lines={1} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <SkeletonCard lines={4} />
            <SkeletonCard lines={3} />
          </div>
          <div className="space-y-4">
            <SkeletonCard lines={4} />
            <SkeletonCard lines={5} />
          </div>
        </div>
      </div>
    );
  }

  if (!business) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="space-y-6 max-w-screen-lg"
    >
      {/* Back + action buttons */}
      <div className="flex items-center justify-between gap-4 flex-wrap">

        {/* Back */}
        <Link href="/businesses">
          <button className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Business
          </button>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            icon={business.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            onClick={() => setToggleModal(true)}
          >
            {business.isActive ? 'Deactivate' : 'Activate'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCcw className="w-4 h-4" />}
            onClick={() => setExtendModal(true)}
          >
            Extend Subscription
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<CreditCard className="w-4 h-4" />}
            onClick={() => setPlanModal(true)}
          >
            Change Plan
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={<ShieldCheck className="w-4 h-4" />}
            onClick={() => setGrantModal(true)}
          >
            Grant Subscription
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={<Eye className="w-4 h-4" />}
            onClick={() => setCreditsModal(true)}
          >
            Grant Previews
          </Button>

          <Button
            variant="danger"
            size="sm"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => setDeleteModal(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — business info */}
        <BusinessDetailCard business={business} staffCount={staffCount} />

        {/* Right — subscription */}
        <div className="space-y-6">
          <BusinessSubscriptionCard subscription={subscription} plan={plan} />
          <SubscriptionHistoryCard history={subHistory} />
        </div>
      </div>

      {/* Modals — built in Step 10 */}
      <ToggleBusinessModal
        open={toggleModal}
        onClose={() => setToggleModal(false)}
        business={business}
        onSuccess={(updatedBusiness) => { setBusiness(updatedBusiness); setToggleModal(false); }}
      />

      <ChangePlanModal
        open={planModal}
        onClose={() => setPlanModal(false)}
        businessId={id}
        currentPlanId={plan?._id}
        onSuccess={() => { fetchBusiness(); setPlanModal(false); }}
      />

      <ExtendSubModal
        open={extendModal}
        onClose={() => setExtendModal(false)}
        businessId={id}
        businessName={business.name}
        currentEndDate={subscription?.endDate}
        onSuccess={() => { fetchBusiness(); setExtendModal(false); }}
      />

      <GrantSubscriptionModal
        open={grantModal}
        onClose={() => setGrantModal(false)}
        businessId={id}
        businessName={business.name}
        onSuccess={() => { fetchBusiness(); fetchSubHistory(); setGrantModal(false); }}
      />

      <GrantPreviewCreditsModal
        open={creditsModal}
        onClose={() => setCreditsModal(false)}
        businessId={id}
        businessName={business.name}
        onSuccess={() => { fetchBusiness(); setCreditsModal(false); }}
      />

      <DeleteBusinessModal
        open={deleteModal}
        business={business}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDeleteBusiness}
      />
    </motion.div>
  );
}

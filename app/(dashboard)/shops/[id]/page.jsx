// app/(dashboard)/shops/[id]/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ToggleLeft, ToggleRight, RefreshCcw, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import api from '@/lib/api';
import { API } from '@/lib/constants';
import ShopDetailCard from '@/components/shops/ShopDetailCard';
import ShopSubscriptionCard from '@/components/shops/ShopSubscriptionCard';
import Button from '@/components/ui/Button';
import { SkeletonCard } from '@/components/ui/Skeleton';

// These modals are built in Step 10
import ToggleShopModal   from '@/components/shops/ToggleShopModal';
import ChangePlanModal   from '@/components/shops/ChangePlanModal';
import ExtendSubModal    from '@/components/shops/ExtendSubModal';

export default function ShopDetailPage() {
  const { id }    = useParams();
  const router    = useRouter();

  const [shop,         setShop]         = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [plan,         setPlan]         = useState(null);
  const [staffCount,   setStaffCount]   = useState(0);
  const [loading,      setLoading]      = useState(true);

  // Modal state
  const [toggleModal, setToggleModal]  = useState(false);
  const [planModal,   setPlanModal]    = useState(false);
  const [extendModal, setExtendModal]  = useState(false);

  // ── Fetch shop data ─────────────────────────────────────────────────────
  const fetchShop = async () => {
    try {
      setLoading(true);
      const res = await api.get(API.SHOP_BY_ID(id));
      const { shop, subscription, plan, staffCount } = res.data.data;
      setShop(shop);
      setSubscription(subscription);
      setPlan(plan);
      setStaffCount(staffCount);
    } catch (err) {
      toast.error(err.userMessage || 'Failed to load shop');
      router.replace('/shops');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShop(); }, [id]);

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

  if (!shop) return null;

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
        <Link href="/shops">
          <button className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Shops
          </button>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="secondary"
            size="sm"
            icon={shop.isActive ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
            onClick={() => setToggleModal(true)}
          >
            {shop.isActive ? 'Deactivate' : 'Activate'}
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
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — shop info */}
        <ShopDetailCard shop={shop} staffCount={staffCount} />

        {/* Right — subscription */}
        <ShopSubscriptionCard subscription={subscription} plan={plan} />
      </div>

      {/* Modals — built in Step 10 */}
      <ToggleShopModal
        open={toggleModal}
        onClose={() => setToggleModal(false)}
        shop={shop}
        onSuccess={(updatedShop) => { setShop(updatedShop); setToggleModal(false); }}
      />

      <ChangePlanModal
        open={planModal}
        onClose={() => setPlanModal(false)}
        shopId={id}
        currentPlanId={plan?._id}
        onSuccess={() => { fetchShop(); setPlanModal(false); }}
      />

      <ExtendSubModal
        open={extendModal}
        onClose={() => setExtendModal(false)}
        shopId={id}
        shopName={shop.name}
        currentEndDate={subscription?.endDate}
        onSuccess={() => { fetchShop(); setExtendModal(false); }}
      />
    </motion.div>
  );
}
// src/vendor/pages/EarningsPage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { buildApiUrl } from '../../utils/api';
import { toast } from 'react-toastify';
import PendingNotice from '../components/PendingNotice';
import {
  IndianRupee,
  Calendar,
  CheckCircle,
  XCircle,
  TrendingUp,
  Camera,
  Music,
  Sparkles,
  Utensils,
  Building2,
  Video,
  Flower2,
  Tag,
  Loader2,
  RefreshCw
} from 'lucide-react';

// ——— Utilities
const categoryIcon = (cat) => {
  const icons = {
    photography: Camera,
    videography: Video,
    music: Music,
    catering: Utensils,
    venues: Building2,
    decorations: Flower2,
    makeup: Sparkles,
    cakes: Tag,
    mandap: Building2,
    hosts: Music,
  };
  return icons[cat] || Tag;
};

const inr = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;
const dt = (d) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

// ——— UI Primitives
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-100 rounded-md ${className}`} />
);

const StatCard = ({ title, value, subtitle, icon: Icon, trend, className = '' }) => (
  <div className={`bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow ${className}`}>
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm text-gray-600 font-medium truncate">{title}</p>
        <p className="text-2xl font-semibold text-gray-950 mt-1">{value}</p>
        {subtitle && (
          <p
            className={`text-sm mt-1 ${
              trend === 'up'
                ? 'text-green-600'
                : trend === 'down'
                ? 'text-red-600'
                : 'text-gray-500'
            }`}
          >
            {subtitle}
          </p>
        )}
      </div>
      {Icon && (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 ring-1 ring-black/5 flex items-center justify-center shrink-0">
          <Icon className="w-6 h-6 text-gray-700" />
        </div>
      )}
    </div>
  </div>
);

const ServiceCard = ({ service }) => {
  const Icon = categoryIcon(service.category);
  const completionRate =
    service.bookingsCount > 0
      ? ((service.completedCount / service.bookingsCount) * 100).toFixed(0)
      : 0;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 ring-1 ring-black/5 flex items-center justify-center">
            <Icon className="w-5 h-5 text-gray-700" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-950 truncate">{service.serviceName}</h3>
            <p className="text-sm text-gray-500 capitalize truncate">{service.category}</p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-semibold text-gray-950">{inr(service.totalEarnings)}</p>
          <p className="text-sm text-gray-500">{service.bookingsCount} bookings</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <p className="text-xs text-gray-500">Completed</p>
          <p className="text-base font-semibold text-green-700">{service.completedCount}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Cancelled</p>
          <p className="text-base font-semibold text-red-600">{service.cancelledCount}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-500">Avg. Value</p>
          <p className="text-base font-semibold text-gray-950">{inr(service.avgBookingValue)}</p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-600">Completion Rate</span>
          <span className="font-medium text-gray-950">{completionRate}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const isCompleted = status === 'completed';
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${
        isCompleted
          ? 'bg-green-50 text-green-700 border-green-200'
          : 'bg-gray-50 text-gray-600 border-gray-200'
      }`}
    >
      {isCompleted ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {status}
    </span>
  );
};

const TransactionRow = ({ transaction }) => (
  <div className="py-3 border-b border-gray-100 last:border-0">
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="font-medium text-gray-950 truncate">{transaction.customerName}</p>
        <p className="text-sm text-gray-600 truncate">{transaction.serviceName}</p>
        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
          <span className="truncate">{transaction.bookingNumber}</span>
          {transaction.commission != null && (
            <span className="truncate">Commission: {inr(transaction.commission)}</span>
          )}
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="font-semibold text-gray-950">{inr(transaction.amount)}</p>
        {transaction.grossAmount != null && (
          <p className="text-xs text-gray-500">Gross: {inr(transaction.grossAmount)}</p>
        )}
        <p className="text-sm text-gray-500">{dt(transaction.date)}</p>
        <div className="mt-1">
          <StatusBadge status={transaction.status} />
        </div>
      </div>
    </div>
  </div>
);

// ——— Page
const EarningsPage = () => {
  const { vendorData } = useOutletContext();
  const [earningsData, setEarningsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  if (!vendorData.vendorInfo.verified) {
    return <PendingNotice title="Application under process" />;
  }

  useEffect(() => {
    fetchEarnings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEarnings = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('vendorToken');
      const response = await axios.get(buildApiUrl('/api/vendor/earnings'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data.success) {
        setEarningsData(response.data.data);
      } else {
        throw new Error('Failed to fetch earnings data');
      }
    } catch (error) {
      console.error('Fetch earnings error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load earnings data';
      setError(errorMessage);
      toast.error(errorMessage);
      setEarningsData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const monthlyGrowth = useMemo(() => {
    if (!earningsData) return 0;
    const current = earningsData.thisMonth;
    const previous = earningsData.lastMonth;
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  }, [earningsData]);

  const completionRate = useMemo(() => {
    if (!earningsData) return 0;
    const { completedBookings, totalBookings } = earningsData;
    return totalBookings > 0 ? ((completedBookings / totalBookings) * 100).toFixed(1) : 0;
  }, [earningsData]);

  // ——— Loading State (Skeletons)
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-72 mt-2" />
          </div>
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-28 rounded-xl" />
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  // ——— Error State
  if (error || !earningsData) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-sm">
          <div className="mx-auto w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <XCircle className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-gray-950 mt-3">Failed to load earnings</h2>
          <p className="text-sm text-gray-600 mt-1">{error || 'Please try again'}</p>
          <button
            onClick={fetchEarnings}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-black transition"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ——— Main Content
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-950">Earnings</h2>
          <p className="text-sm text-gray-600">Track revenue and service performance</p>
          {earningsData?.commissionRate != null && (
            <p className="text-xs text-gray-500 mt-1">
              Platform commission: {earningsData.commissionRate}% • Earnings shown after commission
            </p>
          )}
        </div>
        <button
          onClick={fetchEarnings}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 disabled:opacity-50 transition"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Earnings"
          value={inr(earningsData.totalEarnings)}
          subtitle="After commission"
          icon={IndianRupee}
          className="lg:col-span-2"
        />
        <StatCard
          title="This Month"
          value={inr(earningsData.thisMonth)}
          subtitle={`${monthlyGrowth > 0 ? '+' : ''}${monthlyGrowth}% vs last month`}
          trend={monthlyGrowth >= 0 ? 'up' : 'down'}
          icon={TrendingUp}
        />
        <StatCard
          title="Completion Rate"
          value={`${completionRate}%`}
          subtitle={`${earningsData.completedBookings}/${earningsData.totalBookings} bookings`}
          icon={CheckCircle}
        />
      </div>

      {/* Commission / Revenue Summary */}
      {earningsData?.summary && (
        <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Revenue Summary</h3>
          <div className="grid sm:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-blue-700">Gross Revenue</p>
              <p className="font-semibold text-blue-900">{inr(earningsData.summary.totalGrossRevenue)}</p>
            </div>
            <div>
              <p className="text-blue-700">Platform Commission</p>
              <p className="font-semibold text-blue-900">-{inr(earningsData.summary.totalCommissionPaid)}</p>
            </div>
            <div>
              <p className="text-blue-700">Your Earnings</p>
              <p className="font-semibold text-blue-900">{inr(earningsData.totalEarnings)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Service Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-gray-950 mb-4">Service Performance</h3>
        {earningsData.serviceBreakdown && earningsData.serviceBreakdown.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {earningsData.serviceBreakdown.map((service, idx) => (
              <ServiceCard key={(service.category || '') + idx} service={service} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center shadow-sm">
            <p className="text-gray-700 font-medium">No service data yet</p>
            <p className="text-sm text-gray-500 mt-1">Complete bookings to see performance</p>
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-950">Recent Transactions</h3>
          <p className="text-sm text-gray-600">Latest completed bookings</p>
        </div>
        <div className="p-5">
          {earningsData.recentTransactions && earningsData.recentTransactions.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {earningsData.recentTransactions.map((transaction) => (
                <TransactionRow key={transaction.id} transaction={transaction} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-700 font-medium">No transactions yet</p>
              <p className="text-sm text-gray-500 mt-1">Completed bookings will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EarningsPage;

// src/vendor/pages/AnalyticsPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { buildApiUrl } from '../../utils/api';
import PendingNotice from '../components/PendingNotice';
import {
  BarChart2,
  PieChart as PieIcon,
  LineChart as LineIcon,
  RefreshCw,
  Eye,
  Handshake,
  CalendarDays,
} from 'lucide-react';
import { format } from 'date-fns';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const inr = (n) => `₹${(n || 0).toLocaleString('en-IN')}`;

const KPI = ({ icon: Icon, label, value, hint }) => (
  <div className="bg-white border rounded-xl p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-xl font-semibold text-gray-900 mt-1">{value}</p>
        {hint ? <p className="text-xs text-gray-500 mt-1">{hint}</p> : null}
      </div>
      <div className="w-10 h-10 rounded-lg bg-gray-100 grid place-items-center">
        <Icon className="w-5 h-5 text-gray-700" />
      </div>
    </div>
  </div>
);

const RangeChip = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full border text-sm ${
      active ? 'bg-gray-900 text-white border-gray-900' : 'bg-white hover:bg-gray-50'
    }`}
  >
    {children}
  </button>
);

const COLORS = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#a78bfa', '#14b8a6'];

const AnalyticsPage = () => {
  const { vendorData } = useOutletContext();
  const [range, setRange] = useState('30d'); // 7d | 30d | 90d
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);

  if (!vendorData.vendorInfo.verified) {
    return <PendingNotice title="Application under process" />;
  }

  useEffect(() => {
    fetchAnalytics(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const fetchAnalytics = async (r) => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('vendorToken');
      // Expected backend: GET /api/vendor/analytics?range=7d|30d|90d
      const res = await axios.get(buildApiUrl(`/api/vendor/analytics`), {
        params: { range: r },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success) {
        setData(res.data.data || null);
      } else {
        throw new Error('Failed to load analytics');
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Failed to load analytics');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const trendData = useMemo(() => {
    // bookings over time: [{ date, bookings, revenue }]
    return (data?.timeseries || []).map((d) => ({
      ...d,
      dateLabel: d.date ? format(new Date(d.date), 'dd MMM') : '',
    }));
  }, [data]);

  const statusData = useMemo(() => {
    // [{ status, count }]
    return data?.bookingsByStatus || [];
  }, [data]);

  const categoryData = useMemo(() => {
    // [{ category, value }] value is earnings share
    return data?.categoryShare || [];
  }, [data]);

  const totals = data?.totals || {
    views: 0,
    inquiries: 0,
    bookings: 0,
    conversionRate: 0,
    revenueAfterCommission: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Analytics</h2>
          <p className="text-sm text-gray-500">
            Traffic, conversions, and category performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RangeChip active={range === '7d'} onClick={() => setRange('7d')}>
            7 days
          </RangeChip>
          <RangeChip active={range === '30d'} onClick={() => setRange('30d')}>
            30 days
          </RangeChip>
          <RangeChip active={range === '90d'} onClick={() => setRange('90d')}>
            90 days
          </RangeChip>
          <button
            onClick={() => fetchAnalytics(range)}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Loading / Error */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <svg className="w-8 h-8 animate-spin text-gray-400 mx-auto" viewBox="0 0 24 24" />
            <p className="text-gray-600 mt-2">Loading analytics…</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white border rounded-xl p-10 text-center">
          <p className="text-gray-700 font-medium">Failed to load analytics</p>
          <p className="text-sm text-gray-500 mt-1">{error}</p>
          <button
            onClick={() => fetchAnalytics(range)}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 text-white text-sm hover:bg-black"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPI icon={Eye} label="Views" value={totals.views?.toLocaleString('en-IN')} hint="Profile & listing views" />
            <KPI icon={Handshake} label="Inquiries" value={totals.inquiries?.toLocaleString('en-IN')} hint="Leads generated" />
            <KPI icon={CalendarDays} label="Bookings" value={totals.bookings?.toLocaleString('en-IN')} hint={`${totals.conversionRate || 0}% conversion`} />
            <KPI icon={BarChart2} label="Revenue (net)" value={inr(totals.revenueAfterCommission)} hint="After commission" />
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Line: bookings & revenue over time */}
            <div className="bg-white border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <LineIcon className="w-4 h-4 text-gray-600" />
                  <h3 className="font-semibold text-gray-900 text-sm">Trend</h3>
                </div>
                <p className="text-xs text-gray-500">Bookings & revenue</p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dateLabel" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="bookings" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Bookings" />
                    <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={false} name="Revenue" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar: bookings by status */}
            <div className="bg-white border rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-gray-600" />
                  <h3 className="font-semibold text-gray-900 text-sm">Bookings by status</h3>
                </div>
                <p className="text-xs text-gray-500">Distribution</p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie: category share */}
            <div className="bg-white border rounded-xl p-4 lg:col-span-2">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-gray-600" />
                  <h3 className="font-semibold text-gray-900 text-sm">Earnings by category</h3>
                </div>
                <p className="text-xs text-gray-500">Net earnings share</p>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={120}
                      label
                    >
                      {categoryData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;

import React from 'react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { useAuth } from '../hooks/useAuth';

const DashboardPage: React.FC = () => {
  const { profile } = useAuth();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-br from-primary/10 via-white to-white p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Welcome back</p>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">
          {profile?.displayName ?? 'Club member'}, here is your club overview.
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          This dashboard prioritizes court usage, upcoming sessions, and announcements for your
          role.
        </p>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card title="Active Players">
          <div className="flex items-center justify-between">
            <p className="text-3xl font-semibold text-slate-900">—</p>
            <Badge label="Live" tone="success" />
          </div>
          <p className="text-sm text-slate-500">
            Sync this metric from the members collection in Firestore.
          </p>
        </Card>
        <Card title="Sessions this week">
          <div className="flex items-center justify-between">
            <p className="text-3xl font-semibold text-slate-900">—</p>
            <Badge label="Live" tone="warning" />
          </div>
          <p className="text-sm text-slate-500">
            Aggregated from training sessions in the planner.
          </p>
        </Card>
        <Card title="Court usage">
          <div className="flex items-center justify-between">
            <p className="text-3xl font-semibold text-slate-900">—</p>
            <Badge label="Live" tone="info" />
          </div>
          <p className="text-sm text-slate-500">
            Derived from confirmed court bookings.
          </p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Upcoming priorities">
          <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
            Priorities will appear here once admin tasks are captured in Firestore.
          </div>
        </Card>
        <Card title="Latest announcements">
          <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
            Publish announcements from the message board to surface them on this dashboard.
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;

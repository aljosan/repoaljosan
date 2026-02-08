import React from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const AdminPage: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-semibold text-slate-900">Admin Dashboard</h2>
      <p className="mt-2 text-sm text-slate-500">
        Manage users, courts, and group assignments with full visibility.
      </p>
    </div>

    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="User management">
        <form className="grid gap-4 text-sm">
          <label className="grid gap-2">
            Member email
            <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="member@ktk.club" />
          </label>
          <label className="grid gap-2">
            Role
            <select className="rounded-lg border border-slate-200 px-3 py-2">
              <option value="admin">Admin</option>
              <option value="coach">Coach</option>
              <option value="player">Player</option>
              <option value="parent">Parent</option>
            </select>
          </label>
          <Button type="button">Invite user</Button>
        </form>
      </Card>

      <Card title="Court management">
        <div className="space-y-3 text-sm text-slate-600">
          <div className="rounded-lg border border-dashed border-slate-200 p-3">
            Add courts to the <strong>courts</strong> collection for booking.
          </div>
          <div className="rounded-lg border border-dashed border-slate-200 p-3">
            Define booking rules, time limits, and priority groups.
          </div>
          <div className="rounded-lg border border-dashed border-slate-200 p-3">
            Assign coaches to groups for planner visibility.
          </div>
        </div>
      </Card>
    </div>
  </div>
);

export default AdminPage;

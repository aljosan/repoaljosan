import React from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const GroupsPage: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-semibold text-slate-900">Groups & Teams</h2>
      <p className="mt-2 text-sm text-slate-500">
        Manage training groups by age, level, and coach assignment. Parents can view group rosters.
      </p>
    </div>

    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Create training group">
        <form className="grid gap-4 text-sm">
          <label className="grid gap-2">
            Group name
            <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="U14 Performance" />
          </label>
          <label className="grid gap-2">
            Coach
            <select className="rounded-lg border border-slate-200 px-3 py-2">
              <option>Select coach</option>
            </select>
          </label>
          <label className="grid gap-2">
            Age band
            <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="12-14" />
          </label>
          <label className="grid gap-2">
            Level
            <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Advanced" />
          </label>
          <Button type="button">Create group</Button>
        </form>
      </Card>

      <Card title="Group roster view">
        <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
          Load group rosters from Firestore to display player lists and parent links.
        </div>
        <div className="mt-4 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-500">
          Parents have read-only access to group rosters and schedules.
        </div>
      </Card>
    </div>
  </div>
);

export default GroupsPage;

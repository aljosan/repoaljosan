import React from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const AttendancePage: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-semibold text-slate-900">Attendance Tracking</h2>
      <p className="mt-2 text-sm text-slate-500">
        Track attendance per session and share visibility with parents.
      </p>
    </div>

    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Mark attendance">
        <form className="grid gap-4 text-sm">
          <label className="grid gap-2">
            Session
            <select className="rounded-lg border border-slate-200 px-3 py-2">
              <option>Select session</option>
            </select>
          </label>
          <label className="grid gap-2">
            Player
            <select className="rounded-lg border border-slate-200 px-3 py-2">
              <option>Select player</option>
            </select>
          </label>
          <label className="grid gap-2">
            Status
            <select className="rounded-lg border border-slate-200 px-3 py-2">
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="injured">Injured</option>
            </select>
          </label>
          <Button type="button">Save attendance</Button>
        </form>
      </Card>
      <Card title="Attendance history">
        <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
          Parents will see attendance history pulled from the <strong>attendance</strong> collection.
        </div>
      </Card>
    </div>
  </div>
);

export default AttendancePage;

import React from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { formatWeekday } from '../utils/date';

const BookingPage: React.FC = () => {
  const days = Array.from({ length: 7 }).map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return formatWeekday(date);
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-slate-900">Court Booking</h2>
        <p className="mt-2 text-sm text-slate-500">
          Review availability, request courts, and enforce booking rules to avoid double bookings.
        </p>
      </div>

      <Card title="Weekly availability">
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="grid grid-cols-8 gap-2 text-xs font-semibold text-slate-500">
              <div />
              {days.map((day) => (
                <div key={day} className="rounded-lg bg-slate-50 p-2 text-center">
                  {day}
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              {['Court 1', 'Court 2', 'Court 3', 'Court 4'].map((court) => (
                <div key={court} className="grid grid-cols-8 gap-2 text-sm">
                  <div className="rounded-lg border border-slate-200 bg-white p-2 font-semibold text-slate-700">
                    {court}
                  </div>
                  {days.map((day) => (
                    <div
                      key={`${court}-${day}`}
                      className="rounded-lg border border-dashed border-slate-200 bg-white p-2 text-center text-xs text-slate-400"
                    >
                      Available
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
          <span className="rounded-full bg-slate-100 px-3 py-1">Max 90 min per booking</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">Priority: coaches + teams</span>
          <span className="rounded-full bg-slate-100 px-3 py-1">Admin override enabled</span>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Create booking">
          <form className="grid gap-4 text-sm">
            <label className="grid gap-2">
              Court
              <select className="rounded-lg border border-slate-200 px-3 py-2">
                <option>Select court</option>
              </select>
            </label>
            <label className="grid gap-2">
              Date & time
              <input type="datetime-local" className="rounded-lg border border-slate-200 px-3 py-2" />
            </label>
            <label className="grid gap-2">
              Duration (minutes)
              <input type="number" min={30} max={120} className="rounded-lg border border-slate-200 px-3 py-2" />
            </label>
            <Button type="button">Request booking</Button>
          </form>
        </Card>
        <Card title="Booking rules">
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="rounded-lg border border-dashed border-slate-200 p-3">
              Configure club-specific rules in Firestore under <strong>bookingRules</strong>.
            </li>
            <li className="rounded-lg border border-dashed border-slate-200 p-3">
              Enforce priority groups by role or team membership.
            </li>
            <li className="rounded-lg border border-dashed border-slate-200 p-3">
              Admins can override conflicts for tournaments and events.
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default BookingPage;

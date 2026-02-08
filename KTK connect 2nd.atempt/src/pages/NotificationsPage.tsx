import React from 'react';
import Card from '../components/common/Card';

const NotificationsPage: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-semibold text-slate-900">Notifications</h2>
      <p className="mt-2 text-sm text-slate-500">
        Review in-app notifications for bookings, sessions, and announcements.
      </p>
    </div>

    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="In-app notification panel">
        <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
          Notifications will populate from the <strong>notifications</strong> collection.
        </div>
      </Card>
      <Card title="Email automation">
        <ul className="space-y-3 text-sm text-slate-600">
          <li className="rounded-lg border border-dashed border-slate-200 p-3">
            Configure outbound email triggers for new sessions and cancellations.
          </li>
          <li className="rounded-lg border border-dashed border-slate-200 p-3">
            Use Firebase Extensions or a server function for email delivery.
          </li>
          <li className="rounded-lg border border-dashed border-slate-200 p-3">
            Track delivery status with event logs.
          </li>
        </ul>
      </Card>
    </div>
  </div>
);

export default NotificationsPage;

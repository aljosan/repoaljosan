import React from 'react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const MessagesPage: React.FC = () => (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-semibold text-slate-900">Group Message Boards</h2>
      <p className="mt-2 text-sm text-slate-500">
        Post announcements and async updates for each training group.
      </p>
    </div>

    <div className="grid gap-4 lg:grid-cols-2">
      <Card title="Create announcement">
        <form className="grid gap-4 text-sm">
          <label className="grid gap-2">
            Group
            <select className="rounded-lg border border-slate-200 px-3 py-2">
              <option>All groups</option>
            </select>
          </label>
          <label className="grid gap-2">
            Title
            <input className="rounded-lg border border-slate-200 px-3 py-2" placeholder="Weekly focus" />
          </label>
          <label className="grid gap-2">
            Message
            <textarea className="min-h-[120px] rounded-lg border border-slate-200 px-3 py-2" />
          </label>
          <Button type="button">Publish announcement</Button>
        </form>
      </Card>
      <Card title="Recent posts">
        <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-slate-500">
          Message board posts appear here once saved to the <strong>announcements</strong> collection.
        </div>
      </Card>
    </div>
  </div>
);

export default MessagesPage;

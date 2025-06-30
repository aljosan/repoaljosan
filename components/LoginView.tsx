import React, { useState } from 'react';
import { useMembers } from '../hooks/ClubDataContext';

const LoginView: React.FC = () => {
  const { members, login } = useMembers();
  const [memberId, setMemberId] = useState<string>(members[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (memberId) {
      login(memberId);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <h1 className="text-xl font-bold text-center text-slate-800">Select Member</h1>
        <select
          className="border rounded w-full p-2"
          value={memberId}
          onChange={(e) => setMemberId(e.target.value)}
        >
          {members.map(m => (
            <option key={m.id} value={m.id}>{m.name}</option>
          ))}
        </select>
        <button type="submit" className="w-full bg-club-primary text-white rounded p-2">Login</button>
      </form>
    </div>
  );
};

export default LoginView;

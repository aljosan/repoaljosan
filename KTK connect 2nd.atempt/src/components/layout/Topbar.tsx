import React from 'react';
import Button from '../common/Button';
import { useAuth } from '../../hooks/useAuth';
import { roleLabels } from '../../types/roles';

const Topbar: React.FC = () => {
  const { profile, signOut } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">KTK Connect</p>
          <h1 className="text-lg font-semibold text-slate-900">Club Operations Hub</h1>
        </div>
        <div className="flex items-center gap-3">
          {profile ? (
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-900">{profile.displayName}</p>
              <p className="text-xs text-slate-500">{roleLabels[profile.role]}</p>
            </div>
          ) : null}
          <Button variant="secondary" onClick={signOut}>
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;

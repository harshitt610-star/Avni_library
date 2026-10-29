'use client';

import React from 'react';

export type AuthRole = 'reader' | 'parent' | 'author' | 'admin';

interface AuthRoleTabsProps {
  activeRole: AuthRole;
  onSelectRole: (role: AuthRole) => void;
}

export default function AuthRoleTabs({ activeRole, onSelectRole }: AuthRoleTabsProps) {
  const roles: { id: AuthRole; label: string; icon: string; badge: string; color: string }[] = [
    {
      id: 'reader',
      label: 'Young Reader',
      icon: '🧒',
      badge: 'Books & Quests',
      color: 'border-amber-400 text-amber-900 bg-amber-50/70',
    },
    {
      id: 'parent',
      label: 'Parent Sanctuary',
      icon: '🏡',
      badge: 'Family Link & Controls',
      color: 'border-emerald-500 text-emerald-900 bg-emerald-50/70',
    },
    {
      id: 'author',
      label: 'Author & Studio',
      icon: '✍️',
      badge: 'Publishing & Manuscripts',
      color: 'border-sky-500 text-sky-900 bg-sky-50/70',
    },
    {
      id: 'admin',
      label: 'Admin Operations',
      icon: '🛡️',
      badge: 'Editorial Command',
      color: 'border-purple-500 text-purple-900 bg-purple-50/70',
    },
  ];

  return (
    <div className="w-full bg-[#f8fbfe] p-1.5 rounded-2xl border border-[#ddeaf2] grid grid-cols-2 sm:grid-cols-4 gap-1.5 shadow-xs">
      {roles.map((r) => {
        const isActive = activeRole === r.id;
        return (
          <button
            key={r.id}
            type="button"
            onClick={() => onSelectRole(r.id)}
            className={`py-3 px-2 sm:px-3 rounded-xl transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
              isActive
                ? 'bg-white shadow-sm border border-[#ddeaf2] scale-[1.02]'
                : 'text-[#44474d] hover:bg-white/50 hover:text-[#091b31]'
            }`}
          >
            <span className="text-xl sm:text-2xl mb-1">{r.icon}</span>
            <span className="font-bold text-xs sm:text-sm text-[#091b31] tracking-tight leading-tight">
              {r.label}
            </span>
            <span className="text-[10px] text-[#74777f] font-medium hidden sm:inline-block mt-0.5 truncate max-w-[120px]">
              {r.badge}
            </span>
          </button>
        );
      })}
    </div>
  );
}


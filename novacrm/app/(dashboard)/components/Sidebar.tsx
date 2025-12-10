'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import LogoutButton from './LogoutButton';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const mainNavItems: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { label: 'Contacts', href: '/contacts', icon: UsersIcon },
  { label: 'Companies', href: '/companies', icon: BuildingOfficeIcon },
  { label: 'Deals', href: '/deals', icon: CurrencyDollarIcon },
];

const managementNavItems: NavItem[] = [
  { label: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { label: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-[100] p-2 rounded-lg bg-[#181825] border border-[#313244] md:hidden"
      >
        {isMobileOpen ? (
          <XMarkIcon className="w-6 h-6 text-[#cdd6f4]" />
        ) : (
          <Bars3Icon className="w-6 h-6 text-[#cdd6f4]" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[95] md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        className={`
          fixed left-0 top-0 h-screen bg-[#181825] border-r border-[#313244] py-8 z-[99] flex flex-col
          transition-all duration-300 ease-in-out
          ${isExpanded ? 'w-[280px] px-6' : 'w-[80px] px-3'}
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0
        `}
      >
        {/* Logo Section */}
        <div className="mb-6 pb-6 border-b border-[#313244]">
          <div className="flex justify-center items-center overflow-hidden">
            <Image
              src="/nova-crm-icon.svg"
              alt="Nova"
              width={40}
              height={40}
              priority
              className="transition-opacity duration-300"
            />
          </div>
        </div>

      {/* Main Navigation Section */}
      <nav className="space-y-8 flex-1 min-h-0 overflow-y-auto">
        <div>
          {isExpanded && (
            <h3 className="text-[#7f849c] text-xs font-semibold uppercase mb-2 transition-opacity duration-300">
              MAIN
            </h3>
          )}
          <ul className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`
                      flex items-center rounded-lg
                      text-[0.95rem] font-medium
                      transition-all duration-200 ease-in-out
                      ${isExpanded ? 'gap-3 px-4 py-3' : 'justify-center py-3 px-2'}
                      ${
                        active
                          ? 'bg-gradient-to-r from-[rgba(242,92,5,0.15)] to-[rgba(242,92,5,0.05)] text-[#F25C05] border-l-[3px] border-[#F25C05] pl-[calc(1rem-3px)] font-semibold'
                          : 'text-[#a6adc8] hover:bg-[#313244] hover:text-[#cdd6f4]'
                      }
                      ${!isExpanded && active ? 'border-l-[3px] border-[#F25C05]' : ''}
                    `}
                    title={!isExpanded ? item.label : undefined}
                  >
                    <Icon className={`stroke-2 ${isExpanded ? 'w-5 h-5' : 'w-6 h-6'}`} />
                    {isExpanded && (
                      <span className="whitespace-nowrap">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Management Navigation Section */}
        <div>
          {isExpanded && (
            <h3 className="text-[#7f849c] text-xs font-semibold uppercase mb-2 transition-opacity duration-300">
              MANAGEMENT
            </h3>
          )}
          <ul className="space-y-1">
            {managementNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`
                      flex items-center rounded-lg
                      text-[0.95rem] font-medium
                      transition-all duration-200 ease-in-out
                      ${isExpanded ? 'gap-3 px-4 py-3' : 'justify-center py-3 px-2'}
                      ${
                        active
                          ? 'bg-gradient-to-r from-[rgba(242,92,5,0.15)] to-[rgba(242,92,5,0.05)] text-[#F25C05] border-l-[3px] border-[#F25C05] pl-[calc(1rem-3px)] font-semibold'
                          : 'text-[#a6adc8] hover:bg-[#313244] hover:text-[#cdd6f4]'
                      }
                      ${!isExpanded && active ? 'border-l-[3px] border-[#F25C05]' : ''}
                    `}
                    title={!isExpanded ? item.label : undefined}
                  >
                    <Icon className={`stroke-2 ${isExpanded ? 'w-5 h-5' : 'w-6 h-6'}`} />
                    {isExpanded && (
                      <span className="whitespace-nowrap">{item.label}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Logout Button - Pushed to Bottom */}
      <div className="mt-auto flex-shrink-0 pt-4">
        <LogoutButton isCollapsed={!isExpanded} />
      </div>
    </aside>
    </>
  );
}

'use client';

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
} from '@heroicons/react/24/outline';

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

  const isActive = (href: string) => pathname === href;

  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] bg-[#181825] border-r border-[#313244] px-6 py-8 z-90">
      {/* Logo Section */}
      <div className="mb-6 pb-6 border-b border-[#313244]">
        <div className="flex justify-center">
          <Image
            src="/nova-crm-logo.svg"
            alt="NovaCRM"
            width={200}
            height={60}
            priority
          />
        </div>
      </div>

      {/* Main Navigation Section */}
      <nav className="space-y-8">
        <div>
          <h3 className="text-[#7f849c] text-xs font-semibold uppercase mb-2">
            MAIN
          </h3>
          <ul className="space-y-1">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg
                      text-[0.95rem] font-medium
                      transition-all duration-200 ease-in-out
                      ${
                        active
                          ? 'bg-gradient-to-r from-[rgba(242,92,5,0.15)] to-[rgba(242,92,5,0.05)] text-[#F25C05] border-l-[3px] border-[#F25C05] pl-[calc(1rem-3px)] font-semibold'
                          : 'text-[#a6adc8] hover:bg-[#313244] hover:text-[#cdd6f4]'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 stroke-2" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Management Navigation Section */}
        <div>
          <h3 className="text-[#7f849c] text-xs font-semibold uppercase mb-2">
            MANAGEMENT
          </h3>
          <ul className="space-y-1">
            {managementNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg
                      text-[0.95rem] font-medium
                      transition-all duration-200 ease-in-out
                      ${
                        active
                          ? 'bg-gradient-to-r from-[rgba(242,92,5,0.15)] to-[rgba(242,92,5,0.05)] text-[#F25C05] border-l-[3px] border-[#F25C05] pl-[calc(1rem-3px)] font-semibold'
                          : 'text-[#a6adc8] hover:bg-[#313244] hover:text-[#cdd6f4]'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 stroke-2" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </aside>
  );
}

'use client';

/**
 * RecentActivityWidget Component
 *
 * Dashboard widget showing recent team activity with stats and filtering.
 * Story: 7.5 - Activity Summary & Recent Activity Dashboard Widget
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  EnvelopeIcon,
  PhoneIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

type ActivityType = 'Email' | 'Call' | 'Meeting' | 'LinkedIn Message' | 'WhatsApp' | 'Note';

interface Activity {
  id: string;
  contact_id: string | null;
  deal_id: string | null;
  activity_type: ActivityType;
  subject: string;
  description: string | null;
  activity_date: string;
  logged_by: string;
  logged_by_user: {
    id: string;
    name: string;
  };
  contact?: {
    id: string;
    first_name: string;
    last_name: string;
    company: string | null;
  };
  deal?: {
    id: string;
    title: string;
  };
  created_at: string;
  updated_at: string;
}

interface ActivityStats {
  thisWeek: number;
  thisMonth: number;
  avgPerDay: number;
}

const activityTypeIcons: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  'Email': EnvelopeIcon,
  'Call': PhoneIcon,
  'Meeting': UserGroupIcon,
  'LinkedIn Message': BriefcaseIcon,
  'WhatsApp': ChatBubbleLeftIcon,
  'Note': DocumentTextIcon,
};

const activityTypeColors: Record<ActivityType, string> = {
  'Email': 'text-blue-400',
  'Call': 'text-green-400',
  'Meeting': 'text-purple-400',
  'LinkedIn Message': 'text-[#F25C05]',
  'WhatsApp': 'text-emerald-400',
  'Note': 'text-gray-400',
};

export default function RecentActivityWidget() {
  const router = useRouter();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<ActivityStats>({ thisWeek: 0, thisMonth: 0, avgPerDay: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'my' | 'all'>('my');
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    fetchActivities();
  }, [filter]);

  const fetchActivities = async () => {
    try {
      setLoading(true);

      // Fetch current user
      const userResponse = await fetch('/api/users');
      const userData = await userResponse.json();
      const currentUser = userData.users?.find((u: any) => u.email);
      if (currentUser) {
        setCurrentUserId(currentUser.id);
      }

      // Fetch recent activities
      const params = new URLSearchParams({
        limit: '10',
        recent: 'true',
        ...(filter === 'my' && currentUser ? { user_id: currentUser.id } : {}),
      });

      const response = await fetch(`/api/activities?${params}`);
      const data = await response.json();

      if (data.success) {
        setActivities(data.activities || []);
        setStats(data.stats || { thisWeek: 0, thisMonth: 0, avgPerDay: 0 });
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Reset time parts for comparison
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const yesterdayOnly = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return 'Today';
    } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const groupByDate = (activities: Activity[]) => {
    const grouped: Record<string, Activity[]> = {};
    activities.forEach((activity) => {
      const dateKey = formatDate(activity.activity_date);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(activity);
    });
    return grouped;
  };

  const handleActivityClick = (activity: Activity) => {
    if (activity.contact_id) {
      router.push(`/contacts?id=${activity.contact_id}`);
    } else if (activity.deal_id) {
      router.push(`/deals?id=${activity.deal_id}`);
    }
  };

  const groupedActivities = groupByDate(activities);

  if (loading) {
    return (
      <div className="rounded-xl border border-[#313244] bg-[#181825] p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#313244] border-t-[#F25C05]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Activity Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[#313244] bg-[#181825] p-4">
          <p className="text-sm text-[#a6adc8]">This Week</p>
          <p className="mt-1 text-2xl font-bold text-[#cdd6f4]">{stats.thisWeek}</p>
          <p className="text-xs text-[#6c7086]">activities</p>
        </div>
        <div className="rounded-xl border border-[#313244] bg-[#181825] p-4">
          <p className="text-sm text-[#a6adc8]">This Month</p>
          <p className="mt-1 text-2xl font-bold text-[#cdd6f4]">{stats.thisMonth}</p>
          <p className="text-xs text-[#6c7086]">activities</p>
        </div>
        <div className="rounded-xl border border-[#313244] bg-[#181825] p-4">
          <p className="text-sm text-[#a6adc8]">Avg/Day</p>
          <p className="mt-1 text-2xl font-bold text-[#cdd6f4]">{stats.avgPerDay.toFixed(1)}</p>
          <p className="text-xs text-[#6c7086]">activities</p>
        </div>
      </div>

      {/* Recent Activity Widget */}
      <div className="rounded-xl border border-[#313244] bg-[#181825] p-6">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-[#cdd6f4]">Recent Activity</h3>
            <p className="mt-1 text-sm text-[#a6adc8]">Your last 10 interactions</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'my' | 'all')}
              className="rounded-lg border border-[#313244] bg-[#1e1e2e] px-3 py-2 text-sm text-[#cdd6f4] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
            >
              <option value="my">My Activity</option>
              <option value="all">All Team</option>
            </select>
          </div>
        </div>

        {/* Activity List */}
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <ClipboardDocumentListIcon className="h-16 w-16 text-[#6c7086]" />
            <p className="mt-4 text-base font-semibold text-[#a6adc8]">No recent activity</p>
            <p className="mt-1 text-sm text-[#6c7086]">Log your first activity to start tracking</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupedActivities).map(([date, dateActivities]) => (
              <div key={date}>
                <h4 className="mb-2 text-sm font-semibold text-[#a6adc8]">{date}</h4>
                <div className="space-y-2">
                  {dateActivities.map((activity) => {
                    const Icon = activityTypeIcons[activity.activity_type];
                    const colorClass = activityTypeColors[activity.activity_type];

                    return (
                      <div
                        key={activity.id}
                        onClick={() => handleActivityClick(activity)}
                        className="cursor-pointer rounded-lg border border-[#313244] bg-[#1e1e2e] p-3 transition-colors hover:bg-[#313244]"
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={`h-5 w-5 flex-shrink-0 ${colorClass}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#cdd6f4] truncate">
                              {activity.subject}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-xs text-[#a6adc8]">
                              <span>{formatTime(activity.activity_date)}</span>
                              {filter === 'all' && (
                                <>
                                  <span>•</span>
                                  <span>by {activity.logged_by_user.name}</span>
                                </>
                              )}
                              {activity.contact && (
                                <>
                                  <span>•</span>
                                  <span>
                                    {activity.contact.first_name} {activity.contact.last_name}
                                    {activity.contact.company && ` • ${activity.contact.company}`}
                                  </span>
                                </>
                              )}
                              {activity.deal && (
                                <>
                                  <span>•</span>
                                  <span>{activity.deal.title}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

/**
 * ActivityTimeline Component
 *
 * Displays a chronological timeline of activities for contacts and deals.
 * Story: 7.3 - Activity Timeline Component for Contacts & Deals
 */

import { useState, useEffect } from 'react';
import {
  EnvelopeIcon,
  PhoneIcon,
  UserGroupIcon,
  BriefcaseIcon,
  ChatBubbleLeftIcon,
  DocumentTextIcon,
  ChevronDownIcon,
  PencilIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { useToast } from './ToastContext';

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
  created_at: string;
  updated_at: string;
}

interface ActivityTimelineProps {
  contactId?: string;
  dealId?: string;
  onEditActivity?: (activity: Activity) => void;
  onActivityUpdated?: () => void;
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
  'Email': 'bg-blue-500',
  'Call': 'bg-green-500',
  'Meeting': 'bg-purple-500',
  'LinkedIn Message': 'bg-[#F25C05]',
  'WhatsApp': 'bg-emerald-500',
  'Note': 'bg-gray-500',
};

export default function ActivityTimeline({
  contactId,
  dealId,
  onEditActivity,
  onActivityUpdated,
}: ActivityTimelineProps) {
  const { showToast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    if (contactId || dealId) {
      fetchActivities();
    }
  }, [contactId, dealId, selectedType]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (contactId) params.append('contact_id', contactId);
      if (dealId) params.append('deal_id', dealId);
      if (selectedType !== 'all') params.append('type', selectedType);

      const response = await fetch(`/api/activities?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }

      const data = await response.json();
      setActivities(data.activities || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      showToast('Failed to load activities', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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

  const truncateText = (text: string | null, maxLength: number = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const groupedActivities = groupByDate(activities);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#313244] border-t-[#F25C05]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-xl border border-[#313244] bg-[#181825] p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#cdd6f4]">
          Activity Timeline ({activities.length})
        </h3>
        <div className="flex items-center gap-3">
          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-lg border border-[#313244] bg-[#1e1e2e] px-3 py-2 text-sm text-[#cdd6f4] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
          >
            <option value="all">All Activities</option>
            <option value="Email">Emails</option>
            <option value="Call">Calls</option>
            <option value="Meeting">Meetings</option>
            <option value="LinkedIn Message">LinkedIn</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Note">Notes</option>
          </select>
        </div>
      </div>

      {/* Timeline */}
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ClipboardDocumentListIcon className="h-16 w-16 text-[#6c7086]" />
          <p className="mt-4 text-base font-medium text-[#a6adc8]">
            {selectedType === 'all' ? 'No activities logged yet' : `No ${selectedType.toLowerCase()} activities yet`}
          </p>
          <p className="mt-2 text-sm text-[#6c7086]">
            Log your first activity to start tracking interactions
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedActivities).map(([date, dateActivities]) => (
            <div key={date}>
              {/* Date Header */}
              <div className="mb-3 text-sm font-semibold text-[#7f849c]">{date}</div>

              {/* Activities for this date */}
              <div className="space-y-3 border-l-2 border-[#313244] pl-6">
                {dateActivities.map((activity) => {
                  const Icon = activityTypeIcons[activity.activity_type];
                  const dotColor = activityTypeColors[activity.activity_type];
                  const isExpanded = expandedIds.has(activity.id);

                  return (
                    <div key={activity.id} className="relative">
                      {/* Timeline Dot */}
                      <div className={`absolute -left-[29px] top-2 h-2 w-2 rounded-full ${dotColor}`}></div>

                      {/* Activity Card */}
                      <div className="rounded-lg border border-[#313244] bg-[#1e1e2e] p-4 transition-all hover:border-[#45475a]">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 flex-1">
                            <Icon className="h-5 w-5 text-[#F25C05] flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-base font-semibold text-[#cdd6f4] break-words">
                                {activity.subject}
                              </h4>
                              <p className="mt-1 text-sm text-[#a6adc8]">
                                {formatTime(activity.activity_date)} • by {activity.logged_by_user?.name || 'Unknown'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {onEditActivity && (
                              <button
                                onClick={() => onEditActivity(activity)}
                                className="rounded-lg p-2 text-[#a6adc8] transition-colors hover:bg-[#313244] hover:text-[#cdd6f4]"
                                title="Edit activity"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        {activity.description && (
                          <div className="mt-3">
                            <p className="text-sm text-[#cdd6f4] whitespace-pre-wrap break-words">
                              {isExpanded ? activity.description : truncateText(activity.description)}
                            </p>
                            {activity.description.length > 100 && (
                              <button
                                onClick={() => toggleExpanded(activity.id)}
                                className="mt-2 flex items-center gap-1 text-sm font-medium text-[#F25C05] transition-colors hover:text-[#ff6b1a]"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronDownIcon className="h-4 w-4" />
                                    Show Less
                                  </>
                                ) : (
                                  <>
                                    <ChevronRightIcon className="h-4 w-4" />
                                    Read More
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        )}
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
  );
}

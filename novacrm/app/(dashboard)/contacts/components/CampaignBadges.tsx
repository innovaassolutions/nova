'use client';

/**
 * CampaignBadges Component
 *
 * Displays campaign badges with rotating Catppuccin Mocha colors.
 * Story: 2.3 - Contacts List with Search & Filter
 */

interface Campaign {
  campaign: {
    id: string;
    name: string;
    status: string;
  };
}

interface CampaignBadgesProps {
  campaigns: Campaign[];
}

export default function CampaignBadges({ campaigns }: CampaignBadgesProps) {
  // Catppuccin Mocha accent colors for badge backgrounds
  const colors = [
    '#89b4fa', // Blue
    '#74c7ec', // Sapphire
    '#94e2d5', // Teal
    '#b4befe', // Lavender
  ];

  if (!campaigns || campaigns.length === 0) {
    return <span className="text-sm text-[#6c7086]">—</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {campaigns.map((item, index) => {
        const color = colors[index % colors.length];
        return (
          <span
            key={item.campaign.id}
            className="rounded-md px-2 py-1 text-xs font-semibold text-[#1e1e2e]"
            style={{ backgroundColor: color }}
          >
            {item.campaign.name}
          </span>
        );
      })}
    </div>
  );
}

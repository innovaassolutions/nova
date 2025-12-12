'use client';

/**
 * CompanyAvatar Component
 *
 * Displays a colored avatar with first 2 letters of company name.
 * Rotates through Catppuccin Mocha accent colors.
 * Story: 5.2 - Company List Page & CRUD Operations
 */

interface CompanyAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function CompanyAvatar({
  name,
  size = 'md',
}: CompanyAvatarProps) {
  // Generate first 2 letters as initials
  const initials = name.substring(0, 2).toUpperCase();

  // Catppuccin Mocha accent colors for avatar backgrounds
  const colors = [
    '#89b4fa', // Blue
    '#74c7ec', // Sapphire
    '#94e2d5', // Teal
    '#b4befe', // Lavender
  ];

  // Generate consistent color based on name
  const colorIndex = name.charCodeAt(0) % colors.length;
  const backgroundColor = colors[colorIndex];

  // Size classes
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  };

  return (
    <div
      className={`${sizeClasses[size]} flex items-center justify-center rounded-md font-bold text-[#1e1e2e]`}
      style={{ backgroundColor }}
    >
      {initials}
    </div>
  );
}

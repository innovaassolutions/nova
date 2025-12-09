'use client';

/**
 * ContactAvatar Component
 *
 * Displays a colored avatar with initials for contacts.
 * Rotates through Catppuccin Mocha accent colors.
 * Story: 2.3 - Contacts List with Search & Filter
 */

interface ContactAvatarProps {
  firstName: string;
  lastName: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function ContactAvatar({
  firstName,
  lastName,
  size = 'md',
}: ContactAvatarProps) {
  // Generate initials
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  // Catppuccin Mocha accent colors for avatar backgrounds
  const colors = [
    '#89b4fa', // Blue
    '#74c7ec', // Sapphire
    '#94e2d5', // Teal
    '#b4befe', // Lavender
    '#f5c2e7', // Pink
    '#f38ba8', // Red
    '#fab387', // Peach
    '#f9e2af', // Yellow
    '#a6e3a1', // Green
  ];

  // Generate consistent color based on name
  const colorIndex = (firstName.charCodeAt(0) + lastName.charCodeAt(0)) % colors.length;
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

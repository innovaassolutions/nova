'use client';

/**
 * Contact Form Modal Component
 *
 * Modal form for manually creating a new contact with LinkedIn capture.
 * Story: 2.2 - Contact Creation Form
 */

import { useState, useEffect, useRef } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import ContactDetailModal from './ContactDetailModal';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Campaign {
  id: string;
  name: string;
}

interface FormData {
  first_name: string;
  last_name: string;
  linkedin_url: string;
  email: string;
  company: string;
  position: string;
  connected_on: string;
  source: string;
  campaign_ids: string[];
}

interface FormErrors {
  first_name?: string;
  last_name?: string;
  linkedin_url?: string;
  email?: string;
  campaign_ids?: string;
}

interface DuplicateContact {
  id: string;
  first_name: string;
  last_name: string;
  linkedin_url: string;
  company: string | null;
  position: string | null;
  email: string | null;
}

export default function ContactFormModal({ isOpen, onClose, onSuccess }: ContactFormModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [isLinkedInValid, setIsLinkedInValid] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [duplicateMatches, setDuplicateMatches] = useState<DuplicateContact[]>([]);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [showDuplicateContactId, setShowDuplicateContactId] = useState<string | null>(null);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    linkedin_url: '',
    email: '',
    company: '',
    position: '',
    connected_on: today,
    source: 'LinkedIn',
    campaign_ids: [],
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Load campaigns when modal opens
  useEffect(() => {
    if (isOpen) {
      loadCampaigns();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const loadCampaigns = async () => {
    setLoadingCampaigns(true);
    try {
      const response = await fetch('/api/campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      }
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const validateLinkedInUrl = (url: string): boolean => {
    // Simple, flexible LinkedIn URL validation - accepts any valid LinkedIn URL
    // Supports: http/https, with/without www, personal/company pages, query parameters
    const pattern = /^https?:\/\/(www\.)?linkedin\.com\//;
    return pattern.test(url);
  };

  const validateEmail = (email: string): boolean => {
    if (!email) return true; // Optional field
    // RFC 5322 simplified pattern
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
  };

  const checkForDuplicates = async () => {
    if (!formData.linkedin_url && (!formData.first_name || !formData.last_name)) {
      return;
    }

    setCheckingDuplicate(true);
    try {
      const params = new URLSearchParams();
      if (formData.linkedin_url) {
        params.append('linkedin_url', formData.linkedin_url);
      }
      if (formData.first_name && formData.last_name) {
        params.append('first_name', formData.first_name);
        params.append('last_name', formData.last_name);
      }

      const response = await fetch(`/api/contacts/check-duplicate?${params}`);
      if (response.ok) {
        const data = await response.json();
        setIsDuplicate(data.isDuplicate);
        setDuplicateMatches(data.matches || []);
      }
    } catch (error) {
      console.error('Error checking for duplicates:', error);
    } finally {
      setCheckingDuplicate(false);
    }
  };

  const handleLinkedInBlur = async () => {
    if (formData.linkedin_url) {
      const isValid = validateLinkedInUrl(formData.linkedin_url);
      setIsLinkedInValid(isValid);
      if (!isValid) {
        setErrors(prev => ({
          ...prev,
          linkedin_url: 'Must be a valid LinkedIn profile URL (e.g., https://www.linkedin.com/in/username)'
        }));
        setIsDuplicate(false);
        setDuplicateMatches([]);
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.linkedin_url;
          return newErrors;
        });
        // Check for duplicates after validating URL
        if (formData.linkedin_url) {
          await checkForDuplicates();
        }
      }
    }
  };

  const handleEmailBlur = () => {
    if (formData.email && !validateEmail(formData.email)) {
      setErrors(prev => ({
        ...prev,
        email: 'Please enter a valid email address'
      }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof FormErrors];
        return newErrors;
      });
    }

    // Reset LinkedIn validation and duplicate check when URL changes
    if (field === 'linkedin_url') {
      setIsLinkedInValid(false);
      setIsDuplicate(false);
      setDuplicateMatches([]);
    }
  };

  const handleCampaignToggle = (campaignId: string) => {
    setFormData(prev => {
      const isSelected = prev.campaign_ids.includes(campaignId);
      return {
        ...prev,
        campaign_ids: isSelected
          ? prev.campaign_ids.filter(id => id !== campaignId)
          : [...prev.campaign_ids, campaignId]
      };
    });

    // Clear campaign error if selecting
    if (errors.campaign_ids) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.campaign_ids;
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    // LinkedIn URL is optional, but if provided, must be valid
    if (formData.linkedin_url.trim() && !validateLinkedInUrl(formData.linkedin_url)) {
      newErrors.linkedin_url = 'Must be a valid LinkedIn URL (e.g., https://linkedin.com/in/username)';
    }

    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.campaign_ids.length === 0) {
      newErrors.campaign_ids = 'Please select at least one campaign';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        // Reset form
        setFormData({
          first_name: '',
          last_name: '',
          linkedin_url: '',
          email: '',
          company: '',
          position: '',
          connected_on: today,
          source: 'LinkedIn',
          campaign_ids: [],
        });
        setIsLinkedInValid(false);
        setErrors({});

        // Call success callback
        onSuccess();
      } else {
        // Handle specific error types
        if (data.error?.includes('duplicate') || data.error?.includes('already exists')) {
          setErrors(prev => ({
            ...prev,
            linkedin_url: 'A contact with this LinkedIn URL already exists'
          }));
        } else {
          setErrors(prev => ({
            ...prev,
            linkedin_url: data.error || 'Failed to create contact'
          }));
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      setErrors(prev => ({
        ...prev,
        linkedin_url: 'An unexpected error occurred. Please try again.'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-[600px] animate-slideUp rounded-lg bg-[#181825] shadow-xl"
        style={{
          animation: 'slideUp 0.3s ease'
        }}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#313244] px-6 py-4">
          <h2 className="text-xl font-semibold text-[#cdd6f4]">New Contact</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[#a6adc8] transition-colors hover:bg-[#313244] hover:text-[#cdd6f4]"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body - Form */}
        <form onSubmit={handleSubmit} className="max-h-[calc(100vh-200px)] overflow-y-auto px-6 py-4">
          <div className="space-y-4">
            {/* First Name - Required */}
            <div>
              <label htmlFor="first_name" className="mb-1 block text-sm font-medium text-[#cdd6f4]">
                First Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="first_name"
                value={formData.first_name}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                className={`w-full rounded-lg border ${errors.first_name ? 'border-red-400' : 'border-[#313244]'} bg-[#1e1e2e] px-3 py-2 text-[#cdd6f4] placeholder-[#6c7086] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]`}
                placeholder="John"
              />
              {errors.first_name && (
                <p className="mt-1 text-sm text-red-400">{errors.first_name}</p>
              )}
            </div>

            {/* Last Name - Required */}
            <div>
              <label htmlFor="last_name" className="mb-1 block text-sm font-medium text-[#cdd6f4]">
                Last Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                id="last_name"
                value={formData.last_name}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                className={`w-full rounded-lg border ${errors.last_name ? 'border-red-400' : 'border-[#313244]'} bg-[#1e1e2e] px-3 py-2 text-[#cdd6f4] placeholder-[#6c7086] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]`}
                placeholder="Doe"
              />
              {errors.last_name && (
                <p className="mt-1 text-sm text-red-400">{errors.last_name}</p>
              )}
            </div>

            {/* LinkedIn URL - Required with Validation */}
            <div>
              <label htmlFor="linkedin_url" className="mb-1 block text-sm font-medium text-[#cdd6f4]">
                LinkedIn URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  id="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                  onBlur={handleLinkedInBlur}
                  className={`w-full rounded-lg border ${errors.linkedin_url ? 'border-red-400' : isLinkedInValid ? 'border-green-500' : 'border-[#313244]'} bg-[#1e1e2e] px-3 py-2 pr-10 text-[#cdd6f4] placeholder-[#6c7086] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]`}
                  placeholder="https://www.linkedin.com/in/username"
                />
                {isLinkedInValid && (
                  <CheckCircleIcon className="absolute right-3 top-2.5 h-5 w-5 text-green-500" />
                )}
              </div>
              {errors.linkedin_url && (
                <p className="mt-1 text-sm text-red-400">{errors.linkedin_url}</p>
              )}
              {!errors.linkedin_url && !isLinkedInValid && !isDuplicate && formData.linkedin_url && (
                <p className="mt-1 text-xs text-[#6c7086]">
                  Optional - Accepts any valid LinkedIn URL (personal or company profiles)
                </p>
              )}
              {checkingDuplicate && (
                <p className="mt-1 text-xs text-[#a6adc8]">Checking for duplicates...</p>
              )}
              {!errors.linkedin_url && isDuplicate && duplicateMatches.length > 0 && (
                <div className="mt-2 rounded-lg border-l-4 border-[#f9e2af] bg-[#f9e2af]/10 p-3">
                  <div className="flex items-start gap-2">
                    <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 text-[#f9e2af]" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#f9e2af]">
                        This contact may already exist
                      </p>
                      {duplicateMatches.map((match) => (
                        <div key={match.id} className="mt-1 text-sm text-[#cdd6f4]">
                          <span className="font-semibold">{match.first_name} {match.last_name}</span>
                          {match.company && <span> at {match.company}</span>}
                          {' • '}
                          <button
                            type="button"
                            onClick={() => setShowDuplicateContactId(match.id)}
                            className="text-[#89b4fa] hover:text-[#F25C05] hover:underline"
                          >
                            View Contact
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Email - Optional */}
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-[#cdd6f4]">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                onBlur={handleEmailBlur}
                className={`w-full rounded-lg border ${errors.email ? 'border-red-400' : 'border-[#313244]'} bg-[#1e1e2e] px-3 py-2 text-[#cdd6f4] placeholder-[#6c7086] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]`}
                placeholder="john.doe@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Company - Optional */}
            <div>
              <label htmlFor="company" className="mb-1 block text-sm font-medium text-[#cdd6f4]">
                Company
              </label>
              <input
                type="text"
                id="company"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="w-full rounded-lg border border-[#313244] bg-[#1e1e2e] px-3 py-2 text-[#cdd6f4] placeholder-[#6c7086] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
                placeholder="Acme Corp"
              />
            </div>

            {/* Position - Optional */}
            <div>
              <label htmlFor="position" className="mb-1 block text-sm font-medium text-[#cdd6f4]">
                Position
              </label>
              <input
                type="text"
                id="position"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
                className="w-full rounded-lg border border-[#313244] bg-[#1e1e2e] px-3 py-2 text-[#cdd6f4] placeholder-[#6c7086] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
                placeholder="Senior Developer"
              />
            </div>

            {/* Connected On - Date */}
            <div>
              <label htmlFor="connected_on" className="mb-1 block text-sm font-medium text-[#cdd6f4]">
                Connected On
              </label>
              <input
                type="date"
                id="connected_on"
                value={formData.connected_on}
                onChange={(e) => handleInputChange('connected_on', e.target.value)}
                max={today}
                className="w-full rounded-lg border border-[#313244] bg-[#1e1e2e] px-3 py-2 text-[#cdd6f4] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
              />
            </div>

            {/* Lead Source - Dropdown */}
            <div>
              <label htmlFor="source" className="mb-1 block text-sm font-medium text-[#cdd6f4]">
                Lead Source
              </label>
              <select
                id="source"
                value={formData.source}
                onChange={(e) => handleInputChange('source', e.target.value)}
                className="w-full rounded-lg border border-[#313244] bg-[#1e1e2e] px-3 py-2 text-[#cdd6f4] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
              >
                <option value="LinkedIn">LinkedIn</option>
                <option value="Referral">Referral</option>
                <option value="Website">Website</option>
                <option value="Event">Event</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Campaign Multi-Select - Required */}
            <div>
              <label className="mb-1 block text-sm font-medium text-[#cdd6f4]">
                Campaigns <span className="text-red-400">*</span>
              </label>
              {loadingCampaigns ? (
                <div className="rounded-lg border border-[#313244] bg-[#1e1e2e] px-3 py-2 text-[#6c7086]">
                  Loading campaigns...
                </div>
              ) : campaigns.length === 0 ? (
                <div className="rounded-lg border border-[#313244] bg-[#1e1e2e] px-3 py-2 text-[#6c7086]">
                  No campaigns available
                </div>
              ) : (
                <div className={`rounded-lg border ${
                  errors.campaign_ids ? 'border-red-400' : 'border-[#313244]'
                } bg-[#1e1e2e] p-3`}>
                  <div className="max-h-[150px] space-y-2 overflow-y-auto">
                    {campaigns.map((campaign) => (
                      <label
                        key={campaign.id}
                        className="flex cursor-pointer items-center space-x-2 rounded px-2 py-1 hover:bg-[#313244]"
                      >
                        <input
                          type="checkbox"
                          checked={formData.campaign_ids.includes(campaign.id)}
                          onChange={() => handleCampaignToggle(campaign.id)}
                          className="h-4 w-4 rounded border-[#6c7086] bg-[#1e1e2e] text-[#F25C05] focus:ring-2 focus:ring-[#F25C05] focus:ring-offset-0"
                        />
                        <span className="text-sm text-[#cdd6f4]">{campaign.name}</span>
                      </label>
                    ))}
                  </div>
                  {formData.campaign_ids.length > 0 && (
                    <div className="mt-2 border-t border-[#313244] pt-2">
                      <span className="text-xs text-[#6c7086]">
                        {formData.campaign_ids.length} campaign{formData.campaign_ids.length !== 1 ? 's' : ''} selected
                      </span>
                    </div>
                  )}
                </div>
              )}
              {errors.campaign_ids && (
                <p className="mt-1 text-sm text-red-400">{errors.campaign_ids}</p>
              )}
            </div>
          </div>

          {/* Modal Footer - Actions */}
          <div className="mt-6 flex justify-end gap-3 border-t border-[#313244] pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-[#313244] bg-transparent px-4 py-2 text-sm font-medium text-[#cdd6f4] transition-colors hover:bg-[#313244] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isDuplicate
                  ? 'bg-[#f9e2af] text-[#1e1e2e] hover:bg-[#f9e2af]/90'
                  : 'bg-[#F25C05] text-white hover:bg-[#ff6b1a]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creating...
                </>
              ) : isDuplicate ? (
                <>
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  Add Anyway
                </>
              ) : (
                'Create Contact'
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* View Duplicate Contact Modal (layered above creation modal) */}
      {showDuplicateContactId && (
        <ContactDetailModal
          contactId={showDuplicateContactId}
          isOpen={true}
          onClose={() => setShowDuplicateContactId(null)}
          onContactUpdated={() => {}}
          onContactDeleted={() => {}}
        />
      )}
    </div>
  );
}

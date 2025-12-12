'use client';

/**
 * Create Company Modal Component
 *
 * Modal form for creating a new company.
 * Story: 5.2 - Company List Page & CRUD Operations
 */

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CreateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  industry: string;
  size: string;
  website: string;
  notes: string;
}

interface FormErrors {
  name?: string;
  industry?: string;
  website?: string;
  notes?: string;
}

export default function CreateCompanyModal({ isOpen, onClose, onSuccess }: CreateCompanyModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    industry: '',
    size: '',
    website: '',
    notes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

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

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        name: '',
        industry: '',
        size: '',
        website: '',
        notes: '',
      });
      setErrors({});
    }
  }, [isOpen]);

  const validateWebsite = (url: string): boolean => {
    if (!url) return true; // Optional field
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    } else if (formData.name.length > 200) {
      newErrors.name = 'Company name must be 200 characters or less';
    }

    // Industry validation
    if (formData.industry && formData.industry.length > 100) {
      newErrors.industry = 'Industry must be 100 characters or less';
    }

    // Website validation
    if (formData.website && !validateWebsite(formData.website)) {
      newErrors.website = 'Please enter a valid URL (e.g., https://example.com)';
    }

    // Notes validation
    if (formData.notes && formData.notes.length > 2000) {
      newErrors.notes = 'Notes must be 2000 characters or less';
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
      const payload = {
        name: formData.name.trim(),
        industry: formData.industry.trim() || undefined,
        size: formData.size || undefined,
        website: formData.website.trim() || undefined,
        notes: formData.notes.trim() || undefined,
      };

      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setErrors({ name: 'A company with this name already exists' });
        } else {
          setErrors({ name: data.error || 'Failed to create company' });
        }
        return;
      }

      onSuccess();
    } catch (error) {
      console.error('Error creating company:', error);
      setErrors({ name: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
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
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      {/* Modal Container */}
      <div className="w-full max-w-2xl rounded-xl border border-[#313244] bg-[#1e1e2e] shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#313244] px-6 py-4">
          <h2 className="text-xl font-bold text-[#cdd6f4]">Create New Company</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#a6adc8] transition-colors duration-200 hover:bg-[#313244] hover:text-[#cdd6f4]"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Company Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#cdd6f4]">
                Company Name <span className="text-red-400">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`mt-1 w-full rounded-lg border ${
                  errors.name ? 'border-red-500' : 'border-[#45475a]'
                } bg-[#313244] px-4 py-2 text-[#cdd6f4] placeholder-[#6c7086] transition-all duration-200 focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]`}
                placeholder="Acme Corporation"
                maxLength={200}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-400">{errors.name}</p>
              )}
            </div>

            {/* Industry */}
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-[#cdd6f4]">
                Industry
              </label>
              <input
                id="industry"
                type="text"
                value={formData.industry}
                onChange={(e) => handleInputChange('industry', e.target.value)}
                className={`mt-1 w-full rounded-lg border ${
                  errors.industry ? 'border-red-500' : 'border-[#45475a]'
                } bg-[#313244] px-4 py-2 text-[#cdd6f4] placeholder-[#6c7086] transition-all duration-200 focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]`}
                placeholder="Technology, Healthcare, Finance..."
                maxLength={100}
              />
              {errors.industry && (
                <p className="mt-1 text-sm text-red-400">{errors.industry}</p>
              )}
            </div>

            {/* Size */}
            <div>
              <label htmlFor="size" className="block text-sm font-medium text-[#cdd6f4]">
                Company Size
              </label>
              <select
                id="size"
                value={formData.size}
                onChange={(e) => handleInputChange('size', e.target.value)}
                className="mt-1 w-full cursor-pointer rounded-lg border border-[#45475a] bg-[#313244] px-4 py-2 text-[#cdd6f4] transition-all duration-200 hover:bg-[#45475a] focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
              >
                <option value="">Select size...</option>
                <option value="Startup">Startup</option>
                <option value="SMB">SMB</option>
                <option value="Enterprise">Enterprise</option>
              </select>
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-[#cdd6f4]">
                Website
              </label>
              <input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className={`mt-1 w-full rounded-lg border ${
                  errors.website ? 'border-red-500' : 'border-[#45475a]'
                } bg-[#313244] px-4 py-2 text-[#cdd6f4] placeholder-[#6c7086] transition-all duration-200 focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]`}
                placeholder="https://example.com"
              />
              {errors.website && (
                <p className="mt-1 text-sm text-red-400">{errors.website}</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-[#cdd6f4]">
                Notes
              </label>
              <textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                className={`mt-1 w-full rounded-lg border ${
                  errors.notes ? 'border-red-500' : 'border-[#45475a]'
                } bg-[#313244] px-4 py-2 text-[#cdd6f4] placeholder-[#6c7086] transition-all duration-200 focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]`}
                placeholder="Additional notes about this company..."
                maxLength={2000}
              />
              <div className="mt-1 flex justify-between text-xs text-[#6c7086]">
                <span>{errors.notes || '\u00A0'}</span>
                <span>{formData.notes.length}/2000</span>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#313244] bg-transparent px-4 py-2 text-sm font-medium text-[#cdd6f4] transition-colors duration-200 hover:bg-[#313244] hover:border-[#45475a]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-[#F25C05] px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-[#ff6b1a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  Creating...
                </>
              ) : (
                'Create Company'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

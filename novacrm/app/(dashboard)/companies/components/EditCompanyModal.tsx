'use client';

/**
 * Edit Company Modal Component
 *
 * Modal form for editing an existing company.
 * Story: 5.2 - Company List Page & CRUD Operations
 */

import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface EditCompanyModalProps {
  isOpen: boolean;
  companyId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

interface CompanyData {
  id: string;
  name: string;
  industry: string | null;
  size: string | null;
  website: string | null;
  notes: string | null;
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

export default function EditCompanyModal({ isOpen, companyId, onClose, onSuccess }: EditCompanyModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    industry: '',
    size: '',
    website: '',
    notes: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // Fetch company data when modal opens
  useEffect(() => {
    if (isOpen && companyId) {
      fetchCompanyData();
    }
  }, [isOpen, companyId]);

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

  const fetchCompanyData = async () => {
    if (!companyId) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/companies/${companyId}`);
      if (response.ok) {
        const data = await response.json();
        const company: CompanyData = data.company;
        setFormData({
          name: company.name,
          industry: company.industry || '',
          size: company.size || '',
          website: company.website || '',
          notes: company.notes || '',
        });
      }
    } catch (error) {
      console.error('Failed to fetch company:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateWebsite = (url: string): boolean => {
    if (!url) return true;
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    } else if (formData.name.length > 200) {
      newErrors.name = 'Company name must be 200 characters or less';
    }

    if (formData.industry && formData.industry.length > 100) {
      newErrors.industry = 'Industry must be 100 characters or less';
    }

    if (formData.website && !validateWebsite(formData.website)) {
      newErrors.website = 'Please enter a valid URL';
    }

    if (formData.notes && formData.notes.length > 2000) {
      newErrors.notes = 'Notes must be 2000 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!companyId || !validateForm()) {
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

      const response = await fetch(`/api/companies/${companyId}`, {
        method: 'PUT',
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
          setErrors({ name: data.error || 'Failed to update company' });
        }
        return;
      }

      onSuccess();
    } catch (error) {
      console.error('Error updating company:', error);
      setErrors({ name: 'An unexpected error occurred' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      <div className="w-full max-w-2xl rounded-xl border border-[#313244] bg-[#1e1e2e] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#313244] px-6 py-4">
          <h2 className="text-xl font-bold text-[#cdd6f4]">Edit Company</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-[#a6adc8] transition-colors duration-200 hover:bg-[#313244] hover:text-[#cdd6f4]"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center p-6">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#313244] border-t-[#F25C05]"></div>
              <p className="text-sm text-[#a6adc8]">Loading company data...</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="edit-name" className="block text-sm font-medium text-[#cdd6f4]">
                  Company Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="edit-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`mt-1 w-full rounded-lg border ${
                    errors.name ? 'border-red-500' : 'border-[#45475a]'
                  } bg-[#313244] px-4 py-2 text-[#cdd6f4] transition-all duration-200 focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]`}
                  maxLength={200}
                />
                {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="edit-industry" className="block text-sm font-medium text-[#cdd6f4]">
                  Industry
                </label>
                <input
                  id="edit-industry"
                  type="text"
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="mt-1 w-full rounded-lg border border-[#45475a] bg-[#313244] px-4 py-2 text-[#cdd6f4] transition-all duration-200 focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
                  maxLength={100}
                />
              </div>

              <div>
                <label htmlFor="edit-size" className="block text-sm font-medium text-[#cdd6f4]">
                  Company Size
                </label>
                <select
                  id="edit-size"
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

              <div>
                <label htmlFor="edit-website" className="block text-sm font-medium text-[#cdd6f4]">
                  Website
                </label>
                <input
                  id="edit-website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className={`mt-1 w-full rounded-lg border ${
                    errors.website ? 'border-red-500' : 'border-[#45475a]'
                  } bg-[#313244] px-4 py-2 text-[#cdd6f4] transition-all duration-200 focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]`}
                />
                {errors.website && <p className="mt-1 text-sm text-red-400">{errors.website}</p>}
              </div>

              <div>
                <label htmlFor="edit-notes" className="block text-sm font-medium text-[#cdd6f4]">
                  Notes
                </label>
                <textarea
                  id="edit-notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-[#45475a] bg-[#313244] px-4 py-2 text-[#cdd6f4] transition-all duration-200 focus:border-[#F25C05] focus:outline-none focus:ring-1 focus:ring-[#F25C05]"
                  maxLength={2000}
                />
                <div className="mt-1 flex justify-end text-xs text-[#6c7086]">
                  <span>{formData.notes.length}/2000</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-[#313244] bg-transparent px-4 py-2 text-sm font-medium text-[#cdd6f4] transition-colors duration-200 hover:bg-[#313244]"
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
                    Updating...
                  </>
                ) : (
                  'Update Company'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

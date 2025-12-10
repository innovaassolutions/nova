'use client';

/**
 * CSV Upload Modal - Multi-Step Flow
 *
 * Story: 3.2 - CSV Upload Page - Multistep Flow
 *
 * A guided 4-step CSV upload interface:
 * - Step 1: File upload with drag-and-drop
 * - Step 2: Preview contacts and assign campaigns
 * - Step 3: Duplicate resolution (handled in Story 3.3)
 * - Step 4: Confirm and import
 */

import React, { useState, useRef, useCallback } from 'react';
import { XMarkIcon, ArrowUpTrayIcon, CheckIcon, ArrowLeftIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { parseLinkedInCSV, type CSVParseResult, type CSVValidationError } from '@/app/lib/csv-parser';

interface CSVUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: string;
}

type Step = 1 | 2 | 3 | 4;

export default function CSVUploadModal({ isOpen, onClose, onSuccess }: CSVUploadModalProps) {
  // State management
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null);
  const [parseErrors, setParseErrors] = useState<CSVValidationError[]>([]);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importStats, setImportStats] = useState({ imported: 0, updated: 0, skipped: 0 });
  const [campaignsLoaded, setCampaignsLoaded] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step indicator component
  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8 px-6 pt-6">
      {[1, 2, 3, 4].map((step, index) => (
        <div key={step} className="flex items-center">
          <div className={`
            w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-200
            ${step < currentStep ? 'bg-[#F25C05] text-white' : ''}
            ${step === currentStep ? 'bg-[#F25C05] text-white ring-2 ring-[#F25C05] ring-offset-2 ring-offset-[#181825]' : ''}
            ${step > currentStep ? 'bg-transparent border-2 border-[#6c7086] text-[#6c7086]' : ''}
          `}>
            {step < currentStep ? <CheckIcon className="w-5 h-5" /> : step}
          </div>
          {index < 3 && (
            <div className={`h-0.5 w-8 transition-colors duration-200 ${step < currentStep ? 'bg-[#F25C05]' : 'bg-[#45475a]'}`} />
          )}
        </div>
      ))}
    </div>
  );

  // File validation
  const validateFile = (file: File): boolean => {
    setError(null);

    // Check file extension
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Invalid file. Please upload a .csv file under 5MB.');
      return false;
    }

    // Check file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setError('Invalid file. Please upload a .csv file under 5MB.');
      return false;
    }

    return true;
  };

  // Handle file upload
  const handleFileUpload = async (uploadedFile: File) => {
    if (!validateFile(uploadedFile)) {
      return;
    }

    setFile(uploadedFile);
    setIsLoading(true);
    setError(null);
    setParseErrors([]);

    try {
      const result = await parseLinkedInCSV(uploadedFile);

      if (result.errors.length > 0) {
        setParseErrors(result.errors);
        setParseResult(null);
      } else {
        setParseResult(result);
        setParseErrors([]);
      }
    } catch (err) {
      setError('Failed to parse CSV file. Please ensure it is a valid LinkedIn export.');
      console.error('CSV parsing error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileUpload(droppedFile);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileUpload(selectedFile);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Download error report
  const downloadErrorReport = () => {
    const errorText = parseErrors.map(err =>
      `Row ${err.row}: ${err.message}`
    ).join('\n');

    const blob = new Blob([errorText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'csv-errors.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Fetch campaigns when Step 2 loads
  const fetchCampaigns = useCallback(async () => {
    if (campaignsLoaded) return;

    try {
      const response = await fetch('/api/campaigns');
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns || []);
        setCampaignsLoaded(true);
      }
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
    }
  }, [campaignsLoaded]);

  // Handle step navigation
  const handleNextStep = async () => {
    if (currentStep === 1 && parseResult) {
      await fetchCampaigns();
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Check for duplicates and proceed to Step 4 (skip Step 3 for now)
      setIsLoading(true);
      try {
        // Placeholder: Call duplicate check API (Story 3.3)
        const response = await fetch('/api/contacts/check-duplicates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contacts: parseResult?.contacts || [] })
        });

        if (response.ok) {
          const data = await response.json();
          // If no duplicates, skip to Step 4
          if (data.duplicates?.length === 0) {
            setCurrentStep(4);
          } else {
            // TODO: Handle duplicates in Step 3 (Story 3.3)
            setCurrentStep(4);
          }
        }
      } catch (err) {
        console.error('Duplicate check error:', err);
        setCurrentStep(4); // Proceed anyway for MVP
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBackStep = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else if (currentStep === 4) {
      setCurrentStep(2);
    }
  };

  // Handle import
  const handleImport = async () => {
    setIsImporting(true);

    try {
      const response = await fetch('/api/contacts/bulk-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contacts: parseResult?.contacts || [],
          campaign_ids: selectedCampaigns,
          overwrite_ids: []
        })
      });

      if (response.ok) {
        const data = await response.json();
        setImportStats({
          imported: data.imported || 0,
          updated: data.updated || 0,
          skipped: data.skipped || 0
        });
        setImportSuccess(true);
      } else {
        throw new Error('Import failed');
      }
    } catch (err) {
      console.error('Import error:', err);
      setError('Failed to import contacts. Please try again.');
    } finally {
      setIsImporting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (currentStep > 1 || file) {
      setShowCancelConfirm(true);
    } else {
      handleClose();
    }
  };

  const handleCancelConfirm = () => {
    setShowCancelConfirm(false);
    handleClose();
  };

  const handleClose = () => {
    // Reset all state
    setCurrentStep(1);
    setFile(null);
    setParseResult(null);
    setParseErrors([]);
    setSelectedCampaigns([]);
    setError(null);
    setIsLoading(false);
    setIsImporting(false);
    setImportSuccess(false);
    setShowCancelConfirm(false);
    setCampaignsLoaded(false);
    onClose();
  };

  const handleViewContacts = () => {
    handleClose();
    onSuccess();
  };

  // Toggle campaign selection
  const toggleCampaign = (campaignId: string) => {
    setSelectedCampaigns(prev =>
      prev.includes(campaignId)
        ? prev.filter(id => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  if (!isOpen) return null;

  // Import Success Modal
  if (importSuccess) {
    const selectedCampaignNames = campaigns
      .filter(c => selectedCampaigns.includes(c.id))
      .map(c => c.name);

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-8">
        <div className="bg-[#181825] border border-[#313244] rounded-2xl max-w-[500px] w-full p-8 shadow-2xl">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckIcon className="w-8 h-8 text-green-500" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-[#cdd6f4] text-center mb-4">
            Import Complete!
          </h2>

          {/* Statistics */}
          <div className="space-y-3 mb-6 p-4 bg-[#1e1e2e] rounded-lg">
            <div className="flex justify-between text-[#cdd6f4]">
              <span>Successfully imported:</span>
              <span className="font-semibold">{importStats.imported} contacts</span>
            </div>
            <div className="flex justify-between text-[#a6adc8]">
              <span>Updated:</span>
              <span>{importStats.updated} contacts</span>
            </div>
            <div className="flex justify-between text-[#a6adc8]">
              <span>Skipped:</span>
              <span>{importStats.skipped} duplicates</span>
            </div>
          </div>

          {/* Campaigns */}
          {selectedCampaignNames.length > 0 && (
            <div className="mb-6">
              <p className="text-sm text-[#a6adc8] mb-2">All contacts assigned to:</p>
              <ul className="space-y-1">
                {selectedCampaignNames.map((name, index) => (
                  <li key={index} className="text-sm text-[#cdd6f4] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F25C05]"></span>
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleViewContacts}
            className="w-full bg-[#F25C05] hover:bg-[#D94C04] text-white font-semibold px-4 py-3 rounded-lg shadow-[0_2px_8px_rgba(242,92,5,0.3)] hover:shadow-[0_4px_12px_rgba(242,92,5,0.4)] hover:-translate-y-0.5 transition-all duration-200"
          >
            View Contacts
          </button>
        </div>
      </div>
    );
  }

  // Cancel Confirmation Dialog
  if (showCancelConfirm) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-8">
        <div className="bg-[#181825] border border-[#313244] rounded-2xl max-w-[400px] w-full p-6 shadow-2xl">
          <h3 className="text-lg font-semibold text-[#cdd6f4] mb-3">
            Cancel Upload?
          </h3>
          <p className="text-sm text-[#a6adc8] mb-6">
            Are you sure? All progress will be lost.
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowCancelConfirm(false)}
              className="bg-[#313244] hover:bg-[#45475a] text-[#cdd6f4] font-semibold px-4 py-2 rounded-lg transition-all duration-200"
            >
              Continue Upload
            </button>
            <button
              onClick={handleCancelConfirm}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 font-semibold px-4 py-2 rounded-lg transition-all duration-200"
            >
              Yes, Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Modal
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-8">
      <div className="bg-[#181825] border border-[#313244] rounded-2xl max-w-[800px] w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Step Indicator */}
        <StepIndicator />

        {/* Modal Header */}
        <div className="px-6 pb-4 border-b border-[#313244]">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#cdd6f4]">
              Step {currentStep} of 4: {
                currentStep === 1 ? 'Upload CSV File' :
                currentStep === 2 ? 'Preview Contacts' :
                currentStep === 3 ? 'Check Duplicates' :
                'Confirm Import'
              }
            </h2>
            <button
              onClick={handleCancel}
              className="text-[#a6adc8] hover:text-[#cdd6f4] transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Step 1: File Upload */}
          {currentStep === 1 && (
            <div>
              {/* Drag and Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleBrowseClick}
                className={`
                  h-[200px] border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all duration-200
                  ${isDragOver
                    ? 'border-[#F25C05] bg-[rgba(242,92,5,0.1)] border-solid'
                    : error
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-[#45475a] bg-[#313244] hover:border-[#F25C05] hover:bg-[rgba(242,92,5,0.05)]'
                  }
                `}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <ArrowUpTrayIcon className="w-12 h-12 text-[#a6adc8] mb-3" />
                <p className="text-[#cdd6f4] font-medium mb-1">
                  📁 Drag and drop CSV file here or click to browse
                </p>
                <p className="text-sm text-[#6c7086]">
                  Supported: .csv files only
                </p>
              </div>

              {/* Help Text */}
              <div className="mt-4 p-3 bg-[#1e1e2e] rounded-lg border border-[#313244]">
                <p className="text-sm text-[#a6adc8]">
                  💡 <span className="font-semibold">Tip:</span> Export from LinkedIn: Connections → Manage synced contacts → Download
                </p>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="mt-6 flex items-center justify-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#313244] border-t-[#F25C05]"></div>
                  <p className="text-sm text-[#a6adc8]">Parsing CSV...</p>
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Parse Errors */}
              {parseErrors.length > 0 && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm font-semibold text-red-400 mb-2">
                    Found {parseErrors.length} errors in CSV file
                  </p>
                  <ul className="space-y-1 mb-3">
                    {parseErrors.slice(0, 10).map((err, index) => (
                      <li key={index} className="text-xs text-red-300">
                        Row {err.row}: {err.message}
                      </li>
                    ))}
                  </ul>
                  {parseErrors.length > 10 && (
                    <p className="text-xs text-red-300 mb-3">
                      and {parseErrors.length - 10} more...
                    </p>
                  )}
                  <button
                    onClick={downloadErrorReport}
                    className="text-xs text-red-400 hover:text-red-300 underline"
                  >
                    Download Error Report
                  </button>
                </div>
              )}

              {/* Success State */}
              {parseResult && (
                <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-400">
                    ✓ Successfully parsed: {parseResult.validRows} contacts
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Preview and Campaign Assignment */}
          {currentStep === 2 && parseResult && (
            <div>
              {/* Summary */}
              <div className="mb-6 p-4 bg-[#1e1e2e] rounded-lg border border-[#313244]">
                <p className="text-[#cdd6f4] font-medium">
                  Successfully parsed: <span className="text-[#F25C05]">{parseResult.validRows}</span> contacts
                </p>
              </div>

              {/* Campaign Assignment */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#cdd6f4] mb-2">
                  Assign to Campaign(s): <span className="text-red-400">*</span>
                </label>
                <div className="space-y-2 max-h-[150px] overflow-y-auto p-3 bg-[#1e1e2e] rounded-lg border border-[#313244]">
                  {campaigns.map(campaign => (
                    <label key={campaign.id} className="flex items-center gap-3 cursor-pointer hover:bg-[#313244] p-2 rounded transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedCampaigns.includes(campaign.id)}
                        onChange={() => toggleCampaign(campaign.id)}
                        className="w-4 h-4 text-[#F25C05] bg-[#313244] border-[#45475a] rounded focus:ring-[#F25C05] focus:ring-2"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-[#cdd6f4] font-medium">{campaign.name}</p>
                        {campaign.description && (
                          <p className="text-xs text-[#6c7086]">{campaign.description}</p>
                        )}
                      </div>
                    </label>
                  ))}
                  {campaigns.length === 0 && (
                    <p className="text-sm text-[#6c7086] text-center py-2">
                      No campaigns available
                    </p>
                  )}
                </div>
              </div>

              {/* Preview Table */}
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-[#cdd6f4] mb-3">Contact Preview</h3>
                <div className="overflow-x-auto rounded-lg border border-[#313244]">
                  <table className="w-full">
                    <thead className="border-b border-[#313244] bg-[#1e1e2e]">
                      <tr>
                        <th className="text-left px-3 py-3 text-xs font-semibold uppercase tracking-wider text-[#7f849c]">
                          Name
                        </th>
                        <th className="text-left px-3 py-3 text-xs font-semibold uppercase tracking-wider text-[#7f849c]">
                          Company
                        </th>
                        <th className="text-left px-3 py-3 text-xs font-semibold uppercase tracking-wider text-[#7f849c]">
                          Position
                        </th>
                        <th className="text-left px-3 py-3 text-xs font-semibold uppercase tracking-wider text-[#7f849c]">
                          LinkedIn
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {parseResult.contacts.slice(0, 5).map((contact, index) => (
                        <tr key={index} className="border-b border-[#313244] hover:bg-[rgba(242,92,5,0.03)] transition-colors">
                          <td className="px-3 py-3 text-sm text-[#cdd6f4]">
                            {contact.first_name} {contact.last_name}
                          </td>
                          <td className="px-3 py-3 text-sm text-[#a6adc8]">
                            {contact.company || '-'}
                          </td>
                          <td className="px-3 py-3 text-sm text-[#a6adc8]">
                            {contact.position || '-'}
                          </td>
                          <td className="px-3 py-3 text-sm">
                            {contact.linkedin_url ? (
                              <a
                                href={contact.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#F25C05] hover:underline"
                              >
                                View
                              </a>
                            ) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {parseResult.contacts.length > 5 && (
                  <p className="text-xs text-[#6c7086] mt-2 text-center">
                    ... and {parseResult.contacts.length - 5} more
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Confirm and Import */}
          {currentStep === 4 && parseResult && (
            <div>
              {/* Import Summary */}
              <div className="mb-6 p-4 bg-[#1e1e2e] rounded-lg border border-[#313244] space-y-3">
                <div className="flex justify-between text-[#cdd6f4]">
                  <span className="flex items-center gap-2">
                    <CheckIcon className="w-4 h-4 text-green-500" />
                    New contacts
                  </span>
                  <span className="font-semibold">{parseResult.validRows}</span>
                </div>
                <div className="flex justify-between text-[#6c7086]">
                  <span className="flex items-center gap-2">
                    <span className="text-lg">⟳</span>
                    Updated contacts (duplicates)
                  </span>
                  <span>0</span>
                </div>
                <div className="flex justify-between text-[#6c7086]">
                  <span className="flex items-center gap-2">
                    <XMarkIcon className="w-4 h-4" />
                    Skipped (duplicates)
                  </span>
                  <span>0</span>
                </div>
                <div className="pt-3 border-t border-[#313244] flex justify-between text-[#cdd6f4] font-semibold">
                  <span>Total from CSV</span>
                  <span>{parseResult.totalRows}</span>
                </div>
              </div>

              {/* Selected Campaigns */}
              {selectedCampaigns.length > 0 && (
                <div className="mb-6">
                  <p className="text-sm font-medium text-[#cdd6f4] mb-2">Campaigns:</p>
                  <div className="flex flex-wrap gap-2">
                    {campaigns
                      .filter(c => selectedCampaigns.includes(c.id))
                      .map(campaign => (
                        <span
                          key={campaign.id}
                          className="px-3 py-1 bg-[#F25C05]/20 text-[#F25C05] text-sm rounded-full border border-[#F25C05]/30"
                        >
                          {campaign.name}
                        </span>
                      ))}
                  </div>
                </div>
              )}

              {/* Warning */}
              <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-sm text-yellow-400 flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  This action will modify your database
                </p>
              </div>

              {/* Importing State */}
              {isImporting && (
                <div className="mb-4 flex items-center justify-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#313244] border-t-[#F25C05]"></div>
                  <p className="text-sm text-[#a6adc8]">
                    Importing {parseResult.validRows} contacts...
                  </p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#313244] flex justify-between">
          <button
            onClick={handleCancel}
            className="bg-[#313244] hover:bg-[#45475a] text-[#cdd6f4] font-semibold px-4 py-2 rounded-lg border border-[#45475a] transition-all duration-200"
          >
            Cancel
          </button>

          <div className="flex gap-3">
            {currentStep > 1 && currentStep < 4 && (
              <button
                onClick={handleBackStep}
                disabled={isLoading}
                className="flex items-center gap-2 bg-[#313244] hover:bg-[#45475a] text-[#cdd6f4] font-semibold px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Back
              </button>
            )}

            {currentStep === 1 && (
              <button
                onClick={handleNextStep}
                disabled={!parseResult || isLoading}
                className="flex items-center gap-2 bg-[#F25C05] hover:bg-[#D94C04] text-white font-semibold px-4 py-2 rounded-lg shadow-[0_2px_8px_rgba(242,92,5,0.3)] hover:shadow-[0_4px_12px_rgba(242,92,5,0.4)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                Next
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            )}

            {currentStep === 2 && (
              <button
                onClick={handleNextStep}
                disabled={selectedCampaigns.length === 0 || isLoading}
                className="flex items-center gap-2 bg-[#F25C05] hover:bg-[#D94C04] text-white font-semibold px-4 py-2 rounded-lg shadow-[0_2px_8px_rgba(242,92,5,0.3)] hover:shadow-[0_4px_12px_rgba(242,92,5,0.4)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isLoading ? 'Checking...' : 'Next: Check Duplicates'}
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            )}

            {currentStep === 4 && (
              <button
                onClick={handleImport}
                disabled={isImporting}
                className="bg-[#F25C05] hover:bg-[#D94C04] text-white font-semibold px-6 py-2 rounded-lg shadow-[0_2px_8px_rgba(242,92,5,0.3)] hover:shadow-[0_4px_12px_rgba(242,92,5,0.4)] hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {isImporting ? 'Importing...' : 'Import Contacts'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

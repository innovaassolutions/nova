'use client';

import { useState } from 'react';

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  status: string;
}

interface CsvUploadFormProps {
  campaigns: Campaign[];
  onFileSelect: (file: File, selectedCampaignIds: string[]) => Promise<void>;
  isProcessing: boolean;
}

export default function CsvUploadForm({
  campaigns,
  onFileSelect,
  isProcessing,
}: CsvUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [error, setError] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError('');

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!selectedFile.name.endsWith('.csv')) {
      setError('Please select a CSV file');
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleCampaignToggle = (campaignId: string) => {
    setSelectedCampaigns((prev) =>
      prev.includes(campaignId)
        ? prev.filter((id) => id !== campaignId)
        : [...prev, campaignId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setError('Please select a file');
      return;
    }

    if (selectedCampaigns.length === 0) {
      setError('Please select at least one campaign');
      return;
    }

    setError('');
    await onFileSelect(file, selectedCampaigns);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label
          htmlFor="csv-file"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          LinkedIn Connections CSV File
        </label>
        <input
          type="file"
          id="csv-file"
          accept=".csv"
          onChange={handleFileChange}
          disabled={isProcessing}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {file && (
          <p className="mt-2 text-sm text-gray-600">
            Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Associate with Campaigns
        </label>
        <div className="border rounded-lg p-4 max-h-60 overflow-y-auto space-y-2">
          {campaigns.length === 0 ? (
            <p className="text-sm text-gray-500">
              No campaigns available. Create a campaign first.
            </p>
          ) : (
            campaigns.map((campaign) => (
              <label
                key={campaign.id}
                className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedCampaigns.includes(campaign.id)}
                  onChange={() => handleCampaignToggle(campaign.id)}
                  disabled={isProcessing}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {campaign.name}
                  </div>
                  {campaign.description && (
                    <div className="text-sm text-gray-500">
                      {campaign.description}
                    </div>
                  )}
                  <div className="text-xs text-gray-400">
                    Status: {campaign.status}
                  </div>
                </div>
              </label>
            ))
          )}
        </div>
        {selectedCampaigns.length > 0 && (
          <p className="mt-2 text-sm text-gray-600">
            {selectedCampaigns.length} campaign(s) selected
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!file || selectedCampaigns.length === 0 || isProcessing}
        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium
          hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed
          transition-colors"
      >
        {isProcessing ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Processing...
          </span>
        ) : (
          'Upload and Process'
        )}
      </button>
    </form>
  );
}

'use client';

import { useState } from 'react';
import { parseLinkedInCsv, LinkedInContact } from '@/lib/csv-parser';
import ContactPreviewTable from './ContactPreviewTable';

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: string;
}

interface CsvUploadFormProps {
  campaigns: Campaign[];
  onImport: (selectedContacts: Array<{ contact: LinkedInContact; campaignIds: string[] }>) => Promise<void>;
  isProcessing: boolean;
}

export default function CsvUploadForm({
  campaigns,
  onImport,
  isProcessing,
}: CsvUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedContacts, setParsedContacts] = useState<LinkedInContact[] | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [error, setError] = useState<string>('');
  const [isParsing, setIsParsing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError('');
    setParsedContacts(null);
    setParseErrors([]);

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

    // Automatically parse CSV after selection
    setIsParsing(true);
    try {
      const result = await parseLinkedInCsv(selectedFile);

      if (result.errors.length > 0) {
        setParseErrors(result.errors);
      }

      if (result.contacts.length === 0) {
        setError('No valid contacts found in CSV file');
      } else {
        setParsedContacts(result.contacts);
      }
    } catch (err) {
      setError('Failed to parse CSV file. Please check the file format.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setParsedContacts(null);
    setParseErrors([]);
    setError('');
  };

  const handleImportContacts = async (selectedContacts: Array<{ contact: LinkedInContact; campaignIds: string[] }>) => {
    await onImport(selectedContacts);
  };

  // Show preview table if contacts have been parsed
  if (parsedContacts && parsedContacts.length > 0) {
    return (
      <div className="space-y-4">
        {parseErrors.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">
              Parsing Warnings ({parseErrors.length})
            </h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              {parseErrors.slice(0, 5).map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
              {parseErrors.length > 5 && (
                <li className="text-yellow-600">
                  ...and {parseErrors.length - 5} more warnings
                </li>
              )}
            </ul>
          </div>
        )}

        <ContactPreviewTable
          contacts={parsedContacts}
          campaigns={campaigns}
          onImport={handleImportContacts}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  // Show file upload form
  return (
    <div className="space-y-6">
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
          disabled={isProcessing || isParsing}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {file && !isParsing && !parsedContacts && (
          <p className="mt-2 text-sm text-gray-600">
            Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </p>
        )}
        {isParsing && (
          <p className="mt-2 text-sm text-blue-600 flex items-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600"
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
            Parsing CSV file...
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">CSV Format Instructions</h3>
        <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
          <li>Export your connections from LinkedIn Sales Navigator</li>
          <li>File must include columns: First Name, Last Name, URL, Company, Position</li>
          <li>Email Address is optional (often blank in LinkedIn exports)</li>
          <li>Duplicates will be detected by name or LinkedIn URL</li>
        </ul>
      </div>
    </div>
  );
}

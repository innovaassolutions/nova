'use client';

import { useState, useEffect } from 'react';
import CsvUploadForm, { Campaign } from '@/components/CsvUploadForm';
import DuplicateAlertModal from '@/components/DuplicateAlertModal';
import { parseLinkedInCsv, LinkedInContact } from '@/lib/csv-parser';
import { findDuplicates, DuplicateMatch, Contact } from '@/lib/duplicate-checker';
import { createClient } from '@/lib/supabase/client';

export default function UploadContactsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [pendingUpload, setPendingUpload] = useState<{
    selectedContacts: Array<{ contact: LinkedInContact; campaignIds: string[] }>;
  } | null>(null);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    const { data, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('status', 'Active')
      .order('name');

    if (error) {
      console.error('Error loading campaigns:', error);
      return;
    }

    setCampaigns(data || []);
  };

  const handleImport = async (selectedContacts: Array<{ contact: LinkedInContact; campaignIds: string[] }>) => {
    setIsProcessing(true);
    setMessage(null);

    try {
      // Extract just the contacts for duplicate checking
      const contacts = selectedContacts.map(sc => sc.contact);

      // Fetch existing contacts for duplicate detection
      const { data: existingContacts, error: fetchError } = await supabase
        .from('contacts')
        .select('id, first_name, last_name, linkedin_url, email, company, position');

      if (fetchError) {
        throw new Error(`Failed to fetch existing contacts: ${fetchError.message}`);
      }

      // Check for duplicates
      const duplicateMatches = findDuplicates(contacts, existingContacts || []);

      if (duplicateMatches.length > 0) {
        // Show duplicate modal
        setDuplicates(duplicateMatches);
        setPendingUpload({ selectedContacts });
        setIsProcessing(false);
      } else {
        // No duplicates, proceed with import
        await performImport(selectedContacts, []);
      }
    } catch (error) {
      console.error('Error processing import:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'An error occurred during import',
      });
      setIsProcessing(false);
    }
  };

  const handleDuplicateConfirm = async (overwriteIds: string[]) => {
    if (!pendingUpload) return;

    setDuplicates([]);
    setIsProcessing(true);

    await performImport(pendingUpload.selectedContacts, overwriteIds);

    setPendingUpload(null);
  };

  const handleDuplicateCancel = () => {
    setDuplicates([]);
    setPendingUpload(null);
    setIsProcessing(false);
    setMessage({
      type: 'error',
      text: 'Import cancelled',
    });
  };

  const performImport = async (
    selectedContacts: Array<{ contact: LinkedInContact; campaignIds: string[] }>,
    overwriteIds: string[]
  ) => {
    try {
      const response = await fetch('/api/contacts/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedContacts,
          overwriteIds,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Import failed');
      }

      setMessage({
        type: 'success',
        text: `Successfully imported ${result.imported} contact(s). ${
          result.overwritten > 0 ? `Overwritten: ${result.overwritten}.` : ''
        } ${result.errors.length > 0 ? `Errors: ${result.errors.length}` : ''}`,
      });

      // Reset form
      setTimeout(() => {
        setMessage(null);
      }, 5000);
    } catch (error) {
      console.error('Import error:', error);
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Import failed',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <a
            href="/"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Back to Home
          </a>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upload LinkedIn Contacts
          </h1>
          <p className="text-gray-600 mb-8">
            Import contacts from your LinkedIn Connections CSV export
          </p>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.text}</div>
            </div>
          )}

          <CsvUploadForm
            campaigns={campaigns}
            onImport={handleImport}
            isProcessing={isProcessing}
          />

          <div className="mt-8 pt-8 border-t">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">
              CSV Format Instructions
            </h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li>Export your connections from LinkedIn Sales Navigator</li>
              <li>File must include columns: First Name, Last Name, URL, Company, Position</li>
              <li>Email Address is optional (often blank in LinkedIn exports)</li>
              <li>Duplicates will be detected by name or LinkedIn URL</li>
            </ul>
          </div>
        </div>
      </div>

      {duplicates.length > 0 && (
        <DuplicateAlertModal
          duplicates={duplicates}
          onConfirm={handleDuplicateConfirm}
          onCancel={handleDuplicateCancel}
        />
      )}
    </div>
  );
}

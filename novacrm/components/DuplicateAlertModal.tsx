'use client';

import { useState } from 'react';
import { DuplicateMatch } from '@/lib/duplicate-checker';

interface DuplicateAlertModalProps {
  duplicates: DuplicateMatch[];
  onConfirm: (overwriteIds: string[]) => void;
  onCancel: () => void;
}

export default function DuplicateAlertModal({
  duplicates,
  onConfirm,
  onCancel,
}: DuplicateAlertModalProps) {
  const [selectedForOverwrite, setSelectedForOverwrite] = useState<Set<string>>(
    new Set()
  );

  const handleToggleOverwrite = (contactId: string) => {
    setSelectedForOverwrite((prev) => {
      const next = new Set(prev);
      if (next.has(contactId)) {
        next.delete(contactId);
      } else {
        next.add(contactId);
      }
      return next;
    });
  };

  const handleConfirm = () => {
    onConfirm(Array.from(selectedForOverwrite));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Duplicate Contacts Found
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {duplicates.length} duplicate contact{duplicates.length !== 1 ? 's' : ''}{' '}
            detected. Select which ones you want to overwrite with the CSV data.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {duplicates.map((duplicate, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    id={`overwrite-${index}`}
                    checked={selectedForOverwrite.has(
                      duplicate.existingContact.id
                    )}
                    onChange={() =>
                      handleToggleOverwrite(duplicate.existingContact.id)
                    }
                    className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor={`overwrite-${index}`}
                        className="text-sm font-medium text-gray-900 cursor-pointer"
                      >
                        Overwrite this contact
                      </label>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded ${
                          duplicate.matchType === 'url'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        Duplicate by {duplicate.matchType === 'url' ? 'LinkedIn URL' : 'Name'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                          Existing Contact
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="font-medium text-gray-900">
                            {duplicate.existingContact.first_name}{' '}
                            {duplicate.existingContact.last_name}
                          </div>
                          {duplicate.existingContact.company && (
                            <div className="text-gray-600">
                              {duplicate.existingContact.company}
                            </div>
                          )}
                          {duplicate.existingContact.position && (
                            <div className="text-gray-500 text-xs">
                              {duplicate.existingContact.position}
                            </div>
                          )}
                          {duplicate.existingContact.email && (
                            <div className="text-gray-600 text-xs">
                              {duplicate.existingContact.email}
                            </div>
                          )}
                          <div className="text-blue-600 text-xs truncate">
                            <a
                              href={duplicate.existingContact.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {duplicate.existingContact.linkedin_url}
                            </a>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase mb-2">
                          CSV Contact (New Data)
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="font-medium text-gray-900">
                            {duplicate.csvContact.firstName}{' '}
                            {duplicate.csvContact.lastName}
                          </div>
                          {duplicate.csvContact.company && (
                            <div className="text-gray-600">
                              {duplicate.csvContact.company}
                            </div>
                          )}
                          {duplicate.csvContact.position && (
                            <div className="text-gray-500 text-xs">
                              {duplicate.csvContact.position}
                            </div>
                          )}
                          {duplicate.csvContact.email && (
                            <div className="text-gray-600 text-xs">
                              {duplicate.csvContact.email}
                            </div>
                          )}
                          <div className="text-blue-600 text-xs truncate">
                            <a
                              href={duplicate.csvContact.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:underline"
                            >
                              {duplicate.csvContact.url}
                            </a>
                          </div>
                          {duplicate.csvContact.connectedOn && (
                            <div className="text-gray-500 text-xs">
                              Connected: {duplicate.csvContact.connectedOn}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedForOverwrite.size} of {duplicates.length} selected for overwrite
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel Import
              </button>
              <button
                onClick={handleConfirm}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Proceed with Import
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

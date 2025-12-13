/**
 * CSV Parser Utility for LinkedIn Connection Exports
 *
 * Handles parsing of LinkedIn CSV exports with validation and error handling.
 * Supports LinkedIn's standard export format with fields:
 * - First Name, Last Name, URL (required)
 * - Email Address, Company, Position, Connected On (optional)
 *
 * Story: 3.1 - CSV Parser Library Integration & LinkedIn Format Handler
 */

import Papa from 'papaparse';

/**
 * Interface matching LinkedIn's CSV export column headers
 */
export interface LinkedInCSVRow {
  'First Name': string;
  'Last Name': string;
  'URL': string;
  'Email Address'?: string;
  'Company'?: string;
  'Position'?: string;
  'Connected On'?: string;
}

/**
 * Parsed contact data structure for database insertion
 */
export interface ParsedContact {
  first_name: string;
  last_name: string;
  linkedin_url: string;
  email?: string;
  company?: string;
  position?: string;
  connected_on?: string;
  source: 'CSV Import';
}

/**
 * CSV validation error with row number and message
 */
export type CSVValidationError = { row: number; message: string };

/**
 * CSV parse result with success and error tracking
 */
export interface CSVParseResult {
  contacts: ParsedContact[];
  errors: CSVValidationError[];
  totalRows: number;
  validRows: number;
}

/**
 * Parse LinkedIn CSV export file
 *
 * @param file - CSV file from LinkedIn export
 * @returns Promise resolving to parse result with contacts and errors
 *
 * @example
 * ```typescript
 * const result = await parseLinkedInCSV(file);
 * console.log(`Parsed ${result.validRows} of ${result.totalRows} contacts`);
 * if (result.errors.length > 0) {
 *   console.error('Errors:', result.errors);
 * }
 * ```
 */
export async function parseLinkedInCSV(file: File): Promise<CSVParseResult> {
  return new Promise((resolve, reject) => {
    const contacts: ParsedContact[] = [];
    const errors: CSVValidationError[] = [];
    let totalRows = 0;

    Papa.parse<LinkedInCSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(), // Remove whitespace
      complete: (results) => {
        totalRows = results.data.length;

        results.data.forEach((row, index) => {
          const rowNum = index + 2; // Account for header row + 0-index

          // Validate required fields
          if (!row['First Name'] || !row['Last Name'] || !row['URL']) {
            errors.push({
              row: rowNum,
              message: 'Missing required fields (First Name, Last Name, or URL)',
            });
            return;
          }

          // Validate LinkedIn URL format (flexible validation for any LinkedIn URL)
          // Supports: http/https, with/without www, personal/company pages, query parameters
          const linkedinUrlPattern = /^https?:\/\/(www\.)?linkedin\.com\//;
          if (!linkedinUrlPattern.test(row['URL'])) {
            errors.push({
              row: rowNum,
              message: 'Invalid LinkedIn URL format - must be a valid LinkedIn URL',
            });
            return;
          }

          // Parse connected_on date (LinkedIn format: "01 Dec 2024" or "Dec 01, 2024")
          let connected_on: string | undefined;
          if (row['Connected On']) {
            const date = new Date(row['Connected On']);
            if (!isNaN(date.getTime())) {
              // Convert to ISO 8601 date format (YYYY-MM-DD)
              connected_on = date.toISOString().split('T')[0];
            } else {
              errors.push({
                row: rowNum,
                message: `Invalid date format in Connected On: ${row['Connected On']}`,
              });
              // Continue processing - date is optional
            }
          }

          // Create parsed contact object
          const contact: ParsedContact = {
            first_name: row['First Name'].trim(),
            last_name: row['Last Name'].trim(),
            linkedin_url: row['URL'].trim(),
            email: row['Email Address']?.trim() || undefined,
            company: row['Company']?.trim() || undefined,
            position: row['Position']?.trim() || undefined,
            connected_on,
            source: 'CSV Import',
          };

          contacts.push(contact);
        });

        resolve({
          contacts,
          errors,
          totalRows,
          validRows: contacts.length,
        });
      },
      error: (error) => {
        reject(new Error(`CSV parsing failed: ${error.message}`));
      },
    });
  });
}

/**
 * Validate LinkedIn URL format
 *
 * Simple, flexible validation that accepts any valid LinkedIn URL.
 * Supports: http/https, with/without www, personal/company pages, query parameters
 *
 * @param url - URL string to validate
 * @returns true if valid LinkedIn URL, false otherwise
 */
export function validateLinkedInUrl(url: string): boolean {
  const pattern = /^https?:\/\/(www\.)?linkedin\.com\//;
  return pattern.test(url);
}

/**
 * Format LinkedIn URL to standard format (with trailing slash removed)
 *
 * @param url - LinkedIn URL to format
 * @returns Formatted URL without trailing slash
 */
export function formatLinkedInUrl(url: string): string {
  return url.replace(/\/$/, '');
}

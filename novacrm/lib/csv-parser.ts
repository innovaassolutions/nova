import Papa from 'papaparse';

export interface LinkedInContact {
  firstName: string;
  lastName: string;
  url: string;
  email?: string;
  company?: string;
  position?: string;
  connectedOn?: string;
}

export interface ParseResult {
  contacts: LinkedInContact[];
  errors: string[];
}

export async function parseLinkedInCsv(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const errors: string[] = [];
    const contacts: LinkedInContact[] = [];

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      beforeFirstChunk: (chunk) => {
        // Remove Notes section if present (lines before actual CSV headers)
        const lines = chunk.split('\n');
        const headerIndex = lines.findIndex(line =>
          line.trim().startsWith('First Name') ||
          line.includes('First Name,Last Name')
        );

        if (headerIndex > 0) {
          // Found notes section, skip to headers
          return lines.slice(headerIndex).join('\n');
        }
        return chunk;
      },
      transformHeader: (header) => {
        // Normalize header names
        const headerMap: Record<string, string> = {
          'First Name': 'firstName',
          'Last Name': 'lastName',
          'URL': 'url',
          'Email Address': 'email',
          'Company': 'company',
          'Position': 'position',
          'Connected On': 'connectedOn',
        };
        return headerMap[header] || header;
      },
      complete: (results) => {
        const data = results.data as any[];

        for (let i = 0; i < data.length; i++) {
          const row = data[i];

          // Skip empty rows
          if (!row.firstName && !row.lastName && !row.url) {
            continue;
          }

          // Validate required fields
          if (!row.firstName || !row.lastName || !row.url) {
            errors.push(`Row ${i + 1}: Missing required fields (First Name, Last Name, or URL)`);
            continue;
          }

          // Validate LinkedIn URL format
          const linkedInUrlPattern = /^https:\/\/www\.linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
          if (!linkedInUrlPattern.test(row.url)) {
            errors.push(`Row ${i + 1}: Invalid LinkedIn URL format: ${row.url}`);
            continue;
          }

          contacts.push({
            firstName: row.firstName.trim(),
            lastName: row.lastName.trim(),
            url: row.url.trim(),
            email: row.email?.trim() || undefined,
            company: row.company?.trim() || undefined,
            position: row.position?.trim() || undefined,
            connectedOn: row.connectedOn?.trim() || undefined,
          });
        }

        resolve({ contacts, errors });
      },
      error: (error) => {
        errors.push(`CSV parsing error: ${error.message}`);
        resolve({ contacts: [], errors });
      },
    });
  });
}

import { LinkedInContact } from './csv-parser';

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  linkedin_url: string;
  email?: string;
  company?: string;
  position?: string;
}

export interface DuplicateMatch {
  csvContact: LinkedInContact;
  existingContact: Contact;
  matchType: 'name' | 'url';
}

export function findDuplicates(
  csvContacts: LinkedInContact[],
  existingContacts: Contact[]
): DuplicateMatch[] {
  const duplicates: DuplicateMatch[] = [];

  for (const csvContact of csvContacts) {
    const duplicate = existingContacts.find((existing) => {
      // Check LinkedIn URL match (exact)
      if (existing.linkedin_url.toLowerCase() === csvContact.url.toLowerCase()) {
        return true;
      }

      // Check name match (first + last name, case insensitive)
      const nameMatch =
        existing.first_name.toLowerCase() === csvContact.firstName.toLowerCase() &&
        existing.last_name.toLowerCase() === csvContact.lastName.toLowerCase();

      return nameMatch;
    });

    if (duplicate) {
      const matchType =
        duplicate.linkedin_url.toLowerCase() === csvContact.url.toLowerCase()
          ? 'url'
          : 'name';

      duplicates.push({
        csvContact,
        existingContact: duplicate,
        matchType,
      });
    }
  }

  return duplicates;
}

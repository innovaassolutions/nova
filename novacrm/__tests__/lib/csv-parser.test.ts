/**
 * Unit Tests for CSV Parser Utility
 *
 * Story: 3.1 - CSV Parser Library Integration & LinkedIn Format Handler
 *
 * Test Coverage:
 * - AC11.1: Valid CSV with all fields populated
 * - AC11.2: CSV with blank email addresses
 * - AC11.3: CSV with special characters in names
 * - AC11.4: Invalid LinkedIn URL formats
 * - AC11.5: Missing required fields
 * - AC11.6: Date format variations
 * - AC11.7: Empty rows and whitespace handling
 * - AC11.8: CSV parsing error handling
 */

import { describe, it, expect } from 'vitest'
import {
  parseLinkedInCSV,
  validateLinkedInUrl,
  formatLinkedInUrl,
  type CSVParseResult,
  type ParsedContact,
} from '@/lib/csv-parser'

// Helper function to create File objects from CSV strings
function createCsvFile(content: string, filename = 'test.csv'): File {
  return new File([content], filename, { type: 'text/csv' })
}

describe('parseLinkedInCSV', () => {
  describe('AC11.1: Valid CSV with all fields populated', () => {
    it('should successfully parse valid CSV with all fields', async () => {
      const csvContent = `First Name,Last Name,URL,Email Address,Company,Position,Connected On
John,Doe,https://www.linkedin.com/in/john-doe,john@example.com,Acme Corp,Software Engineer,01 Dec 2024
Jane,Smith,https://www.linkedin.com/in/jane-smith,jane@test.com,Tech Inc,Product Manager,15 Nov 2024`

      const file = createCsvFile(csvContent)
      const result: CSVParseResult = await parseLinkedInCSV(file)

      expect(result.totalRows).toBe(2)
      expect(result.validRows).toBe(2)
      expect(result.errors).toHaveLength(0)
      expect(result.contacts).toHaveLength(2)

      // Verify first contact
      expect(result.contacts[0]).toEqual({
        first_name: 'John',
        last_name: 'Doe',
        linkedin_url: 'https://www.linkedin.com/in/john-doe',
        email: 'john@example.com',
        company: 'Acme Corp',
        position: 'Software Engineer',
        connected_on: '2024-12-01',
        source: 'CSV Import',
      })

      // Verify second contact
      expect(result.contacts[1]).toEqual({
        first_name: 'Jane',
        last_name: 'Smith',
        linkedin_url: 'https://www.linkedin.com/in/jane-smith',
        email: 'jane@test.com',
        company: 'Tech Inc',
        position: 'Product Manager',
        connected_on: '2024-11-15',
        source: 'CSV Import',
      })
    })
  })

  describe('AC11.2: CSV with blank email addresses (FR3.2)', () => {
    it('should handle blank email addresses without errors', async () => {
      const csvContent = `First Name,Last Name,URL,Email Address,Company,Position,Connected On
Bob,Wilson,https://www.linkedin.com/in/bob-wilson,,Wilson Co,CEO,10 Dec 2024
Alice,Brown,https://www.linkedin.com/in/alice-brown,,Tech Startup,CTO,05 Dec 2024`

      const file = createCsvFile(csvContent)
      const result = await parseLinkedInCSV(file)

      expect(result.totalRows).toBe(2)
      expect(result.validRows).toBe(2)
      expect(result.errors).toHaveLength(0)

      // Verify email is undefined, not empty string
      expect(result.contacts[0].email).toBeUndefined()
      expect(result.contacts[1].email).toBeUndefined()

      // Verify other fields are still parsed correctly
      expect(result.contacts[0].first_name).toBe('Bob')
      expect(result.contacts[0].company).toBe('Wilson Co')
    })

    it('should handle mix of blank and filled emails', async () => {
      const csvContent = `First Name,Last Name,URL,Email Address,Company,Position,Connected On
Charlie,Davis,https://www.linkedin.com/in/charlie-davis,charlie@example.com,Example Corp,Developer,01 Dec 2024
Diana,Evans,https://www.linkedin.com/in/diana-evans,,Startup Inc,Designer,02 Dec 2024`

      const file = createCsvFile(csvContent)
      const result = await parseLinkedInCSV(file)

      expect(result.validRows).toBe(2)
      expect(result.contacts[0].email).toBe('charlie@example.com')
      expect(result.contacts[1].email).toBeUndefined()
    })
  })

  describe('AC11.3: CSV with special characters in names', () => {
    it('should preserve apostrophes in names', async () => {
      const csvContent = `First Name,Last Name,URL,Email Address,Company,Position,Connected On
Sean,O'Brien,https://www.linkedin.com/in/sean-obrien,sean@example.com,Irish Corp,Manager,01 Dec 2024`

      const file = createCsvFile(csvContent)
      const result = await parseLinkedInCSV(file)

      expect(result.validRows).toBe(1)
      expect(result.contacts[0].last_name).toBe("O'Brien")
    })

    it('should preserve umlauts and accents', async () => {
      const csvContent = `First Name,Last Name,URL,Email Address,Company,Position,Connected On
Hans,Müller,https://www.linkedin.com/in/hans-muller,hans@example.com,German GmbH,Engineer,01 Dec 2024
José,García,https://www.linkedin.com/in/jose-garcia,jose@example.com,Spanish SA,Director,02 Dec 2024`

      const file = createCsvFile(csvContent)
      const result = await parseLinkedInCSV(file)

      expect(result.validRows).toBe(2)
      expect(result.contacts[0].last_name).toBe('Müller')
      expect(result.contacts[1].first_name).toBe('José')
      expect(result.contacts[1].last_name).toBe('García')
    })

    it('should handle names with commas when quoted', async () => {
      const csvContent = `First Name,Last Name,URL,Email Address,Company,Position,Connected On
"Raymond, EHRC",Smith,https://www.linkedin.com/in/raymond-smith,raymond@example.com,Corp Inc,VP,01 Dec 2024`

      const file = createCsvFile(csvContent)
      const result = await parseLinkedInCSV(file)

      expect(result.validRows).toBe(1)
      expect(result.contacts[0].first_name).toBe('Raymond, EHRC')
    })
  })

  describe('AC11.4: Invalid LinkedIn URL formats', () => {
    it('should reject URLs without https', async () => {
      const csvContent = `First Name,Last Name,URL,Email Address,Company,Position,Connected On
Test,User,http://www.linkedin.com/in/test-user,test@example.com,Test Corp,Tester,01 Dec 2024`

      const file = createCsvFile(csvContent)
      const result = await parseLinkedInCSV(file)

      expect(result.validRows).toBe(0)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].row).toBe(2)
      expect(result.errors[0].message).toBe('Invalid LinkedIn URL format')
    })

    it('should reject non-LinkedIn URLs', async () => {
      const csvContent = `First Name,Last Name,URL,Email Address,Company,Position,Connected On
Test,User,https://www.facebook.com/test-user,test@example.com,Test Corp,Tester,01 Dec 2024`

      const file = createCsvFile(csvContent)
      const result = await parseLinkedInCSV(file)

      expect(result.validRows).toBe(0)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].message).toBe('Invalid LinkedIn URL format')
    })

    it('should reject LinkedIn URLs without /in/ path', async () => {
      const csvContent = `First Name,Last Name,URL,Email Address,Company,Position,Connected On
Test,User,https://www.linkedin.com/company/test-company,test@example.com,Test Corp,Tester,01 Dec 2024`

      const file = createCsvFile(csvContent)
      const result = await parseLinkedInCSV(file)

      expect(result.validRows).toBe(0)
      expect(result.errors).toHaveLength(1)
    })

    it('should accept LinkedIn URLs with and without trailing slash', async () => {
      const csvContent = `First Name,Last Name,URL,Email Address,Company,Position,Connected On
User,One,https://www.linkedin.com/in/user-one,user1@example.com,Corp,Dev,01 Dec 2024
User,Two,https://www.linkedin.com/in/user-two/,user2@example.com,Corp,Dev,01 Dec 2024`

      const file = createCsvFile(csvContent)
      const result = await parseLinkedInCSV(file)

      expect(result.validRows).toBe(2)
      expect(result.errors).toHaveLength(0)
    })
  })

  describe('AC11.5: Missing required fields', () => {
    it('should reject rows missing First Name', async () => {
      const csvContent = `First Name,Last Name,URL,Email Address,Company,Position,Connected On
,Doe,https://www.linkedin.com/in/john-doe,john@example.com,Acme Corp,Engineer,01 Dec 2024`

      const file = createCsvFile(csvContent)
      const result = await parseLinkedInCSV(file)

      expect(result.validRows).toBe(0)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].message).toBe('Missing required fields (First Name, Last Name, or URL)')
    })

    it('should reject rows missing Last Name', async () => {
      const csvContent = `First Name,Last Name,URL,Email Address,Company,Position,Connected On
John,,https://www.linkedin.com/in/john-doe,john@example.com,Acme Corp,Engineer,01 Dec 2024`

      const file = createCsvFile(csvContent)
      const result = await parseLinkedInCSV(file)

      expect(result.validRows).toBe(0)
      expect(result.errors).toHaveLength(1)
      expect(result.errors[0].message).toBe('Missing required fields (First Name, Last Name, or URL)')
    })

    it('should reject rows missing URL', async () => {
      const csvContent = `First Name,Last Name,URL,Email Address,Company,Position,Connected On
John,Doe,,john@example.com,Acme Corp,Engineer,01 Dec 2024`

      const file = createCsvFile(csvContent)
      const result = await parseLinkedInCSV(file)

      expect(result.validRows).toBe(0)
      expect(result.errors).toHaveLength(1)
    })

    it('should collect multiple errors for multiple invalid rows', async () => {
      const csvContent = `First Name,Last Name,URL,Email Address,Company,Position,Connected On
,Doe,https://www.linkedin.com/in/john-doe,john@example.com,Acme Corp,Engineer,01 Dec 2024
Jane,Smith,https://www.linkedin.com/in/jane-smith,jane@example.com,Tech Inc,Manager,02 Dec 2024
Bob,,https://www.linkedin.com/in/bob-wilson,bob@example.com,Wilson Co,CEO,03 Dec 2024`

      const file = createCsvFile(csvContent)
      const result = await parseLinkedInCSV(file)

      expect(result.validRows).toBe(1) // Only Jane Smith is valid
      expect(result.errors).toHaveLength(2) // Two rows with missing required fields
      expect(result.errors[0].row).toBe(2)
      expect(result.errors[1].row).toBe(4)
    })
  })

  describe('AC11.6: Date format variations', () => {
    it('should parse "DD MMM YYYY" format (01 Dec 2024)', async () => {
      const csvContent = `First Name,Last Name,URL,Email Address,Company,Position,Connected On
John,Doe,https://www.linkedin.com/in/john-doe,john@example.com,Acme Corp,Engineer,01 Dec 2024`

      const file = createCsvFile(csvContent)
      const result = await parseLinkedInCSV(file)

      expect(result.validRows).toBe(1)
      expect(result.contacts[0].connected_on).toBe('2024-12-01')
    })

    it('should parse "MMM DD, YYYY" format (Dec 01, 2024)', async () => {
      const csvContent = `First Name,Last Name,URL,Email Address,Company,Position,Connected On
Jane,Smith,https://www.linkedin.com/in/jane-smith,jane@example.com,Tech Inc,Manager,Dec 01, 2024`

      const file = createCsvFile(csvContent)
      const result = await parseLinkedInCSV(file)

      expect(result.validRows).toBe(1)
      expect(result.contacts[0].connected_on).toBe('2024-12-01')
    })

    it('should handle various valid date formats', async () => {
      const csvContent = `First Name,Last Name,URL,Email Address,Company,Position,Connected On
User,One,https://www.linkedin.com/in/user-one,user1@example.com,Corp,Dev,2024-12-01
User,Two,https://www.linkedin.com/in/user-two,user2@example.com,Corp,Dev,12/01/2024
User,Three,https://www.linkedin.com/in/user-three,user3@example.com,Corp,Dev,December 1, 2024`

      const file = createCsvFile(csvContent)
      const result = await parseLinkedInCSV(file)

      expect(result.validRows).toBe(3)
      // All should parse to same date
      expect(result.contacts[0].connected_on).toBe('2024-12-01')
      expect(result.contacts[1].connected_on).toBe('2024-12-01')
      expect(result.contacts[2].connected_on).toBe('2024-12-01')
    })

    it('should handle blank Connected On field', async () => {
      const csvContent = `First Name,Last Name,URL,Email Address,Company,Position,Connected On
John,Doe,https://www.linkedin.com/in/john-doe,john@example.com,Acme Corp,Engineer,`

      const file = createCsvFile(csvContent)
      const result = await parseLinkedInCSV(file)

      expect(result.validRows).toBe(1)
      expect(result.contacts[0].connected_on).toBeUndefined()
    })

    it('should add error for invalid date but continue processing contact', async () => {
      const csvContent = `First Name,Last Name,URL,Email Address,Company,Position,Connected On
John,Doe,https://www.linkedin.com/in/john-doe,john@example.com,Acme Corp,Engineer,invalid-date`

      const file = createCsvFile(csvContent)
      const result = await parseLinkedInCSV(file)

      expect(result.validRows).toBe(1) // Contact still added
      expect(result.errors).toHaveLength(1) // But error recorded
      expect(result.errors[0].message).toContain('Invalid date format')
      expect(result.contacts[0].connected_on).toBeUndefined()
    })
  })

  describe('AC11.7: Empty rows and whitespace handling', () => {
    it('should skip empty rows', async () => {
      const csvContent = `First Name,Last Name,URL,Email Address,Company,Position,Connected On
John,Doe,https://www.linkedin.com/in/john-doe,john@example.com,Acme Corp,Engineer,01 Dec 2024

Jane,Smith,https://www.linkedin.com/in/jane-smith,jane@example.com,Tech Inc,Manager,02 Dec 2024`

      const file = createCsvFile(csvContent)
      const result = await parseLinkedInCSV(file)

      expect(result.validRows).toBe(2) // Empty row skipped by PapaParse
      expect(result.contacts).toHaveLength(2)
    })

    it('should trim leading and trailing whitespace from all fields', async () => {
      const csvContent = `First Name,Last Name,URL,Email Address,Company,Position,Connected On
  John  ,  Doe  ,  https://www.linkedin.com/in/john-doe  ,  john@example.com  ,  Acme Corp  ,  Engineer  ,  01 Dec 2024  `

      const file = createCsvFile(csvContent)
      const result = await parseLinkedInCSV(file)

      expect(result.validRows).toBe(1)
      expect(result.contacts[0].first_name).toBe('John')
      expect(result.contacts[0].last_name).toBe('Doe')
      expect(result.contacts[0].linkedin_url).toBe('https://www.linkedin.com/in/john-doe')
      expect(result.contacts[0].email).toBe('john@example.com')
      expect(result.contacts[0].company).toBe('Acme Corp')
      expect(result.contacts[0].position).toBe('Engineer')
    })

    it('should trim whitespace from headers via transformHeader', async () => {
      const csvContent = `  First Name  ,  Last Name  ,  URL  ,  Email Address  ,  Company  ,  Position  ,  Connected On
John,Doe,https://www.linkedin.com/in/john-doe,john@example.com,Acme Corp,Engineer,01 Dec 2024`

      const file = createCsvFile(csvContent)
      const result = await parseLinkedInCSV(file)

      expect(result.validRows).toBe(1) // Should still parse correctly
      expect(result.contacts[0].first_name).toBe('John')
    })
  })

  describe('AC11.8: CSV parsing error handling', () => {
    it('should reject malformed CSV with parsing error', async () => {
      // Create a completely invalid file content
      const invalidContent = 'This is not a CSV file at all!'
      const file = createCsvFile(invalidContent)

      // Parser should handle gracefully - in this case PapaParse won't error,
      // but will parse incorrectly, resulting in validation errors
      const result = await parseLinkedInCSV(file)

      // Since headers don't match, all rows will fail validation
      expect(result.validRows).toBe(0)
    })

    it('should handle CSV with mismatched column counts', async () => {
      const csvContent = `First Name,Last Name,URL,Email Address,Company,Position,Connected On
John,Doe,https://www.linkedin.com/in/john-doe
Jane,Smith,https://www.linkedin.com/in/jane-smith,jane@example.com,Tech Inc,Manager,02 Dec 2024`

      const file = createCsvFile(csvContent)
      const result = await parseLinkedInCSV(file)

      // First row missing required fields will be rejected
      expect(result.validRows).toBe(1) // Only second row valid
      expect(result.errors).toHaveLength(1)
    })
  })

  describe('CSV Parser Result Structure', () => {
    it('should return correct totalRows and validRows counts', async () => {
      const csvContent = `First Name,Last Name,URL,Email Address,Company,Position,Connected On
John,Doe,https://www.linkedin.com/in/john-doe,john@example.com,Acme Corp,Engineer,01 Dec 2024
,Smith,https://www.linkedin.com/in/jane-smith,jane@example.com,Tech Inc,Manager,02 Dec 2024
Bob,Wilson,https://www.linkedin.com/in/bob-wilson,bob@example.com,Wilson Co,CEO,03 Dec 2024`

      const file = createCsvFile(csvContent)
      const result = await parseLinkedInCSV(file)

      expect(result.totalRows).toBe(3) // All rows in CSV
      expect(result.validRows).toBe(2) // Only 2 valid (row 2 missing First Name)
      expect(result.contacts).toHaveLength(2)
      expect(result.errors).toHaveLength(1)
    })

    it('should match validRows to contacts.length', async () => {
      const csvContent = `First Name,Last Name,URL,Email Address,Company,Position,Connected On
John,Doe,https://www.linkedin.com/in/john-doe,john@example.com,Acme Corp,Engineer,01 Dec 2024`

      const file = createCsvFile(csvContent)
      const result = await parseLinkedInCSV(file)

      expect(result.validRows).toBe(result.contacts.length)
    })
  })
})

describe('validateLinkedInUrl', () => {
  it('should accept valid LinkedIn profile URLs', () => {
    expect(validateLinkedInUrl('https://www.linkedin.com/in/john-doe')).toBe(true)
    expect(validateLinkedInUrl('https://www.linkedin.com/in/jane-smith/')).toBe(true)
    expect(validateLinkedInUrl('https://www.linkedin.com/in/user_name')).toBe(true)
    expect(validateLinkedInUrl('https://www.linkedin.com/in/user-123')).toBe(true)
  })

  it('should reject invalid LinkedIn URLs', () => {
    expect(validateLinkedInUrl('http://www.linkedin.com/in/john-doe')).toBe(false) // http not https
    expect(validateLinkedInUrl('https://linkedin.com/in/john-doe')).toBe(false) // missing www
    expect(validateLinkedInUrl('https://www.linkedin.com/company/acme')).toBe(false) // company not in
    expect(validateLinkedInUrl('https://www.facebook.com/john-doe')).toBe(false) // wrong domain
    expect(validateLinkedInUrl('not-a-url')).toBe(false) // invalid URL
  })

  it('should reject URLs with special characters in username', () => {
    expect(validateLinkedInUrl('https://www.linkedin.com/in/user@name')).toBe(false)
    expect(validateLinkedInUrl('https://www.linkedin.com/in/user name')).toBe(false)
    expect(validateLinkedInUrl('https://www.linkedin.com/in/user.name')).toBe(false)
  })
})

describe('formatLinkedInUrl', () => {
  it('should remove trailing slash from URL', () => {
    expect(formatLinkedInUrl('https://www.linkedin.com/in/john-doe/')).toBe(
      'https://www.linkedin.com/in/john-doe'
    )
  })

  it('should leave URL unchanged if no trailing slash', () => {
    expect(formatLinkedInUrl('https://www.linkedin.com/in/john-doe')).toBe(
      'https://www.linkedin.com/in/john-doe'
    )
  })

  it('should only remove the last trailing slash', () => {
    expect(formatLinkedInUrl('https://www.linkedin.com/in/john-doe//')).toBe(
      'https://www.linkedin.com/in/john-doe/'
    )
  })
})

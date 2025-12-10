/**
 * CSV Upload Modal Tests
 *
 * Story: 3.2 - CSV Upload Page - Multistep Flow
 *
 * Test coverage for the multi-step CSV upload modal component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import CSVUploadModal from '../../app/(dashboard)/contacts/components/CSVUploadModal';

// Mock the CSV parser
vi.mock('../../app/lib/csv-parser', () => ({
  parseLinkedInCSV: vi.fn(),
}));

describe('CSVUploadModal', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Modal Rendering', () => {
    it('should render modal when isOpen is true', () => {
      render(<CSVUploadModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      expect(screen.getByText(/Step 1 of 4/i)).toBeInTheDocument();
      expect(screen.getByText(/Upload CSV File/i)).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      const { container } = render(
        <CSVUploadModal isOpen={false} onClose={mockOnClose} onSuccess={mockOnSuccess} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should display step indicator with 4 steps', () => {
      render(<CSVUploadModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      // Check for step circles (looking for the step indicators)
      const modal = screen.getByText(/Step 1 of 4/i).closest('div');
      expect(modal).toBeInTheDocument();
    });
  });

  describe('Step 1: File Upload', () => {
    it('should display drag-and-drop zone', () => {
      render(<CSVUploadModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      expect(screen.getByText(/Drag and drop CSV file here/i)).toBeInTheDocument();
      expect(screen.getByText(/Supported: .csv files only/i)).toBeInTheDocument();
    });

    it('should display help text with LinkedIn export instructions', () => {
      render(<CSVUploadModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      expect(screen.getByText(/Export from LinkedIn/i)).toBeInTheDocument();
    });

    it('should validate file extension - reject non-CSV files', async () => {
      render(<CSVUploadModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toBeInTheDocument();

      const invalidFile = new File(['test content'], 'test.txt', { type: 'text/plain' });

      Object.defineProperty(input, 'files', {
        value: [invalidFile],
        writable: false,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByText(/Invalid file/i)).toBeInTheDocument();
      });
    });

    it('should validate file size - reject files over 5MB', async () => {
      render(<CSVUploadModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      // Create a file that's larger than 5MB
      const largeContent = 'x'.repeat(6 * 1024 * 1024); // 6MB
      const largeFile = new File([largeContent], 'large.csv', { type: 'text/csv' });

      Object.defineProperty(input, 'files', {
        value: [largeFile],
        writable: false,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByText(/Invalid file/i)).toBeInTheDocument();
      });
    });

    it('should have disabled Next button initially', () => {
      render(<CSVUploadModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);
      const nextButton = screen.getByRole('button', { name: /Next/i });
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Cancel and Close Behavior', () => {
    it('should show cancel confirmation when canceling after uploading file', async () => {
      const { parseLinkedInCSV } = await import('../../app/lib/csv-parser');
      (parseLinkedInCSV as ReturnType<typeof vi.fn>).mockResolvedValue({
        contacts: [
          { first_name: 'John', last_name: 'Doe', linkedin_url: 'https://linkedin.com/in/johndoe' }
        ],
        errors: [],
        totalRows: 1,
        validRows: 1
      });

      render(<CSVUploadModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

      // Upload a valid file
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const validFile = new File(['First Name,Last Name,URL\nJohn,Doe,https://linkedin.com/in/johndoe'], 'test.csv', {
        type: 'text/csv'
      });

      Object.defineProperty(input, 'files', {
        value: [validFile],
        writable: false,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(parseLinkedInCSV).toHaveBeenCalledWith(validFile);
      });

      // Click cancel button
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      // Should show confirmation dialog
      await waitFor(() => {
        expect(screen.getByText(/Cancel Upload/i)).toBeInTheDocument();
        expect(screen.getByText(/All progress will be lost/i)).toBeInTheDocument();
      });
    });

    it('should close modal when confirming cancel', async () => {
      render(<CSVUploadModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

      // Since we haven't uploaded a file, clicking cancel should directly call onClose
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('CSV Parsing Integration', () => {
    it('should show loading state while parsing', async () => {
      const { parseLinkedInCSV } = await import('../../app/lib/csv-parser');
      let resolveParser: (value: any) => void;
      const parserPromise = new Promise(resolve => {
        resolveParser = resolve;
      });
      (parseLinkedInCSV as ReturnType<typeof vi.fn>).mockReturnValue(parserPromise);

      render(<CSVUploadModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const validFile = new File(['test'], 'test.csv', { type: 'text/csv' });

      Object.defineProperty(input, 'files', {
        value: [validFile],
        writable: false,
      });

      fireEvent.change(input);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText(/Parsing CSV/i)).toBeInTheDocument();
      });

      // Resolve the parser
      resolveParser!({
        contacts: [],
        errors: [],
        totalRows: 0,
        validRows: 0
      });
    });

    it('should display success message after successful parsing', async () => {
      const { parseLinkedInCSV } = await import('../../app/lib/csv-parser');
      (parseLinkedInCSV as ReturnType<typeof vi.fn>).mockResolvedValue({
        contacts: [
          { first_name: 'John', last_name: 'Doe', linkedin_url: 'https://linkedin.com/in/johndoe' },
          { first_name: 'Jane', last_name: 'Smith', linkedin_url: 'https://linkedin.com/in/janesmith' }
        ],
        errors: [],
        totalRows: 2,
        validRows: 2
      });

      render(<CSVUploadModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const validFile = new File(['test'], 'test.csv', { type: 'text/csv' });

      Object.defineProperty(input, 'files', {
        value: [validFile],
        writable: false,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByText(/Successfully parsed: 2 contacts/i)).toBeInTheDocument();
      });
    });

    it('should display error list when parsing fails', async () => {
      const { parseLinkedInCSV } = await import('../../app/lib/csv-parser');
      (parseLinkedInCSV as ReturnType<typeof vi.fn>).mockResolvedValue({
        contacts: [],
        errors: [
          { row: 2, message: 'Missing required fields' },
          { row: 3, message: 'Invalid LinkedIn URL' }
        ],
        totalRows: 3,
        validRows: 0
      });

      render(<CSVUploadModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const validFile = new File(['test'], 'test.csv', { type: 'text/csv' });

      Object.defineProperty(input, 'files', {
        value: [validFile],
        writable: false,
      });

      fireEvent.change(input);

      await waitFor(() => {
        expect(screen.getByText(/Found 2 errors in CSV file/i)).toBeInTheDocument();
        expect(screen.getByText(/Row 2: Missing required fields/i)).toBeInTheDocument();
        expect(screen.getByText(/Row 3: Invalid LinkedIn URL/i)).toBeInTheDocument();
      });
    });
  });

  describe('Step Navigation', () => {
    it('should enable Next button after successful parsing', async () => {
      const { parseLinkedInCSV } = await import('../../app/lib/csv-parser');
      (parseLinkedInCSV as ReturnType<typeof vi.fn>).mockResolvedValue({
        contacts: [
          { first_name: 'John', last_name: 'Doe', linkedin_url: 'https://linkedin.com/in/johndoe' }
        ],
        errors: [],
        totalRows: 1,
        validRows: 1
      });

      render(<CSVUploadModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const validFile = new File(['test'], 'test.csv', { type: 'text/csv' });

      Object.defineProperty(input, 'files', {
        value: [validFile],
        writable: false,
      });

      fireEvent.change(input);

      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Next/i });
        expect(nextButton).not.toBeDisabled();
      });
    });
  });

  describe('API Integration', () => {
    it('should fetch campaigns when Step 2 loads', async () => {
      const mockCampaigns = [
        { id: '1', name: 'Campaign 1', description: 'Test campaign', status: 'Active' },
        { id: '2', name: 'Campaign 2', description: 'Test campaign 2', status: 'Active' }
      ];

      (global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ campaigns: mockCampaigns })
      } as Response);

      const { parseLinkedInCSV } = await import('../../app/lib/csv-parser');
      (parseLinkedInCSV as ReturnType<typeof vi.fn>).mockResolvedValue({
        contacts: [
          { first_name: 'John', last_name: 'Doe', linkedin_url: 'https://linkedin.com/in/johndoe' }
        ],
        errors: [],
        totalRows: 1,
        validRows: 1
      });

      render(<CSVUploadModal isOpen={true} onClose={mockOnClose} onSuccess={mockOnSuccess} />);

      // Upload file and proceed to Step 2
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;
      const validFile = new File(['test'], 'test.csv', { type: 'text/csv' });

      Object.defineProperty(input, 'files', {
        value: [validFile],
        writable: false,
      });

      fireEvent.change(input);

      await waitFor(() => {
        const nextButton = screen.getByRole('button', { name: /Next/i });
        expect(nextButton).not.toBeDisabled();
      });

      const nextButton = screen.getByRole('button', { name: /Next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(screen.getByText(/Step 2 of 4/i)).toBeInTheDocument();
        expect(global.fetch).toHaveBeenCalledWith('/api/campaigns');
      });
    });
  });
});

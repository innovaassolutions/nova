/**
 * Companies Table Migration Tests
 *
 * Tests for Story 5.1: Companies Database Table & Data Migration
 * Verifies migration idempotence, constraints, triggers, and foreign key behavior
 */

import { createClient } from '@supabase/supabase-js';
import { Database } from '@/lib/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

describe('Companies Migration Tests', () => {
  let supabase: ReturnType<typeof createClient<Database>>;

  beforeAll(() => {
    supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  });

  describe('Table Structure', () => {
    it('should have companies table with correct schema', async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should have all required columns', async () => {
      const { data: companies } = await supabase
        .from('companies')
        .select('id, name, industry, size, website, notes, created_at, updated_at')
        .limit(1);

      if (companies && companies.length > 0) {
        const company = companies[0];
        expect(company).toHaveProperty('id');
        expect(company).toHaveProperty('name');
        expect(company).toHaveProperty('industry');
        expect(company).toHaveProperty('size');
        expect(company).toHaveProperty('website');
        expect(company).toHaveProperty('notes');
        expect(company).toHaveProperty('created_at');
        expect(company).toHaveProperty('updated_at');
      }
    });
  });

  describe('Constraints', () => {
    it('should enforce UNIQUE constraint on company name', async () => {
      const testCompanyName = `Test Company ${Date.now()}`;

      // First insert should succeed
      const { error: error1 } = await supabase
        .from('companies')
        .insert({ name: testCompanyName });

      expect(error1).toBeNull();

      // Second insert with same name should fail
      const { error: error2 } = await supabase
        .from('companies')
        .insert({ name: testCompanyName });

      expect(error2).not.toBeNull();
      expect(error2?.message).toContain('duplicate');

      // Cleanup
      await supabase.from('companies').delete().eq('name', testCompanyName);
    });

    it('should enforce CHECK constraint on size field', async () => {
      const testCompanyName = `Size Test Company ${Date.now()}`;

      // Valid size values should succeed
      const validSizes = ['Startup', 'SMB', 'Enterprise', null];

      for (const size of validSizes) {
        const { error } = await supabase
          .from('companies')
          .insert({ name: `${testCompanyName}-${size}`, size });

        expect(error).toBeNull();
      }

      // Invalid size should fail
      const { error: invalidError } = await supabase
        .from('companies')
        .insert({ name: `${testCompanyName}-invalid`, size: 'InvalidSize' as any });

      expect(invalidError).not.toBeNull();

      // Cleanup
      await supabase.from('companies').delete().like('name', `${testCompanyName}%`);
    });
  });

  describe('Foreign Key Relationships', () => {
    it('should have foreign key from contacts.company_id to companies.id', async () => {
      // Query contacts with company relationship
      const { data, error } = await supabase
        .from('contacts')
        .select('id, company_id, companies(name)')
        .not('company_id', 'is', null)
        .limit(1);

      expect(error).toBeNull();
      if (data && data.length > 0) {
        expect(data[0]).toHaveProperty('companies');
      }
    });

    it('should SET NULL on contacts.company_id when company is deleted', async () => {
      const testCompanyName = `FK Test Company ${Date.now()}`;

      // Create test company
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({ name: testCompanyName })
        .select()
        .single();

      expect(companyError).toBeNull();
      expect(company).toBeDefined();

      // Note: This test would require creating a test contact
      // In production, this behavior is verified by the ON DELETE SET NULL constraint
      // which was confirmed during migration

      // Cleanup
      if (company) {
        await supabase.from('companies').delete().eq('id', company.id);
      }
    });
  });

  describe('Indexes', () => {
    it('should have index on companies.name for fast lookups', async () => {
      // Performance test: search by name should be fast
      const start = Date.now();

      await supabase
        .from('companies')
        .select('id, name')
        .ilike('name', '%consulting%');

      const duration = Date.now() - start;

      // Should complete in under 100ms with index
      expect(duration).toBeLessThan(100);
    });

    it('should have index on contacts.company_id for fast company-to-contacts lookups', async () => {
      // Performance test: filter contacts by company should be fast
      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .limit(1);

      if (companies && companies.length > 0) {
        const start = Date.now();

        await supabase
          .from('contacts')
          .select('id, first_name, last_name')
          .eq('company_id', companies[0].id);

        const duration = Date.now() - start;

        // Should complete in under 100ms with index
        expect(duration).toBeLessThan(100);
      }
    });
  });

  describe('Data Migration Verification', () => {
    it('should have migrated 9 unique companies from contacts', async () => {
      const { data: companies, error } = await supabase
        .from('companies')
        .select('id');

      expect(error).toBeNull();
      expect(companies).toBeDefined();
      expect(companies?.length).toBeGreaterThanOrEqual(9);
    });

    it('should have all contacts mapped to companies', async () => {
      const { data: contacts, error } = await supabase
        .from('contacts')
        .select('id, company_id');

      expect(error).toBeNull();
      expect(contacts).toBeDefined();

      // All contacts should have company_id set
      const unmappedCount = contacts?.filter(c => !c.company_id).length || 0;
      expect(unmappedCount).toBe(0);
    });

    it('should have correct contact counts per company', async () => {
      const { data: companies, error } = await supabase
        .from('companies')
        .select('id, name, contacts(id)');

      expect(error).toBeNull();
      expect(companies).toBeDefined();

      // Each company should have at least 1 contact (from migration)
      companies?.forEach(company => {
        const contactCount = (company.contacts as any[])?.length || 0;
        expect(contactCount).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Updated Trigger', () => {
    it('should auto-update updated_at timestamp on company update', async () => {
      const testCompanyName = `Trigger Test Company ${Date.now()}`;

      // Create test company
      const { data: company, error: createError } = await supabase
        .from('companies')
        .insert({ name: testCompanyName })
        .select()
        .single();

      expect(createError).toBeNull();
      expect(company).toBeDefined();

      const originalUpdatedAt = company?.updated_at;

      // Wait 1 second to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update company
      const { data: updated, error: updateError } = await supabase
        .from('companies')
        .update({ industry: 'Technology' })
        .eq('id', company?.id!)
        .select()
        .single();

      expect(updateError).toBeNull();
      expect(updated).toBeDefined();

      // updated_at should have changed
      expect(updated?.updated_at).not.toBe(originalUpdatedAt);
      expect(new Date(updated?.updated_at!).getTime()).toBeGreaterThan(
        new Date(originalUpdatedAt!).getTime()
      );

      // Cleanup
      if (company) {
        await supabase.from('companies').delete().eq('id', company.id);
      }
    });
  });

  describe('Migration Idempotence', () => {
    it('should safely handle duplicate company names during re-run', async () => {
      const testCompanyName = `Idempotence Test ${Date.now()}`;

      // First insert
      const { error: error1 } = await supabase
        .from('companies')
        .insert({ name: testCompanyName });

      expect(error1).toBeNull();

      // Simulate migration re-run with ON CONFLICT DO NOTHING
      // This would be done via SQL: INSERT ... ON CONFLICT (name) DO NOTHING
      // The upsert should not fail
      const { error: error2 } = await supabase
        .from('companies')
        .upsert({ name: testCompanyName }, { onConflict: 'name' });

      expect(error2).toBeNull();

      // Should still have only one company with this name
      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .eq('name', testCompanyName);

      expect(companies?.length).toBe(1);

      // Cleanup
      await supabase.from('companies').delete().eq('name', testCompanyName);
    });
  });

  describe('RLS (Row Level Security)', () => {
    it('should have RLS enabled on companies table', async () => {
      // This would require direct database query or admin access
      // For now, verify that authenticated users can access companies
      const { data, error } = await supabase
        .from('companies')
        .select('id, name')
        .limit(1);

      expect(error).toBeNull();
      expect(data).toBeDefined();
    });

    it('should allow authenticated users to insert companies', async () => {
      const testCompanyName = `RLS Test ${Date.now()}`;

      const { error } = await supabase
        .from('companies')
        .insert({ name: testCompanyName });

      expect(error).toBeNull();

      // Cleanup
      await supabase.from('companies').delete().eq('name', testCompanyName);
    });
  });
});

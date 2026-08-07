import { useState, useEffect } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { DEFAULT_CATEGORIES } from './CategoryManagerSection';

export interface Category {
  id: string;
  label: string;
  icon_url?: string;
}

/**
 * Fetches categories from Supabase `categorias` table.
 * Falls back to DEFAULT_CATEGORIES if table doesn't exist or is empty.
 */
export function useCategories(supabase: SupabaseClient) {
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('categorias')
          .select('id, label, icon_url')
          .order('label');

        if (!cancelled) {
          if (!error && data?.length) {
            setCategories(data);
          }
          // else keep DEFAULT_CATEGORIES
        }
      } catch {
        // keep defaults
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [supabase]);

  return { categories, loading };
}

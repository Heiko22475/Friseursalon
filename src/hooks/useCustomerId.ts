import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useCustomerId = () => {
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCustomerId = async () => {
      try {
        const hostname = window.location.hostname;

        // 1. Development Override
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          // In development, you might want to force a specific ID or lookup 'localhost'
          // For now, let's keep the fallback behavior or try to find 'localhost' in DB
          const { data: devSite } = await supabase
            .from('websites')
            .select('customer_id')
            .eq('domain', 'localhost')
            .single();
            
          if (devSite) {
            setCustomerId(devSite.customer_id);
            setLoading(false);
            return;
          }

          // Fallback for dev if no 'localhost' entry exists: Get FIRST user
          const { data, error } = await supabase
             .from('websites')
             .select('customer_id')
             .limit(1)
             .single();
             
          if (data) setCustomerId(data.customer_id);
        } else {
          // 2. Production Domain Lookup
          const { data, error } = await supabase
            .from('websites')
            .select('customer_id')
            .eq('domain', hostname)
            .single();

          if (data) {
            setCustomerId(data.customer_id);
          } else {
             console.warn(`No website configured for domain: ${hostname}`);
             setCustomerId(null); 
          }
        }
      } catch (err) {
        console.error('Failed to load customer_id:', err);
      } finally {
        setLoading(false);
      }
    };

    loadCustomerId();
  }, []);

  return { customerId, loading };
};

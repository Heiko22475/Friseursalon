import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useCustomerId = () => {
  const [customerId, setCustomerId] = useState<string>('000000');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCustomerId = async () => {
      try {
        const { data, error } = await supabase
          .from('websites')
          .select('customer_id')
          .single();
        
        if (error) {
          console.error('Error loading customer_id:', error);
          // Fallback: Try old site_settings table
          const { data: oldData } = await supabase
            .from('site_settings')
            .select('customer_id')
            .single();
          
          if (oldData?.customer_id) {
            setCustomerId(oldData.customer_id);
          }
        } else if (data?.customer_id) {
          setCustomerId(data.customer_id);
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

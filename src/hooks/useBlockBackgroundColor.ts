import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface UseBlockBackgroundColorProps {
  blockType: string;
  instanceId: number;
}

export const useBlockBackgroundColor = ({ blockType, instanceId }: UseBlockBackgroundColorProps) => {
  const [backgroundColor, setBackgroundColor] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBackgroundColor();
  }, [blockType, instanceId]);

  const loadBackgroundColor = async () => {
    try {
      const { data, error } = await supabase
        .from('page_blocks')
        .select('config')
        .eq('block_type', blockType)
        .eq('block_instance_id', instanceId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading background color:', error);
        return;
      }

      if (data?.config?.backgroundColor) {
        setBackgroundColor(data.config.backgroundColor);
      }
    } catch (error) {
      console.error('Error loading background color:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveBackgroundColor = async (color: string) => {
    try {
      setBackgroundColor(color);

      const { error } = await supabase
        .from('page_blocks')
        .update({
          config: { backgroundColor: color },
          updated_at: new Date().toISOString()
        })
        .eq('block_type', blockType)
        .eq('block_instance_id', instanceId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error saving background color:', error);
      return { success: false, error };
    }
  };

  return {
    backgroundColor,
    setBackgroundColor: saveBackgroundColor,
    loading
  };
};

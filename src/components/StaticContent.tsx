import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface StaticContentProps {
  instanceId?: number;
}

export const StaticContent: React.FC<StaticContentProps> = ({ instanceId = 1 }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, [instanceId]);

  const loadContent = async () => {
    try {
      const { data, error } = await supabase
        .from('static_content')
        .select('title, content')
        .eq('instance_id', instanceId)
        .single();

      if (error) throw error;
      if (data) {
        setTitle(data.title);
        setContent(data.content);
      }
    } catch (error) {
      console.error('Error loading content:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-500"></div>
      </div>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        {title && (
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-8">
            {title}
          </h1>
        )}
        <div 
          className="static-content-display"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </section>
  );
};

export default StaticContent;

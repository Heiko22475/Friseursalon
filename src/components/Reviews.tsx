import { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { useWebsite } from '../contexts/WebsiteContext';

interface Review {
  name: string;
  rating: number;
  text: string;
}

interface ReviewsProps {
  instanceId?: number;
}

export default function Reviews({ instanceId = 1 }: ReviewsProps) {
  const { website } = useWebsite();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [mainReview, setMainReview] = useState<Review | null>(null);

  useEffect(() => {
    if (website?.reviews && website.reviews.length > 0) {
      const mappedReviews = website.reviews.map(r => ({
        name: r.author_name,
        rating: r.rating,
        text: r.review_text
      }));
      setMainReview(mappedReviews[0]);
      setReviews(mappedReviews.slice(1));
    } else {
      loadReviews();
    }
  }, [instanceId, website]);

  const loadReviews = async () => {
    if (website?.reviews && website.reviews.length > 0) return;
    /*
    const { data } = await supabase
      .from('reviews')
      .select('name, rating, text')
      .eq('instance_id', instanceId)
      .order('display_order');

    if (data && data.length > 0) {
      setMainReview(data[0]);
      setReviews(data.slice(1));
    }
    */
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <section className="bg-slate-900 text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="fill-amber-500 text-amber-500" size={32} />
            ))}
          </div>

          {mainReview && (
            <>
              <blockquote className="text-2xl md:text-3xl font-serif italic mb-8 leading-relaxed">
                "{mainReview.text}"
              </blockquote>

              <div className="text-amber-500 uppercase tracking-widest text-sm font-semibold">
                {averageRating} Sterne bei {reviews.length + 1} Google-Rezensionen
              </div>
            </>
          )}

          <div className="mt-12 grid md:grid-cols-3 gap-6 text-left">
            {reviews.map((review, index) => (
              <div key={index} className="bg-white/10 p-6 rounded-lg">
                <div className="flex mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="fill-amber-500 text-amber-500" size={16} />
                  ))}
                </div>
                <p className="text-slate-300 italic mb-3">"{review.text}"</p>
                <p className="text-slate-400 text-sm">- {review.name}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

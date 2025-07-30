"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutlineIcon } from '@heroicons/react/24/outline';

interface Review {
  id: string;
  customerName: string;
  productName: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified: boolean;
  helpful: number;
}

const ReviewsPage: React.FC = () => {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>('newest');

  // Hardcoded reviews data
  const reviews: Review[] = [
    {
      id: '1',
      customerName: 'Sarah M.',
      productName: 'Vitamin C Serum',
      rating: 5,
      title: 'Absolutely amazing results!',
      comment: 'I\'ve been using this Vitamin C serum for 3 months now and the results are incredible. My skin is brighter, more even-toned, and the fine lines around my eyes have diminished significantly. The texture is perfect - not sticky at all and absorbs quickly. Highly recommend!',
      date: '2024-01-15',
      verified: true,
      helpful: 24
    },
    {
      id: '2',
      customerName: 'Michael R.',
      productName: 'Hydrating Serum',
      rating: 4,
      title: 'Great hydration boost',
      comment: 'This hydrating serum has been a game-changer for my dry skin. It provides intense moisture without feeling heavy or greasy. I use it morning and night, and my skin feels plump and healthy. The only reason I didn\'t give it 5 stars is because I wish the bottle was bigger.',
      date: '2024-01-10',
      verified: true,
      helpful: 18
    },
    {
      id: '3',
      customerName: 'Jennifer L.',
      productName: 'Collagen Serum',
      rating: 5,
      title: 'Visible anti-aging results',
      comment: 'I was skeptical about collagen serums, but this one actually delivers! After 2 months of consistent use, I can see a noticeable improvement in my skin\'s firmness and elasticity. The fine lines on my forehead are less prominent, and my skin has a healthy glow. Worth every penny!',
      date: '2024-01-08',
      verified: true,
      helpful: 31
    },
    {
      id: '4',
      customerName: 'David K.',
      productName: 'Brightening Serum',
      rating: 4,
      title: 'Good brightening effect',
      comment: 'This brightening serum has helped fade some of my dark spots and even out my skin tone. It\'s gentle enough for daily use and doesn\'t cause any irritation. I\'ve noticed a subtle but consistent improvement in my skin\'s radiance.',
      date: '2024-01-05',
      verified: true,
      helpful: 12
    },
    {
      id: '5',
      customerName: 'Emma T.',
      productName: 'Soothing Serum',
      rating: 5,
      title: 'Perfect for sensitive skin',
      comment: 'As someone with sensitive skin, I\'m always cautious about trying new products. This soothing serum is absolutely perfect! It calms redness and irritation immediately, and I\'ve had zero reactions. It\'s become a staple in my routine.',
      date: '2024-01-03',
      verified: true,
      helpful: 27
    },
    {
      id: '6',
      customerName: 'Alex P.',
      productName: 'Intensive Serum',
      rating: 4,
      title: 'Strong but effective',
      comment: 'This intensive serum packs a punch! I can definitely see results, but it\'s quite potent so I had to start slowly. Now I use it every other day and my skin looks amazing. Just make sure to follow the instructions and don\'t overdo it.',
      date: '2024-01-01',
      verified: true,
      helpful: 15
    }
  ];

  const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;
  const totalReviews = reviews.length;

  const filteredReviews = reviews
    .filter(review => selectedRating === null || review.rating === selectedRating)
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'highest':
          return b.rating - a.rating;
        case 'lowest':
          return a.rating - b.rating;
        case 'most-helpful':
          return b.helpful - a.helpful;
        default:
          return 0;
      }
    });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i}>
        {i < rating ? (
          <StarIcon className="h-5 w-5 text-yellow-400" />
        ) : (
          <StarOutlineIcon className="h-5 w-5 text-gray-300" />
        )}
      </span>
    ));
  };

  const getRatingCount = (rating: number) => {
    return reviews.filter(review => review.rating === rating).length;
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Customer Reviews</h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            See what our customers are saying about our premium skincare products
          </p>
        </div>

        {/* Rating Summary */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="text-6xl font-bold text-white mb-2">{averageRating.toFixed(1)}</div>
              <div className="flex justify-center mb-2">
                {renderStars(Math.round(averageRating))}
              </div>
              <div className="text-white/80">Based on {totalReviews} reviews</div>
            </div>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map(rating => (
                <div key={rating} className="flex items-center">
                  <span className="text-white w-8">{rating}</span>
                  <div className="flex-1 mx-2">
                    <div className="bg-white/20 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full" 
                        style={{ width: `${(getRatingCount(rating) / totalReviews) * 100}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-white/80 w-12 text-right">{getRatingCount(rating)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedRating === null ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setSelectedRating(null)}
                className="bg-white/20 text-white hover:bg-white/30"
              >
                All Ratings
              </Button>
              {[5, 4, 3, 2, 1].map(rating => (
                <Button
                  key={rating}
                  variant={selectedRating === rating ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setSelectedRating(rating)}
                  className="bg-white/20 text-white hover:bg-white/30"
                >
                  {rating} Stars ({getRatingCount(rating)})
                </Button>
              ))}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
              <option value="most-helpful">Most Helpful</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          {filteredReviews.map((review) => (
            <div key={review.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-white">{review.title}</h3>
                    {review.verified && (
                      <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-white/80 text-sm">
                    <span>{review.customerName}</span>
                    <span>•</span>
                    <span>{review.productName}</span>
                    <span>•</span>
                    <span>{new Date(review.date).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {renderStars(review.rating)}
                </div>
              </div>
              <p className="text-white/90 leading-relaxed mb-4">{review.comment}</p>
              <div className="flex items-center justify-between">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 text-white hover:bg-white/30"
                >
                  Helpful ({review.helpful})
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-white/20 text-white hover:bg-white/30"
                >
                  Report
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-theme-tertiary rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Share Your Experience</h2>
            <p className="text-white/80 mb-6 max-w-md mx-auto">
              Have you tried our products? We&apos;d love to hear about your experience!
            </p>
            <Button variant="tertiary">
              Write a Review
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewsPage; 
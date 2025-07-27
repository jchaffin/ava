'use client';

import { useState } from 'react';
import { CheckCircle, AlertCircle, Sparkles, ShoppingCart, Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from './ui';

interface AnalysisResult {
  skinType: string;
  concerns: string[];
  recommendations: string[];
  confidence: number;
  imageUrl?: string;
  analysisId?: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
}

interface SkinAnalysisResultsProps {
  result: AnalysisResult;
  onReset?: () => void;
  onSave?: (result: AnalysisResult) => void;
}

// Mock product data - in a real app, this would come from your database
const mockProducts: Product[] = [
  {
    id: 'vitamin-c-serum',
    name: 'Vitamin C Brightening Serum',
    price: 45.00,
    image: '/images/products/vitcserum/vitcserum_main.jpg',
    category: 'serum',
    description: 'Brightening serum with 20% Vitamin C for even skin tone'
  },
  {
    id: 'hyaluronic-acid-serum',
    name: 'Hyaluronic Acid Hydration Serum',
    price: 38.00,
    image: '/images/products/hydserum/hydserum_main.jpg',
    category: 'serum',
    description: 'Deeply hydrating serum with hyaluronic acid'
  },
  {
    id: 'retinol-serum',
    name: 'Advanced Retinol Night Serum',
    price: 52.00,
    image: '/images/products/brserum/brserum_main.jpg',
    category: 'serum',
    description: 'Anti-aging retinol serum for fine lines and wrinkles'
  },
  {
    id: 'niacinamide-serum',
    name: 'Niacinamide Oil Control Serum',
    price: 35.00,
    image: '/images/products/iserum/iserum_main.jpg',
    category: 'serum',
    description: 'Oil control and pore-minimizing serum'
  },
  {
    id: 'gentle-cleanser',
    name: 'Gentle Daily Cleanser',
    price: 28.00,
    image: '/images/products/soothserum/soothserum_main.jpg',
    category: 'cleanser',
    description: 'Gentle foaming cleanser for all skin types'
  },
  {
    id: 'sunscreen-spf30',
    name: 'Daily Defense SPF 30',
    price: 32.00,
    image: '/images/products/collagenserum/collagenserum_main.jpg',
    category: 'sunscreen',
    description: 'Broad spectrum sunscreen with antioxidants'
  }
];

export default function SkinAnalysisResults({ result, onReset, onSave }: SkinAnalysisResultsProps) {
  const [savedProducts, setSavedProducts] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Get product recommendations based on analysis
  const getRecommendedProducts = () => {
    const recommendations = new Set<string>();
    
    // Add base recommendations
    recommendations.add('gentle-cleanser');
    recommendations.add('sunscreen-spf30');
    
    // Add skin type specific products
    switch (result.skinType) {
      case 'dry':
        recommendations.add('hyaluronic-acid-serum');
        break;
      case 'oily':
        recommendations.add('niacinamide-serum');
        break;
      case 'normal':
        recommendations.add('vitamin-c-serum');
        recommendations.add('retinol-serum');
        break;
    }
    
    // Add concern specific products
    result.concerns.forEach(concern => {
      if (concern.includes('fine lines') || concern.includes('wrinkles')) {
        recommendations.add('retinol-serum');
      }
      if (concern.includes('uneven') || concern.includes('dark spots')) {
        recommendations.add('vitamin-c-serum');
      }
      if (concern.includes('acne') || concern.includes('blemishes')) {
        recommendations.add('niacinamide-serum');
      }
      if (concern.includes('dehydration')) {
        recommendations.add('hyaluronic-acid-serum');
      }
    });
    
    return mockProducts.filter(product => recommendations.has(product.id));
  };

  const recommendedProducts = getRecommendedProducts();

  const handleAddToCart = (productId: string) => {
    // In a real app, this would add to cart context
    toast.success('Product added to cart!');
  };

  const handleAddToWishlist = (productId: string) => {
    setSavedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
    toast.success(
      savedProducts.includes(productId) 
        ? 'Removed from wishlist' 
        : 'Added to wishlist!'
    );
  };

  const handleSaveAnalysis = async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    try {
      await onSave(result);
      toast.success('Analysis saved successfully!');
    } catch (error) {
      toast.error('Failed to save analysis');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Confidence Score */}
      <div className="bg-theme-secondary rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium  ">
            Analysis Confidence
          </span>
          <span className="text-sm font-bold text-theme-primary">
            {result.confidence}%
          </span>
        </div>
        <div className="w-full bg-theme-secondary rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${result.confidence}%` }}
          />
        </div>
      </div>

      {/* Skin Type */}
      <div className="bg-theme-secondary rounded-xl p-4 border border-gray-200 dark:border-gray-600">
        <h3 className="font-semibold text-gray-900 dark:text-theme-primary mb-2">
          Skin Type
        </h3>
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-theme-primary" />
          <span className="text-gray-700 dark:text-gray-300 capitalize">
            {result.skinType}
          </span>
        </div>
      </div>

      {/* Concerns */}
      <div className="bg-theme-secondary rounded-xl p-4 border border-gray-200 dark:border-gray-600">
        <h3 className="font-semibold text-gray-900 dark:text-theme-primary mb-3">
          Identified Concerns
        </h3>
        <div className="space-y-2">
          {result.concerns.map((concern, index) => (
            <div key={index} className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              <span className="text-gray-700 dark:text-gray-300 text-sm">
                {concern}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-theme-secondary rounded-xl p-4">
        <h3 className="font-semibold text-gray-900 dark:text-theme-primary mb-3">
          Personalized Recommendations
        </h3>
        <div className="space-y-2">
          {result.recommendations.map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-theme-primary rounded-full mt-2 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300 text-sm">
                {recommendation}
              </span>
            </div>
          ))}
        </div>
      </div>



      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        {onSave && (
          <Button
            onClick={handleSaveAnalysis}
            disabled={isSaving}
            variant="secondary"
            className="btn-secondary flex-1 py-3 px-6 rounded-xl transition-all space-x-2"
          >
            <Sparkles className="w-5 h-5" />
            <span>{isSaving ? 'Saving...' : 'Save Analysis'}</span>
          </Button>
        )}
        {onReset && (
          <Button
            variant="secondary"
            onClick={onReset}
            className="flex-1 btn-secondary py-3 px-6 rounded-xl transition-colors"
          >
            New Analysis
          </Button>
        )}
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium mb-1">
              Important Disclaimer
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-300">
              This analysis is for informational purposes only and should not replace professional medical advice. 
              Always consult with a dermatologist for serious skin concerns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 
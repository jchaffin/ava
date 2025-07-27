'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Calendar, Clock, Eye, Trash2, Sparkles, TrendingUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

interface SkinAnalysis {
  _id: string;
  skinType: string;
  concerns: string[];
  recommendations: string[];
  confidence: number;
  imageUrl?: string;
  analysisId: string;
  createdAt: string;
  updatedAt: string;
}

export default function SkinAnalysisHistoryPage() {
  const { data: session, status } = useSession();
  const [analyses, setAnalyses] = useState<SkinAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAnalyses();
    }
  }, [status]);

  const fetchAnalyses = async () => {
    try {
      const response = await fetch('/api/skin-analysis/save');
      if (response.ok) {
        const data = await response.json();
        setAnalyses(data.data || []);
      } else {
        toast.error('Failed to load analyses');
      }
    } catch (error) {
      console.error('Error fetching analyses:', error);
      toast.error('Failed to load analyses');
    } finally {
      setLoading(false);
    }
  };

  const deleteAnalysis = async (analysisId: string) => {
    if (!confirm('Are you sure you want to delete this analysis?')) {
      return;
    }

    setDeleting(analysisId);
    try {
      const response = await fetch(`/api/skin-analysis/save?analysisId=${analysisId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAnalyses(prev => prev.filter(analysis => analysis.analysisId !== analysisId));
        toast.success('Analysis deleted successfully');
      } else {
        toast.error('Failed to delete analysis');
      }
    } catch (error) {
      console.error('Error deleting analysis:', error);
      toast.error('Failed to delete analysis');
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSkinTypeColor = (skinType: string) => {
    const colors = {
      normal: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      dry: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      oily: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      combination: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      sensitive: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    return colors[skinType as keyof typeof colors] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-theme-primary mb-4">
            Authentication Required
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Please sign in to view your skin analysis history.
          </p>
          <Link
            href="/signin"
            className="bg-blue-500 hover:bg-blue-600 text-theme-primary px-6 py-2 rounded-lg transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4">
              <Sparkles className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-theme-primary mb-4">
              Skin Analysis History
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Track your skin journey and see how your skin has changed over time.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center mb-8">
            <Link
              href="/skin-analysis"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-theme-primary px-8 py-3 rounded-xl transition-all flex items-center space-x-2"
            >
              <Sparkles className="w-5 h-5" />
              <span>New Analysis</span>
            </Link>
          </div>

          {/* Analytics Summary */}
          {analyses.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-theme-secondary rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Analyses</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-theme-primary">{analyses.length}</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-theme-secondary rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Latest Analysis</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-theme-primary">
                      {analyses[0]?.skinType || 'N/A'}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>

              <div className="bg-theme-secondary rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Confidence</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-theme-primary">
                      {analyses.length > 0 
                        ? Math.round(analyses.reduce((sum, a) => sum + a.confidence, 0) / analyses.length)
                        : 0}%
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                    <Eye className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Analyses List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-300">Loading your analyses...</p>
            </div>
          ) : analyses.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-theme-primary mb-2">
                No analyses yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Start your skin journey with your first AI analysis
              </p>
              <Link
                href="/skin-analysis"
                className="bg-blue-500 hover:bg-blue-600 text-theme-primary px-6 py-2 rounded-lg transition-colors"
              >
                Get Started
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {analyses.map((analysis) => (
                <div key={analysis._id} className="bg-theme-secondary rounded-xl shadow-lg overflow-hidden">
                  {/* Header */}
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getSkinTypeColor(analysis.skinType)}`}>
                          {analysis.skinType}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {analysis.confidence}% confidence
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => deleteAnalysis(analysis.analysisId)}
                          disabled={deleting === analysis.analysisId}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete analysis"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(analysis.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="space-y-4">
                      {/* Concerns */}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-theme-primary mb-2">Concerns</h4>
                        <div className="flex flex-wrap gap-2">
                          {analysis.concerns.slice(0, 3).map((concern, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-200 text-xs rounded-full"
                            >
                              {concern}
                            </span>
                          ))}
                          {analysis.concerns.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full">
                              +{analysis.concerns.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-theme-primary mb-2">Top Recommendations</h4>
                        <ul className="space-y-1">
                          {analysis.recommendations.slice(0, 2).map((recommendation, index) => (
                            <li key={index} className="text-sm text-gray-600 dark:text-gray-300 flex items-start space-x-2">
                              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                              <span>{recommendation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* View Details Button */}
                    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <Link
                        href={`/skin-analysis?analysisId=${analysis.analysisId}`}
                        className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
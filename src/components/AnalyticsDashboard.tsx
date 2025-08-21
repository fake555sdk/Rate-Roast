import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Eye, Star, MessageCircle, X } from 'lucide-react';
import { AnalyticsService } from '../services/analytics';
import { useAuth } from '../hooks/useAuth';

interface AnalyticsDashboardProps {
  onClose: () => void;
}

export default function AnalyticsDashboard({ onClose }: AnalyticsDashboardProps) {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<any>(null);
  const [timeRange, setTimeRange] = useState<7 | 30 | 90>(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [user, timeRange]);

  const loadAnalytics = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const userMetrics = AnalyticsService.getUserEngagementMetrics(user.id, timeRange);
      const allEvents = AnalyticsService.getStoredEvents();
      
      // Calculate additional metrics
      const profileViews = allEvents.filter(e => 
        e.event_type === 'profile_view' && 
        e.profile_id === user.id &&
        new Date(e.timestamp!).getTime() > Date.now() - (timeRange * 24 * 60 * 60 * 1000)
      ).length;

      const ratingsReceived = allEvents.filter(e => 
        e.event_type === 'rating_submitted' && 
        e.profile_id === user.id &&
        new Date(e.timestamp!).getTime() > Date.now() - (timeRange * 24 * 60 * 60 * 1000)
      ).length;

      const roastsReceived = allEvents.filter(e => 
        e.event_type === 'roast_submitted' && 
        e.profile_id === user.id &&
        new Date(e.timestamp!).getTime() > Date.now() - (timeRange * 24 * 60 * 60 * 1000)
      ).length;

      setMetrics({
        ...userMetrics,
        profile_views: profileViews,
        ratings_received: ratingsReceived,
        roasts_received: roastsReceived,
      });
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <div className="flex items-center gap-3 text-white">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
            Loading analytics...
          </div>
        </div>
      </div>
    );
  }

  const getEngagementLevel = (score: number) => {
    if (score >= 100) return { level: 'Excellent', color: 'text-green-400' };
    if (score >= 50) return { level: 'Good', color: 'text-blue-400' };
    if (score >= 20) return { level: 'Average', color: 'text-yellow-400' };
    return { level: 'Low', color: 'text-red-400' };
  };

  const engagement = getEngagementLevel(metrics?.engagement_score || 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-lg rounded-2xl p-6 w-full max-w-4xl border border-white/20 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="text-blue-400" />
            Analytics Dashboard
          </h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-6">
          {[7, 30, 90].map((days) => (
            <button
              key={days}
              onClick={() => setTimeRange(days as 7 | 30 | 90)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                timeRange === days
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {days} days
            </button>
          ))}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/10 rounded-lg p-4 text-center">
            <Eye className="text-blue-400 mx-auto mb-2" size={24} />
            <div className="text-2xl font-bold text-white">{metrics?.profile_views || 0}</div>
            <div className="text-white/70 text-sm">Profile Views</div>
          </div>

          <div className="bg-white/10 rounded-lg p-4 text-center">
            <Star className="text-yellow-400 mx-auto mb-2 fill-current" size={24} />
            <div className="text-2xl font-bold text-white">{metrics?.ratings_received || 0}</div>
            <div className="text-white/70 text-sm">Ratings Received</div>
          </div>

          <div className="bg-white/10 rounded-lg p-4 text-center">
            <MessageCircle className="text-red-400 mx-auto mb-2" size={24} />
            <div className="text-2xl font-bold text-white">{metrics?.roasts_received || 0}</div>
            <div className="text-white/70 text-sm">Roasts Received</div>
          </div>

          <div className="bg-white/10 rounded-lg p-4 text-center">
            <TrendingUp className="text-green-400 mx-auto mb-2" size={24} />
            <div className={`text-2xl font-bold ${engagement.color}`}>{engagement.level}</div>
            <div className="text-white/70 text-sm">Engagement</div>
          </div>
        </div>

        {/* Engagement Score */}
        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Engagement Score</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="bg-white/20 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-400 to-pink-400 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (metrics?.engagement_score || 0) / 2)}%` }}
                />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">
              {metrics?.engagement_score || 0}
            </div>
          </div>
          <p className="text-white/70 text-sm mt-2">
            Based on your activity: views, ratings, roasts, and purchases
          </p>
        </div>

        {/* Activity Breakdown */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Activity Breakdown</h3>
            <div className="space-y-3">
              {Object.entries(metrics?.event_counts || {}).map(([event, count]) => (
                <div key={event} className="flex justify-between items-center">
                  <span className="text-white/80 capitalize">
                    {event.replace('_', ' ')}
                  </span>
                  <span className="text-white font-semibold">{count as number}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/10 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-3">Insights</h3>
            <div className="space-y-2">
              <div className="text-white/80 text-sm">
                📅 Most active day: {metrics?.most_active_day || 'No data'}
              </div>
              <div className="text-white/80 text-sm">
                📊 Total events: {metrics?.total_events || 0}
              </div>
              <div className="text-white/80 text-sm">
                🎯 Engagement level: {engagement.level}
              </div>
              {metrics?.profile_views > 0 && metrics?.ratings_received > 0 && (
                <div className="text-white/80 text-sm">
                  💫 Conversion rate: {((metrics.ratings_received / metrics.profile_views) * 100).toFixed(1)}%
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-gradient-to-r from-green-500/20 to-teal-500/20 border border-green-400/30 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">💡 Recommendations</h3>
          <div className="space-y-2 text-sm">
            {metrics?.profile_views < 10 && (
              <div className="text-white/80">• Boost your profile to increase visibility</div>
            )}
            {metrics?.ratings_received < 5 && (
              <div className="text-white/80">• Engage more with others to get rated back</div>
            )}
            {metrics?.engagement_score < 50 && (
              <div className="text-white/80">• Be more active - rate and roast other profiles</div>
            )}
            {metrics?.roasts_received === 0 && (
              <div className="text-white/80">• Update your bio to attract more roasts</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
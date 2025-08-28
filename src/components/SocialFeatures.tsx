import React, { useState, useEffect } from 'react';
import { Users, MessageSquare, Heart, Share2, Trophy, Crown, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { AnalyticsService } from '../services/analytics';

interface SocialPost {
  id: string;
  userId: string;
  content: string;
  type: 'achievement' | 'rating' | 'roast' | 'milestone';
  metadata: any;
  likes: number;
  comments: number;
  timestamp: Date;
  isLiked: boolean;
}

export default function SocialFeatures() {
  const { state } = useApp();
  const { user } = useAuth();
  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSocialFeed();
  }, []);

  const loadSocialFeed = async () => {
    // Simulate loading social posts
    const mockPosts: SocialPost[] = [
      {
        id: '1',
        userId: '2',
        content: 'Just reached 100 ratings! 🎉',
        type: 'milestone',
        metadata: { milestone: '100_ratings' },
        likes: 15,
        comments: 3,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isLiked: false,
      },
      {
        id: '2',
        userId: '3',
        content: 'Got roasted so hard I need ice! 🧊',
        type: 'roast',
        metadata: { roastId: 'roast_123' },
        likes: 8,
        comments: 5,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
        isLiked: true,
      },
      {
        id: '3',
        userId: '4',
        content: 'Unlocked "Top Rated" achievement! 🏆',
        type: 'achievement',
        metadata: { achievement: 'top_rated' },
        likes: 23,
        comments: 7,
        timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
        isLiked: false,
      },
    ];

    setPosts(mockPosts);
    setLoading(false);
  };

  const handleLike = (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1
          }
        : post
    ));

    AnalyticsService.trackFeatureUsage('social_like', user?.id, { post_id: postId });
  };

  const handleShare = (post: SocialPost) => {
    if (navigator.share) {
      navigator.share({
        title: 'Rate & Roast',
        text: post.content,
        url: window.location.href,
      });
    }

    AnalyticsService.trackFeatureUsage('social_share', user?.id, { post_id: post.id });
  };

  const getPostIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Trophy className="text-yellow-400" size={20} />;
      case 'milestone': return <Crown className="text-purple-400" size={20} />;
      case 'roast': return <Zap className="text-red-400" size={20} />;
      default: return <MessageSquare className="text-blue-400" size={20} />;
    }
  };

  const getUserFromId = (userId: string) => {
    return state.profiles.find(p => p.userId === userId)?.user || {
      id: userId,
      username: 'unknown',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=150&h=150&fit=crop',
      firstName: 'Unknown',
      lastName: 'User',
    };
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white/10 rounded-lg p-4 animate-pulse">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-white/20 rounded mb-1 w-1/3" />
                <div className="h-3 bg-white/20 rounded w-1/4" />
              </div>
            </div>
            <div className="h-4 bg-white/20 rounded mb-2" />
            <div className="h-4 bg-white/20 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">🌟 Community Feed</h1>
        <p className="text-white/70">See what's happening in the community!</p>
      </div>

      <div className="space-y-4">
        {posts.map((post) => {
          const postUser = getUserFromId(post.userId);
          
          return (
            <div
              key={post.id}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-200"
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={postUser.avatar}
                  alt={postUser.username}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold">
                      {postUser.firstName} {postUser.lastName}
                    </h3>
                    {getPostIcon(post.type)}
                  </div>
                  <p className="text-white/60 text-sm">@{postUser.username} • {formatTimeAgo(post.timestamp)}</p>
                </div>
              </div>

              <p className="text-white text-lg mb-4">{post.content}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full transition-all duration-200 ${
                      post.isLiked
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    <Heart 
                      size={16} 
                      className={post.isLiked ? 'fill-current' : ''} 
                    />
                    <span className="text-sm">{post.likes}</span>
                  </button>

                  <button className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-all duration-200">
                    <MessageSquare size={16} />
                    <span className="text-sm">{post.comments}</span>
                  </button>
                </div>

                <button
                  onClick={() => handleShare(post)}
                  className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/70 hover:bg-white/20 transition-all duration-200"
                >
                  <Share2 size={16} />
                  <span className="text-sm">Share</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center py-8">
        <p className="text-white/50 text-sm">
          More social features coming soon! 🚀
        </p>
      </div>
    </div>
  );
}
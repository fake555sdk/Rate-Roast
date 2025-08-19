import React, { useState } from 'react';
import { Crown, Zap, TrendingUp, BarChart3, Palette, Shield, X } from 'lucide-react';
import { PaymentService } from '../services/payments';
import { useAuth } from '../hooks/useAuth';

interface PremiumFeaturesProps {
  onClose: () => void;
}

interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  price: number;
  benefits: string[];
  popular?: boolean;
}

export default function PremiumFeatures({ onClose }: PremiumFeaturesProps) {
  const { user, updateStars } = useAuth();
  const [purchasing, setPurchasing] = useState<string | null>(null);

  const premiumFeatures: PremiumFeature[] = [
    {
      id: 'premium_theme',
      name: 'Custom Themes',
      description: 'Personalize your profile with exclusive themes',
      icon: <Palette className="text-purple-400" size={24} />,
      price: PaymentService.FEATURE_PRICES.PREMIUM_THEME,
      benefits: [
        'Exclusive gradient backgrounds',
        'Custom color schemes',
        'Animated profile effects',
        'Stand out from the crowd'
      ]
    },
    {
      id: 'priority_placement',
      name: 'Priority Placement',
      description: 'Always appear at the top of feeds',
      icon: <TrendingUp className="text-green-400" size={24} />,
      price: PaymentService.FEATURE_PRICES.PRIORITY_PLACEMENT,
      benefits: [
        'Top position in all feeds',
        'Increased profile visibility',
        'More ratings and interactions',
        'Permanent boost effect'
      ],
      popular: true
    },
    {
      id: 'analytics_dashboard',
      name: 'Analytics Dashboard',
      description: 'Detailed insights about your profile performance',
      icon: <BarChart3 className="text-blue-400" size={24} />,
      price: PaymentService.FEATURE_PRICES.ANALYTICS_DASHBOARD,
      benefits: [
        'Detailed view statistics',
        'Rating trends over time',
        'Demographic insights',
        'Performance comparisons'
      ]
    }
  ];

  const handlePurchase = async (featureId: string) => {
    if (!user) return;

    const feature = premiumFeatures.find(f => f.id === featureId);
    if (!feature) return;

    setPurchasing(featureId);

    try {
      const result = await PaymentService.spendStars(
        user.id,
        feature.price,
        `Purchased ${feature.name}`,
        { feature_id: featureId }
      );

      if (result.success) {
        updateStars(-feature.price);
        // Here you would typically update the user's premium features
        alert(`${feature.name} activated successfully!`);
        onClose();
      } else {
        alert(result.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Premium feature purchase error:', error);
      alert('Purchase failed');
    } finally {
      setPurchasing(null);
    }
  };

  const canAfford = (price: number) => {
    return user && user.stars_balance >= price;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-lg rounded-2xl p-6 w-full max-w-lg border border-white/20 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Crown className="text-yellow-400" />
            Premium Features
          </h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Shield className="text-yellow-400" size={24} />
              <div>
                <p className="text-white font-semibold">Unlock Premium Power</p>
                <p className="text-white/80 text-sm">Get exclusive features to dominate the leaderboards</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {premiumFeatures.map((feature) => (
            <div
              key={feature.id}
              className={`relative rounded-lg border p-4 transition-all duration-200 ${
                feature.popular 
                  ? 'border-yellow-400/50 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 ring-2 ring-yellow-400/30'
                  : 'border-white/20 bg-white/10'
              }`}
            >
              {feature.popular && (
                <div className="absolute -top-2 left-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                  MOST POPULAR
                </div>
              )}

              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0">
                  {feature.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{feature.name}</h3>
                  <p className="text-white/70 text-sm mb-3">{feature.description}</p>
                  
                  <div className="space-y-1 mb-4">
                    {feature.benefits.map((benefit, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0" />
                        <span className="text-white/80">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-white">{feature.price}</span>
                  <span className="text-yellow-400">⭐</span>
                </div>
                
                <button
                  onClick={() => handlePurchase(feature.id)}
                  disabled={!canAfford(feature.price) || purchasing === feature.id}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 ${
                    canAfford(feature.price)
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white'
                      : 'bg-gray-500/50 text-white/50 cursor-not-allowed'
                  }`}
                >
                  {purchasing === feature.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      Activating...
                    </>
                  ) : canAfford(feature.price) ? (
                    <>
                      <Zap size={16} />
                      Activate
                    </>
                  ) : (
                    'Insufficient Stars'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-white/10 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">Need more stars?</h3>
          <p className="text-white/70 text-sm mb-3">
            Purchase star packages to unlock these premium features
          </p>
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
          >
            Buy Stars
          </button>
        </div>
      </div>
    </div>
  );
}
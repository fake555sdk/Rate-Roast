import React, { useState } from 'react';
import { X, Star, Zap, Crown, TrendingUp } from 'lucide-react';
import { PaymentService, PaymentPackage } from '../services/payments';
import { useAuth } from '../hooks/useAuth';

interface StarsShopProps {
  onClose: () => void;
}

export default function StarsShop({ onClose }: StarsShopProps) {
  const { user, updateStars } = useAuth();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const handlePurchase = async (packageId: string) => {
    if (!user) return;

    setPurchasing(packageId);
    
    try {
      const result = await PaymentService.purchaseStars(user.id, packageId);
      
      if (result.success) {
        const package_ = PaymentService.STAR_PACKAGES.find(p => p.id === packageId);
        if (package_) {
          const totalStars = package_.stars + (package_.bonus || 0);
          updateStars(totalStars);
        }
        onClose();
      } else {
        alert(result.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Purchase failed');
    } finally {
      setPurchasing(null);
    }
  };

  const getPackageIcon = (package_: PaymentPackage) => {
    if (package_.popular) return <Crown className="text-yellow-400" size={20} />;
    if (package_.bonus) return <Zap className="text-purple-400" size={20} />;
    return <Star className="text-blue-400" size={20} />;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md border border-white/20 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Star className="text-yellow-400 fill-current" />
            Stars Shop
          </h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6">
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <Star className="text-yellow-400 fill-current" size={24} />
              <div>
                <p className="text-white font-semibold">Current Balance</p>
                <p className="text-yellow-300 text-2xl font-bold">{user?.stars_balance || 0} Stars</p>
              </div>
            </div>
          </div>

          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-white mb-2">What can you do with Stars?</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-white/10 rounded-lg p-2">
                <p className="text-white/80">🔓 Unlock Roasts</p>
                <p className="text-yellow-300 font-bold">5⭐</p>
              </div>
              <div className="bg-white/10 rounded-lg p-2">
                <p className="text-white/80">⚡ Boost Profile</p>
                <p className="text-yellow-300 font-bold">10⭐/hr</p>
              </div>
              <div className="bg-white/10 rounded-lg p-2">
                <p className="text-white/80">🤖 AI Roasts</p>
                <p className="text-yellow-300 font-bold">2-3⭐</p>
              </div>
              <div className="bg-white/10 rounded-lg p-2">
                <p className="text-white/80">👑 Premium</p>
                <p className="text-yellow-300 font-bold">25⭐+</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {PaymentService.STAR_PACKAGES.map((package_) => (
            <div
              key={package_.id}
              className={`relative rounded-lg border transition-all duration-200 cursor-pointer ${
                selectedPackage === package_.id
                  ? 'border-yellow-400/50 bg-gradient-to-r from-yellow-500/20 to-orange-500/20'
                  : 'border-white/20 bg-white/10 hover:bg-white/15'
              } ${package_.popular ? 'ring-2 ring-yellow-400/30' : ''}`}
              onClick={() => setSelectedPackage(package_.id)}
            >
              {package_.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-bold">
                  MOST POPULAR
                </div>
              )}
              
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getPackageIcon(package_)}
                    <h3 className="text-lg font-semibold text-white">{package_.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">${package_.price}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="text-yellow-400 fill-current" size={16} />
                    <span className="text-white font-semibold">{package_.stars.toLocaleString()}</span>
                    {package_.bonus && (
                      <span className="text-green-400 font-semibold">+{package_.bonus}</span>
                    )}
                  </div>
                  
                  {package_.bonus && (
                    <div className="bg-green-500/20 text-green-300 text-xs px-2 py-1 rounded-full font-bold">
                      {Math.round((package_.bonus / package_.stars) * 100)}% BONUS
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={() => selectedPackage && handlePurchase(selectedPackage)}
            disabled={!selectedPackage || purchasing !== null}
            className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            {purchasing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                Purchasing...
              </>
            ) : (
              <>
                <Star className="fill-current" size={16} />
                Purchase
              </>
            )}
          </button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-white/60 text-xs">
            Secure payment powered by Telegram Stars
          </p>
        </div>
      </div>
    </div>
  );
}
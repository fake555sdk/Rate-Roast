import React, { useState, useEffect } from 'react';
import { X, Star, TrendingUp, TrendingDown, Clock, Gift } from 'lucide-react';
import { PaymentService } from '../services/payments';
import { useAuth } from '../hooks/useAuth';

interface TransactionHistoryProps {
  onClose: () => void;
}

interface Transaction {
  id: string;
  transaction_type: 'purchase' | 'spend' | 'reward' | 'refund';
  amount: number;
  stars_balance_after: number;
  description: string;
  metadata: any;
  created_at: string;
}

export default function TransactionHistory({ onClose }: TransactionHistoryProps) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, [user]);

  const loadTransactions = async () => {
    if (!user) return;

    try {
      const history = await PaymentService.getTransactionHistory(user.id);
      setTransactions(history);
    } catch (error) {
      console.error('Failed to load transaction history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string, amount: number) => {
    switch (type) {
      case 'purchase':
        return <TrendingUp className="text-green-400" size={20} />;
      case 'spend':
        return <TrendingDown className="text-red-400" size={20} />;
      case 'reward':
        return <Gift className="text-purple-400" size={20} />;
      case 'refund':
        return <TrendingUp className="text-blue-400" size={20} />;
      default:
        return <Star className="text-yellow-400" size={20} />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'purchase':
      case 'reward':
      case 'refund':
        return 'text-green-400';
      case 'spend':
        return 'text-red-400';
      default:
        return 'text-white';
    }
  };

  const formatAmount = (amount: number) => {
    return amount > 0 ? `+${amount}` : amount.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <div className="flex items-center gap-3 text-white">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
            Loading transactions...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md border border-white/20 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Clock className="text-blue-400" />
            Transaction History
          </h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-4">
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-400/30 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Star className="text-yellow-400 fill-current" size={24} />
              <div>
                <p className="text-white font-semibold">Current Balance</p>
                <p className="text-yellow-300 text-2xl font-bold">{user?.stars_balance || 0} Stars</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="text-white/30 mx-auto mb-4" size={48} />
              <p className="text-white/70">No transactions yet</p>
              <p className="text-white/50 text-sm">Your transaction history will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-white/10 rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getTransactionIcon(transaction.transaction_type, transaction.amount)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="text-white font-medium truncate">
                          {transaction.description}
                        </h3>
                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                          <span className={`font-bold ${getTransactionColor(transaction.transaction_type)}`}>
                            {formatAmount(transaction.amount)}
                          </span>
                          <Star className="text-yellow-400 fill-current" size={14} />
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-white/60 capitalize">
                          {transaction.transaction_type}
                        </span>
                        <span className="text-white/50">
                          {formatDate(transaction.created_at)}
                        </span>
                      </div>
                      
                      <div className="mt-1 text-xs text-white/50">
                        Balance after: {transaction.stars_balance_after}⭐
                      </div>
                      
                      {transaction.metadata && Object.keys(transaction.metadata).length > 0 && (
                        <div className="mt-2 text-xs">
                          {transaction.metadata.package_id && (
                            <span className="bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                              Package: {transaction.metadata.package_id}
                            </span>
                          )}
                          {transaction.metadata.profile_id && (
                            <span className="bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">
                              Profile Action
                            </span>
                          )}
                          {transaction.metadata.simulated && (
                            <span className="bg-orange-500/20 text-orange-300 px-2 py-1 rounded-full">
                              Demo Mode
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-white/20">
          <button
            onClick={onClose}
            className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
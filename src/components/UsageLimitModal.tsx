import React from 'react';
import { AlertTriangle, Crown, Zap, ArrowRight } from 'lucide-react';

interface UsageLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  featureType: 'DM Generation' | 'Pricing Calculation' | 'Media Kit Generation';
  limit: number;
}

const UsageLimitModal: React.FC<UsageLimitModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  featureType,
  limit
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center backdrop-blur-sm p-4">
      <div className="bg-slate-800 rounded-2xl max-w-md w-full p-8 shadow-2xl border border-slate-700">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-white mb-4">
            Monthly Limit Reached
          </h3>
          
          <p className="text-slate-300 mb-6 leading-relaxed">
            You've used all <span className="font-semibold text-white">{limit}</span> of your monthly {featureType.toLowerCase()} credits on the free plan.
          </p>

          <div className="bg-gradient-to-r from-purple-800/20 to-blue-800/20 rounded-xl p-6 mb-6 border border-purple-500/20">
            <div className="flex items-center justify-center mb-3">
              <Crown className="h-6 w-6 text-purple-400 mr-2" />
              <span className="font-semibold text-purple-200">Upgrade to Pro</span>
            </div>
            <ul className="text-sm text-purple-200 space-y-2">
              <li className="flex items-center">
                <Zap className="h-4 w-4 mr-2 text-purple-400" />
                Unlimited {featureType.toLowerCase()}s
              </li>
              <li className="flex items-center">
                <Zap className="h-4 w-4 mr-2 text-purple-400" />
                Premium features & themes
              </li>
              <li className="flex items-center">
                <Zap className="h-4 w-4 mr-2 text-purple-400" />
                PDF downloads
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-300 flex items-center justify-center font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Crown className="h-5 w-5 mr-2" />
              Upgrade to Pro - $7/month
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
            
            <button
              onClick={onClose}
              className="w-full py-3 px-6 rounded-xl border border-slate-600 text-slate-300 font-semibold hover:bg-slate-700/50 transition-colors"
            >
              Maybe Later
            </button>
          </div>

          <p className="text-xs text-slate-500 mt-4">
            Limits reset on the 1st of each month
          </p>
        </div>
      </div>
    </div>
  );
};

export default UsageLimitModal;
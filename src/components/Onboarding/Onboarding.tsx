import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Bot, Coins, ShoppingBag, MessageCircle, Star, ArrowRight, ArrowLeft, Check } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
}

const steps = [
  {
    title: 'Welcome to FTC Parts Exchange',
    description: 'Your marketplace for robotics parts and services',
    content: (
      <div className="text-center space-y-6">
        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto">
          <Bot className="w-10 h-10 text-white" />
        </div>
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Welcome to the FTC Community!</h3>
          <p className="text-gray-600 leading-relaxed">
            Connect with teams across the country to buy, sell, and trade robotics parts using our credit system.
            Build better robots together!
          </p>
        </div>
      </div>
    )
  },
  {
    title: 'Understanding Credits',
    description: 'Learn how our digital currency works',
    content: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Coins className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Your Credit System</h3>
        </div>
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                ✓
              </div>
              <div>
                <p className="font-semibold text-green-900">Starting Balance: 100 Credits</p>
                <p className="text-green-700 text-sm">Every new user receives 100 credits to start trading</p>
              </div>
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                $
              </div>
              <div>
                <p className="font-semibold text-blue-900">Earn Credits</p>
                <p className="text-blue-700 text-sm">Sell your parts and services to earn more credits</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                ♻
              </div>
              <div>
                <p className="font-semibold text-purple-900">Spend Wisely</p>
                <p className="text-purple-700 text-sm">Use credits to purchase items from other teams</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    title: 'Buying & Selling',
    description: 'How to use the marketplace',
    content: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Marketplace Features</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <ShoppingBag className="w-5 h-5 text-green-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Browse & Buy</h4>
            <p className="text-gray-600 text-sm">Search for parts, filter by category and price, then purchase with credits</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
              <Bot className="w-5 h-5 text-orange-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Create Listings</h4>
            <p className="text-gray-600 text-sm">List your spare parts or offer services to other teams</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <MessageCircle className="w-5 h-5 text-purple-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Communicate</h4>
            <p className="text-gray-600 text-sm">Message sellers to ask questions or coordinate pickup</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-3">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Rate & Review</h4>
            <p className="text-gray-600 text-sm">Leave feedback after purchases to build community trust</p>
          </div>
        </div>
      </div>
    )
  },
  {
    title: 'Community Guidelines',
    description: 'Building trust in our marketplace',
    content: (
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">Community Guidelines</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-1">
              ✓
            </div>
            <div>
              <p className="font-semibold text-gray-900">Be Honest & Accurate</p>
              <p className="text-gray-600 text-sm">Describe items accurately including condition and compatibility</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-1">
              ✓
            </div>
            <div>
              <p className="font-semibold text-gray-900">Communicate Clearly</p>
              <p className="text-gray-600 text-sm">Respond promptly to messages and be professional</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-1">
              ✓
            </div>
            <div>
              <p className="font-semibold text-gray-900">Rate Fairly</p>
              <p className="text-gray-600 text-sm">Leave honest reviews to help other teams make informed decisions</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-1">
              ✓
            </div>
            <div>
              <p className="font-semibold text-gray-900">Support the Community</p>
              <p className="text-gray-600 text-sm">Help fellow teams succeed and build lasting connections</p>
            </div>
          </div>
        </div>
      </div>
    )
  }
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { markOnboardingComplete } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      markOnboardingComplete();
      onComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    markOnboardingComplete();
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Progress Bar */}
          <div className="bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Step {currentStep + 1} of {steps.length}
              </span>
              <button
                onClick={handleSkip}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Skip tour
              </button>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                {steps[currentStep].title}
              </h2>
              <p className="text-gray-600">{steps[currentStep].description}</p>
            </div>

            <div className="mb-8">
              {steps[currentStep].content}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              <div className="flex space-x-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep
                        ? 'bg-blue-600'
                        : index < currentStep
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Get Started</span>
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { Profile } from '../types';
import { useApp } from '../context/AppContext';

interface RatingModalProps {
  profile: Profile;
  onClose: () => void;
}

export default function RatingModal({ profile, onClose }: RatingModalProps) {
  const { dispatch } = useApp();
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = () => {
    if (selectedRating > 0) {
      dispatch({
        type: 'ADD_RATING',
        payload: { profileId: profile.userId, score: selectedRating }
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-purple-900/90 to-blue-900/90 backdrop-blur-lg rounded-2xl p-6 w-full max-w-md border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Rate Profile</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="text-center mb-6">
          <img
            src={profile.user.avatar}
            alt={profile.user.username}
            className="w-20 h-20 rounded-full object-cover mx-auto mb-3 border-3 border-white/30"
          />
          <h3 className="text-xl font-semibold text-white">
            {profile.user.firstName} {profile.user.lastName}
          </h3>
          <p className="text-white/70">@{profile.user.username}</p>
        </div>

        <div className="mb-6">
          <p className="text-white/80 text-center mb-4">How would you rate this profile?</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
              <button
                key={rating}
                onClick={() => setSelectedRating(rating)}
                onMouseEnter={() => setHoveredRating(rating)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-all duration-200 hover:scale-125"
              >
                <Star
                  size={24}
                  className={`${
                    rating <= (hoveredRating || selectedRating)
                      ? 'text-yellow-400 fill-current'
                      : 'text-white/30'
                  }`}
                />
              </button>
            ))}
          </div>
          {selectedRating > 0 && (
            <p className="text-center mt-2 text-white font-semibold">
              {selectedRating}/10 - {
                selectedRating <= 3 ? 'Not great' :
                selectedRating <= 6 ? 'Okay' :
                selectedRating <= 8 ? 'Good' : 'Amazing!'
              }
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={selectedRating === 0}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200"
          >
            Submit Rating
          </button>
        </div>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { Button } from "./UI/button";

export default function RatingSection({ roomId }) {
  const [ratingData, setRatingData] = useState({
    rating: 0,
    totalRatings: 0,
    ratingCounts: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  });
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchRatingData();
  }, [roomId]);

  const fetchRatingData = async () => {
    try {
      const response = await fetch(`http://localhost:3000/room/${roomId}/rating`);
      if (response.ok) {
        const data = await response.json();
        setRatingData(data);
      }
    } catch (error) {
      console.error("Error fetching rating:", error);
    }
  };

  const submitRating = async (rating) => {
    setIsSubmitting(true);
    
    // Demo user ID - aap actual authentication use kar sakte hain
    const demoUserId = "user_" + Date.now();

    try {
      const response = await fetch(`http://localhost:3000/room/${roomId}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: demoUserId,
          rating: rating
        })
      });

      if (response.ok) {
        const result = await response.json();
        setRatingData(result.room);
        setUserRating(rating);
        alert(`Thanks for your ${rating} star rating!`);
      } else {
        const error = await response.json();
        alert(error.message || "Failed to submit rating");
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Error submitting rating");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPercentage = (star) => {
    if (ratingData.totalRatings === 0) return 0;
    return (ratingData.ratingCounts[star] / ratingData.totalRatings) * 100;
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mt-8">
      {/* Rating Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
        <div className="flex-1">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Guest Ratings</h3>
          
          <div className="flex items-center gap-8">
            {/* Average Rating */}
            <div className="text-center">
              <div className="text-5xl font-bold text-teal-600">{ratingData.rating}</div>
              <div className="flex items-center justify-center gap-1 mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className={i < Math.floor(ratingData.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                  />
                ))}
              </div>
              <div className="text-sm text-gray-600 mt-2">
                {ratingData.totalRatings} {ratingData.totalRatings === 1 ? 'rating' : 'ratings'}
              </div>
            </div>

            {/* Rating Distribution */}
            <div className="flex-1 max-w-md">
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-4">{star}</span>
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${getPercentage(star)}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12">
                      ({ratingData.ratingCounts[star] || 0})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Rate This Room */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Rate this room</h4>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Star Rating Input */}
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => submitRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                disabled={isSubmitting}
                className="text-3xl transition-transform duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none"
              >
                <span className={
                  star <= (hoverRating || userRating) 
                    ? "text-yellow-400" 
                    : "text-gray-300"
                }>
                  ⭐
                </span>
              </button>
            ))}
          </div>

          {/* Rating Text */}
          <div className="text-sm text-gray-600">
            {userRating > 0 ? (
              <span className="text-green-600 font-medium">
                You rated this {userRating} star{userRating > 1 ? 's' : ''}
              </span>
            ) : hoverRating > 0 ? (
              <span>Rate {hoverRating} star{hoverRating > 1 ? 's' : ''}</span>
            ) : (
              <span>Click to rate this room</span>
            )}
          </div>

          {isSubmitting && (
            <div className="text-sm text-blue-600">
              Submitting...
            </div>
          )}
        </div>

        {/* Quick Rating Buttons */}
        <div className="flex gap-2 mt-4 flex-wrap">
          {[
            { emoji: "😞", text: "Poor", rating: 1 },
            { emoji: "😐", text: "Fair", rating: 2 },
            { emoji: "😊", text: "Good", rating: 3 },
            { emoji: "😄", text: "Very Good", rating: 4 },
            { emoji: "🤩", text: "Excellent", rating: 5 }
          ].map(({ emoji, text, rating }) => (
            <button
              key={rating}
              onClick={() => submitRating(rating)}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <span className="text-lg">{emoji}</span>
              <span className="text-sm">{text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
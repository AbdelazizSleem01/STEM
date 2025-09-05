"use client";

import { useState, useEffect } from "react";
import { FiStar, FiUser } from "react-icons/fi";

export default function CourseReviews({ courseId }) {
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 0, review: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [courseId]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/user/courses/${courseId}/reviews`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch reviews");
      const data = await res.json();
      setReviews(data.reviews || []); // Adjust based on API response
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (newReview.rating === 0) {
      setError("Please select a rating");
      return;
    }

    setSubmitLoading(true);
    try {
      const res = await fetch(`/api/user/courses/${courseId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(newReview),
      });

      if (!res.ok) throw new Error("Failed to submit review");
      const data = await res.json();
      setReviews((prev) => [data.review, ...prev]);
      setNewReview({ rating: 0, review: "" });
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const StarRating = ({ rating, onRate, disabled = false }) => (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => !disabled && onRate(star)}
          className={`${
            star <= rating ? "text-yellow-400" : "text-gray-300"
          } hover:text-yellow-400 ${
            disabled ? "cursor-default" : "cursor-pointer"
          }`}
        >
          <FiStar
            className={`h-5 w-5 ${star <= rating ? "fill-current" : ""}`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Write a Review
          </h3>
          <form onSubmit={handleSubmitReview} className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Rating
              </label>
              <StarRating
                rating={newReview.rating}
                onRate={(rating) =>
                  setNewReview((prev) => ({ ...prev, rating }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Your Review
              </label>
              <textarea
                value={newReview.review}
                onChange={(e) =>
                  setNewReview((prev) => ({ ...prev, review: e.target.value }))
                }
                required
                rows={4}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Write your review here..."
              />
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <button
              type="submit"
              disabled={submitLoading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {submitLoading ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            Course Reviews
          </h3>

          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No reviews yet. Be the first to review this course!
            </p>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div
                  key={review._id}
                  className="border-b border-gray-200 pb-6 last:border-b-0"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100">
                        <FiUser className="h-5 w-5 text-gray-500" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {review.user?.name || "Anonymous"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <StarRating rating={review.rating} disabled />
                  </div>
                  <div className="mt-4 text-sm text-gray-700">
                    {review.review}
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

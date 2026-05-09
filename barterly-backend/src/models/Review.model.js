import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reviewer is required"],
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Reviewee is required"],
    },
    barter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BarterRequest",
      required: [true, "Barter request is required"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
    },
    comment: {
      type: String,
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  },
);

// Indexes for better query performance
reviewSchema.index({ reviewee: 1, createdAt: -1 });
reviewSchema.index({ reviewer: 1 });
reviewSchema.index({ barter: 1 });

// Prevent duplicate reviews for same barter from same reviewer
reviewSchema.index({ reviewer: 1, barter: 1 }, { unique: true });

// Update user's average rating and total reviews after review is saved
reviewSchema.post("save", async function () {
  const User = mongoose.model("User");

  // Calculate average rating for reviewee
  const stats = await this.constructor.aggregate([
    {
      $match: { reviewee: this.reviewee },
    },
    {
      $group: {
        _id: "$reviewee",
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await User.findByIdAndUpdate(this.reviewee, {
      averageRating: Math.round(stats[0].averageRating * 10) / 10, // Round to 1 decimal
      totalReviews: stats[0].totalReviews,
    });
  }
});

// Update user's average rating and total reviews after review is deleted
reviewSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    const User = mongoose.model("User");

    const stats = await this.model.aggregate([
      {
        $match: { reviewee: doc.reviewee },
      },
      {
        $group: {
          _id: "$reviewee",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (stats.length > 0) {
      await User.findByIdAndUpdate(doc.reviewee, {
        averageRating: Math.round(stats[0].averageRating * 10) / 10,
        totalReviews: stats[0].totalReviews,
      });
    } else {
      // No reviews left, reset to 0
      await User.findByIdAndUpdate(doc.reviewee, {
        averageRating: 0,
        totalReviews: 0,
      });
    }
  }
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;

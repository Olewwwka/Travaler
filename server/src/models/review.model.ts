import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  point: string;
  user: string;
  rating: number;
  comment: string;
  photos?: string[];
}

const reviewSchema = new Schema<IReview>(
  {
    point: {
      type: Schema.Types.ObjectId,
      ref: 'Point',
      required: true
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      trim: true
    },
    photos: [{
      type: String
    }]
  },
  {
    timestamps: true
  }
);

// Индекс для предотвращения дублирования отзывов от одного пользователя для одной точки
reviewSchema.index({ point: 1, user: 1 }, { unique: true });

export const Review = mongoose.model<IReview>('Review', reviewSchema); 
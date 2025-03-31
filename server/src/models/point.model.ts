import mongoose, { Document, Schema } from 'mongoose';

export interface IPoint extends Document {
  name: string;
  description: string;
  location: {
    type: string;
    coordinates: number[];
  };
  photos: string[];
  rating: number;
  reviews: string[];
  createdBy: string;
  category: string;
  address: string;
  openingHours?: string;
  contact?: string;
  website?: string;
}

const pointSchema = new Schema<IPoint>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Description is required']
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: [true, 'Coordinates are required']
      }
    },
    photos: [{
      type: String
    }],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviews: [{
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['restaurant', 'hotel', 'attraction', 'museum', 'park', 'other']
    },
    address: {
      type: String,
      required: [true, 'Address is required']
    },
    openingHours: String,
    contact: String,
    website: String
  },
  {
    timestamps: true
  }
);

pointSchema.index({ location: '2dsphere' });

export const Point = mongoose.model<IPoint>('Point', pointSchema); 
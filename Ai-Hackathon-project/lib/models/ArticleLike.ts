import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IArticleLike extends Document {
  articleId: string;
  likesCount: number;
  likedUserEmails: string[];
  updatedAt: Date;
}

const ArticleLikeSchema = new Schema<IArticleLike>(
  {
    articleId: { type: String, required: true, unique: true, index: true },
    likesCount: { type: Number, default: 0 },
    likedUserEmails: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

export const ArticleLikeModel: Model<IArticleLike> =
  mongoose.models.ArticleLike || mongoose.model<IArticleLike>('ArticleLike', ArticleLikeSchema);

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  password?: string;
  paperTitle: string;
  isVerified: boolean;
  otpCode?: string;
  otpExpiresAt?: Date;
  preferences?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, default: '' },
    paperTitle: { type: String, default: 'DAYMARK' },
    isVerified: { type: Boolean, default: false },
    otpCode: { type: String, default: null },
    otpExpiresAt: { type: Date, default: null },
    preferences: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  }
);

// Prevent model recompilation in Next.js hot reload
export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

import mongoose from "mongoose";
import type { Document } from "mongoose";
import bcrypt from "bcryptjs";

export enum UserRole {
  CANDIDATE = "candidate",
  RECRUITER = "recruiter",
  ADMIN = "admin",
}

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  role: UserRole;
  isVerified: boolean;
  tokenVersion: number;
  emailVerificationTokenHash?: string | undefined;
  emailVerificationTokenExpiry?: Date | undefined;
  passwordResetTokenHash?: string | undefined;
  passwordResetTokenExpiry?: Date | undefined;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(password: string): Promise<boolean>;
}

type IUserModel = mongoose.Model<IUser>;

const userSchema = new mongoose.Schema<IUser, IUserModel>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      minlength: [3, "Email must be at least 3 characters long"],
      maxlength: [50, "Email must be at most 50 characters long"],
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Email must be a valid email address",
      ],
    },

    passwordHash: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false, // Exclude passwordHash from query results by default
    },

    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.CANDIDATE,
      required: [true, "Role is required"],
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    tokenVersion: {
      type: Number,
      default: 0, // Increment this to invalidate all existing tokens for the user
    },

    emailVerificationTokenHash: {
      type: String,
      select: false,
    },

    emailVerificationTokenExpiry: {
      type: Date,
      select: false,
    },

    passwordResetTokenHash: {
      type: String,
      select: false,
    },

    passwordResetTokenExpiry: {
      type: Date,
      select: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

// ---- Indexes ----
userSchema.index(
  { email: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } },
);
userSchema.index({ deletedAt: 1 });

// ---- Hash the password automatically when it is modified ----
userSchema.pre("save", async function () {
  if (!this.isModified("passwordHash")) return;
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
});

// ---- Instance method to compare password ----
userSchema.methods.comparePassword = async function (
  password: string,
): Promise<boolean> {
  return bcrypt.compare(password, this.passwordHash);
};

export const User = mongoose.model<IUser, IUserModel>("User", userSchema);

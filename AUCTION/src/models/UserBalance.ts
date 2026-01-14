import { Schema, model, Document } from 'mongoose';

export interface IUserBalance extends Document {
  userId: string;
  balance: number;
  locked: number;
}

const UserBalanceSchema = new Schema<IUserBalance>({
  userId: { type: String, required: true, unique: true, index: true },
  balance: { type: Number, required: true, min: 0, default: 0 },
  locked: { type: Number, required: true, min: 0, default: 0 },
});

export const UserBalance = model<IUserBalance>('UserBalance', UserBalanceSchema);
import { Schema, model, Document } from 'mongoose';

export interface IAuction extends Document {
  name: string;
  totalRounds: number;
  winnersPerRound: number;
  basePrice: number;
  currentRound: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  rounds: Schema.Types.ObjectId[];
  creatorId: string;
  createdAt: Date;
  endsAt?: Date;
}

const AuctionSchema = new Schema<IAuction>({
  name: { type: String, required: true },
  totalRounds: { type: Number, required: true, min: 1 },
  winnersPerRound: { type: Number, required: true, min: 1 },
  basePrice: { type: Number, required: true, min: 0.01 },
  currentRound: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'active', 'completed', 'cancelled'], default: 'pending' },
  rounds: [{ type: Schema.Types.ObjectId, ref: 'Round' }],
  creatorId: { type: String, required: true },
}, { timestamps: true });

export const Auction = model<IAuction>('Auction', AuctionSchema);
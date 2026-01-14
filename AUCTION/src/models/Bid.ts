import { Schema, model, Document } from 'mongoose';

export interface IBid extends Document {
  userId: string;
  auctionId: Schema.Types.ObjectId;
  roundId: Schema.Types.ObjectId;
  amount: number;
  timestamp: Date;
  status: 'active' | 'won' | 'lost' | 'refunded';
}

const BidSchema = new Schema<IBid>({
  userId: { type: String, required: true, index: true },
  auctionId: { type: Schema.Types.ObjectId, ref: 'Auction', required: true },
  roundId: { type: Schema.Types.ObjectId, ref: 'Round', required: true },
  amount: { type: Number, required: true, min: 0.01 },
  timestamp: { type: Date, default: () => new Date() },
  status: { type: String, enum: ['active', 'won', 'lost', 'refunded'], default: 'active' },
});

export const Bid = model<IBid>('Bid', BidSchema);
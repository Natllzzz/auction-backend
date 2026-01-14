import { Schema, model, Document } from 'mongoose';

export interface IRound extends Document {
  auctionId: Schema.Types.ObjectId;
  roundNumber: number;
  status: 'scheduled' | 'active' | 'finished';
  startTime: Date;
  scheduledEndTime: Date;
  actualEndTime: Date | null;
  bids: Schema.Types.ObjectId[];
  winners: Schema.Types.ObjectId[];
  extendedDueToSniping: boolean;
}

const RoundSchema = new Schema<IRound>({
  auctionId: { type: Schema.Types.ObjectId, ref: 'Auction', required: true },
  roundNumber: { type: Number, required: true },
  status: { type: String, enum: ['scheduled', 'active', 'finished'], default: 'scheduled' },
  startTime: { type: Date, required: true },
  scheduledEndTime: { type: Date, required: true },
  actualEndTime: { type: Date, default: null },
  bids: [{ type: Schema.Types.ObjectId, ref: 'Bid' }],
  winners: [{ type: Schema.Types.ObjectId, ref: 'Bid' }],
  extendedDueToSniping: { type: Boolean, default: false },
});

export const Round = model<IRound>('Round', RoundSchema);
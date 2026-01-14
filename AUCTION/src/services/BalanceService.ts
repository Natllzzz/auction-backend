import { UserBalance } from '../models/UserBalance';
import mongoose from 'mongoose';

export class BalanceService {
  static async lockFunds(userId: string, amount: number): Promise<boolean> {
    const session = await mongoose.startSession();
    let success = false;

    try {
      await session.withTransaction(async () => {
        const userBalance = await UserBalance.findOne({ userId }).session(session);
        if (!userBalance || userBalance.balance - userBalance.locked < amount) {
          throw new Error('Insufficient funds');
        }

        await UserBalance.updateOne(
          { userId },
          { $inc: { locked: amount } },
          { session }
        );
        success = true;
      });
    } finally {
      await session.endSession();
    }

    return success;
  }

  static async unlockFunds(userId: string, amount: number): Promise<void> {
    await UserBalance.updateOne({ userId }, { $inc: { locked: -amount } });
  }

  static async transferFunds(fromUserId: string, toUserId: string, amount: number): Promise<void> {
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        await UserBalance.updateOne(
          { userId: fromUserId },
          { $inc: { balance: -amount, locked: -amount } },
          { session }
        );
        await UserBalance.updateOne(
          { userId: toUserId },
          { $inc: { balance: amount } },
          { session }
        );
      });
    } finally {
      await session.endSession();
    }
  }

  static async refundFunds(userId: string, amount: number): Promise<void> {
    await UserBalance.updateOne({ userId }, { $inc: { balance: amount, locked: -amount } });
  }
}
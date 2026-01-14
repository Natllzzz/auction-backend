import { Auction } from '../models/Auction';
import { Round, IRound } from '../models/Round';
import { Bid } from '../models/Bid';
import { BalanceService } from './BalanceService';

export class RoundManager {
  private static activeTimers = new Map<string, NodeJS.Timeout>();

  static async startRound(auctionId: string, roundNumber: number): Promise<void> {
    const round = await Round.findOne({ auctionId, roundNumber });
    if (!round) throw new Error('Round not found');

    const scheduledEnd = round.scheduledEndTime.getTime();
    const now = Date.now();
    let delay = scheduledEnd - now;
    if (delay < 0) delay = 0;

    const timer = setTimeout(async () => {
      await this.finishRound(round._id.toString());
    }, delay);

    this.activeTimers.set(round._id.toString(), timer);
    await Round.findByIdAndUpdate(round._id, { status: 'active' });
    await Auction.findByIdAndUpdate(auctionId, { currentRound: roundNumber, status: 'active' });
  }

  static async finishRound(roundId: string): Promise<void> {
    const round = await Round.findById(roundId).populate<{ bids: IBid[] }>('bids');
    if (!round || round.status !== 'active') return;

    const bids = await Bid.find({ _id: { $in: round.bids } }).sort({ amount: -1, timestamp: 1 });

    const winners = bids.slice(0, 1); // 1 победитель на раунд
    const winnerIds = winners.map(w => w._id);

    await Bid.updateMany({ _id: { $in: winnerIds } }, { status: 'won' });
    await Bid.updateMany({ _id: { $nin: winnerIds, $in: round.bids } }, { status: 'lost' });

    for (const bid of winners) {
      const auction = await Auction.findById(bid.auctionId);
      if (auction) {
        await BalanceService.transferFunds(bid.userId, auction.creatorId, bid.amount);
      }
    }

    const losers = bids.filter(b => !winnerIds.includes(b._id));
    for (const bid of losers) {
      await BalanceService.refundFunds(bid.userId, bid.amount);
    }

    await Round.findByIdAndUpdate(roundId, {
      status: 'finished',
      actualEndTime: new Date(),
      winners: winnerIds,
    });

    const auction = await Auction.findById(round.auctionId);
    if (auction && auction.currentRound < auction.totalRounds) {
      await this.startRound(auction._id.toString(), auction.currentRound + 1);
    } else if (auction) {
      await Auction.findByIdAndUpdate(auction._id, { status: 'completed' });
    }
  }

  static clearTimer(roundId: string): void {
    const timer = this.activeTimers.get(roundId);
    if (timer) {
      clearTimeout(timer);
      this.activeTimers.delete(roundId);
    }
  }
}
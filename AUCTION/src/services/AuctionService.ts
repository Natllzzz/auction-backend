import { Auction, IAuction } from '../models/Auction';
import { Round, IRound } from '../models/Round';
import { Bid, IBid } from '../models/Bid';
import { BalanceService } from './BalanceService';
import { shouldExtendRound, extendRoundEndTime } from '../utils/antiSniping';
import { RoundManager } from './RoundManager';

export class AuctionService {
  static async createAuction(params: {
    name: string;
    totalRounds: number;
    winnersPerRound: number;
    basePrice: number;
    creatorId: string;
    durationPerRoundMs: number;
  }): Promise<IAuction> {
    const auction = new Auction({
      ...params,
      status: 'pending',
    });
    await auction.save();

    const rounds: IRound[] = [];
    let startTime = Date.now() + 60_000;

    for (let i = 1; i <= params.totalRounds; i++) {
      const round = new Round({
        auctionId: auction._id,
        roundNumber: i,
        startTime: new Date(startTime),
        scheduledEndTime: new Date(startTime + params.durationPerRoundMs),
        status: i === 1 ? 'scheduled' : 'pending',
      });
      await round.save();
      rounds.push(round);
      startTime += params.durationPerRoundMs + 10_000;
    }

    auction.rounds = rounds.map(r => r._id);
    await auction.save();

    if (params.totalRounds > 0) {
      await RoundManager.startRound(auction._id.toString(), 1);
    }

    return auction;
  }

  static async placeBid(auctionId: string, userId: string, amount: number): Promise<IBid> {
    const auction = await Auction.findById(auctionId);
    if (!auction || auction.status !== 'active') throw new Error('Auction not active');

    const currentRound = await Round.findOne({
      auctionId,
      status: 'active'
    });
    if (!currentRound) throw new Error('No active round');

    if (amount < auction.basePrice) throw new Error('Bid below base price');

    const locked = await BalanceService.lockFunds(userId, amount);
    if (!locked) throw new Error('Insufficient funds');

    const now = new Date();
    let actualEndTime = currentRound.scheduledEndTime;
    let extended = currentRound.extendedDueToSniping;

    if (shouldExtendRound(currentRound.scheduledEndTime, now)) {
      actualEndTime = extendRoundEndTime(currentRound.scheduledEndTime);
      extended = true;
      await Round.findByIdAndUpdate(currentRound._id, {
        actualEndTime,
        extendedDueToSniping: true
      });
    }

    const bid = new Bid({
      userId,
      auctionId,
      roundId: currentRound._id,
      amount,
      timestamp: now
    });
    await bid.save();

    await Round.findByIdAndUpdate(currentRound._id, {
      $push: { bids: bid._id }
    });

    return bid;
  }
}
import { Request, Response } from 'express';
import { AuctionService } from '../services/AuctionService';
import { Auction } from '../models/Auction';
import { Bid } from '../models/Bid';
import { UserBalance } from '../models/UserBalance';

export const createAuction = async (req: Request, res: Response) => {
  try {
    const { name, totalRounds, winnersPerRound, basePrice, creatorId } = req.body;
    const auction = await AuctionService.createAuction({
      name,
      totalRounds,
      winnersPerRound,
      basePrice,
      creatorId, 
      durationPerRoundMs: 60_000,
    });
    res.status(201).json(auction);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
};

export const placeBid = async (req: Request, res: Response) => {
  try {
    const { auctionId, userId, amount } = req.body;
    const bid = await AuctionService.placeBid(auctionId, userId, amount);
    res.status(201).json(bid);
  } catch (e) {
    res.status(400).json({ error: (e as Error).message });
  }
};

export const getAuction = async (req: Request, res: Response) => {
  const auction = await Auction.findById(req.params.id).populate('rounds');
  res.json(auction);
};

export const getBidsForRound = async (req: Request, res: Response) => {
  const { round, auction } = req.query as { round: string; auction: string };
  const bids = await Bid.find({ roundId: round, auctionId: auction }).sort({ amount: -1 });
  res.json(bids);
};

export const getBalance = async (req: Request, res: Response) => {
  const { userId } = req.params;
  let balance = await UserBalance.findOne({ userId });
  if (!balance) {
    balance = new UserBalance({ userId, balance: 10 }); // 10 USDT по умолчанию
    await balance.save();
  }
  res.json(balance);
};

// Изменение баланса на 1$
export const updateBalance = async (req: Request, res: Response) => {
  const { userId, amount } = req.body;

  try {
    let balance = await UserBalance.findOne({ userId });
    if (!balance) {
      balance = new UserBalance({ userId, balance: 10 });
      await balance.save();
    }

    // Проверка:баланс не отрицательный
    if (balance.balance + amount < 0) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    await UserBalance.updateOne(
      { userId },
      { $inc: { balance: amount } }
    );

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
};
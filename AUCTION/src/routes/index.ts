import { Router } from 'express';
import * as ctrl from '../controllers/auctionController';

const router = Router();

router.post('/auctions', ctrl.createAuction);
router.post('/bids', ctrl.placeBid);
router.get('/auctions/:id', ctrl.getAuction);
router.get('/bids', ctrl.getBidsForRound);
router.get('/balance/:userId', ctrl.getBalance);
router.post('/balance/update', ctrl.updateBalance); // ✅ Новый маршрут

export default router;
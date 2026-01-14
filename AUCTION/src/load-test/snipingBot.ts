import axios from 'axios';

const AUCTION_ID = process.env.AUCTION_ID!;
const BASE_URL = 'http://localhost:3000/api';

async function simulateSniping() {
  const users = ['bot1', 'bot2', 'bot3', 'bot4', 'bot5'];
  const amounts = [10, 12, 15, 18, 20];

  setTimeout(async () => {
    for (let i = 0; i < 20; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const amount = amounts[Math.floor(Math.random() * amounts.length)] + Math.random();
      try {
        await axios.post(`${BASE_URL}/bids`, {
          auctionId: AUCTION_ID,
          userId: `${user}-${i}`,
          amount,
        });
        console.log(`✅ Bid by ${user}-${i}: $${amount.toFixed(2)}`);
      } catch (e) {
        console.log(`❌ Failed bid: ${(e as any).response?.data?.error}`);
      }
      await new Promise(r => setTimeout(r, 100));
    }
  }, 58_000);
}

simulateSniping();
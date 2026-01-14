import mongoose from 'mongoose';
import app from './app';

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/auction';

// Подключение к MongoDB
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    
    // Запуск сервера
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌐 Visit: http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  });

// Обработка ошибок
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});
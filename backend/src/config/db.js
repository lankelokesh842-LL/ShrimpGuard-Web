import mongoose from 'mongoose';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mongodProcess = null;

async function tryConnect(uri, timeoutMs = 3000) {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: timeoutMs
    });
    return true;
  } catch {
    return false;
  }
}

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shrimpguard';

  console.log(`📡 Connecting to MongoDB at ${uri}...`);

  const initialConnected = await tryConnect(uri, 3000);
  if (initialConnected) {
    console.log('✅ MongoDB Connected successfully!');
    return;
  }

  // If initial connection failed, check if we can spawn local mongod.exe
  const defaultMongodPath = 'C:\\Program Files\\MongoDB\\Server\\8.3\\bin\\mongod.exe';
  const dbDataPath = path.resolve(__dirname, '../../../db_data');

  if (fs.existsSync(defaultMongodPath)) {
    console.log('⚡ Starting local MongoDB instance from Program Files...');
    if (!fs.existsSync(dbDataPath)) {
      fs.mkdirSync(dbDataPath, { recursive: true });
    }

    try {
      mongodProcess = spawn(defaultMongodPath, [
        '--dbpath', dbDataPath,
        '--port', '27017',
        '--bind_ip', '127.0.0.1'
      ], {
        detached: false,
        stdio: 'ignore'
      });

      // Wait 2.5 seconds for mongod to initialize
      await new Promise((resolve) => setTimeout(resolve, 2500));

      const reconnected = await tryConnect(uri, 5000);
      if (reconnected) {
        console.log('✅ Local MongoDB instance started and connected successfully!');
        return;
      }
    } catch (spawnErr) {
      console.warn('⚠️ Could not auto-start local mongod:', spawnErr.message);
    }
  }

  // If still not connected, retry one more time or log helpful message
  try {
    await mongoose.connect(uri);
    console.log('✅ MongoDB Connected successfully!');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.log('ℹ️ Ensure MongoDB is running on port 27017 or update MONGODB_URI in backend/.env');
  }
};

// Cleanup on exit
process.on('SIGINT', () => {
  if (mongodProcess) {
    try {
      mongodProcess.kill();
    } catch {
      // ignore
    }
  }
  process.exit(0);
});

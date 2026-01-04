/**
 * Script to seed initial categories in MongoDB
 * Run with: npx ts-node scripts/seed-categories.ts
 */

import mongoose from 'mongoose';
import Category from '../models/Category';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  console.error('MONGODB_URI is not defined in environment variables');
  process.exit(1);
}

const initialCategories = [
  { name: 'Software Engineering', color: 'bg-blue-500', icon: 'Code' },
  { name: 'Creative Arts', color: 'bg-purple-500', icon: 'Palette' },
  { name: 'Business', color: 'bg-emerald-500', icon: 'Briefcase' },
];

async function seedCategories() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if categories already exist
    const existingCount = await Category.countDocuments();
    if (existingCount > 0) {
      console.log(`Categories already exist (${existingCount}). Skipping seed.`);
      await mongoose.disconnect();
      return;
    }

    // Insert initial categories
    const categories = await Category.insertMany(initialCategories);
    console.log(`Successfully seeded ${categories.length} categories:`);
    categories.forEach(cat => {
      console.log(`  - ${cat.name} (${cat.color})`);
    });

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();


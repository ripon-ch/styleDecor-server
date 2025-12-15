require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Service = require('../models/Service');
const connectDB = require('../config/database');

const seedData = async () => {
  try {
    await connectDB();

    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Service.deleteMany({});

    console.log('✅ Deleted existing data');

    // Create admin user
    console.log('👤 Creating admin user...');
    const admin = await User.create({
      email: 'admin@styledecor.com',
      password: 'admin123',
      fullName: 'Admin User',
      role: 'admin',
      phone: '+8801712345678',
      isActive: true,
      isEmailVerified: true
    });

    // Create decorator users
    console.log('👷 Creating decorator users...');
    const decorators = await User.create([
      {
        email: 'decorator1@styledecor.com',
        password: 'decorator123',
        fullName: 'Fatima Rahman',
        role: 'decorator',
        phone: '+8801812345678',
        bio: 'Experienced wedding decorator with 8 years in the industry',
        experienceYears: 8,
        isVerified: true,
        rating: { average: 4.8, count: 25 },
        totalJobs: 25,
        address: {
          district: 'Dhaka',
          thana: 'Gulshan'
        }
      },
      {
        email: 'decorator2@styledecor.com',
        password: 'decorator123',
        fullName: 'Ahmed Hassan',
        role: 'decorator',
        phone: '+8801912345678',
        bio: 'Specializing in corporate events and office spaces',
        experienceYears: 5,
        isVerified: true,
        rating: { average: 4.6, count: 18 },
        totalJobs: 18,
        address: {
          district: 'Dhaka',
          thana: 'Banani'
        }
      }
    ]);

    // Create customer users
    console.log('👥 Creating customer users...');
    const customers = await User.create([
      {
        email: 'customer1@styledecor.com',
        password: 'customer123',
        fullName: 'Sarah Ahmed',
        role: 'customer',
        phone: '+8801612345678',
        address: {
          street: '123 Main Street',
          district: 'Dhaka',
          thana: 'Dhanmondi'
        }
      }
    ]);

    // Create services
    console.log('🎨 Creating services...');
    const services = await Service.create([
      {
        serviceName: 'Wedding Stage Decoration',
        description: 'Complete wedding stage decoration with floral arrangements, lighting, and elegant backdrop setup. Perfect for traditional and modern weddings.',
        cost: 35000,
        unit: 'package',
        serviceCategory: 'wedding',
        isActive: true,
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed',
            altText: 'Elegant wedding stage decoration',
            isPrimary: true,
            displayOrder: 1
          }
        ],
        features: [
          'Floral arrangements',
          'Stage lighting',
          'Backdrop setup',
          'Seating decoration',
          'Photography setup'
        ],
        createdBy: admin._id,
        rating: { average: 4.8, count: 15 }
      },
      {
        serviceName: 'Birthday Party Decoration',
        description: 'Fun and colorful birthday party decorations including balloons, banners, and themed setups for all ages.',
        cost: 5000,
        unit: 'package',
        serviceCategory: 'event',
        isActive: true,
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d',
            altText: 'Colorful birthday party setup',
            isPrimary: true,
            displayOrder: 1
          }
        ],
        features: [
          'Balloon decoration',
          'Custom banners',
          'Themed props',
          'Cake table setup',
          'Photo booth area'
        ],
        createdBy: admin._id,
        rating: { average: 4.5, count: 22 }
      },
      {
        serviceName: 'Office Interior Decoration',
        description: 'Professional office space decoration and interior design to create a productive work environment.',
        cost: 800,
        unit: 'per sq-ft',
        serviceCategory: 'office',
        isActive: true,
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c',
            altText: 'Modern office interior',
            isPrimary: true,
            displayOrder: 1
          }
        ],
        features: [
          'Space planning',
          'Furniture arrangement',
          'Color consultation',
          'Lighting design',
          'Wall art installation'
        ],
        createdBy: admin._id,
        rating: { average: 4.7, count: 12 }
      },
      {
        serviceName: 'Home Living Room Makeover',
        description: 'Complete living room transformation with modern furniture arrangement and decor.',
        cost: 15000,
        unit: 'package',
        serviceCategory: 'home',
        isActive: true,
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1556912167-f556f1f39fdf',
            altText: 'Beautiful living room setup',
            isPrimary: true,
            displayOrder: 1
          }
        ],
        features: [
          'Furniture arrangement',
          'Color scheme design',
          'Curtain installation',
          'Wall decoration',
          'Lighting setup'
        ],
        createdBy: admin._id,
        rating: { average: 4.6, count: 18 }
      },
      {
        serviceName: 'Garden & Outdoor Decoration',
        description: 'Beautiful outdoor and garden decoration for parties, weddings, and special events.',
        cost: 12000,
        unit: 'package',
        serviceCategory: 'outdoor',
        isActive: true,
        images: [
          {
            imageUrl: 'https://images.unsplash.com/photo-1464195244916-405fa0a82545',
            altText: 'Outdoor garden decoration',
            isPrimary: true,
            displayOrder: 1
          }
        ],
        features: [
          'Fairy lights installation',
          'Garden furniture setup',
          'Floral arrangements',
          'Pathway decoration',
          'Tent setup'
        ],
        createdBy: admin._id,
        rating: { average: 4.9, count: 10 }
      }
    ]);

    console.log('\n✅ Seed data created successfully!\n');
    console.log('📧 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Admin:      admin@styledecor.com / admin123');
    console.log('Decorator1: decorator1@styledecor.com / decorator123');
    console.log('Decorator2: decorator2@styledecor.com / decorator123');
    console.log('Customer:   customer1@styledecor.com / customer123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`✨ Created ${services.length} services`);
    console.log(`👥 Created ${decorators.length + 1 + customers.length} users\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
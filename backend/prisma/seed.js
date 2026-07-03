const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding ZYVO database...');

  // ── Clean slate ──────────────────────────────────────
  await prisma.walletTransaction.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.session.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.review.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.seat.deleteMany();
  await prisma.studyHall.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.user.deleteMany();

  // ── Admin User ───────────────────────────────────────
  const adminPassword = await bcrypt.hash('Admin@123', 12);
  const admin = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'admin@zyvo.app',
      passwordHash: adminPassword,
      name: 'Zyvo Admin',
      role: 'ADMIN',
      isVerified: true,
      referralCode: 'ADMIN001',
    },
  });
  console.log('✅ Admin created:', admin.email);

  // ── Owner User ───────────────────────────────────────
  const ownerPassword = await bcrypt.hash('Owner@123', 12);
  const owner = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'owner@zyvo.app',
      passwordHash: ownerPassword,
      name: 'Rajesh Kumar',
      phone: '+91-9876543210',
      role: 'OWNER',
      isVerified: true,
      referralCode: 'OWNER001',
    },
  });
  console.log('✅ Owner created:', owner.email);

  // ── Regular User ─────────────────────────────────────
  const userPassword = await bcrypt.hash('User@123', 12);
  const user = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'user@zyvo.app',
      passwordHash: userPassword,
      name: 'Arjun Sharma',
      phone: '+91-9876543211',
      university: 'IIT Bombay',
      role: 'USER',
      isVerified: true,
      referralCode: 'USER001',
    },
  });
  console.log('✅ Test user created:', user.email);

  // ── Wallets ──────────────────────────────────────────
  await prisma.wallet.create({ data: { userId: user.id, balance: 500 } });
  await prisma.wallet.create({ data: { userId: owner.id, balance: 2500 } });

  // ── Study Halls ──────────────────────────────────────
  const studyHalls = [
    {
      id: uuidv4(),
      ownerId: owner.id,
      name: 'Zen Focus Hub',
      description: 'A premium silent study space designed for deep focus and productivity. Equipped with ergonomic chairs, high-speed fiber internet, and noise-cancelling booths.',
      category: 'FOCUS_ROOM',
      status: 'ACTIVE',
      address: '42, Linking Road, Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
      latitude: 19.0596,
      longitude: 72.8295,
      pricePerHour: 80,
      openingTime: '06:00',
      closingTime: '23:00',
      totalSeats: 20,
      amenities: ['wifi', 'ac', 'parking', 'locker', 'coffee', 'printer'],
      images: [
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
        'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=800',
      ],
      coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800',
      rating: 4.8,
      totalReviews: 127,
      isInstantBook: true,
      rules: 'No phone calls. Maintain silence. Keep your workspace clean.',
    },
    {
      id: uuidv4(),
      ownerId: owner.id,
      name: 'Collab Co-working Space',
      description: 'A vibrant co-working space perfect for students and freelancers. With hot desks, dedicated desks, and meeting pods.',
      category: 'CO_WORKING',
      status: 'ACTIVE',
      address: '15, MG Road, Koramangala',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560034',
      latitude: 12.9352,
      longitude: 77.6245,
      pricePerHour: 60,
      openingTime: '07:00',
      closingTime: '22:00',
      totalSeats: 40,
      amenities: ['wifi', 'ac', 'coffee', 'snacks', 'whiteboard', 'projector'],
      images: [
        'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800',
      ],
      coverImage: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      rating: 4.5,
      totalReviews: 89,
      isInstantBook: true,
      rules: 'Collaborative environment. Phone calls allowed in designated areas.',
    },
    {
      id: uuidv4(),
      ownerId: owner.id,
      name: 'The Quiet Library',
      description: 'Modeled after a traditional library. Absolute silence zone with curated books, reading lamps, and comfortable reading chairs.',
      category: 'LIBRARY',
      status: 'ACTIVE',
      address: '8, University Road, Sector 17',
      city: 'Chandigarh',
      state: 'Punjab',
      pincode: '160017',
      latitude: 30.7333,
      longitude: 76.7794,
      pricePerHour: 40,
      openingTime: '08:00',
      closingTime: '21:00',
      totalSeats: 30,
      amenities: ['wifi', 'ac', 'locker', 'water', 'reading-lamp'],
      images: [
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
        'https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=800',
      ],
      coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
      rating: 4.9,
      totalReviews: 203,
      isInstantBook: false,
      rules: 'Absolute silence. No food or drink. Switch off mobile phones.',
    },
    {
      id: uuidv4(),
      ownerId: owner.id,
      name: 'Creative Studio 7',
      description: 'An inspiring creative studio with whiteboards, art supplies, and a dynamic atmosphere. Perfect for designers and creative thinkers.',
      category: 'CREATIVE_STUDIO',
      status: 'ACTIVE',
      address: '101, Hauz Khas Village',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110016',
      latitude: 28.5496,
      longitude: 77.2014,
      pricePerHour: 100,
      openingTime: '09:00',
      closingTime: '21:00',
      totalSeats: 15,
      amenities: ['wifi', 'ac', 'whiteboard', 'art-supplies', 'projector', 'speaker'],
      images: [
        'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800',
      ],
      coverImage: 'https://images.unsplash.com/photo-1497215842964-222b430dc094?w=800',
      rating: 4.6,
      totalReviews: 61,
      isInstantBook: true,
      rules: 'Creative freedom encouraged. Clean up your workspace after use.',
    },
  ];

  const createdHalls = [];
  for (const hall of studyHalls) {
    const created = await prisma.studyHall.create({ data: hall });
    createdHalls.push(created);
    console.log(`✅ Study Hall created: ${created.name}`);
  }

  // ── Seats for each Hall ──────────────────────────────
  for (const hall of createdHalls) {
    const rows = ['A', 'B', 'C', 'D'];
    const seatsPerRow = Math.ceil(hall.totalSeats / rows.length);
    const seatData = [];

    let count = 0;
    for (const row of rows) {
      for (let col = 1; col <= seatsPerRow && count < hall.totalSeats; col++) {
        seatData.push({
          id: uuidv4(),
          studyHallId: hall.id,
          seatNumber: `${row}${col}`,
          row,
          column: col,
          status: 'AVAILABLE',
        });
        count++;
      }
    }
    await prisma.seat.createMany({ data: seatData });
  }
  console.log('✅ Seats seeded for all study halls');

  // ── Coupons ──────────────────────────────────────────
  await prisma.coupon.createMany({
    data: [
      {
        id: uuidv4(),
        code: 'ZYVO20',
        description: '20% off on your first booking',
        discountType: 'PERCENT',
        discountValue: 20,
        minOrderAmount: 100,
        maxDiscount: 200,
        usageLimit: 1000,
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
      {
        id: uuidv4(),
        code: 'FLAT50',
        description: 'Flat ₹50 off on bookings above ₹200',
        discountType: 'FLAT',
        discountValue: 50,
        minOrderAmount: 200,
        usageLimit: 500,
        isActive: true,
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
      },
      {
        id: uuidv4(),
        code: 'STUDENT30',
        description: '30% off for students',
        discountType: 'PERCENT',
        discountValue: 30,
        minOrderAmount: 150,
        maxDiscount: 300,
        usageLimit: 2000,
        isActive: true,
        expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
      },
    ],
  });
  console.log('✅ Coupons seeded');

  // ── Sample Review ────────────────────────────────────
  await prisma.review.create({
    data: {
      id: uuidv4(),
      userId: user.id,
      studyHallId: createdHalls[0].id,
      rating: 5,
      comment: 'Absolutely loved this space! Super quiet, great wifi, and the coffee machine is a bonus.',
      tags: ['quiet', 'good wifi', 'clean', 'great coffee'],
      isVerified: true,
    },
  });
  console.log('✅ Sample review seeded');

  // ── Sample Notification ──────────────────────────────
  await prisma.notification.create({
    data: {
      id: uuidv4(),
      userId: user.id,
      type: 'SYSTEM',
      title: 'Welcome to ZYVO! 🎉',
      body: 'Start exploring study spaces near you and book your first session today.',
      isRead: false,
    },
  });
  console.log('✅ Sample notification seeded');

  // ── Favorite ──────────────────────────────────────────
  await prisma.favorite.create({
    data: {
      userId: user.id,
      studyHallId: createdHalls[0].id,
    },
  });
  console.log('✅ Favorite seeded');

  console.log('\n🎉 Database seeding completed successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('   Admin  → admin@zyvo.app   / Admin@123');
  console.log('   Owner  → owner@zyvo.app   / Owner@123');
  console.log('   User   → user@zyvo.app    / User@123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });

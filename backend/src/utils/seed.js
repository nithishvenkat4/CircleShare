require('dotenv').config();
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Listing = require('../models/Listing');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');
const Review = require('../models/Review');

const COLORS = ['#4F46E5', '#0EA5E9', '#059669', '#DB2777', '#EA580C', '#7C3AED', '#0891B2', '#CA8A04'];
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);
const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

async function seed() {
  await connectDB();
  console.log('[seed] Clearing existing data...');
  await Promise.all([
    User.deleteMany({}),
    Listing.deleteMany({}),
    Booking.deleteMany({}),
    Notification.deleteMany({}),
    Review.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash('password123', 10);
  const adminHash = await bcrypt.hash('admin123', 10);

  console.log('[seed] Creating users...');
  const users = await User.insertMany([
    { name: 'Admin', email: 'admin@circleshare.app', passwordHash: adminHash, role: 'admin', trustScore: 90, avatarColor: rand(COLORS), bio: 'Platform administrator' },
    { name: 'Aditi Sharma', email: 'aditi@circleshare.app', passwordHash, trustScore: 78, avatarColor: rand(COLORS), bio: 'CS senior, loves lending gadgets.' },
    { name: 'Rohan Mehta', email: 'rohan@circleshare.app', passwordHash, trustScore: 65, avatarColor: rand(COLORS), bio: 'Guitar tutor and photography enthusiast.' },
    { name: 'Priya Nair', email: 'priya@circleshare.app', passwordHash, trustScore: 82, avatarColor: rand(COLORS), bio: 'Design student, sells nothing, shares everything.' },
    { name: 'Karthik Iyer', email: 'karthik@circleshare.app', passwordHash, trustScore: 55, avatarColor: rand(COLORS), bio: 'Sports gear collector.' },
    { name: 'Sneha Reddy', email: 'sneha@circleshare.app', passwordHash, trustScore: 71, avatarColor: rand(COLORS), bio: 'Math tutor, textbook hoarder.' },
    { name: 'You', email: 'demo@circleshare.app', passwordHash, trustScore: 60, avatarColor: rand(COLORS), bio: 'Demo account for exploring CircleShare.' },
  ]);

  const [admin, aditi, rohan, priya, karthik, sneha, demo] = users;

  console.log('[seed] Creating listings...');
  const listingDefs = [
    { owner: aditi, title: 'Canon EOS 200D DSLR Camera', description: 'Great for club events and photography assignments. Comes with 18-55mm kit lens.', category: 'Electronics', type: 'lend', tags: ['camera', 'photography', 'dslr'] },
    { owner: aditi, title: 'Scientific Calculator (Casio fx-991EX)', description: 'Perfect for engineering exams. Barely used.', category: 'Electronics', type: 'lend', tags: ['calculator', 'exams'] },
    { owner: rohan, title: 'Acoustic Guitar Lessons', description: 'Beginner to intermediate guitar lessons, 1 hour sessions on campus.', category: 'Music', type: 'skill', tags: ['guitar', 'music', 'lessons'] },
    { owner: rohan, title: 'Yamaha Acoustic Guitar', description: 'Well-maintained guitar, available for weekend lending.', category: 'Music', type: 'lend', tags: ['guitar', 'instrument'] },
    { owner: priya, title: 'Figma UI Design Mentoring', description: 'Portfolio reviews and Figma basics for design projects.', category: 'Design', type: 'skill', tags: ['design', 'figma', 'ui'] },
    { owner: priya, title: 'Wacom Drawing Tablet', description: 'Small drawing tablet, ideal for digital illustration assignments.', category: 'Electronics', type: 'exchange', tags: ['tablet', 'drawing'] },
    { owner: karthik, title: 'Badminton Racket Set (2 rackets)', description: 'Yonex rackets with a tube of shuttles included.', category: 'Sports', type: 'lend', tags: ['badminton', 'sports'] },
    { owner: karthik, title: 'Cricket Kit (Bat + Pads)', description: 'Full kit, good for intramural matches.', category: 'Sports', type: 'lend', tags: ['cricket', 'sports'] },
    { owner: sneha, title: 'Linear Algebra Tutoring', description: 'Exam-focused tutoring, covers matrices, eigenvalues, vector spaces.', category: 'Tutoring', type: 'skill', tags: ['math', 'tutoring', 'exams'] },
    { owner: sneha, title: 'Engineering Mathematics Textbook Set', description: '3-volume set, semesters 1-3. Some highlighting inside.', category: 'Books', type: 'exchange', tags: ['textbook', 'math'] },
    { owner: admin, title: 'Club Projector (Epson)', description: 'For approved club events only. Book at least 2 days in advance.', category: 'Electronics', type: 'lend', tags: ['projector', 'events'] },
    { owner: aditi, title: 'Portable Bluetooth Speaker', description: 'JBL Flip, great battery life, good for dorm parties.', category: 'Electronics', type: 'lend', tags: ['speaker', 'audio'] },
    { owner: rohan, title: 'Basic Photo Editing (Lightroom)', description: 'Learn color grading and retouching basics in 2 sessions.', category: 'Design', type: 'skill', tags: ['photo', 'editing', 'lightroom'] },
    { owner: priya, title: 'Screwdriver & Repair Tool Kit', description: '32-piece precision kit, handy for laptop and gadget repairs.', category: 'Tools', type: 'lend', tags: ['tools', 'repair'] },
    { owner: karthik, title: 'Camping Tent (2-person)', description: 'Lightweight tent for trekking club trips.', category: 'Sports', type: 'exchange', tags: ['camping', 'outdoor'] },
    { owner: sneha, title: 'Data Structures Notes & Flashcards', description: 'Handwritten notes plus a flashcard deck covering trees, graphs, DP.', category: 'Books', type: 'exchange', tags: ['dsa', 'notes'] },
  ];

  const listings = await Listing.insertMany(
    listingDefs.map((l) => ({ ...l, owner: l.owner._id, accentColor: rand(COLORS), locationHint: 'Main Campus' }))
  );

  console.log('[seed] Creating bookings...');
  const bookingDefs = [
    { listing: listings[0], requester: demo, owner: aditi, status: 'completed', startDate: daysAgo(20), endDate: daysAgo(18) },
    { listing: listings[2], requester: demo, owner: rohan, status: 'approved', startDate: daysFromNow(2), endDate: daysFromNow(2) },
    { listing: listings[6], requester: demo, owner: karthik, status: 'pending', startDate: daysFromNow(5), endDate: daysFromNow(6) },
    { listing: listings[8], requester: priya, owner: sneha, status: 'completed', startDate: daysAgo(15), endDate: daysAgo(14) },
    { listing: listings[1], requester: karthik, owner: aditi, status: 'completed', startDate: daysAgo(10), endDate: daysAgo(9) },
    { listing: listings[3], requester: sneha, owner: rohan, status: 'rejected', startDate: daysAgo(8), endDate: daysAgo(7) },
    { listing: listings[10], requester: rohan, owner: admin, status: 'approved', startDate: daysFromNow(1), endDate: daysFromNow(1) },
    { listing: listings[13], requester: aditi, owner: priya, status: 'pending', startDate: daysFromNow(3), endDate: daysFromNow(4) },
    { listing: listings[9], requester: karthik, owner: sneha, status: 'completed', startDate: daysAgo(25), endDate: daysAgo(23) },
    { listing: listings[5], requester: demo, owner: priya, status: 'cancelled', startDate: daysAgo(5), endDate: daysAgo(4) },
    { listing: listings[11], requester: sneha, owner: aditi, status: 'completed', startDate: daysAgo(3), endDate: daysAgo(2) },
    { listing: listings[14], requester: priya, owner: karthik, status: 'pending', startDate: daysFromNow(7), endDate: daysFromNow(9) },
  ];

  const bookings = await Booking.insertMany(
    bookingDefs.map((b) => ({
      listing: b.listing._id,
      requester: b.requester._id,
      owner: b.owner._id,
      status: b.status,
      startDate: b.startDate,
      endDate: b.endDate,
      message: 'Looking forward to this!',
    }))
  );

  await Listing.findByIdAndUpdate(listings[0]._id, { status: 'completed' });
  await Listing.findByIdAndUpdate(listings[2]._id, { status: 'booked' });
  await Listing.findByIdAndUpdate(listings[10]._id, { status: 'booked' });

  console.log('[seed] Creating notifications...');
  const notifDefs = [];
  bookings.forEach((b, i) => {
    notifDefs.push({
      user: b.owner,
      type: 'booking_requested',
      message: `New request for "${bookingDefs[i].listing.title}"`,
      relatedBooking: b._id,
      read: Math.random() > 0.5,
      createdAt: b.createdAt,
    });
    if (b.status !== 'pending') {
      const typeMap = { approved: 'booking_approved', rejected: 'booking_rejected', completed: 'booking_completed', cancelled: 'booking_rejected' };
      notifDefs.push({
        user: b.requester,
        type: typeMap[b.status] || 'booking_approved',
        message: `Your request for "${bookingDefs[i].listing.title}" is now ${b.status}`,
        relatedBooking: b._id,
        read: Math.random() > 0.6,
        createdAt: b.createdAt,
      });
    }
  });
  await Notification.insertMany(notifDefs);

  console.log('[seed] Creating reviews...');
  const completed = bookings.filter((b) => b.status === 'completed');
  const reviewDefs = completed.map((b) => ({
    booking: b._id,
    reviewer: b.requester,
    reviewee: b.owner,
    rating: 4 + Math.round(Math.random()),
    comment: 'Smooth exchange, would borrow again!',
  }));
  await Review.insertMany(reviewDefs);

  console.log('[seed] Done!');
  console.log('----------------------------------------------------');
  console.log('Demo credentials:');
  console.log('  Admin:  admin@circleshare.app / admin123');
  console.log('  User:   demo@circleshare.app  / password123');
  console.log('  (all other seeded users also use password123)');
  console.log('----------------------------------------------------');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});

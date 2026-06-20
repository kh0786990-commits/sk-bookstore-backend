const { sequelize, User, Category, Settings, AdUnit } = require('./models');
const bcrypt = require('bcryptjs');

require('dotenv').config();

const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Connect to database
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Sync database
    await sequelize.sync({ force: true });
    console.log('Database synchronized.');

    // Create default admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      email: 'admin@bookstory.com',
      password: adminPassword,
      name: 'S.K Admin',
      role: 'super_admin',
      isVerified: true,
      isActive: true
    });
    console.log('Admin user created:', admin.email);

    // Create default categories (Fixed: Added Slugs)
    const categories = [
      { name: 'Fiction', slug: 'fiction', description: 'Fiction books and novels', order: 1, isActive: true },
      { name: 'Non-Fiction', slug: 'non-fiction', description: 'Non-fiction and educational books', order: 2, isActive: true },
      { name: 'Science Fiction', slug: 'science-fiction', description: 'Science fiction and fantasy', order: 3, isActive: true },
      { name: 'Mystery', slug: 'mystery', description: 'Mystery and thriller books', order: 4, isActive: true },
      { name: 'Romance', slug: 'romance', description: 'Romance novels', order: 5, isActive: true },
      { name: 'Self-Help', slug: 'self-help', description: 'Self-improvement and motivation', order: 6, isActive: true },
      { name: 'Business', slug: 'business', description: 'Business and finance', order: 7, isActive: true },
      { name: 'Technology', slug: 'technology', description: 'Technology and programming', order: 8, isActive: true },
      { name: 'History', slug: 'history', description: 'Historical books', order: 9, isActive: true },
      { name: 'Biography', slug: 'biography', description: 'Biographies and memoirs', order: 10, isActive: true }
    ];

    for (const category of categories) {
      await Category.create(category);
    }
    console.log(`${categories.length} categories created.`);

    // Create default settings
    const defaultSettings = [
      {
        key: 'siteName',
        value: { value: 'S.K Book Store' },
        category: 'general',
        description: 'Site name displayed in header and titles',
        isPublic: true
      },
      {
        key: 'siteDescription',
        value: { value: 'Your Ultimate eBook Store' },
        category: 'general',
        description: 'Site description for SEO',
        isPublic: true
      },
      {
        key: 'contactEmail',
        value: { value: 'support@skbookstore.com' },
        category: 'general',
        description: 'Contact email for support',
        isPublic: true
      },
      {
        key: 'enableRegistration',
        value: { value: true },
        category: 'general',
        description: 'Allow new user registration',
        isPublic: false
      },
      {
        key: 'currency',
        value: { value: 'USD' },
        category: 'payment',
        description: 'Default currency for payments',
        isPublic: true
      },
      {
        key: 'enablePurchases',
        value: { value: true },
        category: 'payment',
        description: 'Enable book purchases',
        isPublic: false
      },
      {
        key: 'enableFreeBooks',
        value: { value: true },
        category: 'features',
        description: 'Allow free books in the store',
        isPublic: true
      },
      {
        key: 'enableReviews',
        value: { value: true },
        category: 'features',
        description: 'Enable user reviews and ratings',
        isPublic: true
      },
      {
        key: 'enableAnalytics',
        value: { value: true },
        category: 'features',
        description: 'Enable analytics tracking',
        isPublic: false
      }
    ];

    for (const setting of defaultSettings) {
      await Settings.create(setting);
    }
    console.log(`${defaultSettings.length} default settings created.`);

    // Create default ad units for Android
    const defaultAdUnits = [
      {
        name: 'Android Banner Ad - Footer',
        type: 'banner',
        platform: 'android',
        adUnitId: 'ca-app-pub-3940256099942544/6300978111',
        description: 'Banner ad shown at the bottom of screens',
        placement: 'footer',
        isActive: true,
        priority: 10,
        frequency: 1,
        createdBy: admin.id
      },
      {
        name: 'Android Interstitial Ad - Book Open',
        type: 'interstitial',
        platform: 'android',
        adUnitId: 'ca-app-pub-3940256099942544/1033173712',
        description: 'Interstitial ad shown when opening a book',
        placement: 'book_open',
        isActive: true,
        priority: 8,
        frequency: 1,
        createdBy: admin.id
      },
      {
        name: 'Android Rewarded Ad - Every 10 Pages',
        type: 'rewarded',
        platform: 'android',
        adUnitId: 'ca-app-pub-3940256099942544/5224354917',
        description: 'Rewarded ad shown every 10 pages while reading',
        placement: 'page_turn',
        isActive: true,
        priority: 5,
        frequency: 10,
        createdBy: admin.id
      },
      {
        name: 'Android Banner Ad - Reader Bottom',
        type: 'banner',
        platform: 'android',
        adUnitId: 'ca-app-pub-3940256099942544/6300978111',
        description: 'Banner ad shown at the bottom of the reader',
        placement: 'reader_bottom',
        isActive: true,
        priority: 9,
        frequency: 1,
        createdBy: admin.id
      },
      {
        name: 'Android Native Ad - Home Screen',
        type: 'native',
        platform: 'android',
        adUnitId: 'ca-app-pub-3940256099942544/2247696110',
        description: 'Native ad shown on the home screen',
        placement: 'home_screen',
        isActive: true,
        priority: 7,
        frequency: 1,
        createdBy: admin.id
      }
    ];

    for (const adUnit of defaultAdUnits) {
      await AdUnit.create(adUnit);
    }
    console.log(`${defaultAdUnits.length} default ad units created.`);

    console.log('Database seeding completed successfully!');
    console.log('\n=== Default Credentials ===');
    console.log('Email: admin@bookstory.com');
    console.log('Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
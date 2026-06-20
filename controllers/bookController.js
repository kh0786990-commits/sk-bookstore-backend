const { Book, User, Category, Review, Purchase } = require('../models');
const { Op } = require('sequelize');
const cloudinary = require('cloudinary');
const fs = require('fs');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Upload image to Cloudinary
const uploadToCloudinary = async (filePath, folder = 'books') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: `book-story/${folder}`,
      resource_type: 'auto'
    });
    
    // Delete local file after upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return result.secure_url;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

// Get all books (public)
exports.getAllBooks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      category = '',
      author = '',
      sort = 'newest',
      minPrice = 0,
      maxPrice = 1000,
      isFree = null,
      isFeatured = null,
      isPremium = null
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where clause
    const where = {
      status: 'published',
      price: { [Op.between]: [minPrice, maxPrice] }
    };

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { author: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (category) {
      where.categories = { [Op.contains]: [category] };
    }

    if (author) {
      where.author = { [Op.iLike]: `%${author}%` };
    }

    if (isFree !== null) {
      where.isFree = isFree === 'true';
    }

    if (isFeatured !== null) {
      where.isFeatured = isFeatured === 'true';
    }

    if (isPremium !== null) {
      where.isPremium = isPremium === 'true';
    }

    // Determine sort order
    let order = [];
    switch (sort) {
      case 'oldest':
        order = [['createdAt', 'ASC']];
        break;
      case 'popular':
        order = [['downloadsCount', 'DESC']];
        break;
      case 'rating':
        order = [['rating', 'DESC']];
        break;
      case 'price-low':
        order = [['price', 'ASC']];
        break;
      case 'price-high':
        order = [['price', 'DESC']];
        break;
      case 'title':
        order = [['title', 'ASC']];
        break;
      default:
        order = [['createdAt', 'DESC']];
    }

    const { count, rows } = await Book.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order,
      include: [
        {
          model: Category,
          as: 'categories_list',
          attributes: ['id', 'name', 'slug']
        }
      ]
    });

    res.json({
      status: 'success',
      data: {
        books: rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get single book by ID
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'categories_list',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['name', 'avatar']
        },
        {
          model: Review,
          as: 'reviews',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['name', 'avatar']
            }
          ],
          limit: 10,
          order: [['createdAt', 'DESC']]
        }
      ]
    });

    if (!book) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found'
      });
    }

    // Increment view count
    book.viewsCount++;
    await book.save();

    res.json({
      status: 'success',
      data: { book }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Create new book (admin only)
exports.createBook = async (req, res) => {
  try {
    const bookData = req.body;
    bookData.createdBy = req.user.id;
    bookData.status = 'draft';

    // Handle file uploads
    if (req.files) {
      if (req.files.book) {
        const bookFile = req.files.book[0];
        bookData.fileUrl = await uploadToCloudinary(bookFile.path, 'books');
        bookData.fileSize = bookFile.size;
        bookData.fileType = bookFile.originalname.split('.').pop().toLowerCase();
      }

      if (req.files.cover) {
        const coverFiles = req.files.cover;
        const coverUrls = await Promise.all(
          coverFiles.map(file => uploadToCloudinary(file.path, 'covers'))
        );
        bookData.coverImage = coverUrls[0];
        bookData.coverImages = coverUrls;
      }
    }

    const book = await Book.create(bookData);

    res.status(201).json({
      status: 'success',
      message: 'Book created successfully',
      data: { book }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Update book (admin only)
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const book = await Book.findByPk(id);
    if (!book) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found'
      });
    }

    // Handle file uploads
    if (req.files) {
      if (req.files.book) {
        const bookFile = req.files.book[0];
        updates.fileUrl = await uploadToCloudinary(bookFile.path, 'books');
        updates.fileSize = bookFile.size;
        updates.fileType = bookFile.originalname.split('.').pop().toLowerCase();
      }

      if (req.files.cover) {
        const coverFiles = req.files.cover;
        const coverUrls = await Promise.all(
          coverFiles.map(file => uploadToCloudinary(file.path, 'covers'))
        );
        updates.coverImage = coverUrls[0];
        updates.coverImages = coverUrls;
      }
    }

    updates.updatedBy = req.user.id;
    await book.update(updates);

    res.json({
      status: 'success',
      message: 'Book updated successfully',
      data: { book }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete book (admin only)
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findByPk(id);
    if (!book) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found'
      });
    }

    await book.update({ status: 'deleted' });

    res.json({
      status: 'success',
      message: 'Book deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get featured books
exports.getFeaturedBooks = async (req, res) => {
  try {
    const books = await Book.findAll({
      where: {
        status: 'published',
        isFeatured: true
      },
      limit: 10,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: { books }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get bestseller books
exports.getBestsellerBooks = async (req, res) => {
  try {
    const books = await Book.findAll({
      where: {
        status: 'published',
        isBestseller: true
      },
      limit: 10,
      order: [['purchasesCount', 'DESC']]
    });

    res.json({
      status: 'success',
      data: { books }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Get new arrivals
exports.getNewArrivals = async (req, res) => {
  try {
    const books = await Book.findAll({
      where: {
        status: 'published',
        isNew: true
      },
      limit: 10,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: { books }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Search books
exports.searchBooks = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.length < 2) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query must be at least 2 characters long'
      });
    }

    const books = await Book.findAll({
      where: {
        status: 'published',
        [Op.or]: [
          { title: { [Op.iLike]: `%${q}%` } },
          { author: { [Op.iLike]: `%${q}%` } },
          { description: { [Op.iLike]: `%${q}%` } },
          { tags: { [Op.contains]: [q] } }
        ]
      },
      limit: 20
    });

    res.json({
      status: 'success',
      data: { books }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Download book
exports.downloadBook = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user ? req.user.id : null;

    const book = await Book.findByPk(id);
    if (!book) {
      return res.status(404).json({
        status: 'error',
        message: 'Book not found'
      });
    }

    // Check if user has purchased or book is free
    if (!book.isFree && userId) {
      const purchase = await Purchase.findOne({
        where: {
          userId,
          bookId: id,
          paymentStatus: 'completed'
        }
      });

      if (!purchase && !book.isFree) {
        return res.status(403).json({
          status: 'error',
          message: 'You need to purchase this book to download it'
        });
      }
    }

    // Increment download count
    book.downloadsCount++;
    await book.save();

    res.json({
      status: 'success',
      data: {
        downloadUrl: book.fileUrl,
        fileType: book.fileType
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

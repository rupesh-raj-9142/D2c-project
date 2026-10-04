import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getProducts(req: Request, res: Response) {
  try {
    const {
      search,
      category,
      minPrice,
      maxPrice,
      rating,
      spiceLevel,
      bestseller,
      featured,
      sortBy = 'popular',
      page = '1',
      limit = '50'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    // 1. Search filter
    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { hindiName: { contains: q, mode: 'insensitive' } },
        { tagline: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } }
      ];
    }

    // 2. Category filter
    if (category && typeof category === 'string' && category !== 'all') {
      where.category = {
        OR: [
          { slug: category },
          { id: category }
        ]
      };
    }

    // 3. Spice Level filter
    if (spiceLevel && typeof spiceLevel === 'string' && spiceLevel !== 'all') {
      where.spiceLevel = { contains: spiceLevel, mode: 'insensitive' };
    }

    // 4. Rating filter
    if (rating) {
      const minRating = parseFloat(rating as string);
      if (!isNaN(minRating)) {
        where.rating = { gte: minRating };
      }
    }

    // 5. Flags
    if (bestseller === 'true') {
      where.isBestseller = true;
    }
    if (featured === 'true') {
      where.isFeatured = true;
    }

    // 6. Price filter on variants
    if (minPrice || maxPrice) {
      where.variants = {
        some: {
          ...(minPrice ? { price: { gte: parseFloat(minPrice as string) } } : {}),
          ...(maxPrice ? { price: { lte: parseFloat(maxPrice as string) } } : {})
        }
      };
    }

    // 7. Sorting
    let orderBy: any = { reviewsCount: 'desc' };
    if (sortBy === 'rating') {
      orderBy = { rating: 'desc' };
    } else if (sortBy === 'newest') {
      orderBy = { createdAt: 'desc' };
    } else if (sortBy === 'price-low') {
      orderBy = { variants: { _count: 'asc' } }; // will refine in-memory sorting
    } else if (sortBy === 'price-high') {
      orderBy = { variants: { _count: 'desc' } };
    }

    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: {
            select: { id: true, name: true, slug: true, hindiName: true }
          },
          variants: {
            orderBy: { price: 'asc' }
          },
          images: {
            orderBy: { sortOrder: 'asc' }
          }
        },
        skip,
        take: limitNum,
        orderBy
      }),
      prisma.product.count({ where })
    ]);

    // Format products with frontend-compatible properties
    const formatted = products.map((p) => {
      const primaryImage = p.images.find((img) => img.isPrimary)?.url || p.images[0]?.url || '/assets/images/hero-pickle.jpg';
      const gallery = p.images.map((img) => img.url);

      return {
        id: p.slug, // UI identifies product by slug (e.g. 'laxmi-mango')
        dbId: p.id,
        name: p.name,
        hindiName: p.hindiName || '',
        category: p.category.slug.replace('-pickle', ''),
        tagline: p.tagline || '',
        description: p.description,
        rating: p.rating,
        reviewsCount: p.reviewsCount,
        spiceLevel: p.spiceLevel,
        shelfLife: p.shelfLife,
        badges: p.badges,
        isBestseller: p.isBestseller,
        isFeatured: p.isFeatured,
        image: primaryImage,
        gallery: gallery.length > 0 ? gallery : [primaryImage],
        weights: p.variants.map((v) => ({
          id: v.id,
          weight: v.weight,
          price: v.price,
          originalPrice: v.originalPrice || v.price,
          discount: v.discount || '',
          sku: v.sku,
          stock: v.stock
        })),
        ingredients: p.ingredients,
        nutrition: p.nutrition,
        storage: p.storage,
        deliveryInfo: p.deliveryInfo
      };
    });

    // In-memory sorting for price if selected
    if (sortBy === 'price-low') {
      formatted.sort((a, b) => (a.weights[0]?.price || 0) - (b.weights[0]?.price || 0));
    } else if (sortBy === 'price-high') {
      formatted.sort((a, b) => (b.weights[0]?.price || 0) - (a.weights[0]?.price || 0));
    }

    return sendSuccess(
      res,
      {
        products: formatted,
        pagination: {
          total: totalCount,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(totalCount / limitNum)
        }
      },
      'Products retrieved successfully'
    );
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to fetch products', 500);
  }
}

export async function getProductById(req: Request, res: Response) {
  try {
    const id = req.params.id as string;

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id }, { slug: id }]
      },
      include: {
        category: true,
        variants: { orderBy: { price: 'asc' } },
        images: { orderBy: { sortOrder: 'asc' } },
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { name: true } } }
        }
      }
    });

    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    const primaryImage = product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url || '/assets/images/hero-pickle.jpg';
    const gallery = product.images.map((img) => img.url);

    const formatted = {
      id: product.slug,
      dbId: product.id,
      name: product.name,
      hindiName: product.hindiName || '',
      category: product.category.slug.replace('-pickle', ''),
      tagline: product.tagline || '',
      description: product.description,
      rating: product.rating,
      reviewsCount: product.reviewsCount,
      spiceLevel: product.spiceLevel,
      shelfLife: product.shelfLife,
      badges: product.badges,
      isBestseller: product.isBestseller,
      isFeatured: product.isFeatured,
      image: primaryImage,
      gallery: gallery.length > 0 ? gallery : [primaryImage],
      weights: product.variants.map((v) => ({
        id: v.id,
        weight: v.weight,
        price: v.price,
        originalPrice: v.originalPrice || v.price,
        discount: v.discount || '',
        sku: v.sku,
        stock: v.stock
      })),
      ingredients: product.ingredients,
      nutrition: product.nutrition,
      storage: product.storage,
      deliveryInfo: product.deliveryInfo,
      reviews: product.reviews
    };

    return sendSuccess(res, formatted, 'Product details loaded');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to fetch product', 500);
  }
}

export async function getProductBySlug(req: Request, res: Response) {
  return getProductById(req, res);
}

// Admin: Create product
export async function createProduct(req: Request, res: Response) {
  try {
    const data = req.body;

    const product = await prisma.product.create({
      data: {
        name: data.name,
        hindiName: data.hindiName,
        slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        categoryId: data.categoryId,
        tagline: data.tagline,
        description: data.description,
        ingredients: data.ingredients || [],
        nutrition: data.nutrition,
        storage: data.storage,
        deliveryInfo: data.deliveryInfo,
        spiceLevel: data.spiceLevel || 'Medium Spicy',
        shelfLife: data.shelfLife || '12 Months',
        badges: data.badges || [],
        isBestseller: !!data.isBestseller,
        isFeatured: !!data.isFeatured,
        variants: {
          create: (data.variants || []).map((v: any) => ({
            weight: v.weight,
            price: parseFloat(v.price),
            originalPrice: v.originalPrice ? parseFloat(v.originalPrice) : null,
            discount: v.discount,
            sku: v.sku || `LX-${Math.random().toString(36).substring(7).toUpperCase()}`,
            stock: v.stock ? parseInt(v.stock, 10) : 100
          }))
        },
        images: {
          create: (data.images || []).map((img: any, i: number) => ({
            url: typeof img === 'string' ? img : img.url,
            isPrimary: i === 0,
            sortOrder: i
          }))
        }
      },
      include: { variants: true, images: true }
    });

    return sendSuccess(res, product, 'Product created successfully', 201);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to create product', 500);
  }
}

// Admin: Update product
export async function updateProduct(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const data = req.body;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.hindiName ? { hindiName: data.hindiName } : {}),
        ...(data.tagline ? { tagline: data.tagline } : {}),
        ...(data.description ? { description: data.description } : {}),
        ...(data.ingredients ? { ingredients: data.ingredients } : {}),
        ...(data.spiceLevel ? { spiceLevel: data.spiceLevel } : {}),
        ...(data.shelfLife ? { shelfLife: data.shelfLife } : {}),
        ...(data.isBestseller !== undefined ? { isBestseller: data.isBestseller } : {}),
        ...(data.isFeatured !== undefined ? { isFeatured: data.isFeatured } : {})
      },
      include: { variants: true, images: true }
    });

    return sendSuccess(res, updated, 'Product updated successfully');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to update product', 500);
  }
}

// Admin: Delete product
export async function deleteProduct(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    await prisma.product.delete({
      where: { id }
    });
    return sendSuccess(res, null, 'Product deleted successfully');
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to delete product', 500);
  }
}

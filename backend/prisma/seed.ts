import { PrismaClient, Role, CouponType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed for LAXMI D2C...');

  // 1. Clean existing records in safe order
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.address.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Users
  const adminHashedPassword = await bcrypt.hash('Admin@12345', 10);
  const customerHashedPassword = await bcrypt.hash('Customer@12345', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Laxmi Admin',
      email: 'admin@laxmipickles.com',
      password: adminHashedPassword,
      phone: '+91 98765 00000',
      role: Role.ADMIN
    }
  });

  const customer = await prisma.user.create({
    data: {
      name: 'Aditi Sharma',
      email: 'aditi.sharma@gmail.com',
      password: customerHashedPassword,
      phone: '9811234567',
      role: Role.CUSTOMER
    }
  });

  // Customer default address
  await prisma.address.create({
    data: {
      userId: customer.id,
      fullName: 'Aditi Sharma',
      phone: '9811234567',
      addressLine1: 'Flat 402, Heritage Residency',
      addressLine2: 'Sector 14, Near City Mall',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      landmark: 'Opposite State Bank',
      isDefault: true
    }
  });

  // 3. Seed Categories
  const categoriesData = [
    {
      id: 'mango',
      name: 'Mango Pickle',
      hindiName: 'आम का अचार',
      slug: 'mango-pickle',
      shortDesc: 'Sun-cured raw Ramkela mangoes in cold-pressed mustard oil with heirloom spices.',
      image: '/assets/images/mango-pickle.jpg',
      tag: 'All Time Favourite'
    },
    {
      id: 'lemon',
      name: 'Lemon Pickle',
      hindiName: 'नींबू का अचार',
      slug: 'lemon-pickle',
      shortDesc: 'Juicy Kagzi limes slow-cured with rock salt, ajwain and digestive warming spices.',
      image: '/assets/images/lemon-pickle.jpg',
      tag: 'Digestive & Tangy'
    },
    {
      id: 'green-chilli',
      name: 'Green Chilli Pickle',
      hindiName: 'हरी मिर्च का अचार',
      slug: 'green-chilli-pickle',
      shortDesc: 'Crisp green chillies hand-slit and packed with stone-ground rai and amchur.',
      image: '/assets/images/chilli-pickle.jpg',
      tag: 'Fiery & Bold'
    },
    {
      id: 'mixed',
      name: 'Mixed Pickle',
      hindiName: 'पचरंगा अचार',
      slug: 'mixed-pickle',
      shortDesc: 'Celebratory blend of crunchy seasonal vegetables marinated in Punjabi masala.',
      image: '/assets/images/mixed-pickle.jpg',
      tag: 'Grandmother Recipe'
    },
    {
      id: 'garlic',
      name: 'Garlic Pickle',
      hindiName: 'लहसुन का अचार',
      slug: 'garlic-pickle',
      shortDesc: 'Whole aromatic garlic cloves steeped in Kashmiri red chilli and mustard gravy.',
      image: '/assets/images/garlic-pickle.jpg',
      tag: 'Rich & Therapeutic'
    },
    {
      id: 'combos',
      name: 'Combos',
      hindiName: 'अल्टीमेट कॉम्बो',
      slug: 'combos',
      shortDesc: 'Artisanal gift boxes with signature handcrafted favourites.',
      image: '/assets/images/combo-box.jpg',
      tag: 'Best Value'
    },
    {
      id: 'regional',
      name: 'Special Regional Pickles',
      hindiName: 'क्षेत्रीय विशेषताएं',
      slug: 'regional-pickles',
      shortDesc: 'Rare heirloom recipes from Bihar, Rajasthan, Gujarat, North & South India.',
      image: '/assets/images/hero-pickle.jpg',
      tag: 'Heritage Treasures'
    }
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const created = await prisma.category.create({
      data: {
        name: cat.name,
        hindiName: cat.hindiName,
        slug: cat.slug,
        shortDesc: cat.shortDesc,
        image: cat.image,
        tag: cat.tag
      }
    });
    categoryMap.set(cat.id, created.id);
  }

  // 4. Seed Products with Variants and Images
  const productsData = [
    {
      slug: 'laxmi-mango',
      name: 'LAXMI Classic Mango Pickle',
      hindiName: 'लक्ष्मी पारंपरिक आम का अचार',
      categoryId: categoryMap.get('mango')!,
      tagline: 'Sun-cured with sour Ramkela mangoes & pure cold-pressed mustard oil',
      description: 'Our crown jewel. Handcrafted strictly following a 60-year-old family recipe. Fresh raw Ramkela mangoes are hand-cut, tossed with aromatic whole spices dry-roasted on slow fire, and submerged in pure cold-pressed (kacchi ghani) mustard oil. Cured naturally in glazed ceramic martabans under warm Indian sunlight.',
      ingredients: [
        'Raw Green Mangoes (68%)',
        'Cold-Pressed Kacchi Ghani Mustard Oil',
        'Yellow & Black Mustard Seeds (Rai)',
        'Fenugreek Seeds (Methi)',
        'Fennel Seeds (Saunf)',
        'Kashmiri Red Chilli',
        'Turmeric Powder (Haldi)',
        'Rock Salt (Sendha Namak)',
        'Asafoetida (Hing)'
      ],
      nutrition: {
        servingSize: '100g',
        energy: '174 kcal',
        protein: '2.1g',
        carbs: '9.4g',
        fat: '14.2g',
        sodium: '4600mg'
      },
      storage: 'Store in a cool, dry place. Always use a clean, dry spoon. Ensure a thin layer of mustard oil covers the pickle surface to keep it fresh for over a year.',
      deliveryInfo: 'Dispatched within 24 hours. Delivered across India in 2-4 business days in tamper-proof shatter-resistant packaging.',
      spiceLevel: 'Medium Spicy',
      shelfLife: '12 Months',
      badges: ['Bestseller', 'Sun-Matured'],
      isBestseller: true,
      isFeatured: true,
      rating: 4.8,
      reviewsCount: 1420,
      images: [
        { url: '/assets/images/mango-pickle.jpg', isPrimary: true },
        { url: '/assets/images/hero-pickle.jpg', isPrimary: false },
        { url: '/assets/images/brand-story.jpg', isPrimary: false }
      ],
      variants: [
        { weight: '250g', price: 199, originalPrice: 249, discount: '20% OFF', sku: 'LX-MNG-250', stock: 150 },
        { weight: '500g', price: 369, originalPrice: 459, discount: '20% OFF', sku: 'LX-MNG-500', stock: 120 },
        { weight: '1kg', price: 699, originalPrice: 899, discount: '22% OFF', sku: 'LX-MNG-1KG', stock: 80 }
      ]
    },
    {
      slug: 'laxmi-lemon',
      name: 'LAXMI Traditional Lemon Pickle',
      hindiName: 'लक्ष्मी खट्टा-मीठा नींबू का अचार',
      categoryId: categoryMap.get('lemon')!,
      tagline: 'Juicy Kagzi limes slow-cured with rock salt & digestive herbs',
      description: 'Thin-skinned Kagzi limes quartered and cured in their own juices along with rock salt, toasted ajwain, black salt, and freshly cracked black pepper. The lime peel softens to melt-in-the-mouth perfection over weeks of sun-basking. A time-tested digestive accompaniment for heavy festive meals.',
      ingredients: [
        'Fresh Kagzi Lemons (72%)',
        'Sendha Namak (Rock Salt)',
        'Black Salt (Kala Namak)',
        'Toasted Carom Seeds (Ajwain)',
        'Coarsely Ground Black Pepper',
        'Kashmiri Red Chilli Flakes',
        'Turmeric',
        'Roasted Cumin (Jeera)'
      ],
      nutrition: {
        servingSize: '100g',
        energy: '118 kcal',
        protein: '1.6g',
        carbs: '12.8g',
        fat: '6.9g',
        sodium: '4900mg'
      },
      storage: 'Store in airtight jar. Does not require refrigeration. Grows darker, softer, and richer in medicinal value with age.',
      deliveryInfo: 'Fast dispatch within 24 hours in secure bubble-wrap safety packaging.',
      spiceLevel: 'Tangy & Mild',
      shelfLife: '18 Months',
      badges: ['Digestive', 'Heirloom'],
      isBestseller: true,
      isFeatured: true,
      rating: 4.7,
      reviewsCount: 980,
      images: [
        { url: '/assets/images/lemon-pickle.jpg', isPrimary: true },
        { url: '/assets/images/hero-pickle.jpg', isPrimary: false },
        { url: '/assets/images/combo-box.jpg', isPrimary: false }
      ],
      variants: [
        { weight: '250g', price: 179, originalPrice: 219, discount: '18% OFF', sku: 'LX-LMN-250', stock: 140 },
        { weight: '500g', price: 329, originalPrice: 399, discount: '18% OFF', sku: 'LX-LMN-500', stock: 110 },
        { weight: '1kg', price: 629, originalPrice: 779, discount: '19% OFF', sku: 'LX-LMN-1KG', stock: 65 }
      ]
    },
    {
      slug: 'laxmi-chilli',
      name: 'LAXMI Green Chilli Pickle',
      hindiName: 'लक्ष्मी तीखी हरी मिर्च का अचार',
      categoryId: categoryMap.get('green-chilli')!,
      tagline: 'Crunchy farm-fresh chillies stuffed with tangy mustard masala',
      description: 'For lovers of pure, authentic heat. Crisp spicy green chillies are hand-slit and filled with coarse stone-ground mustard seeds (rai kuria), tangy dry mango powder (amchur), kalonji, and pungent cold-pressed mustard oil. The crunch remains intact while soaking up deep spicy flavours.',
      ingredients: [
        'Fresh Green Chillies (65%)',
        'Cold-Pressed Mustard Oil',
        'Crushed Mustard Seeds (Rai Dal)',
        'Dry Mango Powder (Amchur)',
        'Fennel Seeds (Saunf)',
        'Kalonji (Nigella Seeds)',
        'Turmeric',
        'Iodised Salt',
        'Hing (Compounded Asafoetida)'
      ],
      nutrition: {
        servingSize: '100g',
        energy: '185 kcal',
        protein: '2.4g',
        carbs: '8.2g',
        fat: '15.8g',
        sodium: '4400mg'
      },
      storage: 'Keep in a cool dry place. Keep jar well-sealed to preserve crisp texture and aroma.',
      deliveryInfo: 'Delivered in 2-4 business days across India.',
      spiceLevel: 'Extra Spicy',
      shelfLife: '9 Months',
      badges: ['Fiery Punch', 'Customer Love'],
      isBestseller: true,
      isFeatured: true,
      rating: 4.8,
      reviewsCount: 850,
      images: [
        { url: '/assets/images/chilli-pickle.jpg', isPrimary: true },
        { url: '/assets/images/hero-pickle.jpg', isPrimary: false },
        { url: '/assets/images/brand-story.jpg', isPrimary: false }
      ],
      variants: [
        { weight: '250g', price: 189, originalPrice: 229, discount: '17% OFF', sku: 'LX-CHL-250', stock: 120 },
        { weight: '500g', price: 349, originalPrice: 429, discount: '19% OFF', sku: 'LX-CHL-500', stock: 95 },
        { weight: '1kg', price: 659, originalPrice: 799, discount: '18% OFF', sku: 'LX-CHL-1KG', stock: 70 }
      ]
    },
    {
      slug: 'laxmi-mixed',
      name: 'LAXMI Mixed Pickle (Pachranga)',
      hindiName: 'लक्ष्मी शाही पचरंगा मिक्स अचार',
      categoryId: categoryMap.get('mixed')!,
      tagline: 'Hand-cut mango, carrot, lime, cauliflower & lotus stem in rich Punjabi spices',
      description: 'An Indian culinary masterpiece. A vibrant harmony of crunchy winter carrots, garden cauliflower florets, tender lotus stem (kamal kakdi), raw mango slivers, and zesty lime wedges. Marinated with slow-toasted fenugreek, coriander seeds, and fragrant mustard oil. Every spoonful offers a new texture.',
      ingredients: [
        'Mixed Vegetables (Mango, Carrot, Lime, Cauliflower, Lotus Stem - 70%)',
        'Kacchi Ghani Mustard Oil',
        'Fenugreek Seeds (Methi)',
        'Nigella Seeds (Kalonji)',
        'Yellow Mustard Seeds',
        'Red Chilli Powder',
        'Turmeric',
        'Rock Salt',
        'Pure Spices'
      ],
      nutrition: {
        servingSize: '100g',
        energy: '165 kcal',
        protein: '2.3g',
        carbs: '11.1g',
        fat: '12.5g',
        sodium: '4500mg'
      },
      storage: 'Keep at room temperature away from direct humidity. Mix gently before serving.',
      deliveryInfo: 'Express delivery available. Free delivery on orders over ₹499.',
      spiceLevel: 'Medium Spicy',
      shelfLife: '12 Months',
      badges: ['Top Rated', 'Grandma’s Special'],
      isBestseller: true,
      isFeatured: true,
      rating: 4.9,
      reviewsCount: 2150,
      images: [
        { url: '/assets/images/mixed-pickle.jpg', isPrimary: true },
        { url: '/assets/images/combo-box.jpg', isPrimary: false },
        { url: '/assets/images/hero-pickle.jpg', isPrimary: false }
      ],
      variants: [
        { weight: '250g', price: 199, originalPrice: 249, discount: '20% OFF', sku: 'LX-MIX-250', stock: 160 },
        { weight: '500g', price: 369, originalPrice: 459, discount: '20% OFF', sku: 'LX-MIX-500', stock: 130 },
        { weight: '1kg', price: 699, originalPrice: 899, discount: '22% OFF', sku: 'LX-MIX-1KG', stock: 90 }
      ]
    },
    {
      slug: 'laxmi-garlic',
      name: 'LAXMI Artisanal Garlic Pickle',
      hindiName: 'लक्ष्मी देसी लहसुन का अचार',
      categoryId: categoryMap.get('garlic')!,
      tagline: 'Plump cloves of desi garlic slow-steeped in rich Kashmiri chilli oil',
      description: 'Whole country garlic cloves gently softened and steeped in cold-pressed mustard oil with roasted fenugreek, cracked mustard, and fragrant hing. Known for its therapeutic heart benefits and deeply satisfying, warm umami flavour. Elevated comfort food alongside warm rotis or dal khichdi.',
      ingredients: [
        'Peeled Desi Garlic (66%)',
        'Pure Mustard Oil',
        'Kashmiri Chilli Powder',
        'Cracked Mustard Seeds',
        'Fenugreek Seeds',
        'Turmeric',
        'Lemon Juice',
        'Rock Salt',
        'Hing'
      ],
      nutrition: {
        servingSize: '100g',
        energy: '198 kcal',
        protein: '4.2g',
        carbs: '15.6g',
        fat: '13.8g',
        sodium: '4100mg'
      },
      storage: 'Store in a dry cupboard. Use dry spoon only. Re-seal cap tightly.',
      deliveryInfo: 'Fast dispatch within 24 hours in tamper-evident glass jar packaging.',
      spiceLevel: 'Spicy & Robust',
      shelfLife: '12 Months',
      badges: ['Immunity Booster', 'Aromatic'],
      isBestseller: false,
      isFeatured: true,
      rating: 4.8,
      reviewsCount: 720,
      images: [
        { url: '/assets/images/garlic-pickle.jpg', isPrimary: true },
        { url: '/assets/images/hero-pickle.jpg', isPrimary: false },
        { url: '/assets/images/mixed-pickle.jpg', isPrimary: false }
      ],
      variants: [
        { weight: '250g', price: 219, originalPrice: 269, discount: '19% OFF', sku: 'LX-GAR-250', stock: 100 },
        { weight: '500g', price: 399, originalPrice: 499, discount: '20% OFF', sku: 'LX-GAR-500', stock: 80 },
        { weight: '1kg', price: 749, originalPrice: 949, discount: '21% OFF', sku: 'LX-GAR-1KG', stock: 50 }
      ]
    },
    {
      slug: 'laxmi-ultimate-combo',
      name: 'The Ultimate Achar Combo (4 Jars Box)',
      hindiName: 'लक्ष्मी अल्टीमेट अचार कॉम्बो बॉक्स',
      categoryId: categoryMap.get('combos')!,
      tagline: '4 Handcrafted Flavours in a Royal Gift Box • Mango, Lemon, Chilli & Mixed',
      description: 'Experience the entire heritage of LAXMI pickles in one magnificent presentation box. Includes our signature quartet: Classic Mango Pickle, Traditional Tangy Lemon Pickle, Crunchy Green Chilli Pickle, and Royal Mixed Pachranga. Packed in an ornate crimson-gold gift box with satin ribbon.',
      ingredients: [
        'Mango Pickle (250g / 500g)',
        'Lemon Pickle (250g / 500g)',
        'Green Chilli Pickle (250g / 500g)',
        'Mixed Vegetable Pickle (250g / 500g)'
      ],
      nutrition: {
        servingSize: '100g (Avg)',
        energy: '160 kcal',
        protein: '2.4g',
        carbs: '10.5g',
        fat: '12.8g',
        sodium: '4500mg'
      },
      storage: 'Store individual jars in a cool, dry place away from sunlight.',
      deliveryInfo: 'Free Express Shipping nationwide. Packed in double-cushioned premium gift box.',
      spiceLevel: 'Assorted Range',
      shelfLife: '12-18 Months',
      badges: ['BEST VALUE', 'Gift Ready', 'Save ₹100'],
      isBestseller: false,
      isFeatured: true,
      rating: 4.9,
      reviewsCount: 3200,
      images: [
        { url: '/assets/images/combo-box.jpg', isPrimary: true },
        { url: '/assets/images/hero-pickle.jpg', isPrimary: false },
        { url: '/assets/images/brand-story.jpg', isPrimary: false }
      ],
      variants: [
        { weight: '4 x 250g (1kg Total)', price: 699, originalPrice: 799, discount: '₹100 OFF', sku: 'LX-CMB-1KG', stock: 120 },
        { weight: '4 x 500g (2kg Total)', price: 1299, originalPrice: 1599, discount: '₹300 OFF', sku: 'LX-CMB-2KG', stock: 75 }
      ]
    },
    {
      slug: 'laxmi-bihar-oal',
      name: 'Bihari Oal (Elephant Yam) Barani Achar',
      hindiName: 'बिहार का प्रसिद्ध ओल का अचार',
      categoryId: categoryMap.get('regional')!,
      tagline: 'Hand-grated elephant foot yam with fiery ginger, green chillies & mustard',
      description: 'An iconic culinary gem from the heart of Bihar. Sun-dried grated Oal (suran) blended with grated fresh ginger, minced green chillies, raw mango amchur, ajwain, and pure raw mustard oil. Has an invigorating pungent mustard aroma that transforms simple dal-bhaat into a feast.',
      ingredients: [
        'Elephant Foot Yam / Oal (62%)',
        'Fresh Ginger',
        'Green Chilli',
        'Cold-Pressed Mustard Oil',
        'Amchur Powder',
        'Ajwain & Mangrela (Kalonji)',
        'Turmeric',
        'Rock Salt'
      ],
      nutrition: {
        servingSize: '100g',
        energy: '162 kcal',
        protein: '2.8g',
        carbs: '14.0g',
        fat: '10.5g',
        sodium: '4200mg'
      },
      storage: 'Store in a cool dry space. Keep well-moistened with top oil layer.',
      deliveryInfo: 'Handcrafted fresh in limited monthly batches.',
      spiceLevel: 'Pungent & Tangy',
      shelfLife: '12 Months',
      badges: ['Bihari Heritage', 'Rare Delicacy'],
      isBestseller: false,
      isFeatured: false,
      rating: 4.9,
      reviewsCount: 540,
      images: [
        { url: '/assets/images/hero-pickle.jpg', isPrimary: true },
        { url: '/assets/images/brand-story.jpg', isPrimary: false }
      ],
      variants: [
        { weight: '250g', price: 229, originalPrice: 279, discount: '18% OFF', sku: 'LX-OAL-250', stock: 80 },
        { weight: '500g', price: 419, originalPrice: 519, discount: '19% OFF', sku: 'LX-OAL-500', stock: 50 },
        { weight: '1kg', price: 789, originalPrice: 999, discount: '21% OFF', sku: 'LX-OAL-1KG', stock: 30 }
      ]
    },
    {
      slug: 'laxmi-rajasthan-kersangri',
      name: 'Rajasthani Ker Sangri Heritage Achar',
      hindiName: 'राजस्थानी केर सांगरी शाही अचार',
      categoryId: categoryMap.get('regional')!,
      tagline: 'Wild desert caper berries & bean pods simmered in Marwari spices',
      description: 'The prized delicacy of royal Rajputana. Foraged wild Ker berries and tender Sangri pods from the Thar desert, meticulously cleaned, sun-dried, and cooked with dry red chillies, amchur, and aromatic spices in golden mustard oil. Mildly tangy, earthy, and richly aromatic.',
      ingredients: [
        'Ker Berries & Sangri Beans (60%)',
        'Mustard Oil',
        'Mathania Dry Red Chillies',
        'Dry Mango Powder (Amchur)',
        'Fennel & Coriander Seeds',
        'Turmeric',
        'Rock Salt',
        'Hing'
      ],
      nutrition: {
        servingSize: '100g',
        energy: '175 kcal',
        protein: '3.5g',
        carbs: '16.0g',
        fat: '11.0g',
        sodium: '4100mg'
      },
      storage: 'Keep in cool dry area. Do not refrigerate.',
      deliveryInfo: 'Freshly packed in small artisanal batches.',
      spiceLevel: 'Marwari Spicy',
      shelfLife: '12 Months',
      badges: ['Marwar Royal', 'Artisanal Batch'],
      isBestseller: false,
      isFeatured: false,
      rating: 4.8,
      reviewsCount: 410,
      images: [
        { url: '/assets/images/brand-story.jpg', isPrimary: true },
        { url: '/assets/images/combo-box.jpg', isPrimary: false }
      ],
      variants: [
        { weight: '250g', price: 249, originalPrice: 299, discount: '17% OFF', sku: 'LX-KER-250', stock: 60 },
        { weight: '500g', price: 469, originalPrice: 569, discount: '18% OFF', sku: 'LX-KER-500', stock: 40 },
        { weight: '1kg', price: 879, originalPrice: 1099, discount: '20% OFF', sku: 'LX-KER-1KG', stock: 25 }
      ]
    }
  ];

  for (const prod of productsData) {
    const createdProduct = await prisma.product.create({
      data: {
        name: prod.name,
        hindiName: prod.hindiName,
        slug: prod.slug,
        categoryId: prod.categoryId,
        tagline: prod.tagline,
        description: prod.description,
        ingredients: prod.ingredients,
        nutrition: prod.nutrition,
        storage: prod.storage,
        deliveryInfo: prod.deliveryInfo,
        spiceLevel: prod.spiceLevel,
        shelfLife: prod.shelfLife,
        badges: prod.badges,
        isBestseller: prod.isBestseller,
        isFeatured: prod.isFeatured,
        rating: prod.rating,
        reviewsCount: prod.reviewsCount,
        variants: {
          create: prod.variants
        },
        images: {
          create: prod.images.map((img, i) => ({
            url: img.url,
            isPrimary: img.isPrimary,
            sortOrder: i
          }))
        }
      }
    });

    // Add sample review for mango pickle
    if (prod.slug === 'laxmi-mango') {
      await prisma.review.create({
        data: {
          productId: createdProduct.id,
          userId: customer.id,
          userName: customer.name,
          city: 'New Delhi',
          rating: 5,
          comment: 'Exactly like the pickle my grandmother used to make in her haveli! Perfect spice balance.',
          isVerifiedBuyer: true
        }
      });
    }
  }

  // 5. Seed Coupons
  await prisma.coupon.createMany({
    data: [
      {
        code: 'GHARKASWAD',
        type: CouponType.PERCENT,
        value: 10,
        minOrderAmount: 0,
        maxDiscount: 200,
        isActive: true
      },
      {
        code: 'FIRST10',
        type: CouponType.PERCENT,
        value: 10,
        minOrderAmount: 0,
        maxDiscount: 150,
        isActive: true
      },
      {
        code: 'LAXMI50',
        type: CouponType.FIXED,
        value: 50,
        minOrderAmount: 299,
        isActive: true
      },
      {
        code: 'LAXMI10',
        type: CouponType.PERCENT,
        value: 10,
        minOrderAmount: 199,
        maxDiscount: 100,
        isActive: true
      }
    ]
  });

  console.log('✅ Database seeded successfully with Products, Categories, Admin, Customer, and Coupons!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

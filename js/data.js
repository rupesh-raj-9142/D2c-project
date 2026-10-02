// LAXMI Pickles - Product Catalog & Static Data
// "Ghar Ka Swad, Har Bite Mein"

export const CATEGORIES = [
  {
    id: 'mango',
    name: 'Mango Pickle',
    hindi: 'आम का अचार',
    shortDesc: 'Sun-cured raw Ramkela mangoes in cold-pressed mustard oil with heirloom spices.',
    image: 'assets/images/mango-pickle.jpg',
    tag: 'All Time Favourite'
  },
  {
    id: 'lemon',
    name: 'Lemon Pickle',
    hindi: 'नींबू का अचार',
    shortDesc: 'Juicy Kagzi limes slow-cured with rock salt, ajwain and digestive warming spices.',
    image: 'assets/images/lemon-pickle.jpg',
    tag: 'Digestive & Tangy'
  },
  {
    id: 'green-chilli',
    name: 'Green Chilli Pickle',
    hindi: 'हरी मिर्च का अचार',
    shortDesc: 'Crisp green chillies hand-slit and packed with stone-ground rai and amchur.',
    image: 'assets/images/chilli-pickle.jpg',
    tag: 'Fiery & Bold'
  },
  {
    id: 'mixed',
    name: 'Mixed Pickle',
    hindi: 'पचरंगा अचार',
    shortDesc: 'Celebratory blend of crunchy seasonal vegetables marinated in Punjabi masala.',
    image: 'assets/images/mixed-pickle.jpg',
    tag: 'Grandmother Recipe'
  },
  {
    id: 'garlic',
    name: 'Garlic Pickle',
    hindi: 'लहसुन का अचार',
    shortDesc: 'Whole aromatic garlic cloves steeped in Kashmiri red chilli and mustard gravy.',
    image: 'assets/images/garlic-pickle.jpg',
    tag: 'Rich & Therapeutic'
  },
  {
    id: 'regional',
    name: 'Special Regional Pickles',
    hindi: 'क्षेत्रीय विशेषताएं',
    shortDesc: 'Rare heirloom recipes from Bihar, Rajasthan, Gujarat, North & South India.',
    image: 'assets/images/hero-pickle.jpg',
    tag: 'Heritage Treasures'
  }
];

export const PRODUCTS = [
  {
    id: 'laxmi-mango',
    name: 'LAXMI Classic Mango Pickle',
    hindiName: 'लक्ष्मी पारंपरिक आम का अचार',
    category: 'mango',
    tagline: 'Sun-cured with sour Ramkela mangoes & pure cold-pressed mustard oil',
    rating: 4.8,
    reviewsCount: 1420,
    spiceLevel: 'Medium Spicy',
    shelfLife: '12 Months',
    badges: ['Bestseller', 'Sun-Matured'],
    image: 'assets/images/mango-pickle.jpg',
    gallery: [
      'assets/images/mango-pickle.jpg',
      'assets/images/hero-pickle.jpg',
      'assets/images/brand-story.jpg'
    ],
    weights: [
      { weight: '250g', price: 199, originalPrice: 249, discount: '20% OFF' },
      { weight: '500g', price: 369, originalPrice: 459, discount: '20% OFF' },
      { weight: '1kg', price: 699, originalPrice: 899, discount: '22% OFF' }
    ],
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
    deliveryInfo: 'Dispatched within 24 hours. Delivered across India in 2-4 business days in tamper-proof shatter-resistant packaging.'
  },
  {
    id: 'laxmi-lemon',
    name: 'LAXMI Traditional Lemon Pickle',
    hindiName: 'लक्ष्मी खट्टा-मीठा नींबू का अचार',
    category: 'lemon',
    tagline: 'Juicy Kagzi limes slow-cured with rock salt & digestive herbs',
    rating: 4.7,
    reviewsCount: 980,
    spiceLevel: 'Tangy & Mild',
    shelfLife: '18 Months',
    badges: ['Digestive', 'Heirloom'],
    image: 'assets/images/lemon-pickle.jpg',
    gallery: [
      'assets/images/lemon-pickle.jpg',
      'assets/images/hero-pickle.jpg',
      'assets/images/combo-box.jpg'
    ],
    weights: [
      { weight: '250g', price: 179, originalPrice: 219, discount: '18% OFF' },
      { weight: '500g', price: 329, originalPrice: 399, discount: '18% OFF' },
      { weight: '1kg', price: 629, originalPrice: 779, discount: '19% OFF' }
    ],
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
    deliveryInfo: 'Fast dispatch within 24 hours in secure bubble-wrap safety packaging.'
  },
  {
    id: 'laxmi-chilli',
    name: 'LAXMI Green Chilli Pickle',
    hindiName: 'लक्ष्मी तीखी हरी मिर्च का अचार',
    category: 'green-chilli',
    tagline: 'Crunchy farm-fresh chillies stuffed with tangy mustard masala',
    rating: 4.8,
    reviewsCount: 850,
    spiceLevel: 'Extra Spicy',
    shelfLife: '9 Months',
    badges: ['Fiery Punch', 'Customer Love'],
    image: 'assets/images/chilli-pickle.jpg',
    gallery: [
      'assets/images/chilli-pickle.jpg',
      'assets/images/hero-pickle.jpg',
      'assets/images/brand-story.jpg'
    ],
    weights: [
      { weight: '250g', price: 189, originalPrice: 229, discount: '17% OFF' },
      { weight: '500g', price: 349, originalPrice: 429, discount: '19% OFF' },
      { weight: '1kg', price: 659, originalPrice: 799, discount: '18% OFF' }
    ],
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
    deliveryInfo: 'Delivered in 2-4 business days across India.'
  },
  {
    id: 'laxmi-mixed',
    name: 'LAXMI Mixed Pickle (Pachranga)',
    hindiName: 'लक्ष्मी शाही पचरंगा मिक्स अचार',
    category: 'mixed',
    tagline: 'Hand-cut mango, carrot, lime, cauliflower & lotus stem in rich Punjabi spices',
    rating: 4.9,
    reviewsCount: 2150,
    spiceLevel: 'Medium Spicy',
    shelfLife: '12 Months',
    badges: ['Top Rated', 'Grandma’s Special'],
    image: 'assets/images/mixed-pickle.jpg',
    gallery: [
      'assets/images/mixed-pickle.jpg',
      'assets/images/combo-box.jpg',
      'assets/images/hero-pickle.jpg'
    ],
    weights: [
      { weight: '250g', price: 199, originalPrice: 249, discount: '20% OFF' },
      { weight: '500g', price: 369, originalPrice: 459, discount: '20% OFF' },
      { weight: '1kg', price: 699, originalPrice: 899, discount: '22% OFF' }
    ],
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
    deliveryInfo: 'Express delivery available. Free delivery on orders over ₹499.'
  },
  {
    id: 'laxmi-garlic',
    name: 'LAXMI Artisanal Garlic Pickle',
    hindiName: 'लक्ष्मी देसी लहसुन का अचार',
    category: 'garlic',
    tagline: 'Plump cloves of desi garlic slow-steeped in rich Kashmiri chilli oil',
    rating: 4.8,
    reviewsCount: 720,
    spiceLevel: 'Spicy & Robust',
    shelfLife: '12 Months',
    badges: ['Immunity Booster', 'Aromatic'],
    image: 'assets/images/garlic-pickle.jpg',
    gallery: [
      'assets/images/garlic-pickle.jpg',
      'assets/images/hero-pickle.jpg',
      'assets/images/mixed-pickle.jpg'
    ],
    weights: [
      { weight: '250g', price: 219, originalPrice: 269, discount: '19% OFF' },
      { weight: '500g', price: 399, originalPrice: 499, discount: '20% OFF' },
      { weight: '1kg', price: 749, originalPrice: 949, discount: '21% OFF' }
    ],
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
    deliveryInfo: 'Fast dispatch within 24 hours in tamper-evident glass jar packaging.'
  },
  {
    id: 'laxmi-ultimate-combo',
    name: 'The Ultimate Achar Combo (4 Jars Box)',
    hindiName: 'लक्ष्मी अल्टीमेट अचार कॉम्बो बॉक्स',
    category: 'combos',
    tagline: '4 Handcrafted Flavours in a Royal Gift Box • Mango, Lemon, Chilli & Mixed',
    rating: 4.9,
    reviewsCount: 3200,
    spiceLevel: 'Assorted Range',
    shelfLife: '12-18 Months',
    badges: ['BEST VALUE', 'Gift Ready', 'Save ₹100'],
    image: 'assets/images/combo-box.jpg',
    gallery: [
      'assets/images/combo-box.jpg',
      'assets/images/hero-pickle.jpg',
      'assets/images/brand-story.jpg'
    ],
    weights: [
      { weight: '4 x 250g (1kg Total)', price: 699, originalPrice: 799, discount: '₹100 OFF' },
      { weight: '4 x 500g (2kg Total)', price: 1299, originalPrice: 1599, discount: '₹300 OFF' }
    ],
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
    deliveryInfo: 'Free Express Shipping nationwide. Packed in double-cushioned premium gift box.'
  },
  {
    id: 'laxmi-bihar-oal',
    name: 'Bihari Oal (Elephant Yam) Barani Achar',
    hindiName: 'बिहार का प्रसिद्ध ओल का अचार',
    category: 'regional',
    tagline: 'Hand-grated elephant foot yam with fiery ginger, green chillies & mustard',
    rating: 4.9,
    reviewsCount: 540,
    spiceLevel: 'Pungent & Tangy',
    shelfLife: '12 Months',
    badges: ['Bihari Heritage', 'Rare Delicacy'],
    image: 'assets/images/hero-pickle.jpg',
    gallery: [
      'assets/images/hero-pickle.jpg',
      'assets/images/brand-story.jpg'
    ],
    weights: [
      { weight: '250g', price: 229, originalPrice: 279, discount: '18% OFF' },
      { weight: '500g', price: 419, originalPrice: 519, discount: '19% OFF' },
      { weight: '1kg', price: 789, originalPrice: 999, discount: '21% OFF' }
    ],
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
    deliveryInfo: 'Handcrafted fresh in limited monthly batches.'
  },
  {
    id: 'laxmi-rajasthan-kersangri',
    name: 'Rajasthani Ker Sangri Heritage Achar',
    hindiName: 'राजस्थानी केर सांगरी शाही अचार',
    category: 'regional',
    tagline: 'Wild desert caper berries & bean pods simmered in Marwari spices',
    rating: 4.8,
    reviewsCount: 410,
    spiceLevel: 'Marwari Spicy',
    shelfLife: '12 Months',
    badges: ['Marwar Royal', 'Artisanal Batch'],
    image: 'assets/images/brand-story.jpg',
    gallery: [
      'assets/images/brand-story.jpg',
      'assets/images/combo-box.jpg'
    ],
    weights: [
      { weight: '250g', price: 249, originalPrice: 299, discount: '17% OFF' },
      { weight: '500g', price: 469, originalPrice: 569, discount: '18% OFF' },
      { weight: '1kg', price: 879, originalPrice: 1099, discount: '20% OFF' }
    ],
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
    deliveryInfo: 'Freshly packed in small artisanal batches.'
  }
];

export const REGIONAL_FLAVOURS = [
  {
    region: 'North India',
    title: 'Hing & Stuffed Red Chilli',
    desc: 'Bold Banarasi Bharwa Lal Mirch and pungent Hing Mango pickles crafted with unrefined kacchi ghani oil.',
    image: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?w=600&auto=format&fit=crop&q=80',
    tag: 'Bold & Pungent'
  },
  {
    region: 'Bihar',
    title: 'Oal & Sattu Mirch',
    desc: 'Centuries-old recipes of grated elephant foot yam, spicy sattu stuffed chillies, and sun-baked raw mango.',
    image: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=600&auto=format&fit=crop&q=80',
    tag: 'Earthy & Tangy'
  },
  {
    region: 'Rajasthan',
    title: 'Ker Sangri & Kair',
    desc: 'Desert delicacies gathered from wild thorny bushes, infused with Mathania chillies and Marwari spices.',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
    tag: 'Royal Marwari'
  },
  {
    region: 'Gujarat',
    title: 'Chhundo & Gorkeri',
    desc: 'Sweet and tangy sun-melted raw mango preserves flavoured with jaggery, cinnamon, and toasted cumin.',
    image: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=600&auto=format&fit=crop&q=80',
    tag: 'Sweet & Tangy'
  },
  {
    region: 'South India',
    title: 'Avakaya & Gongura',
    desc: 'Fiery Andhra-style Avakaya drenched in sesame (gingelly) oil, crushed mustard powder, and sorrel leaves.',
    image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=600&auto=format&fit=crop&q=80',
    tag: 'Fiery Gingelly'
  }
];

export const HOW_IT_MADE_STEPS = [
  {
    step: '01',
    title: 'Fresh Ingredients',
    subtitle: 'Hand-picked fruits & veggies',
    desc: 'We source only native Ramkela green mangoes, paper-thin Kagzi limes, and farm-fresh green chillies washed in natural spring water.'
  },
  {
    step: '02',
    title: 'Traditional Spices',
    subtitle: 'Slow-roasted & hand-pounded',
    desc: 'Whole spices like mustard, fenugreek, fennel, and coriander are sun-dried, gently dry-roasted, and stone-ground to release aromatic oils.'
  },
  {
    step: '03',
    title: 'Slow & Careful Preparation',
    subtitle: 'Sun-matured for 14-21 days',
    desc: 'No rushed artificial heating. Jars are lovingly turned on rooftop terraces under gentle Indian sunshine to let natural fermentation peak.'
  },
  {
    step: '04',
    title: 'Freshly Packed',
    subtitle: 'Hygienically sealed in glass',
    desc: 'Preserved with pure cold-pressed mustard oil with zero artificial preservatives, packaged in eco-friendly sterilized glass jars.'
  }
];

export const REVIEWS = [
  {
    name: 'Meera Sharma',
    city: 'New Delhi',
    rating: 5,
    date: 'Verified Buyer • 2 weeks ago',
    product: 'Classic Mango Pickle',
    avatar: 'MS',
    review: 'Exactly like the pickle my grandmother used to make in her haveli! The mango pieces have the perfect bite, not mushy at all, and the balance of mustard oil and methi is sheer perfection.'
  },
  {
    name: 'Rajesh Kumar',
    city: 'Bengaluru',
    rating: 5,
    date: 'Verified Buyer • 1 month ago',
    product: 'Green Chilli Pickle',
    avatar: 'RK',
    review: 'The Green Chilli pickle took me straight back to my childhood in UP. The aroma of cold-pressed mustard oil hits you the moment you pop open the seal. Highly recommended!'
  },
  {
    name: 'Ananya Desai',
    city: 'Mumbai',
    rating: 5,
    date: 'Verified Buyer • 3 weeks ago',
    product: 'The Ultimate Achar Combo',
    avatar: 'AD',
    review: 'Ordered the 4-pack combo for Diwali gifting, but ended up keeping one box for ourselves! Every single flavour is outstanding, especially the mixed pickle. Zero artificial chemicals or vinegar taste.'
  },
  {
    name: 'Harpreet Singh',
    city: 'Chandigarh',
    rating: 5,
    date: 'Verified Buyer • 5 days ago',
    product: 'Artisanal Garlic Pickle',
    avatar: 'HS',
    review: 'The Garlic Pickle with hot buttered parathas is heavenly. Garlic cloves are so tender they just melt in your mouth. Pure nostalgia in every bite!'
  }
];

export const INSTAGRAM_POSTS = [
  {
    id: 1,
    image: 'assets/images/hero-pickle.jpg',
    likes: 1842,
    caption: 'Tradition bottled with love. Freshly prepared batch of LAXMI Mango Achar getting sun-cured. ☀️'
  },
  {
    id: 2,
    image: 'assets/images/brand-story.jpg',
    likes: 2490,
    caption: 'Generations of culinary secrets, passed down by our dadi. Nothing beats homemade achar!'
  },
  {
    id: 3,
    image: 'assets/images/combo-box.jpg',
    likes: 3120,
    caption: 'The Ultimate Achar Combo box is here. 4 flavours of pure nostalgia, gift-wrapped for your loved ones.'
  },
  {
    id: 4,
    image: 'assets/images/mango-pickle.jpg',
    likes: 1950,
    caption: 'That vibrant golden-red glow of pure kacchi ghani mustard oil and Kashmiri mirch!'
  },
  {
    id: 5,
    image: 'assets/images/chilli-pickle.jpg',
    likes: 1430,
    caption: 'Spice lovers, assemble! Slit green chillies packed with aromatic rai kuria.'
  },
  {
    id: 6,
    image: 'assets/images/mixed-pickle.jpg',
    likes: 2180,
    caption: 'Winter carrots, lime, cauliflower and mango. A bowl of Pachranga happiness.'
  }
];

import dbConnect from "@/lib/db"
import User from "@/models/User"
import Product from "@/models/Product"
import bcrypt from "bcryptjs"

export async function seedDatabase() {
  try {
    await dbConnect()
    console.log("Connected to MongoDB for seeding")

    // Check if admin user exists
    const adminExists = await User.findOne({ email: "admin@example.com" })

    if (!adminExists) {
      // Create admin user
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash("admin123", salt)

      await User.create({
        name: "Admin User",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
      })

      console.log("Admin user created")
    }

    // Check if test user exists
    const userExists = await User.findOne({ email: "user@example.com" })

    if (!userExists) {
      // Create test user
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash("user123", salt)

      await User.create({
        name: "Test User",
        email: "user@example.com",
        password: hashedPassword,
        role: "user",
      })

      console.log("Test user created")
    }

    // Check if products exist
    const productsCount = await Product.countDocuments()

    if (productsCount === 0) {
      // Sample products data with more realistic data and images
      const sampleProducts = [
        {
          name: "iPhone 13 Pro",
          slug: "iphone-13-pro",
          description:
            "The latest iPhone with A15 Bionic chip, Pro camera system, and Super Retina XDR display with ProMotion.",
          price: 999,
          category: "electronics",
          subcategory: "smartphones",
          brand: "Apple",
          stock: 50,
          images: [
            {
              url: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?auto=format&fit=crop&w=800&q=80",
              alt: "iPhone 13 Pro",
            },
            {
              url: "https://images.unsplash.com/photo-1591337676887-a217a6970a8a?auto=format&fit=crop&w=800&q=80",
              alt: "iPhone 13 Pro Side View",
            },
          ],
          features: [
            "A15 Bionic chip",
            "Pro camera system",
            "Super Retina XDR display",
            "ProMotion technology",
            "Ceramic Shield",
          ],
          tags: ["iphone", "apple", "smartphone", "ios", "gift", "premium"],
          specifications: new Map([
            ["display", "6.1-inch Super Retina XDR"],
            ["processor", "A15 Bionic"],
            ["storage", "128GB, 256GB, 512GB, 1TB"],
            ["camera", "Triple 12MP"],
            ["battery", "Up to 22 hours"],
            ["os", "iOS 15"],
            ["dimensions", "146.7 x 71.5 x 7.65 mm"],
            ["weight", "204g"],
          ]),
          isFeatured: true,
        },
        {
          name: "Samsung Galaxy S21",
          slug: "samsung-galaxy-s21",
          description: "Samsung Galaxy S21 with Exynos 2100 processor, 8GB RAM, and Dynamic AMOLED 2X display.",
          price: 799,
          category: "electronics",
          subcategory: "smartphones",
          brand: "Samsung",
          stock: 35,
          images: [
            {
              url: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=800&q=80",
              alt: "Samsung Galaxy S21",
            },
            {
              url: "https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?auto=format&fit=crop&w=800&q=80",
              alt: "Samsung Galaxy S21 Camera",
            },
          ],
          features: [
            "Exynos 2100 processor",
            "8GB RAM",
            "Dynamic AMOLED 2X display",
            "64MP camera",
            "Wireless PowerShare",
          ],
          tags: ["samsung", "galaxy", "smartphone", "android", "gift"],
          specifications: new Map([
            ["display", "6.2-inch Dynamic AMOLED 2X"],
            ["processor", "Exynos 2100"],
            ["storage", "128GB, 256GB"],
            ["camera", "Triple camera system"],
            ["battery", "4000mAh"],
            ["os", "Android 11"],
            ["dimensions", "151.7 x 71.2 x 7.9 mm"],
            ["weight", "169g"],
          ]),
          isFeatured: true,
        },
        {
          name: "Sony WH-1000XM4",
          slug: "sony-wh-1000xm4",
          description: "Industry-leading noise canceling wireless headphones with premium sound quality.",
          price: 349,
          category: "electronics",
          subcategory: "headphones",
          brand: "Sony",
          stock: 20,
          images: [
            {
              url: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80",
              alt: "Sony WH-1000XM4",
            },
            {
              url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
              alt: "Sony WH-1000XM4 Case",
            },
          ],
          features: [
            "Industry-leading noise cancellation",
            "Exceptional sound quality",
            "30-hour battery life",
            "Touch controls",
            "Speak-to-chat technology",
          ],
          tags: ["sony", "headphones", "wireless", "noise-canceling", "gift", "premium"],
          specifications: new Map([
            ["type", "Over-ear"],
            ["connectivity", "Bluetooth 5.0"],
            ["battery", "Up to 30 hours"],
            ["weight", "254g"],
            ["color", "Black, Silver, Blue"],
            ["frequency response", "4Hz-40,000Hz"],
            ["driver", "40mm"],
          ]),
          isFeatured: false,
        },
        {
          name: 'MacBook Pro 14"',
          slug: "macbook-pro-14",
          description:
            "The most powerful MacBook Pro ever with M1 Pro or M1 Max chip and stunning Liquid Retina XDR display.",
          price: 1999,
          category: "electronics",
          subcategory: "laptops",
          brand: "Apple",
          stock: 15,
          images: [
            {
              url: "https://images.unsplash.com/photo-1639249227523-85ebe4344d53?auto=format&fit=crop&w=800&q=80",
              alt: 'MacBook Pro 14"',
            },
            {
              url: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80",
              alt: "MacBook Pro Keyboard",
            },
          ],
          features: [
            "M1 Pro or M1 Max chip",
            "Liquid Retina XDR display",
            "Up to 32GB unified memory",
            "Up to 8TB storage",
            "MagSafe charging",
          ],
          tags: ["apple", "macbook", "laptop", "macos", "gift", "premium"],
          specifications: new Map([
            ["display", "14.2-inch Liquid Retina XDR"],
            ["processor", "M1 Pro or M1 Max"],
            ["memory", "16GB, 32GB, 64GB"],
            ["storage", "512GB, 1TB, 2TB, 4TB, 8TB"],
            ["battery", "Up to 17 hours"],
            ["ports", "HDMI, SDXC, MagSafe 3, Thunderbolt 4 (x3)"],
            ["dimensions", "31.26 x 22.12 x 1.55 cm"],
            ["weight", "1.6kg"],
          ]),
          isFeatured: true,
        },
        {
          name: "Nike Air Max 270",
          slug: "nike-air-max-270",
          description:
            "The Nike Air Max 270 delivers visible cushioning under every step with a large window and 270 degrees of comfort.",
          price: 150,
          category: "clothing",
          subcategory: "shoes",
          brand: "Nike",
          stock: 40,
          images: [
            {
              url: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80",
              alt: "Nike Air Max 270",
            },
            {
              url: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=800&q=80",
              alt: "Nike Air Max 270 Side View",
            },
          ],
          features: ["Max Air 270 unit", "Mesh upper", "Foam midsole", "Rubber outsole", "Heel pull tab"],
          tags: ["nike", "shoes", "sneakers", "air max", "gift"],
          specifications: new Map([
            ["material", "Mesh, synthetic"],
            ["closure", "Lace-up"],
            ["style", "Athletic"],
            ["color", "Multiple options"],
            ["gender", "Unisex"],
            ["sole", "Rubber"],
            ["height", "Mid-top"],
          ]),
          isFeatured: false,
        },
        {
          name: "LEGO Star Wars Millennium Falcon",
          slug: "lego-star-wars-millennium-falcon",
          description:
            "Build the iconic Corellian freighter from Star Wars with this detailed LEGO set featuring over 1,300 pieces.",
          price: 159.99,
          category: "toys",
          subcategory: "building sets",
          brand: "LEGO",
          stock: 25,
          images: [
            {
              url: "https://images.unsplash.com/photo-1518331483807-f6adb0e1ad23?auto=format&fit=crop&w=800&q=80",
              alt: "LEGO Star Wars Millennium Falcon",
            },
            {
              url: "https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?auto=format&fit=crop&w=800&q=80",
              alt: "LEGO Star Wars Minifigures",
            },
          ],
          features: [
            "1,300+ pieces",
            "7 minifigures included",
            "Detailed interior",
            "Opening top panels",
            "Rotating gun turrets",
          ],
          tags: ["lego", "star wars", "toys", "building", "kids", "gift", "children"],
          specifications: new Map([
            ["age", "9+"],
            ["pieces", "1,351"],
            ["minifigures", "7"],
            ["dimensions", "12 x 17 x 5 inches (built)"],
            ["weight", "4.8 pounds"],
            ["release year", "2022"],
          ]),
          isFeatured: true,
        },
        {
          name: "Dyson V11 Absolute",
          slug: "dyson-v11-absolute",
          description: "Powerful cordless vacuum with intelligent suction and up to 60 minutes of run time.",
          price: 599.99,
          category: "electronics",
          subcategory: "home appliances",
          brand: "Dyson",
          stock: 18,
          images: [
            {
              url: "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=800&q=80",
              alt: "Dyson V11 Absolute",
            },
            {
              url: "https://images.unsplash.com/photo-1584184924103-e310d9dc82fc?auto=format&fit=crop&w=800&q=80",
              alt: "Dyson V11 Attachments",
            },
          ],
          features: [
            "Intelligent suction",
            "LCD screen",
            "Up to 60 minutes run time",
            "Whole-machine filtration",
            "Multiple cleaning modes",
          ],
          tags: ["dyson", "vacuum", "cordless", "home", "cleaning", "premium", "gift"],
          specifications: new Map([
            ["power", "185 AW"],
            ["run time", "Up to 60 minutes"],
            ["weight", "6.68 lbs"],
            ["bin volume", "0.76L"],
            ["filtration", "Advanced whole-machine filtration"],
            ["charging time", "4.5 hours"],
            ["dimensions", "50.6 x 9.8 x 10.3 inches"],
          ]),
          isFeatured: true,
        },
        {
          name: "Nintendo Switch OLED",
          slug: "nintendo-switch-oled",
          description: "Enhanced Nintendo Switch console with vibrant 7-inch OLED screen and improved audio.",
          price: 349.99,
          category: "electronics",
          subcategory: "gaming",
          brand: "Nintendo",
          stock: 30,
          images: [
            {
              url: "https://images.unsplash.com/photo-1662997297674-bb522e99a67b?auto=format&fit=crop&w=800&q=80",
              alt: "Nintendo Switch OLED",
            },
            {
              url: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?auto=format&fit=crop&w=800&q=80",
              alt: "Nintendo Switch Controllers",
            },
          ],
          features: [
            "7-inch OLED screen",
            "Enhanced audio",
            "Wired LAN port",
            "64GB internal storage",
            "Wide adjustable stand",
          ],
          tags: ["nintendo", "switch", "gaming", "console", "gift", "kids", "teen"],
          specifications: new Map([
            ["screen", "7-inch OLED"],
            ["storage", "64GB (expandable)"],
            ["battery life", "4.5-9 hours"],
            ["weight", "0.93 lbs (with Joy-Con)"],
            ["dimensions", "9.5 x 4 x 0.55 inches"],
            ["connectivity", "Wi-Fi, Bluetooth, Wired LAN"],
            ["resolution", "Up to 1080p (TV), 720p (handheld)"],
          ]),
          isFeatured: true,
        },
        {
          name: "Kindle Paperwhite",
          slug: "kindle-paperwhite",
          description: "Waterproof e-reader with a flush-front design and 300 ppi glare-free display.",
          price: 139.99,
          category: "electronics",
          subcategory: "e-readers",
          brand: "Amazon",
          stock: 45,
          images: [
            {
              url: "https://images.unsplash.com/photo-1544158828-5f2bcc1f31b6?auto=format&fit=crop&w=800&q=80",
              alt: "Kindle Paperwhite",
            },
            {
              url: "https://images.unsplash.com/photo-1585298723682-7115561c51b7?auto=format&fit=crop&w=800&q=80",
              alt: "Kindle Paperwhite Reading",
            },
          ],
          features: [
            "Waterproof (IPX8)",
            "300 ppi glare-free display",
            "Adjustable warm light",
            "8GB or 32GB storage",
            "Weeks of battery life",
          ],
          tags: ["kindle", "amazon", "e-reader", "books", "reading", "gift"],
          specifications: new Map([
            ["display", "6-inch 300 ppi"],
            ["storage", "8GB or 32GB"],
            ["battery life", "Up to 10 weeks"],
            ["waterproof", "IPX8 rated"],
            ["weight", "6.4 oz"],
            ["dimensions", "6.6 x 4.6 x 0.3 inches"],
            ["connectivity", "Wi-Fi, Bluetooth"],
          ]),
          isFeatured: false,
        },
        {
          name: "Bose QuietComfort 45",
          slug: "bose-quietcomfort-45",
          description: "Premium noise cancelling headphones with high-fidelity audio and comfortable design.",
          price: 329,
          category: "electronics",
          subcategory: "headphones",
          brand: "Bose",
          stock: 22,
          images: [
            {
              url: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80",
              alt: "Bose QuietComfort 45",
            },
            {
              url: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80",
              alt: "Bose Headphones Case",
            },
          ],
          features: [
            "World-class noise cancellation",
            "High-fidelity audio",
            "Up to 24 hours battery life",
            "Comfortable design",
            "Bluetooth 5.1",
          ],
          tags: ["bose", "headphones", "noise-cancelling", "audio", "premium", "gift"],
          specifications: new Map([
            ["type", "Over-ear"],
            ["connectivity", "Bluetooth 5.1"],
            ["battery", "Up to 24 hours"],
            ["weight", "8.5 oz"],
            ["color", "Black, White"],
            ["charging", "USB-C"],
            ["audio cable", "3.5mm included"],
          ]),
          isFeatured: false,
        },
        {
          name: "LEGO Duplo My First Animal Brick Box",
          slug: "lego-duplo-animal-brick-box",
          description: "Colorful LEGO Duplo set for toddlers with animal-themed bricks and easy building options.",
          price: 29.99,
          category: "toys",
          subcategory: "building sets",
          brand: "LEGO",
          stock: 50,
          images: [
            {
              url: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80",
              alt: "LEGO Duplo Set",
            },
            {
              url: "https://images.unsplash.com/photo-1560167016-022b78a0258e?auto=format&fit=crop&w=800&q=80",
              alt: "LEGO Duplo Blocks",
            },
          ],
          features: [
            "34 colorful pieces",
            "Animal-themed bricks",
            "Easy to build",
            "Develops fine motor skills",
            "Compatible with all LEGO Duplo sets",
          ],
          tags: ["lego", "duplo", "toddler", "baby", "building", "gift", "educational"],
          specifications: new Map([
            ["age", "1.5-5 years"],
            ["pieces", "34"],
            ["theme", "Animals"],
            ["dimensions", "12 x 9 x 3.5 inches (box)"],
            ["weight", "1.5 pounds"],
          ]),
          isFeatured: false,
        },
        {
          name: "Fitbit Charge 5",
          slug: "fitbit-charge-5",
          description: "Advanced fitness tracker with built-in GPS, stress management tools, and health metrics.",
          price: 179.95,
          category: "electronics",
          subcategory: "wearables",
          brand: "Fitbit",
          stock: 38,
          images: [
            {
              url: "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?auto=format&fit=crop&w=800&q=80",
              alt: "Fitbit Charge 5",
            },
            {
              url: "https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=800&q=80",
              alt: "Fitbit on Wrist",
            },
          ],
          features: [
            "Built-in GPS",
            "24/7 heart rate monitoring",
            "Stress management tools",
            "Sleep tracking",
            "Up to 7 days battery life",
          ],
          tags: ["fitbit", "fitness", "tracker", "wearable", "health", "gift", "sports"],
          specifications: new Map([
            ["display", "AMOLED color touchscreen"],
            ["battery", "Up to 7 days"],
            ["water resistance", "50m water resistant"],
            ["sensors", "GPS, heart rate, SpO2, EDA"],
            ["compatibility", "iOS and Android"],
            ["dimensions", "1.4 x 0.9 x 0.4 inches"],
            ["weight", "0.7 oz"],
          ]),
          isFeatured: true,
        },
        {
          name: "Instant Pot Duo 7-in-1",
          slug: "instant-pot-duo",
          description:
            "Multi-functional pressure cooker that speeds up cooking by 2-6 times while using 70% less energy.",
          price: 99.95,
          category: "electronics",
          subcategory: "kitchen appliances",
          brand: "Instant Pot",
          stock: 42,
          images: [
            {
              url: "https://images.unsplash.com/photo-1588486224808-b8bc2e2f3b16?auto=format&fit=crop&w=800&q=80",
              alt: "Instant Pot Duo",
            },
            {
              url: "https://images.unsplash.com/photo-1621317758612-3958e0f07c1d?auto=format&fit=crop&w=800&q=80",
              alt: "Instant Pot Cooking",
            },
          ],
          features: [
            "7-in-1 functionality",
            "13 one-touch programs",
            "Stainless steel inner pot",
            "Advanced safety features",
            "Easy to clean",
          ],
          tags: ["instant pot", "kitchen", "cooking", "appliance", "gift", "home"],
          specifications: new Map([
            ["capacity", "6 quart"],
            ["functions", "Pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker, warmer"],
            ["power", "1000W"],
            ["voltage", "120V"],
            ["dimensions", "13.4 x 12.2 x 12.5 inches"],
            ["weight", "11.8 pounds"],
          ]),
          isFeatured: false,
        },
        {
          name: "PlayStation 5",
          slug: "playstation-5",
          description:
            "Next-generation gaming console with ultra-high speed SSD, 3D audio, and haptic feedback controller.",
          price: 499.99,
          category: "electronics",
          subcategory: "gaming",
          brand: "Sony",
          stock: 10,
          images: [
            {
              url: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=800&q=80",
              alt: "PlayStation 5",
            },
            {
              url: "https://images.unsplash.com/photo-1617096200347-cb04ae810b1d?auto=format&fit=crop&w=800&q=80",
              alt: "PlayStation 5 Controller",
            },
          ],
          features: ["Ultra-high speed SSD", "4K gaming", "3D audio", "Haptic feedback", "Ray tracing support"],
          tags: ["playstation", "ps5", "gaming", "console", "gift", "premium", "teen"],
          specifications: new Map([
            ["cpu", "AMD Zen 2, 8 cores at 3.5GHz"],
            ["gpu", "AMD RDNA 2, 10.28 TFLOPs"],
            ["storage", "825GB SSD"],
            ["resolution", "Up to 8K"],
            ["frame rate", "Up to 120fps"],
            ["dimensions", "15.4 x 10.2 x 4.1 inches"],
            ["weight", "9.9 pounds"],
          ]),
          isFeatured: true,
        },
        {
          name: 'Squishmallow 16" Avocado Plush',
          slug: "squishmallow-avocado",
          description: "Super soft and cuddly plush toy in the shape of an adorable avocado character.",
          price: 24.99,
          category: "toys",
          subcategory: "plush toys",
          brand: "Squishmallow",
          stock: 60,
          images: [
            {
              url: "https://images.unsplash.com/photo-1563901935883-cb61f5d49be4?auto=format&fit=crop&w=800&q=80",
              alt: "Squishmallow Plush",
            },
            {
              url: "https://images.unsplash.com/photo-1566576322468-10a3999641dd?auto=format&fit=crop&w=800&q=80",
              alt: "Plush Toys",
            },
          ],
          features: [
            "Super soft fabric",
            "16 inches tall",
            "Adorable avocado design",
            "Squeezable and huggable",
            "Machine washable",
          ],
          tags: ["squishmallow", "plush", "toy", "kids", "gift", "children", "toddler"],
          specifications: new Map([
            ["size", "16 inches"],
            ["material", "Polyester fiber"],
            ["age", "All ages"],
            ["care", "Machine washable"],
            ["filling", "Polyester stuffing"],
            ["weight", "1.2 pounds"],
          ]),
          isFeatured: false,
        },
        {
          name: "Hydro Flask 32oz Water Bottle",
          slug: "hydro-flask-32oz",
          description:
            "Vacuum insulated stainless steel water bottle that keeps beverages cold for up to 24 hours or hot for up to 12 hours.",
          price: 44.95,
          category: "sports",
          subcategory: "hydration",
          brand: "Hydro Flask",
          stock: 75,
          images: [
            {
              url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=800&q=80",
              alt: "Hydro Flask Water Bottle",
            },
            {
              url: "https://images.unsplash.com/photo-1575377427642-087cf684f29d?auto=format&fit=crop&w=800&q=80",
              alt: "Water Bottle Collection",
            },
          ],
          features: [
            "TempShield insulation",
            "18/8 pro-grade stainless steel",
            "BPA-free and phthalate-free",
            "Durable powder coat finish",
            "Lifetime warranty",
          ],
          tags: ["hydro flask", "water bottle", "hydration", "sports", "outdoor", "gift"],
          specifications: new Map([
            ["capacity", "32 oz (946 ml)"],
            ["material", "18/8 stainless steel"],
            ["insulation", "Double-wall vacuum"],
            ["mouth", "Wide mouth"],
            ["dimensions", "9.4 x 3.6 inches"],
            ["weight", "14.8 oz"],
            ["colors", "Multiple options"],
          ]),
          isFeatured: false,
        },
      ]

      await Product.insertMany(sampleProducts)
      console.log("Sample products created")
    }

    console.log("Database seeding completed")
    return { success: true, message: "Database seeded successfully" }
  } catch (error) {
    console.error("Error seeding database:", error)
    return { success: false, message: "Error seeding database" }
  }
}

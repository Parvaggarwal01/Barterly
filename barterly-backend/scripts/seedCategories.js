import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Import Category model
import Category from "../src/models/Category.model.js";

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// Categories data
const categories = [
  {
    name: "Technology",
    slug: "technology",
    description:
      "Programming, Web Development, Mobile Apps, Software, IT Support",
    icon: "computer",
  },
  {
    name: "Design",
    slug: "design",
    description:
      "Graphic Design, UI/UX, Logo Design, Branding, Illustration, Photo Editing",
    icon: "palette",
  },
  {
    name: "Business",
    slug: "business",
    description:
      "Marketing, Sales, Business Strategy, Finance, Accounting, Consulting",
    icon: "business_center",
  },
  {
    name: "Creative",
    slug: "creative",
    description: "Writing, Content Creation, Copywriting, Video Editing, Music",
    icon: "brush",
  },
  {
    name: "Languages",
    slug: "languages",
    description: "English, Spanish, French, German, Chinese, Translation",
    icon: "translate",
  },
  {
    name: "Education",
    slug: "education",
    description: "Tutoring, Teaching, Training, Coaching, Mentoring",
    icon: "school",
  },
  {
    name: "Health & Fitness",
    slug: "health-fitness",
    description:
      "Personal Training, Yoga, Nutrition, Wellness, Mental Health",
    icon: "fitness_center",
  },
  {
    name: "Music",
    slug: "music",
    description:
      "Guitar, Piano, Vocal Lessons, Music Production, DJ, Songwriting",
    icon: "music_note",
  },
  {
    name: "Lifestyle",
    slug: "lifestyle",
    description: "Cooking, Baking, Gardening, Home Organization, DIY",
    icon: "home",
  },
  {
    name: "Professional Services",
    slug: "professional-services",
    description: "Legal, Real Estate, Photography, Event Planning",
    icon: "work",
  },
];

// Seed categories
const seedCategories = async () => {
  try {
    await connectDB();

    // Clear existing categories
    await Category.deleteMany({});
    console.log("🗑️  Existing categories cleared");

    // Insert new categories
    const createdCategories = await Category.insertMany(categories);

    console.log("✅ Categories seeded successfully!");
    console.log("==========================================");
    console.log(`📊 Total categories: ${createdCategories.length}`);
    console.log("==========================================");
    createdCategories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.name} (${cat.slug})`);
    });
    console.log("==========================================");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding categories:", error.message);
    process.exit(1);
  }
};

// Run seed script
seedCategories();

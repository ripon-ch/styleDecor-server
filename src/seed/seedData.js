require("dotenv").config();
const connectDB = require("../config/database"); // CommonJS path
const User = require("../models/User");
const Service = require("../models/Service");
const bcrypt = require("bcryptjs");

const seedData = async () => {
    try {
        await connectDB();

        console.log("🗑️  Clearing existing data...");
        await User.deleteMany({});
        await Service.deleteMany({});
        console.log("✅ Deleted existing data");

        // Helper to hash passwords
        const hashPassword = password => bcrypt.hashSync(password, 10);

        // Admin
        const admin = await User.create({
            email: "admin@styledecor.com",
            password: "admin123",
            fullName: "Admin User",
            role: "admin",
            phone: "+8801712345678",
            isActive: true,
            isEmailVerified: true
        });

        // Decorators
        await User.create([
            {
                email: "decorator1@styledecor.com",
                password: "decorator123",
                fullName: "Fatima Rahman",
                role: "decorator",
                phone: "+8801812345678",
                bio: "Experienced wedding decorator with 8 years in the industry",
                experienceYears: 8,
                isVerified: true,
                rating: { average: 4.8, count: 25 },
                totalJobs: 25,
                address: { district: "Dhaka", thana: "Gulshan" }
            },
            {
                email: "decorator2@styledecor.com",
                password: "decorator123",
                fullName: "Ahmed Hassan",
                role: "decorator",
                phone: "+8801912345678",
                bio: "Specializing in corporate events and office spaces",
                experienceYears: 5,
                isVerified: true,
                rating: { average: 4.6, count: 18 },
                totalJobs: 18,
                address: { district: "Dhaka", thana: "Banani" }
            }
        ]);

        // Customers
        await User.create([
            {
                email: "customer1@styledecor.com",
                password: ("customer123"),
                fullName: "Sarah Ahmed",
                role: "customer",
                phone: "+8801612345678",
                address: {
                    street: "123 Main Street",
                    district: "Dhaka",
                    thana: "Dhanmondi"
                }
            }
        ]);

        console.log("✅ Seed data created successfully!");
        console.log("📧 Login Credentials:");
        console.log("Admin: admin@styledecor.com / admin123");
        console.log("Decorator1: decorator1@styledecor.com / decorator123");
        console.log("Decorator2: decorator2@styledecor.com / decorator123");
        console.log("Customer: customer1@styledecor.com / customer123");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding data:", error);
        process.exit(1);
    }
};

seedData();

require("dotenv").config();
const connectDB = require("../config/database");
const User = require("../models/User");
const Service = require("../models/Service");

const seedData = async () => {
    try {
        await connectDB();

        console.log("🗑️ Clearing existing data...");
        await User.deleteMany({});
        await Service.deleteMany({});

        // ADMIN
        await User.create({
            firebaseUid: "Nqd6V4UnhGWGeLinwlIvtG12qW32", // Get from Firebase Console
            email: "admin@styledecor.com",
            fullName: "Admin User",
            role: "admin",
            phone: "+8801712345678",
            isActive: true,
            isEmailVerified: true
        });

        // DECORATORS
        await User.create([
            {
                firebaseUid: "aGRvcLbPwZRo3x7oxzKZZ2WddqB3",
                email: "decorator1@styledecor.com",
                fullName: "Fatima Rahman",
                role: "decorator",
                phone: "+8801812345678",
                bio: "Experienced wedding decorator with 8 years in the industry",
                experienceYears: 8,
                isVerified: true,
                rating: { average: 4.8, count: 25 },
                totalJobs: 25,
                address: { district: "Dhaka", thana: "Gulshan" }
            }
        ]);
        await User.create([
            {
                firebaseUid: "XvUi1KQOS3M351kFepE6wsDV5002",
                email: "decorator@styledecor.com",
                fullName: "Fazlur Rahman",
                role: "decorator",
                phone: "+8801812365678",
                bio: "Experienced wedding decorator with 8 years in the industry",
                experienceYears: 8,
                isVerified: true,
                rating: { average: 4.9, count: 25 },
                totalJobs: 25,
                address: { district: "Dhaka", thana: "Banani" }
            }
        ]);

        // CUSTOMERS
        await User.create([
            {
                firebaseUid: "Q77YQA5PpJUVZV9DY2s2HaXUJpc2",
                email: "customer1@styledecor.com",
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
        await User.create([
            {
                firebaseUid: "s5gMtXw25sM511Yury124NgZUx12",
                email: "customer@styledecor.com",
                fullName: "Nabil Ahmed",
                role: "customer",
                phone: "+8801612345578",
                address: {
                    street: "123 Main Street",
                    district: "Dhaka",
                    thana: "Gulshan"
                }
            }
        ]);

        console.log("✅ Seed data created successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error seeding data:", error);
        process.exit(1);
    }
};

seedData();

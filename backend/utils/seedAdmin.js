import User from "../models/User.js";
import env from "../config/env.js";

export const seedAdminUser = async () => {
  try {
    const adminEmail = env.ADMIN_EMAIL || process.env.ADMIN_EMAIL || "kishan122@gmail.com";
    const adminPassword = env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "Kishan21";

    let admin = await User.findOne({ email: adminEmail }).select("+password");

    if (!admin) {
      admin = new User({
        name: "Admin User",
        email: adminEmail,
        password: adminPassword,
        role: "admin",
        isVerified: true,
        plan: "agency",
      });
      await admin.save();
      console.log(`✅ Default Admin user created: ${adminEmail}`);
    } else {
      let modified = false;
      if (admin.role !== "admin") {
        admin.role = "admin";
        modified = true;
      }
      if (!admin.isVerified) {
        admin.isVerified = true;
        modified = true;
      }
      const matches = await admin.comparePassword(adminPassword);
      if (!matches) {
        admin.password = adminPassword;
        modified = true;
      }
      if (modified) {
        await admin.save();
        console.log(`✅ Admin user credentials updated for: ${adminEmail}`);
      } else {
        console.log(`✅ Admin user verified: ${adminEmail}`);
      }
    }
  } catch (error) {
    console.error("❌ Error seeding admin user:", error.message);
  }
};

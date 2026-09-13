import bcrypt from 'bcryptjs';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { Admin } from '../models/Admin.js';
import dotenv from 'dotenv';

dotenv.config();

const BCRYPT_SALT_ROUNDS = 12;

const seedAdmin = async () => {
    try {
        await connectDatabase();

        const name = process.env.ADMIN_NAME || process.argv[4] || 'Majedar Super Admin';
        const email = (process.env.ADMIN_EMAIL || process.argv[2] || 'admin@majedar.com').trim().toLowerCase(); // Admin EMAIL
        const password = process.env.ADMIN_PASSWORD || process.argv[3] || 'Admin@Majedar123!'; // ADMIN PASSWORD

        const existingAdmin = await Admin.findOne();
        if (existingAdmin) {
            console.log(`[Seed Admin] Admin already exists with email: ${existingAdmin.email}`);
            console.log(`[Seed Admin] Since only one admin is allowed, no new admin was created.`);
            await disconnectDatabase();
            process.exit(0);
        }

        const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

        const newAdmin = new Admin({
            name,
            email,
            passwordHash,
            role: 'admin',
        });

        await newAdmin.save();
        console.log(`[Seed Admin] Successfully created initial admin:`);
        console.log(`  Name:  ${newAdmin.name}`);
        console.log(`  Email: ${newAdmin.email}`);
        console.log(`  Role:  ${newAdmin.role}`);

        await disconnectDatabase();
        process.exit(0);
    } catch (error) {
        console.error(`[Seed Admin Error]: ${error.message}`);
        await disconnectDatabase().catch(() => { });
        process.exit(1);
    }
};

seedAdmin();
// scripts/create-admin.ts
// Run this script to create an admin user in your database
// Usage: ts-node scripts/create-admin.ts

import { PrismaClient } from '@/generated/prisma-client';
import * as bcrypt from 'bcrypt';
import * as readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdmin() {
  console.log('\n=== Create Admin User ===\n');

  try {
    // Get admin details
    const firstName = await question('Enter first name: ');
    const lastName = await question('Enter last name: ');
    const email = await question('Enter email: ');
    const password = await question('Enter password: ');
    const phone = await question('Enter phone number (optional): ');

    // Validate inputs
    if (!firstName || !lastName || !email || !password) {
      throw new Error(
        'First name, last name, email, and password are required',
      );
    }

    // Check if user already exists
    const existingUser = await prisma.member.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('\n⚠️  User with this email already exists!');
      const update = await question(
        'Do you want to update this user to ADMIN role? (yes/no): ',
      );

      if (update.toLowerCase() === 'yes') {
        const updatedUser = await prisma.member.update({
          where: { email },
          data: {
            role: 'ADMIN',
            status: 'Active',
          },
        });
        console.log('\n✅ User updated to ADMIN role successfully!');
        console.log('User ID:', updatedUser.id);
        console.log('Email:', updatedUser.email);
        console.log(
          'Name:',
          `${updatedUser.firstName} ${updatedUser.lastName}`,
        );
      } else {
        console.log('\n❌ Operation cancelled.');
      }
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate membership ID
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    const membershipId = `ALM-${year}-${random}`;

    // Create admin user
    const admin = await prisma.member.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone: phone || '0000000000',
        membershipId,
        role: 'ADMIN',
        status: 'Active',
        gender: 'Other',
      },
    });

    console.log('\n✅ Admin user created successfully!\n');
    console.log('User ID:', admin.id);
    console.log('Email:', admin.email);
    console.log('Name:', `${admin.firstName} ${admin.lastName}`);
    console.log('Membership ID:', admin.membershipId);
    console.log('Role:', admin.role);
    console.log('Status:', admin.status);
    console.log('\n🔑 You can now login with these credentials.');
  } catch (error) {
    console.error('\n❌ Error creating admin:', error);
  } finally {
    rl.close();
    await prisma.$disconnect();
  }
}

// Run the script
createAdmin();

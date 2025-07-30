const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  // 1. Clear Old Data (order matters due to FKs)
  await prisma.callLog.deleteMany();
  await prisma.sale.deleteMany();
  await prisma.appointment.deleteMany();
  await prisma.contactDocument.deleteMany();
  await prisma.contactTag.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.user.deleteMany();

  // 2. Insert Users
  const karus = await prisma.user.create({
    data: {
      name: 'Karus Admin',
      email: 'karus.admin@example.com',
      passwordHash: await bcrypt.hash('adminpass', 10),
      role: 'admin',
    }
  });
  const john = await prisma.user.create({
    data: {
      name: 'John',
      email: 'john.employee@example.com',
      passwordHash: await bcrypt.hash('johnpass', 10),
      role: 'employee',
    }
  });
  const sarah = await prisma.user.create({
    data: {
      name: 'Sarah',
      email: 'sarah.employee@example.com',
      passwordHash: await bcrypt.hash('sarahpass', 10),
      role: 'employee',
    }
  });

  // 3. Insert Contacts
  const contacts = [];
  for (let i = 1; i <= 5; i++) {
    contacts.push(await prisma.contact.create({
      data: {
        type: 'individual',
        firstName: `Contact${i}`,
        lastName: `Test${i}`,
        mobile: `55500000${randomInt(100 + i, 999 + i)}`,
        email: `contact${i}@example.com`,
        createdBy: karus.id
      }
    }));
  }

  // 4. Insert Appointments
  const today = new Date();
  today.setHours(10, 0, 0, 0);
  const statuses = ['pending', 'confirmed', 'completed'];
  for (let i = 0; i < 5; i++) {
    await prisma.appointment.create({
      data: {
        userId: i % 2 === 0 ? john.id : sarah.id,
        contactId: contacts[i % contacts.length].id,
        title: `Today Meeting ${i+1}`,
        description: 'Discuss project',
        startTime: new Date(today.getTime() + i * 3600000),
        endTime: new Date(today.getTime() + (i+1) * 3600000),
        status: statuses[i % statuses.length],
      }
    });
  }
  // 3 more appointments this week
  const weekBase = new Date();
  weekBase.setDate(weekBase.getDate() + 2);
  weekBase.setHours(14, 0, 0, 0);
  for (let i = 0; i < 3; i++) {
    await prisma.appointment.create({
      data: {
        userId: i % 2 === 0 ? john.id : sarah.id,
        contactId: contacts[(i+2) % contacts.length].id,
        title: `Week Meeting ${i+1}`,
        description: 'Weekly sync',
        startTime: new Date(weekBase.getTime() + i * 86400000),
        endTime: new Date(weekBase.getTime() + i * 86400000 + 3600000),
        status: statuses[(i+1) % statuses.length],
      }
    });
  }

  // 5. Insert Sales
  for (let i = 0; i < 3; i++) {
    await prisma.sale.create({
      data: {
        userId: john.id,
        contactId: contacts[i].id,
        amount: randomInt(100, 500),
        saleType: 'product',
        saleDate: new Date(),
        notes: 'Test sale',
      }
    });
  }
  for (let i = 0; i < 2; i++) {
    await prisma.sale.create({
      data: {
        userId: sarah.id,
        contactId: contacts[i+3].id,
        amount: randomInt(100, 500),
        saleType: 'service',
        saleDate: new Date(),
        notes: 'Test sale',
      }
    });
  }

  // 6. Insert Call Logs
  for (let i = 0; i < 5; i++) {
    await prisma.callLog.create({
      data: {
        userId: i % 2 === 0 ? john.id : sarah.id,
        phoneNumber: contacts[i % contacts.length].mobile,
        poolId: null,
        status: 'answered',
        outcome: 'sale',
        duration: 120 + i * 10,
        callTime: new Date(),
        notes: 'Answered call',
      }
    });
  }
  for (let i = 0; i < 3; i++) {
    await prisma.callLog.create({
      data: {
        userId: i % 2 === 0 ? john.id : sarah.id,
        phoneNumber: contacts[i % contacts.length].mobile,
        poolId: null,
        status: 'missed',
        outcome: 'no-answer',
        duration: 0,
        callTime: new Date(),
        notes: 'Missed call',
      }
    });
  }

  console.log('Seed data inserted successfully.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());  
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const contacts = await prisma.contact.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
            sender: { select: { id: true, firstName: true, email: true } },
            recipient: { select: { id: true, firstName: true, email: true } },
            property: { select: { id: true, title: true } }
        }
    });

    console.log('--- RECENT CONTACTS ---');
    contacts.forEach(c => {
        console.log(`ID: ${c.id}`);
        console.log(`From: ${c.sender?.firstName} (${c.senderId})`);
        console.log(`To: ${c.recipient?.firstName} (${c.recipientId})`);
        console.log(`Message: ${c.message.substring(0, 20)}...`);
        console.log(`Property: ${c.property?.title}`);
        console.log('---');
    });

    const total = await prisma.contact.count();
    console.log(`TOTAL CONTACTS: ${total}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

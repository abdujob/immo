import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- STARTING CONTACT RECIPIENT FIX ---');

    // Find all contacts
    const contacts = await prisma.contact.findMany({
        include: {
            property: {
                select: { ownerId: true }
            }
        }
    });

    console.log(`Processing ${contacts.length} contacts...`);
    let updatedCount = 0;

    for (const contact of contacts) {
        if (contact.property && contact.recipientId !== contact.property.ownerId && contact.senderId !== contact.property.ownerId) {
            // If the recipient is not the owner and we are not the owner, 
            // then for legacy messages (where recipientId might be wrong), 
            // we set the recipient to the property owner.

            // actually, keep it simple: if parentId is null, the recipient MUST be the property owner.
            if (!contact.parentId && contact.recipientId !== contact.property.ownerId) {
                await prisma.contact.update({
                    where: { id: contact.id },
                    data: { recipientId: contact.property.ownerId }
                });
                updatedCount++;
            }
        }
    }

    console.log(`Successfully updated ${updatedCount} contacts.`);
    console.log('--- DONE ---');
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const property = await prisma.property.findUnique({
        where: { id: 'a94b48e4-1c35-44ac-bc76-b6228cbf92b1' }, // ID de l'annonce démo
        select: { title: true, images: true }
    });

    console.log("Détails de l'annonce démo :");
    console.log(property);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

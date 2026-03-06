import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();
  await prisma.agency.deleteMany();

  // Hash password for test users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // ============================================
  // CREATE AGENCIES
  // ============================================

  const agencySenImmo = await prisma.agency.create({
    data: {
      name: 'SenImmo Plus',
      description: 'Agence immobilière de référence au Sénégal depuis 2010. Spécialisée dans la vente et location de biens haut de gamme.',
      address: 'Rue 6, Point E',
      city: 'Dakar',
      phone: '+221 33 824 50 60',
      email: 'contact@senimmoplus.sn',
      website: 'https://senimmoplus.sn',
      verified: true,
    },
  });

  const agencyDakarHabitat = await prisma.agency.create({
    data: {
      name: 'Dakar Habitat',
      description: 'Votre partenaire pour trouver le bien idéal à Dakar et ses environs.',
      address: 'Avenue Cheikh Anta Diop, Fann',
      city: 'Dakar',
      phone: '+221 77 123 45 67',
      email: 'info@dakarhabitat.sn',
      verified: true,
    },
  });

  // ============================================
  // CREATE USERS
  // ============================================

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@immosenegal.sn',
      password: hashedPassword,
      phone: '+221 77 000 00 00',
      firstName: 'Amadou',
      lastName: 'Diallo',
      role: 'ADMIN',
    },
  });

  const agentSenImmo = await prisma.user.create({
    data: {
      email: 'agent@senimmoplus.sn',
      password: hashedPassword,
      phone: '+221 77 111 11 11',
      firstName: 'Fatou',
      lastName: 'Sall',
      role: 'AGENCY_AGENT',
      agencyId: agencySenImmo.id,
    },
  });

  const agentDakar = await prisma.user.create({
    data: {
      email: 'agent@dakarhabitat.sn',
      password: hashedPassword,
      phone: '+221 77 222 22 22',
      firstName: 'Moussa',
      lastName: 'Ndiaye',
      role: 'AGENCY_AGENT',
      agencyId: agencyDakarHabitat.id,
    },
  });

  const individual1 = await prisma.user.create({
    data: {
      email: 'mamadou@example.sn',
      password: hashedPassword,
      phone: '+221 77 333 33 33',
      firstName: 'Mamadou',
      lastName: 'Ba',
      role: 'INDIVIDUAL',
    },
  });

  const individual2 = await prisma.user.create({
    data: {
      email: 'aissatou@example.sn',
      password: hashedPassword,
      phone: '+221 77 444 44 44',
      firstName: 'Aïssatou',
      lastName: 'Thiam',
      role: 'INDIVIDUAL',
    },
  });

  // ============================================
  // CREATE PROPERTIES
  // ============================================

  // Villa Almadies
  const villa1 = await prisma.property.create({
    data: {
      title: 'Villa moderne avec piscine aux Almadies',
      description: 'Magnifique villa de standing située dans le quartier prisé des Almadies. Cette propriété offre 5 chambres spacieuses, un grand salon, une cuisine équipée, et une piscine. Idéale pour une famille. Proche des écoles internationales et de la plage.',
      type: 'VILLA',
      transactionType: 'VENTE',
      price: 350000000, // 350M FCFA
      surface: 450,
      rooms: 7,
      bedrooms: 5,
      bathrooms: 4,
      hasGarden: true,
      hasParking: true,
      hasPool: true,
      isFurnished: false,
      hasAirCon: true,
      hasGuardian: true,
      address: 'Route des Almadies',
      city: 'Dakar',
      district: 'Almadies',
      lat: 14.7167,
      lng: -17.4833,
      images: JSON.stringify(['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1470&auto=format&fit=crop']),
      status: 'ACTIVE',
      featured: true,
      verified: true,
      views: 245,
      ownerId: agentSenImmo.id,
      agencyId: agencySenImmo.id,
    },
  });

  // Appartement Mermoz
  await prisma.property.create({
    data: {
      title: 'Appartement F4 meublé à Mermoz',
      description: 'Bel appartement de 4 pièces entièrement meublé et équipé. Situé au 3ème étage d\'un immeuble sécurisé avec ascenseur. Comprend 3 chambres, salon, cuisine moderne, 2 salles de bain. Parking disponible.',
      type: 'APPARTEMENT',
      transactionType: 'LOCATION',
      price: 450000, // 450K FCFA/mois
      surface: 120,
      rooms: 4,
      bedrooms: 3,
      bathrooms: 2,
      floor: 3,
      hasGarden: false,
      hasParking: true,
      hasPool: false,
      isFurnished: true,
      hasAirCon: true,
      hasGuardian: true,
      address: 'Cité Biagui',
      city: 'Dakar',
      district: 'Mermoz',
      lat: 14.7000,
      lng: -17.4500,
      images: JSON.stringify(['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1470&auto=format&fit=crop']),
      status: 'ACTIVE',
      featured: true,
      verified: true,
      views: 189,
      ownerId: agentDakar.id,
      agencyId: agencyDakarHabitat.id,
    },
  });

  // Terrain Mbao
  await prisma.property.create({
    data: {
      title: 'Terrain titré 500m² à Mbao',
      description: 'Terrain titré et viabilisé de 500m² situé à Mbao, zone en plein développement. Idéal pour construction de villa ou immeuble. Accès facile, proche des commodités.',
      type: 'TERRAIN',
      transactionType: 'VENTE',
      price: 25000000, // 25M FCFA
      surface: 500,
      hasGarden: false,
      hasParking: false,
      hasPool: false,
      isFurnished: false,
      hasAirCon: false,
      hasGuardian: false,
      address: 'Mbao Extension',
      city: 'Dakar',
      district: 'Mbao',
      lat: 14.7300,
      lng: -17.3500,
      images: JSON.stringify(['https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1632&auto=format&fit=crop']),
      status: 'ACTIVE',
      featured: false,
      verified: true,
      views: 67,
      ownerId: individual1.id,
    },
  });

  // Maison Sacré-Coeur
  await prisma.property.create({
    data: {
      title: 'Maison R+1 à Sacré-Cœur',
      description: 'Belle maison R+1 dans le quartier résidentiel de Sacré-Cœur. 4 chambres, 2 salons, cuisine, terrasse. Quartier calme et sécurisé.',
      type: 'MAISON',
      transactionType: 'VENTE',
      price: 180000000, // 180M FCFA
      surface: 280,
      rooms: 6,
      bedrooms: 4,
      bathrooms: 3,
      hasGarden: true,
      hasParking: true,
      hasPool: false,
      isFurnished: false,
      hasAirCon: true,
      hasGuardian: false,
      address: 'Sacré-Cœur 3',
      city: 'Dakar',
      district: 'Sacré-Cœur',
      lat: 14.7100,
      lng: -17.4600,
      images: JSON.stringify(['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1475&auto=format&fit=crop']),
      status: 'ACTIVE',
      featured: false,
      verified: true,
      views: 134,
      ownerId: individual2.id,
    },
  });

  // Studio Plateau
  await prisma.property.create({
    data: {
      title: 'Studio meublé au Plateau',
      description: 'Studio moderne et fonctionnel au cœur du Plateau. Parfait pour jeune professionnel. Meublé et équipé, prêt à habiter.',
      type: 'STUDIO',
      transactionType: 'LOCATION',
      price: 200000, // 200K FCFA/mois
      surface: 35,
      rooms: 1,
      bedrooms: 1,
      bathrooms: 1,
      floor: 2,
      hasGarden: false,
      hasParking: false,
      hasPool: false,
      isFurnished: true,
      hasAirCon: true,
      hasGuardian: true,
      address: 'Avenue Pompidou',
      city: 'Dakar',
      district: 'Plateau',
      lat: 14.6700,
      lng: -17.4400,
      images: JSON.stringify(['https://images.unsplash.com/photo-1536376072261-38c75010e6c9?q=80&w=1471&auto=format&fit=crop']),
      status: 'ACTIVE',
      featured: false,
      verified: true,
      views: 98,
      ownerId: agentSenImmo.id,
      agencyId: agencySenImmo.id,
    },
  });

  // Duplex Ngor
  await prisma.property.create({
    data: {
      title: 'Duplex vue mer à Ngor',
      description: 'Superbe duplex avec vue imprenable sur la mer. 3 chambres, terrasse panoramique, finitions haut de gamme. Proche de la plage de Ngor.',
      type: 'DUPLEX',
      transactionType: 'LOCATION',
      price: 800000, // 800K FCFA/mois
      surface: 180,
      rooms: 5,
      bedrooms: 3,
      bathrooms: 2,
      floor: 4,
      hasGarden: false,
      hasParking: true,
      hasPool: false,
      isFurnished: true,
      hasAirCon: true,
      hasGuardian: true,
      address: 'Cité Ngor',
      city: 'Dakar',
      district: 'Ngor',
      lat: 14.7500,
      lng: -17.5100,
      images: JSON.stringify(['https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=1470&auto=format&fit=crop']),
      status: 'ACTIVE',
      featured: true,
      verified: true,
      views: 312,
      ownerId: agentDakar.id,
      agencyId: agencyDakarHabitat.id,
    },
  });

  // Bureau Point E
  await prisma.property.create({
    data: {
      title: 'Bureau 100m² à Point E',
      description: 'Espace de bureau moderne et lumineux à Point E. Idéal pour cabinet, startup ou bureau de représentation. Climatisé, parking disponible.',
      type: 'BUREAU',
      transactionType: 'LOCATION',
      price: 350000, // 350K FCFA/mois
      surface: 100,
      rooms: 3,
      bathrooms: 1,
      floor: 1,
      hasGarden: false,
      hasParking: true,
      hasPool: false,
      isFurnished: false,
      hasAirCon: true,
      hasGuardian: true,
      address: 'Rue 6, Point E',
      city: 'Dakar',
      district: 'Point E',
      lat: 14.6950,
      lng: -17.4550,
      images: JSON.stringify(['https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1469&auto=format&fit=crop']),
      status: 'ACTIVE',
      featured: false,
      verified: true,
      views: 56,
      ownerId: individual1.id,
    },
  });

  // Commerce HLM
  await prisma.property.create({
    data: {
      title: 'Local commercial HLM Grand Yoff',
      description: 'Local commercial bien situé dans la zone commerciale de HLM Grand Yoff. Vitrine sur rue passante, idéal pour boutique ou commerce.',
      type: 'COMMERCE',
      transactionType: 'LOCATION',
      price: 500000, // 500K FCFA/mois
      surface: 60,
      rooms: 2,
      bathrooms: 1,
      hasGarden: false,
      hasParking: false,
      hasPool: false,
      isFurnished: false,
      hasAirCon: false,
      hasGuardian: false,
      address: 'HLM Grand Yoff',
      city: 'Dakar',
      district: 'HLM',
      lat: 14.7400,
      lng: -17.4700,
      images: JSON.stringify(['https://images.unsplash.com/photo-1582046427495-2acba647bf01?q=80&w=1481&auto=format&fit=crop']),
      status: 'ACTIVE',
      featured: false,
      verified: true,
      views: 78,
      ownerId: individual2.id,
    },
  });

  // ============================================
  // CREATE FAVORITES
  // ============================================

  await prisma.favorite.create({
    data: {
      userId: individual1.id,
      propertyId: villa1.id,
    },
  });

  // ============================================
  // CREATE REVIEWS
  // ============================================

  await prisma.review.create({
    data: {
      rating: 5,
      comment: 'Excellente agence, très professionnelle. M. Ndiaye m\'a aidé à trouver l\'appartement parfait !',
      targetType: 'AGENCY',
      authorId: individual1.id,
      agencyId: agencyDakarHabitat.id,
    },
  });

  await prisma.review.create({
    data: {
      rating: 4,
      comment: 'Belle villa, conforme à l\'annonce. Quartier très agréable.',
      targetType: 'PROPERTY',
      authorId: individual2.id,
      propertyId: villa1.id,
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('📊 Created:');
  console.log('  - 2 agencies');
  console.log('  - 5 users (1 admin, 2 agents, 2 individuals)');
  console.log('  - 8 properties');
  console.log('  - 1 favorite');
  console.log('  - 2 reviews');
  console.log('\n🔐 Test credentials:');
  console.log('  Admin: admin@immosenegal.sn / password123');
  console.log('  Agent: agent@senimmoplus.sn / password123');
  console.log('  User: mamadou@example.sn / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

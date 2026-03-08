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
  // ADDITIONAL DEMO PROPERTIES
  // ============================================

  // Villa Ngor with Sea View
  await prisma.property.create({
    data: {
      title: 'Villa avec vue sur l\'océan - Ngor',
      description: 'Spectaculaire villa d\'architecte avec vue panoramique sur l\'océan. 6 chambres, terrasse infinie, piscine débordante, salle de cinéma. Situation privilégiée sur les hauteurs de Ngor.',
      type: 'VILLA',
      transactionType: 'VENTE',
      price: 250000000,
      surface: 380,
      bedrooms: 6,
      bathrooms: 5,
      hasGarden: true,
      hasParking: true,
      hasPool: true,
      isFurnished: true,
      hasAirCon: true,
      hasGuardian: true,
      address: 'Route de Ngor',
      city: 'Dakar',
      district: 'Ngor',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1570129477492-45a003537e1f?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
      ]),
      status: 'ACTIVE',
      featured: true,
      verified: true,
      views: 456,
      ownerId: agentSenImmo.id,
      agencyId: agencySenImmo.id,
    },
  });

  // Luxury Apartment Plateau
  await prisma.property.create({
    data: {
      title: 'Penthouse luxe - Plateau Centre Ville',
      description: 'Magnifique penthouse haute gamme au dernier étage. 4 chambres, 3 salles de bain, salon double, bibliothèque, terrasse vue panoramique sur Dakar. Ascenseur privé, sécurité 24/24.',
      type: 'APPARTEMENT',
      transactionType: 'VENTE',
      price: 120000000,
      surface: 250,
      bedrooms: 4,
      bathrooms: 3,
      floor: 10,
      hasGarden: false,
      hasParking: true,
      hasPool: false,
      isFurnished: true,
      hasAirCon: true,
      hasGuardian: true,
      address: 'Avenue Albert Sarraut',
      city: 'Dakar',
      district: 'Plateau',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
      ]),
      status: 'ACTIVE',
      featured: true,
      verified: true,
      views: 234,
      ownerId: agentDakar.id,
      agencyId: agencyDakarHabitat.id,
    },
  });

  // Large Terrain Mbao
  await prisma.property.create({
    data: {
      title: 'Terrain lotis 1000m² - Mbao extension',
      description: 'Grand terrain titré et complètement viabilisé. Idéal pour projet immobilier important. Électricité, eau, route bitumée. Zone en forte appréciation.',
      type: 'TERRAIN',
      transactionType: 'VENTE',
      price: 35000000,
      surface: 1000,
      hasGarden: false,
      hasParking: false,
      hasPool: false,
      isFurnished: false,
      hasAirCon: false,
      hasGuardian: false,
      address: 'Mbao extension zone 3',
      city: 'Dakar',
      district: 'Mbao',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1500595046891-b45dda4d6cbd?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=800&h=600&fit=crop',
      ]),
      status: 'ACTIVE',
      featured: false,
      verified: true,
      views: 123,
      ownerId: individual1.id,
    },
  });

  // Modern House Liberté
  await prisma.property.create({
    data: {
      title: 'Maison moderne R+1 - Liberté 6',
      description: 'Maison contemporaine avec finitions modernes. 4 chambres spacieuses, 3 salles de bain, cuisine américaine équipée, jardin aménagé, garage double. Quartier résidentiel calme.',
      type: 'MAISON',
      transactionType: 'VENTE',
      price: 95000000,
      surface: 220,
      bedrooms: 4,
      bathrooms: 3,
      hasGarden: true,
      hasParking: true,
      hasPool: false,
      isFurnished: false,
      hasAirCon: true,
      hasGuardian: false,
      address: 'Avenue Moussa Diallo, Liberté 6',
      city: 'Dakar',
      district: 'Liberté 6',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1575458495149-7adc08f7cab9?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
      ]),
      status: 'ACTIVE',
      featured: true,
      verified: true,
      views: 289,
      ownerId: individual2.id,
    },
  });

  // Budget Apartment Medina
  await prisma.property.create({
    data: {
      title: 'Appartement F3 - Medina (Abordable)',
      description: 'Appartement 3 pièces accessible dans quartier populaire. 2 chambres, salon, cuisine, salle de bain. Immeuble calme, proche transports. Idéal pour première acquisition.',
      type: 'APPARTEMENT',
      transactionType: 'VENTE',
      price: 25000000,
      surface: 80,
      bedrooms: 2,
      bathrooms: 1,
      floor: 2,
      hasGarden: false,
      hasParking: false,
      hasPool: false,
      isFurnished: false,
      hasAirCon: false,
      hasGuardian: true,
      address: 'Rue 10, Medina',
      city: 'Dakar',
      district: 'Medina',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
      ]),
      status: 'ACTIVE',
      featured: false,
      verified: true,
      views: 156,
      ownerId: individual1.id,
    },
  });

  // Duplex Luxury Ngor
  await prisma.property.create({
    data: {
      title: 'Duplex de prestige - Ngor Almadies',
      description: 'Luxueux duplex avec ascenseur privé, piscine sur terrasse, 4 chambres, 3 salles de bain, cuisine professionnelle, cave à vin. Finitions haut de gamme, vue imprenable.',
      type: 'DUPLEX',
      transactionType: 'VENTE',
      price: 180000000,
      surface: 300,
      bedrooms: 4,
      bathrooms: 3,
      hasGarden: false,
      hasParking: true,
      hasPool: true,
      isFurnished: true,
      hasAirCon: true,
      hasGuardian: true,
      address: 'Cité des Almadies',
      city: 'Dakar',
      district: 'Almadies',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
      ]),
      status: 'ACTIVE',
      featured: true,
      verified: true,
      views: 367,
      ownerId: agentDakar.id,
      agencyId: agencyDakarHabitat.id,
    },
  });

  // Studio Fann
  await prisma.property.create({
    data: {
      title: 'Studio F1 - Fann (Étudiant)',
      description: 'Petit studio fonctionnel aux Fann, parfait pour étudiant. Pièce principale avec lit, kitchenette, salle de bain. Chauffage eau, électricité, immeuble sécurisé.',
      type: 'STUDIO',
      transactionType: 'LOCATION',
      price: 120000,
      surface: 28,
      bedrooms: 0,
      bathrooms: 1,
      floor: 1,
      hasGarden: false,
      hasParking: false,
      hasPool: false,
      isFurnished: true,
      hasAirCon: false,
      hasGuardian: true,
      address: 'Rue 15, Fann',
      city: 'Dakar',
      district: 'Fann',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?q=80&w=1471&auto=format&fit=crop',
      ]),
      status: 'ACTIVE',
      featured: false,
      verified: true,
      views: 89,
      ownerId: agentSenImmo.id,
      agencyId: agencySenImmo.id,
    },
  });

  // Bureau Coworking Point E
  await prisma.property.create({
    data: {
      title: 'Espace de coworking - Point E',
      description: 'Espaces de travail modernes et flexibles. Accès à salle de réunion, internet haut débit, café gratuit. Parfait pour startups et freelancers. À l\'heure, jour ou mois.',
      type: 'BUREAU',
      transactionType: 'LOCATION',
      price: 50000,
      surface: 150,
      rooms: 5,
      bathrooms: 2,
      floor: 2,
      hasGarden: false,
      hasParking: true,
      hasPool: false,
      isFurnished: true,
      hasAirCon: true,
      hasGuardian: true,
      address: 'Rue 1, Point E',
      city: 'Dakar',
      district: 'Point E',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=1469&auto=format&fit=crop',
      ]),
      status: 'ACTIVE',
      featured: false,
      verified: true,
      views: 145,
      ownerId: individual2.id,
    },
  });

  // Commerce Dakar Centre
  await prisma.property.create({
    data: {
      title: 'Local commercial prestige - Centre ville',
      description: 'Beau local commercial avec grande vitrine, étage arrière, climatisation. Situation de rêve en centre-ville. Parfait pour boutique, restaurant ou agence haute gamme.',
      type: 'COMMERCE',
      transactionType: 'LOCATION',
      price: 1200000,
      surface: 120,
      rooms: 3,
      bathrooms: 2,
      floor: 0,
      hasGarden: false,
      hasParking: false,
      hasPool: false,
      isFurnished: false,
      hasAirCon: true,
      hasGuardian: true,
      address: 'Avenue Lamine Guèye',
      city: 'Dakar',
      district: 'Centre',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1582046427495-2acba647bf01?q=80&w=1481&auto=format&fit=crop',
      ]),
      status: 'ACTIVE',
      featured: false,
      verified: true,
      views: 234,
      ownerId: agentDakar.id,
      agencyId: agencyDakarHabitat.id,
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
  console.log('  - 18 properties (villas, apartments, houses, studios, duplex, offices, commerce, terrain)');
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

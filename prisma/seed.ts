import { PrismaClient, Role } from '@prisma/client'; // Changed UserRole to Role
import { makeDocuments } from './data/documents';

const prisma = new PrismaClient();
const SHOULD_UPLOAD = false; // Set to true if you want real S3 uploads

async function main() {
  console.log('🌱  Begin Seeding...');

  // 1. Clean up old data (Optional: Uncomment to wipe DB before seeding)
  // await prisma.documentAnalytics.deleteMany();
  // await prisma.documentLinkVisitor.deleteMany();
  // await prisma.documentLink.deleteMany();
  // await prisma.document.deleteMany();
  // await prisma.userCategoryAccess.deleteMany();
  // await prisma.category.deleteMany();
  // await prisma.department.deleteMany();
  // await prisma.user.deleteMany();

  // 2. Create Organization Structure
  console.log('➤ Creating Organization Structure...');
  
  const legalDept = await prisma.department.create({
    data: { name: 'Legal Department', description: 'Legal docs and contracts' }
  });

  const contractsCat = await prisma.category.create({
    data: { name: 'Contracts', departmentId: legalDept.id }
  });

  const financialsCat = await prisma.category.create({
    data: { name: 'Financials', departmentId: legalDept.id }
  });

  // 3. Create Users
  console.log('➤ Creating Users...');
  
  // Create a specific View Only User for testing
  const viewUser = await prisma.user.create({
    data: {
      email: 'view@test.com',
      firstName: 'View',
      lastName: 'User',
      role: Role.VIEW_ONLY_USER, // Using the correct Enum from your schema
      status: 'ACTIVE',
      // Note: If you are using bcrypt in your app, you should hash this password manually here
      // e.g. password: await hash('password123', 10)
      password: 'password123', 
    }
  });

  // Create a Master Admin
  await prisma.user.create({
    data: {
      email: 'admin@test.com',
      firstName: 'Master',
      lastName: 'Admin',
      role: Role.MASTER_ADMIN,
      status: 'ACTIVE',
      password: 'password123',
    }
  });

  // 4. Grant Access
  console.log('➤ Granting Permissions...');
  
  // Give ViewUser access to the "Contracts" category
  await prisma.userCategoryAccess.create({
    data: {
      userId: viewUser.id,
      categoryId: contractsCat.id,
      canUpload: false,
      canDelete: false
    }
  });

  // 5. Create Documents attached to Categories
  console.log('➤ Seeding Documents...');

  // FIX: We cast this to 'any' to bypass the TypeScript error about missing 'email'
  // We use viewUser.id (the CUID) so the relation works correctly
  const mockUserList = [{ userId: viewUser.id }] as any; 

  // Generate 5 documents for Contracts
  const rawDocs = await makeDocuments(mockUserList, SHOULD_UPLOAD, 5);

  const docsWithCategory = rawDocs.map(doc => ({
    ...doc,
    categoryId: contractsCat.id, // <--- IMPORTANT: Link to category
    userId: viewUser.id 
  }));

  await prisma.document.createMany({ data: docsWithCategory });

  // Generate 3 documents for Financials (Hidden from view user)
  const rawDocs2 = await makeDocuments(mockUserList, SHOULD_UPLOAD, 3);
  const hiddenDocs = rawDocs2.map(doc => ({
    ...doc,
    categoryId: financialsCat.id,
    userId: viewUser.id
  }));
  
  await prisma.document.createMany({ data: hiddenDocs });

  console.log('✅ Seed complete!');
  console.log('-------------------------------------------');
  console.log(`Test User Email: view@test.com`);
  console.log(`Test User Role : ${Role.VIEW_ONLY_USER}`);
  console.log(`Has Access To  : ${contractsCat.name}`);
  console.log('-------------------------------------------');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => prisma.$disconnect());
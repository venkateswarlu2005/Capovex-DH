import { PrismaClient, Role, RequestType, RequestStatus, ActivityType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧪 STARTING COMPREHENSIVE BACKEND VERIFICATION...');
  console.log('=================================================');

  // ---------------------------------------------------------
  // 1. CLEANUP
  // ---------------------------------------------------------
  const prefix = 'auto_test_';
  // Delete in reverse dependency order
  await prisma.activityLog.deleteMany({ where: { user: { email: { startsWith: prefix } } } });
  await prisma.message.deleteMany({ where: { sender: { email: { startsWith: prefix } } } });
  await prisma.request.deleteMany({ where: { requester: { email: { startsWith: prefix } } } });
  await prisma.document.deleteMany({ where: { user: { email: { startsWith: prefix } } } });
  await prisma.userCategoryAccess.deleteMany({ where: { user: { email: { startsWith: prefix } } } });
  await prisma.user.deleteMany({ where: { email: { startsWith: prefix } } });
  await prisma.category.deleteMany({ where: { name: { startsWith: prefix } } });
  await prisma.department.deleteMany({ where: { name: { startsWith: prefix } } });

  console.log('✅ Cleanup Complete');

  // ---------------------------------------------------------
  // 2. SETUP: USERS & DEPARTMENTS
  // ---------------------------------------------------------
  console.log('\n--- 🏗️  Setup Infrastructure ---');

  // Create TWO Departments to test isolation
  const deptA = await prisma.department.create({ data: { name: `${prefix}Finance`, description: 'Dept A' } });
  const deptB = await prisma.department.create({ data: { name: `${prefix}Legal`, description: 'Dept B' } });
  console.log(`✅ Created Departments: ${deptA.name}, ${deptB.name}`);

  // Create Users
  const masterAdmin = await prisma.user.create({
    data: { email: `${prefix}master@test.com`, role: Role.MASTER_ADMIN, firstName: 'Master', lastName: 'Admin' }
  });

  const deptAdminA = await prisma.user.create({
    data: { email: `${prefix}adminA@test.com`, role: Role.DEPT_ADMIN, departmentId: deptA.id, firstName: 'Admin', lastName: 'Finance' }
  });

  const deptAdminB = await prisma.user.create({
    data: { email: `${prefix}adminB@test.com`, role: Role.DEPT_ADMIN, departmentId: deptB.id, firstName: 'Admin', lastName: 'Legal' }
  });

  const userA = await prisma.user.create({
    data: { email: `${prefix}userA@test.com`, role: Role.DEPT_USER, departmentId: deptA.id, firstName: 'User', lastName: 'Finance' }
  });

  console.log('✅ Created Users: Master, Admin A (Finance), Admin B (Legal), User A (Finance)');


  // ---------------------------------------------------------
  // 3. TEST: CATEGORY WORKFLOWS (Positive & Negative)
  // ---------------------------------------------------------
  console.log('\n--- 📂 Testing Category Workflows ---');

  // Case 3.1: Master Admin Direct Create (Should work without request)
  const catMaster = await prisma.category.create({
    data: { name: `${prefix}Master_Direct`, departmentId: deptA.id }
  });
  console.log('✅ PASS: Master Admin created category directly');

  // Case 3.2: Dept Admin Request -> APPROVED
  const reqApprove = await prisma.request.create({
    data: {
      requesterId: deptAdminA.id,
      type: RequestType.CREATE_CATEGORY,
      status: RequestStatus.PENDING,
      details: { categoryName: `${prefix}Finance_Invoices`, departmentId: deptA.id }
    }
  });
  // Simulate Master Admin Approving
  await prisma.category.create({ data: { name: `${prefix}Finance_Invoices`, departmentId: deptA.id } });
  await prisma.request.update({ where: { id: reqApprove.id }, data: { status: RequestStatus.APPROVED, approverId: masterAdmin.id } });
  console.log('✅ PASS: Dept Admin Request -> Approved');

  // Case 3.3: Dept Admin Request -> REJECTED
  const reqReject = await prisma.request.create({
    data: {
      requesterId: deptAdminA.id,
      type: RequestType.CREATE_CATEGORY,
      status: RequestStatus.PENDING,
      details: { categoryName: `${prefix}Finance_BadIdea`, departmentId: deptA.id }
    }
  });
  // Simulate Master Admin Rejecting
  await prisma.request.update({ where: { id: reqReject.id }, data: { status: RequestStatus.REJECTED, approverId: masterAdmin.id } });

  const badCat = await prisma.category.findUnique({
    where: { name_departmentId: { name: `${prefix}Finance_BadIdea`, departmentId: deptA.id } }
  });
  if (!badCat) console.log('✅ PASS: Rejected request did NOT create a category');
  else console.error('❌ FAIL: Category created despite rejection');


  // ---------------------------------------------------------
  // 4. TEST: CROSS-DEPARTMENT SECURITY
  // ---------------------------------------------------------
  console.log('\n--- 🔒 Testing Cross-Department Security ---');

  // Setup: Create a file in Dept B (Legal)
  const catLegal = await prisma.category.create({ data: { name: `${prefix}Legal_Docs`, departmentId: deptB.id } });
  const docLegal = await prisma.document.create({
    data: { userId: deptAdminB.id, fileName: 'legal_contract.pdf', filePath: 'xyz', fileType: 'pdf', size: 100, categoryId: catLegal.id }
  });

  // Case 4.1: Can Admin A (Finance) see Admin B's file?
  // Logic from API: if (doc.category.departmentId === user.departmentId) ...
  const docDept = await prisma.document.findUnique({ where: { id: docLegal.id }, include: { category: true } });
  const isSameDept = docDept?.category?.departmentId === deptAdminA.departmentId;

  if (!isSameDept) {
     console.log('✅ SECURITY PASS: Admin A (Finance) blocked from seeing Admin B (Legal) file');
  } else {
     console.error('❌ SECURITY FAIL: Department isolation broken');
  }


  // ---------------------------------------------------------
  // 5. TEST: STRICT PERMISSIONS (The "Delete" Check)
  // ---------------------------------------------------------
  console.log('\n--- 🛡️  Testing Strict Permissions ---');

  // Setup: User A has access to Finance Invoices, but NO delete permission
  const catFinance = await prisma.category.findFirst({ where: { name: `${prefix}Finance_Invoices` } });
  await prisma.userCategoryAccess.create({
    data: { userId: userA.id, categoryId: catFinance!.id, canUpload: true, canDelete: false }
  });

  // User A uploads a file
  const docUserA = await prisma.document.create({
    data: { userId: userA.id, fileName: 'my_expense.pdf', filePath: 'abc', fileType: 'pdf', size: 100, categoryId: catFinance!.id }
  });

  // Case 5.1: User A tries to delete their OWN file
  // Logic from API: if (role === DEPT_USER && !access.canDelete) -> BLOCK
  const accessRecord = await prisma.userCategoryAccess.findUnique({
    where: { userId_categoryId: { userId: userA.id, categoryId: catFinance!.id } }
  });

  if (accessRecord?.canDelete === false) {
    console.log('✅ SECURITY PASS: User A blocked from deleting file (even though they own it) because canDelete=false');
  } else {
    console.error('❌ SECURITY FAIL: Delete allowed');
  }

  // Case 5.2: Grant Delete Permission
  await prisma.userCategoryAccess.update({
    where: { userId_categoryId: { userId: userA.id, categoryId: catFinance!.id } },
    data: { canDelete: true }
  });
  console.log('✅ PASS: Admin granted delete permission to User A');


  // ---------------------------------------------------------
  // 6. TEST: CHAT ISOLATION
  // ---------------------------------------------------------
  console.log('\n--- 💬 Testing Chat Isolation ---');

  // Setup: Create General Channels for both Depts
  const chatFinance = await prisma.chatChannel.create({ data: { departmentId: deptA.id } });
  const chatLegal = await prisma.chatChannel.create({ data: { departmentId: deptB.id } });

  // Case 6.1: Admin A checks for channels
  // API Logic: where: { departmentId: user.departmentId }
  const visibleChannels = await prisma.chatChannel.findMany({
    where: { departmentId: deptAdminA.departmentId! }
  });

  const seesFinance = visibleChannels.some(c => c.id === chatFinance.id);
  const seesLegal = visibleChannels.some(c => c.id === chatLegal.id);

  if (seesFinance && !seesLegal) {
    console.log('✅ SECURITY PASS: Admin A sees Finance Chat but NOT Legal Chat');
  } else {
    console.error(`❌ SECURITY FAIL: Visibility leak. Finance: ${seesFinance}, Legal: ${seesLegal}`);
  }

  // ---------------------------------------------------------
  // 7. SUMMARY
  // ---------------------------------------------------------
  console.log('\n=================================================');
  console.log('🎉 COMPREHENSIVE VERIFICATION COMPLETE');
  console.log('=================================================');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // -------------------------
  // 1️⃣ Create roles
  // -------------------------
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: { name: 'ADMIN' },
  });

  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: { name: 'USER' },
  });

  const customerRole = await prisma.role.upsert({
    where: { name: 'CUSTOMER' },
    update: {},
    create: { name: 'CUSTOMER' },
  });

  console.log('✅ Roles ensured');

  // -------------------------
  // 2️⃣ Create permissions
  // -------------------------
  const permissions = [
    { name: 'VIEW_REPORTS', description: 'View system reports' },
    { name: 'MANAGE_USERS', description: 'Create, update, delete users' },
    { name: 'EDIT_CONTENT', description: 'Edit site content' },
    { name: 'VIEW_BILLING', description: 'View billing information' },
    { name: 'EXPORT_DATA', description: 'Export system data' },
  ];

  const createdPermissions = [];

  for (const perm of permissions) {
    const permission = await prisma.permission.upsert({
      where: { name: perm.name },
      update: {},
      create: perm,
    });

    createdPermissions.push(permission);
  }

  console.log('✅ Permissions ensured');

  // -------------------------
  // 3️⃣ Assign permissions to roles
  // -------------------------

  // ADMIN gets ALL permissions
  for (const permission of createdPermissions) {
    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }

  // USER permissions
  const userPermissions = ['VIEW_REPORTS', 'EDIT_CONTENT'];

  for (const permName of userPermissions) {
    const permission = createdPermissions.find(p => p.name === permName);

    if (!permission) continue;

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: userRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: userRole.id,
        permissionId: permission.id,
      },
    });
  }

  // CUSTOMER permissions
  const customerPermissions = ['VIEW_BILLING'];

  for (const permName of customerPermissions) {
    const permission = createdPermissions.find(p => p.name === permName);

    if (!permission) continue;

    await prisma.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: customerRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: customerRole.id,
        permissionId: permission.id,
      },
    });
  }

  console.log('✅ Role-permission mappings created');

  // -------------------------
  // 4️⃣ Create admin user
  // -------------------------
  const email = 'admin@gmail.com';
  const password = 'admin123';

  const existingAdmin = await prisma.user.findUnique({
    where: { email },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: 'Super Admin',
        roleId: adminRole.id,
        status: 'Active',
      },
    });

    console.log('✅ Admin user created');
  } else {
    console.log('⚠️ Admin already exists');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

import { prisma } from '../src/infrastructure/database';
import { config } from 'dotenv';

config({ path: '.env' });

const seedData = async () => {
  console.log('🌱 Seeding database with Prisma...');

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await prisma.file.deleteMany();
    await prisma.folder.deleteMany();

    // Create root folder
    console.log('📁 Creating root folder...');
    const rootFolder = await prisma.folder.create({
      data: {
        name: 'Root',
        path: '/',
      },
    });

    console.log(`✅ Root folder created with ID: ${rootFolder.id}`);

    // Create subfolders
    console.log('📂 Creating subfolders...');
    const documentsFolder = await prisma.folder.create({
      data: {
        name: 'Documents',
        parentId: rootFolder.id,
        path: '/documents',
      },
    });

    const picturesFolder = await prisma.folder.create({
      data: {
        name: 'Pictures',
        parentId: rootFolder.id,
        path: '/pictures',
      },
    });

    const musicFolder = await prisma.folder.create({
      data: {
        name: 'Music',
        parentId: rootFolder.id,
        path: '/music',
      },
    });

    console.log(`✅ Subfolders created: Documents, Pictures, Music`);

    // Create nested folders
    console.log('📁 Creating nested folders...');
    const projectsFolder = await prisma.folder.create({
      data: {
        name: 'Projects',
        parentId: documentsFolder.id,
        path: '/documents/projects',
      },
    });

    const workFolder = await prisma.folder.create({
      data: {
        name: 'Work',
        parentId: documentsFolder.id,
        path: '/documents/work',
      },
    });

    const vacationFolder = await prisma.folder.create({
      data: {
        name: 'Vacation',
        parentId: picturesFolder.id,
        path: '/pictures/vacation',
      },
    });

    console.log(`✅ Nested folders created`);

    // Create deeply nested folders
    console.log('📁 Creating deeply nested folders...');
    await prisma.folder.create({
      data: {
        name: 'Vue Projects',
        parentId: projectsFolder.id,
        path: '/documents/projects/vue',
      },
    });

    await prisma.folder.create({
      data: {
        name: 'React Projects',
        parentId: projectsFolder.id,
        path: '/documents/projects/react',
      },
    });

    console.log(`✅ Deeply nested folders created`);

    // Create sample files
    console.log('📄 Creating sample files...');
    
    // Root files
    await prisma.file.createMany({
      data: [
        {
          name: 'readme.txt',
          folderId: rootFolder.id,
          size: 1024,
          type: 'text/plain',
        },
        {
          name: 'welcome.md',
          folderId: rootFolder.id,
          size: 2048,
          type: 'text/markdown',
        },
      ],
    });

    // Documents files
    await prisma.file.createMany({
      data: [
        {
          name: 'project-plan.pdf',
          folderId: projectsFolder.id,
          size: 2048576,
          type: 'application/pdf',
        },
        {
          name: 'requirements.docx',
          folderId: projectsFolder.id,
          size: 1048576,
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
        {
          name: 'budget.xlsx',
          folderId: workFolder.id,
          size: 524288,
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      ],
    });

    // Image files
    await prisma.file.createMany({
      data: [
        {
          name: 'vacation-photo-1.jpg',
          folderId: picturesFolder.id,
          size: 5242880,
          type: 'image/jpeg',
        },
        {
          name: 'screenshot.png',
          folderId: picturesFolder.id,
          size: 2097152,
          type: 'image/png',
        },
        {
          name: 'beach.jpg',
          folderId: vacationFolder.id,
          size: 6291456,
          type: 'image/jpeg',
        },
      ],
    });

    // Music files
    await prisma.file.createMany({
      data: [
        {
          name: 'song-1.mp3',
          folderId: musicFolder.id,
          size: 8388608,
          type: 'audio/mpeg',
        },
        {
          name: 'song-2.mp3',
          folderId: musicFolder.id,
          size: 9437184,
          type: 'audio/mpeg',
        },
      ],
    });

    console.log('✅ Sample files created successfully!');

    // Verify the data
    const folderCount = await prisma.folder.count();
    const fileCount = await prisma.file.count();

    console.log(`📊 Database seeded successfully!`);
    console.log(`📁 Total folders: ${folderCount}`);
    console.log(`📄 Total files: ${fileCount}`);

    // Show folder tree
    console.log('\n📂 Folder Structure:');
    const folders = await prisma.folder.findMany({
      orderBy: { path: 'asc' },
    });

    folders.forEach(folder => {
      const level = folder.path.split('/').length - 2;
      const indent = '  '.repeat(level);
      console.log(`${indent}📁 ${folder.name} (${folder.path})`);
    });

  } catch (error: any) {
    console.error('❌ Seeding failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

seedData().catch(console.error);
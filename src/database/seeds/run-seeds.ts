import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../modules/users/entities/user.entity';
import { UserRole } from '../../common/enums/user-role.enum';

async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE,
    entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
    synchronize: false,
  });

  await dataSource.initialize();

  const userRepository = dataSource.getRepository(User);

  // Create sample users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const users = [
    {
      email: 'player@example.com',
      password: hashedPassword,
      name: 'John Player',
      role: UserRole.PLAYER,
      bio: 'Professional football player',
      country: 'USA',
      dateOfBirth: new Date('1995-01-15'),
      verified: true,
      passwordChangedAt: new Date(),
    },
    {
      email: 'scout@example.com',
      password: hashedPassword,
      name: 'Jane Scout',
      role: UserRole.SCOUT,
      bio: 'Professional football scout',
      country: 'UK',
      dateOfBirth: new Date('1985-05-20'),
      verified: true,
      passwordChangedAt: new Date(),
    },
    {
      email: 'user@example.com',
      password: hashedPassword,
      name: 'Bob User',
      role: UserRole.USER,
      bio: 'Football enthusiast',
      country: 'Canada',
      dateOfBirth: new Date('1990-08-10'),
      verified: false,
      passwordChangedAt: new Date(),
    },
  ];

  for (const userData of users) {
    const existingUser = await userRepository.findOne({
      where: { email: userData.email },
    });

    if (!existingUser) {
      const user = userRepository.create(userData);
      await userRepository.save(user);
      console.log(`Created user: ${userData.email}`);
    } else {
      console.log(`User already exists: ${userData.email}`);
    }
  }

  await dataSource.destroy();
  console.log('Seeding completed!');
}

seed().catch((error) => {
  console.error('Error seeding database:', error);
  process.exit(1);
});

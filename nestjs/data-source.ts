import { DataSource } from 'typeorm';
import { User } from './src/user/entities/user.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'stytch_starter',
  entities: [User],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});

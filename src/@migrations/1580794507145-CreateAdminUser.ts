import { MigrationInterface, QueryRunner, getRepository } from 'typeorm';
import UserModel from '../@models/UserModel';

export class CreateAdminUser1580794507145 implements MigrationInterface {
  public async up(_: QueryRunner): Promise<any> {
    const user = new UserModel();
    user.username = 'admin';
    user.password = 'admin';
    user.hashPassword();
    user.role = 'ADMIN';
    const userRepository = getRepository(UserModel);
    await userRepository.save(user);
  }

  public async down(_: QueryRunner): Promise<any> {}
}

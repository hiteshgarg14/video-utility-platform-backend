import { Model, DataTypes, Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USERNAME!,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: +process.env.DB_PORT!,
    dialect: 'postgres',
    logging: log => {
      console.log(log);
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
);

export default class VideoModel extends Model {
  public id!: number;
  public name!: string;
  public resolutions!: string[];

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

VideoModel.init(
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    resolutions: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
    },
  },
  {
    tableName: 'videos',
    sequelize,
  },
);

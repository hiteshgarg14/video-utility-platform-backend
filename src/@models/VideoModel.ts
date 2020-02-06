import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../@server';

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

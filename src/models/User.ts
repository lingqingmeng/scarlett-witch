import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export type UserRole = 'admin' | 'editor';

export interface UserAttributes {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'role'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;

  public email!: string;

  public passwordHash!: string;

  public role!: UserRole;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'editor'),
      allowNull: false,
      defaultValue: 'editor',
    },
  },
  {
    sequelize,
    tableName: 'users',
  }
);

export default User;

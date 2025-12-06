import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

export interface SessionAttributes {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SessionCreation extends Optional<SessionAttributes, 'id'> {}

class Session extends Model<SessionAttributes, SessionCreation> implements SessionAttributes {
  public id!: string;

  public userId!: string;

  public tokenHash!: string;

  public expiresAt!: Date;

  public readonly createdAt!: Date;

  public readonly updatedAt!: Date;
}

Session.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    tokenHash: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'sessions',
    indexes: [{ fields: ['userId'] }],
  }
);

User.hasMany(Session, { foreignKey: 'userId', as: 'sessions' });
Session.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default Session;

import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../db/sequelize';

class Url extends Model {
    public id!: number; // Defining the primary key
    public originalUrl!: string;
    public shortCode!: string;
    public createdAt!: Date;
    public clickCount!: number;
}

Url.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true, // Automatically increments with each new record
        },
        originalUrl: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        shortCode: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        clickCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
    },
    {
        sequelize,
        tableName: 'urls',
        timestamps: true, // Disables timestamps (you can set true if you want createdAt/updatedAt)
    },
);

export { Url };

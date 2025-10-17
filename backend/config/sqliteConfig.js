const { Sequelize } = require('sequelize');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// SQLite configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(dataDir, 'database.sqlite'),
  logging: console.log,
  define: {
    timestamps: true,
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

// Define models directly here to avoid circular dependency
const { DataTypes } = require('sequelize');

const Property = sequelize.define('Property', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.BIGINT,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  location: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  subLocation: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['rumah', 'apartemen', 'tanah', 'ruko']]
    }
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['dijual', 'disewa']]
    }
  },
  bedrooms: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  bathrooms: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  area: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0
    }
  },
  images: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('images');
      return typeof value === 'string' ? JSON.parse(value) : value;
    },
    set(value) {
      this.setDataValue('images', JSON.stringify(value));
    }
  },
  features: {
    type: DataTypes.TEXT,
    allowNull: false,
    defaultValue: '[]',
    get() {
      const value = this.getDataValue('features');
      return typeof value === 'string' ? JSON.parse(value) : value;
    },
    set(value) {
      this.setDataValue('features', JSON.stringify(value));
    }
  },
  whatsappNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  igUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  tiktokUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  }
}, {
  tableName: 'properties',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [3, 50]
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [6, 255]
    }
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'user',
    validate: {
      isIn: [['admin', 'user']]
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }
    }
  }
});

// Instance method to check password
User.prototype.checkPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Model untuk OTP reset password
const PasswordResetOtp = sequelize.define('PasswordResetOtp', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  used: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  }
}, {
  tableName: 'password_reset_otps',
  timestamps: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
});

// Relasi
PasswordResetOtp.belongsTo(User, { foreignKey: 'userId' });

// Ensure new optional columns exist in SQLite table (safe alter)
const ensurePropertyColumns = async () => {
  try {
    const [columns] = await sequelize.query("PRAGMA table_info('properties');");
    const names = Array.isArray(columns) ? columns.map((c) => c.name) : [];
    const addIfMissing = async (name, typeSql) => {
      if (!names.includes(name)) {
        await sequelize.query(`ALTER TABLE properties ADD COLUMN ${name} ${typeSql};`);
        console.log(`✅ Column '${name}' added to properties table.`);
      } else {
        console.log(`ℹ️  Column '${name}' already exists.`);
      }
    };
    await addIfMissing('igUrl', 'TEXT');
    await addIfMissing('tiktokUrl', 'TEXT');
  } catch (err) {
    console.error('❌ Failed to ensure property columns:', err);
  }
};

// Sync database and create tables
const syncDatabase = async () => {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ SQLite database connection established successfully.');

    // Sync models (create tables if they don't exist)
    // Use safe sync without alter to avoid SQLite backup/unique conflicts
    await sequelize.sync();
    console.log('✅ SQLite database synchronized successfully (safe sync).');

    // Ensure optional social link columns exist
    await ensurePropertyColumns();

    // Create default admin user if it doesn't exist
    await createDefaultAdmin();

    // Seed sample properties
    await seedProperties();

    return true;
  } catch (error) {
    console.error('❌ Unable to connect to SQLite database:', error);
    return false;
  }
};

// Create default admin user
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    
    if (!adminExists) {
      await User.create({
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✅ Default admin user created successfully.');
    } else {
      console.log('ℹ️  Admin user already exists.');
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
};

// Seed sample properties
const seedProperties = async () => {
  try {
    const propertyCount = await Property.count();
    
    if (propertyCount === 0) {
      const sampleProperties = [
        {
          title: "Rumah Mewah 3 Kamar Tidur",
          description: "Rumah mewah dengan 3 kamar tidur, 2 kamar mandi, dan garasi untuk 2 mobil. Lokasi strategis di Kemang dengan akses mudah ke pusat kota.",
          price: 350000000,
          location: "Jababeka, Cikarang",
          subLocation: "Jababeka",
          type: "rumah",
          status: "dijual",
          bedrooms: 3,
          bathrooms: 2,
          area: 150,
          images: ["/images/p1.png"],
          features: ["Garasi 2 mobil", "Taman luas", "Keamanan 24 jam"],
          whatsappNumber: "6281234567890"
        },
        {
          title: "Apartemen Modern 2 Kamar",
          description: "Apartemen modern dengan 2 kamar tidur, 1 kamar mandi, dan fasilitas lengkap. Cocok untuk keluarga muda atau profesional.",
          price: 1200000000,
          location: "Lippo, Cikarang",
          subLocation: "Lippo",
          type: "apartemen",
          status: "dijual",
          bedrooms: 2,
          bathrooms: 1,
          area: 80,
          images: ["/images/p2.png"],
          features: ["Swimming pool", "Gym", "Parking"],
          whatsappNumber: "6281234567890"
        },
        {
          title: "Apartemen Furnished 2 Kamar",
          description: "Apartemen furnished dengan 2 kamar tidur, 2 kamar mandi. Siap huni dengan furniture lengkap dan fasilitas premium.",
          price: 35000000,
          location: "Deltamas, Cikarang",
          subLocation: "Deltamas",
          type: "apartemen",
          status: "disewa",
          bedrooms: 2,
          bathrooms: 2,
          area: 100,
          images: ["/images/p3.png"],
          features: ["Furnished", "AC", "Internet"],
          whatsappNumber: "6281234567890"
        }
      ];

      await Property.bulkCreate(sampleProperties);
      console.log('✅ Sample properties seeded successfully.');
    } else {
      console.log('ℹ️  Properties already exist.');
    }
  } catch (error) {
    console.error('❌ Error seeding properties:', error);
  }
};

module.exports = {
  sequelize,
  syncDatabase,
  createDefaultAdmin,
  seedProperties,
  Property,
  User,
  PasswordResetOtp
};

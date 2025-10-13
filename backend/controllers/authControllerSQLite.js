const jwt = require('jsonwebtoken');
const { User, PasswordResetOtp } = require('../config/sqliteConfig');
const { sendOtpEmail } = require('../services/emailService');

class AuthController {
  // POST /api/auth/login
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      // Find user in database
      const user = await User.findOne({ 
        where: { 
          username: username,
          isActive: true
        } 
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Check password
      const isValidPassword = await user.checkPassword(password);
      
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username, 
          role: user.role 
        },
        process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            role: user.role
          },
          token: token
        },
        message: 'Login successful'
      });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // POST /api/auth/forgot-password
  static async forgotPassword(req, res) {
    try {
      const { username, email } = req.body;

      if (!username) {
        return res.status(400).json({ success: false, error: 'Username wajib diisi' });
      }

      const user = await User.findOne({ where: { username, isActive: true } });
      if (!user) {
        return res.status(404).json({ success: false, error: 'User tidak ditemukan atau tidak aktif' });
      }

      // Generate kode OTP 6 digit, berlaku 10 menit
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await PasswordResetOtp.create({
        userId: user.id,
        code: otp,
        expiresAt,
        used: false,
      });

      const targetEmail = email || process.env.ADMIN_EMAIL;
      if (!targetEmail) {
        console.warn('ADMIN_EMAIL tidak dikonfigurasi dan email tidak diberikan. OTP hanya dicetak ke log.');
      }

      await sendOtpEmail(targetEmail || 'dev@local', otp);

      return res.json({ success: true, message: 'OTP telah dikirim ke email' });
    } catch (error) {
      console.error('Error forgotPassword:', error);
      return res.status(500).json({ success: false, error: error.message || 'Terjadi kesalahan' });
    }
  }

  // POST /api/auth/reset-password
  static async resetPassword(req, res) {
    try {
      const { username, otp, newPassword } = req.body;

      if (!username || !otp || !newPassword) {
        return res.status(400).json({ success: false, error: 'username, otp, dan newPassword wajib diisi' });
      }

      const user = await User.findOne({ where: { username, isActive: true } });
      if (!user) {
        return res.status(404).json({ success: false, error: 'User tidak ditemukan atau tidak aktif' });
      }

      const otpRecord = await PasswordResetOtp.findOne({
        where: { userId: user.id, code: otp, used: false },
        order: [['createdAt', 'DESC']]
      });

      if (!otpRecord) {
        return res.status(400).json({ success: false, error: 'OTP tidak valid' });
      }

      if (new Date(otpRecord.expiresAt).getTime() < Date.now()) {
        return res.status(400).json({ success: false, error: 'OTP telah kedaluwarsa' });
      }

      // Update password (akan di-hash oleh hook)
      user.password = newPassword;
      await user.save();

      // Tandai OTP sudah digunakan
      otpRecord.used = true;
      await otpRecord.save();

      return res.json({ success: true, message: 'Password berhasil direset' });
    } catch (error) {
      console.error('Error resetPassword:', error);
      return res.status(500).json({ success: false, error: error.message || 'Terjadi kesalahan' });
    }
  }
  // POST /api/auth/verify
  static async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return res.status(401).json({
          success: false,
          error: 'No token provided'
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production');
      
      // Verify user still exists and is active
      const user = await User.findByPk(decoded.userId);
      
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'User not found or inactive'
        });
      }
      
      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            role: user.role
          }
        }
      });
    } catch (error) {
      console.error('Error verifying token:', error);
      res.status(401).json({
        success: false,
        error: 'Invalid token'
      });
    }
  }

  // POST /api/auth/register (bonus feature)
  static async register(req, res) {
    try {
      const { username, password, role = 'user' } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ 
        where: { username: username } 
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Username already exists'
        });
      }

      const user = await User.create({
        username,
        password,
        role
      });

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            username: user.username,
            role: user.role
          }
        },
        message: 'User registered successfully'
      });
    } catch (error) {
      console.error('Error during registration:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  // POST /api/admin/change-credentials
  static async changeCredentials(req, res) {
    try {
      const { currentPassword, newUsername, newPassword } = req.body;

      if (!currentPassword || !newUsername || !newPassword) {
        return res.status(400).json({
          success: false,
          error: 'currentPassword, newUsername, dan newPassword wajib diisi'
        });
      }

      // Pastikan user dari token tersedia
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Unauthorized'
        });
      }

      // Ambil user yang sedang login
      const user = await User.findByPk(userId);
      if (!user || !user.isActive) {
        return res.status(404).json({
          success: false,
          error: 'User tidak ditemukan atau tidak aktif'
        });
      }

      // Verifikasi password saat ini
      const isValid = await user.checkPassword(currentPassword);
      if (!isValid) {
        return res.status(400).json({
          success: false,
          error: 'Password saat ini tidak benar'
        });
      }

      // Cek username baru tidak digunakan oleh user lain
      const existing = await User.findOne({ where: { username: newUsername } });
      if (existing && existing.id !== user.id) {
        return res.status(400).json({
          success: false,
          error: 'Username sudah digunakan'
        });
      }

      // Update username & password
      user.username = newUsername;
      user.password = newPassword; // akan di-hash oleh hook beforeUpdate
      await user.save();

      return res.json({
        success: true,
        message: 'Kredensial berhasil diubah',
        data: {
          id: user.id,
          username: user.username,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Error changing credentials:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Terjadi kesalahan saat mengubah kredensial'
      });
    }
  }
}

module.exports = AuthController;

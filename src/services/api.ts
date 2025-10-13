const API_BASE_URL = 'http://localhost:3001/api';
const USE_FALLBACK = false; // Nonaktifkan fallback agar menggunakan backend SQLite
let nextFallbackId = 100; // ID untuk properti baru dalam fallback mode

class ApiService {
  // Helper method to make API calls
  static async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      // Spread options first, then enforce merged headers so Content-Type is not lost
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options as any).headers,
      },
    } as any;

    try {
      // Gunakan fallback hanya jika diaktifkan secara eksplisit
      if (USE_FALLBACK) {
        console.log('Using fallback data for endpoint:', endpoint);
        this.ensureFallbackLoaded();
        return this.getFallbackResponse(endpoint, options);
      }

      const response = await fetch(url, config);

      // Parse respons (prioritas JSON), tanpa fallback otomatis
      let data: any;
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          data = { success: false, error: text || 'Invalid response format' };
        }
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        return { success: false, error: 'Failed to parse response' };
      }

      // Jika status tidak OK, kembalikan data error dari server tanpa fallback
      if (!response.ok) {
        console.error('API Error:', data?.error || 'API request failed');
        return data || { success: false, error: 'API request failed' };
      }

      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      // Jangan menulis ke localStorage; kembalikan error saja
      return { success: false, error: error?.message || 'Network error' };
    }
  }
  
  // Menyimpan properti fallback
  static fallbackProperties = [
    {
      id: "1",
      title: "Rumah Mewah 3 Kamar",
      description: "Rumah mewah dengan 3 kamar tidur, 2 kamar mandi, dan kolam renang pribadi.",
      price: 750000000,
      location: "Jababeka, Cikarang",
      subLocation: "Jababeka",
      type: "rumah",
      status: "dijual",
      bedrooms: 3,
      bathrooms: 2,
      area: 180,
      images: ["/images/p1.png"],
      features: ["Kolam Renang", "Garasi", "Taman"],
      whatsappNumber: "6281234567890",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z"
    },
    {
      id: "2",
      title: "Apartemen Studio",
      description: "Apartemen studio modern di pusat kota dengan fasilitas lengkap.",
      price: 100000000,
      location: "Jababeka, Cikarang",
      subLocation: "Jababeka",
      type: "apartemen",
      status: "dijual",
      bedrooms: 1,
      bathrooms: 1,
      area: 45,
      images: ["/images/p2.png"],
      features: ["Gym", "Swimming Pool", "Security 24/7"],
      whatsappNumber: "6281234567890",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z"
    },
    {
      id: "3",
      title: "Apartemen 2BR Furnished",
      description: "Apartemen furnished dengan 2 kamar tidur, 2 kamar mandi. Siap huni dengan furniture lengkap dan fasilitas premium.",
      price: 500000000,
      location: "Jababeka, Cikarang",
      subLocation: "Jababeka",
      type: "apartemen",
      status: "dijual",
      bedrooms: 2,
      bathrooms: 2,
      area: 75,
      images: ["/images/p3.png"],
      features: ["Furnished", "Balcony", "City View"],
      whatsappNumber: "6281234567890",
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z"
    }
  ];

  // Kunci penyimpanan localStorage untuk fallback properties
  static STORAGE_KEY = 'fallback_properties';

  // Memastikan data fallback dimuat dari localStorage (jika ada)
  static ensureFallbackLoaded() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          this.fallbackProperties = parsed;
        }
      } else {
        // Simpan default ke localStorage saat pertama kali
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.fallbackProperties));
      }

      // Sinkronkan nextFallbackId berdasarkan ID numerik tertinggi yang ada
      const numericIds = this.fallbackProperties
        .map(p => parseInt(p.id, 10))
        .filter(n => !isNaN(n));
      const maxId = numericIds.length ? Math.max(...numericIds) : 0;
      if (maxId + 1 > nextFallbackId) {
        nextFallbackId = maxId + 1;
      }
    } catch (e) {
      console.error('Failed to load fallback properties from localStorage:', e);
    }
  }

  // Menyimpan fallbackProperties ke localStorage
  static persistFallback() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.fallbackProperties));
    } catch (e) {
      console.error('Failed to persist fallback properties to localStorage:', e);
    }
  }

  // Fallback response untuk saat server tidak tersedia
  static getFallbackResponse(endpoint, options) {
    // Selalu pastikan data fallback sudah dimuat
    this.ensureFallbackLoaded();
    // Endpoint untuk mendapatkan semua properti
    if (endpoint === '/properties' && options.method === 'GET') {
      return {
        success: true,
        data: this.fallbackProperties
      };
    }
    
    // Endpoint untuk menambahkan properti
    if (endpoint === '/properties' && options.method === 'POST') {
      try {
        const propertyData = JSON.parse(options.body);
        const newId = String(nextFallbackId++);
        const newProperty = {
          ...propertyData,
          id: newId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Tambahkan properti baru ke daftar properti fallback
        this.fallbackProperties.push(newProperty);
        this.persistFallback();
        
        return {
          success: true,
          data: newProperty
        };
      } catch (error) {
        return {
          success: false,
          error: 'Failed to create property'
        };
      }
    }
    
    // Menangani berbagai jenis endpoint lainnya
    if (endpoint === '/properties') {
      return {
        success: true,
        data: this.fallbackProperties,
        count: this.fallbackProperties.length
      };
    } else if (endpoint.startsWith('/properties/')) {
      const id = endpoint.split('/')[2];
      const property = this.fallbackProperties.find(p => p.id === id);
      return {
        success: true,
        data: property || this.fallbackProperties[0]
      };
    } else if (endpoint === '/auth/login') {
      return {
        success: true,
        data: {
          user: { id: '1', username: 'admin', role: 'admin' },
          token: 'dummy-token-' + Date.now()
        },
        message: 'Login successful'
      };
    } else if (options.method === 'POST' && endpoint === '/properties') {
      // Menangani pembuatan properti baru
      const newProperty = {
        ...JSON.parse(options.body),
        id: (nextFallbackId++).toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Pastikan semua properti yang diperlukan ada
      if (!newProperty.images || newProperty.images.length === 0) {
        newProperty.images = ['/images/p1.png'];
      }
      
      if (!newProperty.features) {
        newProperty.features = [];
      }
      
      // Tambahkan ke fallbackProperties untuk konsistensi data
      this.fallbackProperties.push(newProperty);
      this.persistFallback();
      
      return {
        success: true,
        data: newProperty,
        message: 'Property created successfully'
      };
    } else if (options.method === 'PUT' && endpoint.startsWith('/properties/')) {
      // Menangani update properti
      const id = endpoint.split('/')[2];
      const updatedProperty = {
        ...JSON.parse(options.body),
        id,
        updatedAt: new Date().toISOString()
      };
      const idx = this.fallbackProperties.findIndex(p => p.id === id);
      if (idx !== -1) {
        this.fallbackProperties[idx] = {
          ...this.fallbackProperties[idx],
          ...updatedProperty
        };
        this.persistFallback();
      }
      return {
        success: true,
        data: updatedProperty,
        message: 'Property updated successfully'
      };
    } else if (options.method === 'DELETE' && endpoint.startsWith('/properties/')) {
      // Menangani penghapusan properti
      const id = endpoint.split('/')[2];
      const before = this.fallbackProperties.length;
      this.fallbackProperties = this.fallbackProperties.filter(p => p.id !== id);
      if (this.fallbackProperties.length !== before) {
        this.persistFallback();
      }
      return {
        success: true,
        message: 'Property deleted successfully'
      };
    }

    // Default fallback
    return {
      success: true,
      data: {},
      message: 'Fallback response'
    };
  }

  // Authentication endpoints
  static async login(username, password) {
    // Fallback login untuk development
    if (USE_FALLBACK) {
      // Get stored credentials or use default
      const storedCredentials = JSON.parse(localStorage.getItem('adminCredentials') || '{"username": "admin", "password": "admin123"}');
      
      if (username === storedCredentials.username && password === storedCredentials.password) {
        return {
          success: true,
          data: {
            token: 'dummy-token-for-development',
            user: {
              username: storedCredentials.username,
              role: 'admin'
            }
          }
        };
      } else {
        return {
          success: false,
          error: 'Invalid username or password'
        };
      }
    }
    
    return this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  // Forgot password - request OTP
  static async requestPasswordReset(username: string, email?: string) {
    return this.makeRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ username, email }),
    });
  }

  // Reset password with OTP
  static async resetPassword(username: string, otp: string, newPassword: string) {
    return this.makeRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ username, otp, newPassword }),
    });
  }
  
  // Fungsi untuk verifikasi dan mengganti kredensial admin
  static async verifyAndChangeCredentials(currentPassword, newUsername, newPassword) {
    // Fallback untuk development
    if (USE_FALLBACK) {
      // Cek apakah ada kredensial admin yang tersimpan di localStorage
      const storedAdminCredentials = localStorage.getItem('admin_credentials');
      let adminPassword = 'admin123';
      
      if (storedAdminCredentials) {
        try {
          const credentials = JSON.parse(storedAdminCredentials);
          adminPassword = credentials.password;
        } catch (e) {
          console.error('Error parsing stored admin credentials:', e);
        }
      }
      
      // Verifikasi password saat ini
      if (currentPassword === adminPassword) {
        // Simpan kredensial baru
        localStorage.setItem('admin_credentials', JSON.stringify({
          username: newUsername,
          password: newPassword
        }));
        
        return {
          success: true,
          message: 'Credentials updated successfully'
        };
      } else {
        return {
          success: false,
          error: 'Current password is incorrect'
        };
      }
    }
    
    return this.makeRequest('/auth/change-credentials', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newUsername, newPassword }),
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      }
    });
  }

  static async verifyToken() {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('No token found');
    }

    return this.makeRequest('/auth/verify', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Property endpoints
  static async getProperties(filters = {}) {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/properties?${queryString}` : '/properties';
    
    return this.makeRequest(endpoint);
  }

  static async getPropertyById(id) {
    return this.makeRequest(`/properties/${id}`);
  }

  static async createProperty(propertyData) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Authentication required');
    }

    // Jika menggunakan fallback, buat ID baru dan tambahkan ke daftar properti
    if (USE_FALLBACK) {
      this.ensureFallbackLoaded();
      const newId = String(nextFallbackId++);
      const newProperty = {
        ...propertyData,
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Tambahkan ke fallbackProperties untuk konsistensi data
      this.fallbackProperties.push(newProperty);
      this.persistFallback();
      
      return {
        success: true,
        data: newProperty
      };
    }
    
    return this.makeRequest('/properties', {
      method: 'POST',
      body: JSON.stringify(propertyData),
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  static async updateProperty(id, propertyData) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Authentication required');
    }

    // Jika menggunakan fallback, update properti di fallbackProperties
    if (USE_FALLBACK) {
      this.ensureFallbackLoaded();
      const propertyIndex = this.fallbackProperties.findIndex(p => p.id === id);
      if (propertyIndex !== -1) {
        const updatedProperty = {
          ...this.fallbackProperties[propertyIndex],
          ...propertyData,
          id: id,
          updatedAt: new Date().toISOString()
        };
        this.fallbackProperties[propertyIndex] = updatedProperty;
        this.persistFallback();
        
        return {
          success: true,
          data: updatedProperty
        };
      } else {
        return {
          success: false,
          error: 'Property not found'
        };
      }
    }

    return this.makeRequest(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(propertyData),
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  static async deleteProperty(id) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw new Error('Authentication required');
    }

    // Jika menggunakan fallback, hapus properti dari fallbackProperties
    if (USE_FALLBACK) {
      this.ensureFallbackLoaded();
      const propertyIndex = this.fallbackProperties.findIndex(p => p.id === id);
      if (propertyIndex !== -1) {
        this.fallbackProperties.splice(propertyIndex, 1);
        this.persistFallback();
        
        return {
          success: true,
          message: 'Property deleted successfully'
        };
      } else {
        return {
          success: false,
          error: 'Property not found'
        };
      }
    }

    return this.makeRequest(`/properties/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  }

  // Change admin credentials
  static async changeCredentials(currentPassword, newCredentials, token) {
    if (USE_FALLBACK) {
      // Simulate credential change in fallback mode
      const storedCredentials = JSON.parse(localStorage.getItem('adminCredentials') || '{"username": "admin", "password": "admin123"}');
      
      if (storedCredentials.password !== currentPassword) {
        return {
          success: false,
          error: 'Password saat ini tidak benar'
        };
      }

      // Update stored credentials
      localStorage.setItem('adminCredentials', JSON.stringify(newCredentials));
      
      return {
        success: true,
        message: 'Kredensial berhasil diubah'
      };
    }

    return this.makeRequest('/admin/change-credentials', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword,
        newUsername: newCredentials.username,
        newPassword: newCredentials.password
      }),
    });
  }

  // Health check
  static async healthCheck() {
    return this.makeRequest('/health');
  }

  // Migrasi data dari localStorage (fallback) ke SQLite backend
  static async migrateFallbackToSQLite() {
    try {
      if (USE_FALLBACK) {
        // Jika fallback aktif, tidak ada migrasi ke backend
        return { success: false, message: 'Fallback mode aktif; migrasi dilewati' };
      }

      const token = localStorage.getItem('auth_token');
      if (!token) {
        return { success: false, error: 'Not authenticated' };
      }

      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) {
        return { success: true, message: 'No local fallback data found' };
      }

      let localProps: any[] = [];
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) localProps = parsed;
      } catch (e) {
        console.error('Failed to parse local fallback properties for migration:', e);
        return { success: false, error: 'Invalid local fallback data' };
      }

      // Ambil data dari backend untuk deduplikasi sederhana
      const backendResp = await this.getProperties();
      const backendProps: any[] = backendResp?.success ? backendResp.data || [] : [];
      const backendFingerprints = new Set(
        backendProps.map(p => `${(p.title||'').toLowerCase()}|${p.price}|${(p.location||'').toLowerCase()}`)
      );

      let migratedCount = 0;
      for (const p of localProps) {
        // Hindari duplikasi: abaikan item yang kemungkinan sample default (id 1-3)
        const idNum = parseInt(p.id, 10);
        const fingerprint = `${(p.title||'').toLowerCase()}|${p.price}|${(p.location||'').toLowerCase()}`;
        const isDuplicate = backendFingerprints.has(fingerprint);
        const isDefaultSample = !isNaN(idNum) && idNum <= 3; 

        if (isDuplicate || isDefaultSample) continue;

        // Backend akan membuat ID sendiri; hindari mengirimkan id lokal
        const { id, createdAt, updatedAt, ...payload } = p;
        const resp = await this.makeRequest('/properties', {
          method: 'POST',
          body: JSON.stringify(payload),
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (resp?.success) {
          migratedCount += 1;
          backendFingerprints.add(fingerprint);
        }
      }

      // Setelah migrasi, bersihkan local fallback agar tidak rancu
      if (migratedCount > 0) {
        localStorage.removeItem(this.STORAGE_KEY);
      }

      return { success: true, migrated: migratedCount };
    } catch (error: any) {
      console.error('Migration error:', error);
      return { success: false, error: error?.message || 'Unknown migration error' };
    }
  }
}

export default ApiService;

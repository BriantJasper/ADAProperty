// @ts-nocheck

export const API_BASE_URL = (() => {
  const envUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (envUrl) return envUrl;
  const isLocal =
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1");
  if (isLocal) return "http://127.0.0.1:8000/api";
  return "/api";
})();
const USE_FALLBACK = false; // Nonaktifkan fallback agar menggunakan backend SQLite
let nextFallbackId = 100; // ID untuk properti baru dalam fallback mode

// Callback untuk handle unauthorized (401) response
let onUnauthorizedCallback: (() => void) | null = null;

class ApiService {
  // Set callback untuk handle 401 unauthorized
  static setUnauthorizedCallback(callback: () => void) {
    onUnauthorizedCallback = callback;
  }

  // Helper method to make API calls
  static async makeRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    // Build headers allowing FormData without forcing Content-Type
    const headers = { ...((options as any).headers || {}) } as any;
    const isFormData =
      typeof FormData !== "undefined" &&
      (options as any).body instanceof FormData;
    if (!("Content-Type" in headers) && !isFormData) {
      headers["Content-Type"] = "application/json";
    }
    const config = {
      ...options,
      headers,
    } as any;

    try {
      // Gunakan fallback hanya jika diaktifkan secara eksplisit
      if (USE_FALLBACK) {
        this.ensureFallbackLoaded();
        return this.getFallbackResponse(endpoint, options);
      }

      const response = await fetch(url, config);

      // Check for 401 Unauthorized - token expired/invalid
      if (response.status === 401) {
        // Trigger logout callback if set
        if (onUnauthorizedCallback) {
          onUnauthorizedCallback();
        }
        return {
          success: false,
          error: "Session expired. Please login again.",
          unauthorized: true,
        };
      }

      // Parse respons (prioritas JSON), tanpa fallback otomatis
      let data: any;
      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          const text = await response.text();
          data = { success: false, error: text || "Invalid response format" };
        }
      } catch (parseError) {
        return { success: false, error: "Failed to parse response" };
      }

      // Jika status tidak OK, kembalikan data error dari server tanpa fallback
      if (!response.ok) {
        return data || { success: false, error: "API request failed" };
      }

      return data;
    } catch (error: any) {
      // Jangan menulis ke localStorage; kembalikan error saja
      return { success: false, error: error?.message || "Network error" };
    }
  }

  // Menyimpan properti fallback
  static fallbackProperties = [
    {
      id: "1",
      title: "Rumah Mewah 3 Kamar",
      description:
        "Rumah mewah dengan 3 kamar tidur, 2 kamar mandi, dan kolam renang pribadi.",
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
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: "2",
      title: "Apartemen Studio",
      description:
        "Apartemen studio modern di pusat kota dengan fasilitas lengkap.",
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
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: "3",
      title: "Apartemen 2BR Furnished",
      description:
        "Apartemen furnished dengan 2 kamar tidur, 2 kamar mandi. Siap huni dengan furniture lengkap dan fasilitas premium.",
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
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
  ];

  // Kunci penyimpanan localStorage untuk fallback properties
  static STORAGE_KEY = "fallback_properties";

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
        localStorage.setItem(
          this.STORAGE_KEY,
          JSON.stringify(this.fallbackProperties)
        );
      }

      // Sinkronkan nextFallbackId berdasarkan ID numerik tertinggi yang ada
      const numericIds = this.fallbackProperties
        .map((p) => parseInt(p.id, 10))
        .filter((n) => !isNaN(n));
      const maxId = numericIds.length ? Math.max(...numericIds) : 0;
      if (maxId + 1 > nextFallbackId) {
        nextFallbackId = maxId + 1;
      }
    } catch (e) {
      // Failed to load fallback properties
    }
  }

  // Menyimpan fallbackProperties ke localStorage
  static persistFallback() {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(this.fallbackProperties)
      );
    } catch (e) {
      // Failed to persist fallback properties
    }
  }

  // Fallback response untuk saat server tidak tersedia
  static getFallbackResponse(endpoint, options) {
    // Selalu pastikan data fallback sudah dimuat
    this.ensureFallbackLoaded();
    // Endpoint untuk mendapatkan semua properti
    if (endpoint === "/properties" && options.method === "GET") {
      return {
        success: true,
        data: this.fallbackProperties,
      };
    }

    // Endpoint untuk menambahkan properti
    if (endpoint === "/properties" && options.method === "POST") {
      try {
        const propertyData = JSON.parse(options.body);
        const newId = String(nextFallbackId++);
        const newProperty = {
          ...propertyData,
          id: newId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Tambahkan properti baru ke daftar properti fallback
        this.fallbackProperties.push(newProperty);
        this.persistFallback();

        return {
          success: true,
          data: newProperty,
        };
      } catch (error) {
        return {
          success: false,
          error: "Failed to create property",
        };
      }
    }

    // Menangani berbagai jenis endpoint lainnya
    if (endpoint === "/properties") {
      return {
        success: true,
        data: this.fallbackProperties,
        count: this.fallbackProperties.length,
      };
    } else if (endpoint.startsWith("/properties/")) {
      const id = endpoint.split("/")[2];
      const property = this.fallbackProperties.find((p) => p.id === id);
      return {
        success: true,
        data: property || this.fallbackProperties[0],
      };
    } else if (endpoint === "/auth/login") {
      return {
        success: true,
        data: {
          user: { id: "1", username: "admin", role: "admin" },
          token: "dummy-token-" + Date.now(),
        },
        message: "Login successful",
      };
    } else if (options.method === "POST" && endpoint === "/properties") {
      // Menangani pembuatan properti baru
      const newProperty = {
        ...JSON.parse(options.body),
        id: (nextFallbackId++).toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Pastikan semua properti yang diperlukan ada
      if (!newProperty.images || newProperty.images.length === 0) {
        newProperty.images = ["/images/p1.png"];
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
        message: "Property created successfully",
      };
    } else if (
      options.method === "PUT" &&
      endpoint.startsWith("/properties/")
    ) {
      // Menangani update properti
      const id = endpoint.split("/")[2];
      const updatedProperty = {
        ...JSON.parse(options.body),
        id,
        updatedAt: new Date().toISOString(),
      };
      const idx = this.fallbackProperties.findIndex((p) => p.id === id);
      if (idx !== -1) {
        this.fallbackProperties[idx] = {
          ...this.fallbackProperties[idx],
          ...updatedProperty,
        };
        this.persistFallback();
      }
      return {
        success: true,
        data: updatedProperty,
        message: "Property updated successfully",
      };
    } else if (
      options.method === "DELETE" &&
      endpoint.startsWith("/properties/")
    ) {
      // Menangani penghapusan properti
      const id = endpoint.split("/")[2];
      const before = this.fallbackProperties.length;
      this.fallbackProperties = this.fallbackProperties.filter(
        (p) => p.id !== id
      );
      if (this.fallbackProperties.length !== before) {
        this.persistFallback();
      }
      return {
        success: true,
        message: "Property deleted successfully",
      };
    }

    // Default fallback
    return {
      success: true,
      data: {},
      message: "Fallback response",
    };
  }

  // Authentication endpoints
  static async login(username, password) {
    // Fallback login untuk development
    if (USE_FALLBACK) {
      // Get stored credentials or use default
      const storedCredentials = JSON.parse(
        localStorage.getItem("adminCredentials") ||
          '{"username": "admin", "password": "admin123"}'
      );

      if (
        username === storedCredentials.username &&
        password === storedCredentials.password
      ) {
        return {
          success: true,
          data: {
            token: "dummy-token-for-development",
            user: {
              username: storedCredentials.username,
              role: "admin",
            },
          },
        };
      } else {
        return {
          success: false,
          error: "Invalid username or password",
        };
      }
    }

    return this.makeRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  }

  // Forgot password - request OTP
  static async requestPasswordReset(username: string, email?: string) {
    return this.makeRequest("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ username, email }),
    });
  }

  // Reset password with OTP
  static async resetPassword(
    username: string,
    otp: string,
    newPassword: string
  ) {
    return this.makeRequest("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ username, otp, newPassword }),
    });
  }

  // Fungsi untuk verifikasi dan mengganti kredensial admin
  static async verifyAndChangeCredentials(
    currentPassword,
    newUsername,
    newPassword
  ) {
    // Fallback untuk development
    if (USE_FALLBACK) {
      // Cek apakah ada kredensial admin yang tersimpan di localStorage
      const storedAdminCredentials = localStorage.getItem("admin_credentials");
      let adminPassword = "admin123";

      if (storedAdminCredentials) {
        try {
          const credentials = JSON.parse(storedAdminCredentials);
          adminPassword = credentials.password;
        } catch (e) {
          // Error parsing stored admin credentials
        }
      }

      // Verifikasi password saat ini
      if (currentPassword === adminPassword) {
        // Simpan kredensial baru
        localStorage.setItem(
          "admin_credentials",
          JSON.stringify({
            username: newUsername,
            password: newPassword,
          })
        );

        return {
          success: true,
          message: "Credentials updated successfully",
        };
      } else {
        return {
          success: false,
          error: "Current password is incorrect",
        };
      }
    }

    return this.makeRequest("/auth/change-credentials", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newUsername, newPassword }),
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });
  }

  // Ganti kredensial admin
  static async changeCredentials(
    currentPassword: string,
    newCredentials: { username: string; password: string },
    token?: string
  ) {
    const authToken =
      token ??
      (typeof Storage !== "undefined"
        ? localStorage.getItem("auth_token")
        : null);
    if (!authToken) {
      throw new Error("Authentication required");
    }

    if (USE_FALLBACK) {
      try {
        const stored = JSON.parse(
          localStorage.getItem("adminCredentials") ||
            '{"username":"admin","password":"admin123"}'
        );
        if (currentPassword !== stored.password) {
          return { success: false, error: "Current password is incorrect" };
        }
        localStorage.setItem(
          "adminCredentials",
          JSON.stringify({
            username: newCredentials.username,
            password: newCredentials.password,
          })
        );
        return { success: true, message: "Credentials updated successfully" };
      } catch (e) {
        return {
          success: false,
          error: "Failed to update credentials in fallback mode",
        };
      }
    }

    return this.makeRequest("/admin/change-credentials", {
      method: "POST",
      body: JSON.stringify({
        currentPassword,
        newUsername: newCredentials.username,
        newPassword: newCredentials.password,
      }),
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
  }

  static async verifyToken() {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw new Error("No token found");
    }

    return this.makeRequest("/auth/verify", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  // Property endpoints
  static async getProperties(filters = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value as any);
      }
    });
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/properties?${queryString}` : "/properties";
    const res = await this.makeRequest(endpoint);
    return ApiService.normalizeResponse(res);
  }

  static async getPropertyById(id) {
    const res = await this.makeRequest(`/properties/${id}`);
    return ApiService.normalizeResponse(res);
  }

  static async createProperty(propertyData) {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw new Error("Authentication required");
    }

    if (USE_FALLBACK) {
      this.ensureFallbackLoaded();
      const newId = String(nextFallbackId++);
      const newProperty = {
        ...propertyData,
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.fallbackProperties.push(newProperty);
      this.persistFallback();
      return ApiService.normalizeResponse({ success: true, data: newProperty });
    }

    const res = await this.makeRequest("/properties", {
      method: "POST",
      body: JSON.stringify(propertyData),
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res && res.success) {
      const newId = typeof res.data === "object" ? res.data?.id : res.data;
      if (newId) {
        const full = await this.getPropertyById(String(newId));
        if (full && full.success) {
          return ApiService.normalizeResponse(full);
        }
        return ApiService.normalizeResponse({
          success: true,
          data: {
            ...propertyData,
            id: String(newId),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        });
      }
    }
    return ApiService.normalizeResponse(res);
  }

  static async updateProperty(id, propertyData) {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw new Error("Authentication required");
    }

    if (USE_FALLBACK) {
      this.ensureFallbackLoaded();
      const propertyIndex = this.fallbackProperties.findIndex(
        (p) => p.id === id
      );
      if (propertyIndex !== -1) {
        const updatedProperty = {
          ...this.fallbackProperties[propertyIndex],
          ...propertyData,
          id: id,
          updatedAt: new Date().toISOString(),
        };
        this.fallbackProperties[propertyIndex] = updatedProperty;
        this.persistFallback();
        return ApiService.normalizeResponse({
          success: true,
          data: updatedProperty,
        });
      } else {
        return { success: false, error: "Property not found" } as any;
      }
    }

    const res = await this.makeRequest(`/properties/${id}`, {
      method: "PUT",
      body: JSON.stringify(propertyData),
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res && res.success) {
      const full = await this.getPropertyById(id);
      if (full && full.success) return ApiService.normalizeResponse(full);
    }
    return ApiService.normalizeResponse(res);
  }

  static async deleteProperty(id) {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw new Error("Authentication required");
    }

    if (USE_FALLBACK) {
      this.ensureFallbackLoaded();
      const idx = this.fallbackProperties.findIndex((p) => p.id === id);
      if (idx !== -1) {
        this.fallbackProperties.splice(idx, 1);
        this.persistFallback();
        return { success: true, message: "Property deleted successfully" };
      }
      return { success: false, error: "Property not found" };
    }

    return this.makeRequest(`/properties/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  // Upload multiple images and return array of public URLs
  static async uploadImages(files: File[]) {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      throw new Error("Authentication required");
    }
    const form = new FormData();
    // Gunakan 'files[]' agar PHP/Laravel mengenali sebagai array
    files.forEach((f) => form.append("files[]", f, f.name));
    const res = await this.makeRequest("/upload", {
      method: "POST",
      body: form,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res;
  }

  // Normalisasi properti dari backend ke bentuk yang dipakai frontend
  static normalizeProperty(record: any) {
    const toNumber = (v: any) => {
      const n = typeof v === "number" ? v : Number(v);
      return Number.isFinite(n) ? n : undefined;
    };
    const parseJSON = (v: any) => {
      if (typeof v === "string") {
        try {
          return JSON.parse(v);
        } catch {
          return undefined;
        }
      }
      return v;
    };

    const financingRaw = record?.financing;
    const financingParsed = parseJSON(financingRaw);
    const financing =
      financingParsed && typeof financingParsed === "object"
        ? {
            dpPercent: toNumber(financingParsed.dpPercent) ?? 5,
            tenorYears: toNumber(financingParsed.tenorYears) ?? 1,
            fixedYears: toNumber(financingParsed.fixedYears) ?? undefined,
            bookingFee: toNumber(financingParsed.bookingFee) ?? undefined,
            ppnPercent: toNumber(financingParsed.ppnPercent) ?? undefined,
            interestRate: toNumber(financingParsed.interestRate) ?? undefined,
          }
        : undefined;

    const imagesRaw = record?.images;
    const imagesParsed = parseJSON(imagesRaw);
    const images = Array.isArray(imagesParsed)
      ? imagesParsed
      : Array.isArray(imagesRaw)
      ? imagesRaw
      : ["/images/p1.png"];

    const featuresRaw = record?.features;
    const featuresParsed = parseJSON(featuresRaw);
    const features = Array.isArray(featuresParsed)
      ? featuresParsed
      : Array.isArray(featuresRaw)
      ? featuresRaw
      : [];

    const tourUrl =
      (record?.tourUrl ?? record?.tour_url ?? "").toString().trim() ||
      undefined;

    return {
      ...record,
      price: toNumber(record.price) ?? 0,
      bedrooms: toNumber(record.bedrooms) ?? record.bedrooms,
      bathrooms: toNumber(record.bathrooms) ?? record.bathrooms,
      area: toNumber(record.area) ?? record.area,
      landArea:
        toNumber(record.landArea ?? record.land_area) ?? record.landArea,
      floors: toNumber(record.floors) ?? record.floors,
      images,
      features,
      tourUrl,
      financing,
    };
  }

  static normalizeResponse(res: any) {
    if (!res || !res.success) return res;
    if (Array.isArray(res.data)) {
      return {
        ...res,
        data: res.data.map((r: any) => ApiService.normalizeProperty(r)),
      };
    } else if (res.data && typeof res.data === "object") {
      return { ...res, data: ApiService.normalizeProperty(res.data) };
    }
    return res;
  }

  // Consignment API methods
  static async getConsignments() {
    return this.makeRequest("/consignments", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });
  }

  static async downloadConsignmentImage(
    imagePath: string,
    filename?: string
  ): Promise<Response> {
    const params = new URLSearchParams({ path: imagePath });
    if (filename) {
      params.append("filename", filename);
    }

    const url = `${API_BASE_URL}/consignments/download?${params.toString()}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }

  static async createConsignment(consignmentData: any) {
    return this.makeRequest("/consignments", {
      method: "POST",
      body: JSON.stringify(consignmentData),
    });
  }

  static async updateConsignment(id: string, status: string) {
    return this.makeRequest(`/consignments/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
      body: JSON.stringify({ status }),
    });
  }

  static async deleteConsignment(id: string) {
    return this.makeRequest(`/consignments/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
      },
    });
  }
}

export default ApiService;

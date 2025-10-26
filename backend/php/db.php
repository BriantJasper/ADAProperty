<?php
// backend/php/db.php
require_once __DIR__ . '/config.php';

function db() {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['success' => false, 'error' => 'Database connection failed: ' . $e->getMessage()]);
            exit;
        }
    }
    return $pdo;
}



function ensure_default_admin() {
    $pdo = db();
    $pdo->exec('CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(64) NOT NULL UNIQUE,
        email VARCHAR(255) DEFAULT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM("admin","user") NOT NULL DEFAULT "admin",
        status ENUM("active","inactive") NOT NULL DEFAULT "active",
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;');

    // Migration: ensure 'username' column exists (fix older schemas)
    $colCheck = $pdo->prepare('SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = "users" AND COLUMN_NAME = "username"');
    $colCheck->execute([DB_NAME]);
    if ((int)$colCheck->fetchColumn() === 0) {
        $pdo->exec('ALTER TABLE users ADD COLUMN username VARCHAR(64) NOT NULL UNIQUE');
    }

    // Seed default admin if not exists
    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ? LIMIT 1');
    $stmt->execute([ADMIN_USERNAME]);
    $exists = $stmt->fetch();
    if (!$exists) {
        $hash = password_hash(ADMIN_PASSWORD, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare('INSERT INTO users (username, email, password_hash, role, status) VALUES (?, ?, ?, "admin", "active")');
        $stmt->execute([ADMIN_USERNAME, ADMIN_EMAIL, $hash]);
    }

    // Always align admin password with configured ADMIN_PASSWORD (useful for dev/XAMPP)
    try {
        $newHash = password_hash(ADMIN_PASSWORD, PASSWORD_BCRYPT);
        $stmt = $pdo->prepare('UPDATE users SET password_hash = ?, status = "active" WHERE username = ?');
        $stmt->execute([$newHash, ADMIN_USERNAME]);
    } catch (Exception $e) { /* ignore */ }
}

function ensure_property_tables() {
    $pdo = db();
    $pdo->exec('CREATE TABLE IF NOT EXISTS properties (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(12,2) NOT NULL DEFAULT 0,
        location VARCHAR(255) NOT NULL,
        sub_location VARCHAR(255) NOT NULL,
        type ENUM("rumah","apartemen","tanah","ruko") NOT NULL,
        status ENUM("dijual","disewa") NOT NULL,
        bedrooms INT NOT NULL DEFAULT 0,
        bathrooms INT NOT NULL DEFAULT 0,
        area INT NOT NULL DEFAULT 0,
        land_area INT DEFAULT NULL,
        floors INT NOT NULL,
        images MEDIUMTEXT DEFAULT NULL, -- store JSON string
        features MEDIUMTEXT DEFAULT NULL, -- store JSON string
        whatsapp_number VARCHAR(32) NOT NULL,
        ig_url VARCHAR(255) DEFAULT NULL,
        tiktok_url VARCHAR(255) DEFAULT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;');

    $pdo->exec('CREATE TABLE IF NOT EXISTS password_reset_otps (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        otp VARCHAR(10) NOT NULL,
        expires_at DATETIME NOT NULL,
        used TINYINT(1) NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX (user_id),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;');
}

function ensure_schema_migrations() {
    $pdo = db();
    // Upgrade properties.images to MEDIUMTEXT if currently TEXT
    $stmt = $pdo->prepare('SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = "properties" AND COLUMN_NAME = "images" LIMIT 1');
    $stmt->execute([DB_NAME]);
    $type = $stmt->fetchColumn();
    if ($type && strtolower($type) === 'text') {
        $pdo->exec('ALTER TABLE properties MODIFY images MEDIUMTEXT NULL');
    }
    // Upgrade properties.features to MEDIUMTEXT if currently TEXT
    $stmt = $pdo->prepare('SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = "properties" AND COLUMN_NAME = "features" LIMIT 1');
    $stmt->execute([DB_NAME]);
    $ftype = $stmt->fetchColumn();
    if ($ftype && strtolower($ftype) === 'text') {
        $pdo->exec('ALTER TABLE properties MODIFY features MEDIUMTEXT NULL');
    }

    // Ensure 'floors' column exists and is NOT NULL
    $stmt = $pdo->prepare('SELECT IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = "properties" AND COLUMN_NAME = "floors" LIMIT 1');
    $stmt->execute([DB_NAME]);
    $nullable = $stmt->fetchColumn();
    if ($nullable === false) {
        $pdo->exec('ALTER TABLE properties ADD COLUMN floors INT NOT NULL');
    } else if (strtoupper($nullable) === 'YES') {
        $pdo->exec('UPDATE properties SET floors = 0 WHERE floors IS NULL');
        $pdo->exec('ALTER TABLE properties MODIFY floors INT NOT NULL');
    }

    // Ensure 'sub_location' column exists
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = "properties" AND COLUMN_NAME = "sub_location"');
    $stmt->execute([DB_NAME]);
    if ((int)$stmt->fetchColumn() === 0) {
        $pdo->exec('ALTER TABLE properties ADD COLUMN sub_location VARCHAR(255) NOT NULL DEFAULT "" AFTER location');
    }

    // Ensure 'area' column exists
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = "properties" AND COLUMN_NAME = "area"');
    $stmt->execute([DB_NAME]);
    if ((int)$stmt->fetchColumn() === 0) {
        $pdo->exec('ALTER TABLE properties ADD COLUMN area INT NOT NULL DEFAULT 0 AFTER bathrooms');
    }

    // Ensure 'land_area' column exists
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = "properties" AND COLUMN_NAME = "land_area"');
    $stmt->execute([DB_NAME]);
    if ((int)$stmt->fetchColumn() === 0) {
        $pdo->exec('ALTER TABLE properties ADD COLUMN land_area INT NULL AFTER area');
    }

    // Ensure 'images' column exists
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = "properties" AND COLUMN_NAME = "images"');
    $stmt->execute([DB_NAME]);
    if ((int)$stmt->fetchColumn() === 0) {
        $pdo->exec('ALTER TABLE properties ADD COLUMN images MEDIUMTEXT NULL AFTER floors');
    }

    // Ensure 'features' column exists
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = "properties" AND COLUMN_NAME = "features"');
    $stmt->execute([DB_NAME]);
    if ((int)$stmt->fetchColumn() === 0) {
        $pdo->exec('ALTER TABLE properties ADD COLUMN features MEDIUMTEXT NULL AFTER images');
    }

    // Ensure 'whatsapp_number' column exists
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = "properties" AND COLUMN_NAME = "whatsapp_number"');
    $stmt->execute([DB_NAME]);
    if ((int)$stmt->fetchColumn() === 0) {
        $pdo->exec('ALTER TABLE properties ADD COLUMN whatsapp_number VARCHAR(32) NOT NULL AFTER features');
    }

    // Ensure 'ig_url' column exists
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = "properties" AND COLUMN_NAME = "ig_url"');
    $stmt->execute([DB_NAME]);
    if ((int)$stmt->fetchColumn() === 0) {
        $pdo->exec('ALTER TABLE properties ADD COLUMN ig_url VARCHAR(255) DEFAULT NULL AFTER whatsapp_number');
    }

    // Ensure 'tiktok_url' column exists
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = "properties" AND COLUMN_NAME = "tiktok_url"');
    $stmt->execute([DB_NAME]);
    if ((int)$stmt->fetchColumn() === 0) {
        $pdo->exec('ALTER TABLE properties ADD COLUMN tiktok_url VARCHAR(255) DEFAULT NULL AFTER ig_url');
    }
}

function initialize_schema() {
    ensure_default_admin();
    ensure_property_tables();
    ensure_schema_migrations();
}
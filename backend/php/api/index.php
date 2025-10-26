<?php
// backend/php/api/index.php
require_once __DIR__ . '/../config.php';
require_once __DIR__ . '/../db.php';
require_once __DIR__ . '/../utils/utils.php';
require_once __DIR__ . '/../utils/jwt.php';

cors_preflight_if_needed();

// Ensure schema exists
initialize_schema();

// Route handling
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Normalize: remove any prefix before /api
$apiPos = strpos($path, '/api');
$path = $apiPos !== false ? substr($path, $apiPos + 4) : $path; // path after '/api'
$path = '/' . ltrim($path, '/');

// Helpers
function require_auth() {
    $token = get_auth_token();
    if (!$token) json_response(['success' => false, 'error' => 'Access token required'], 401);
    $payload = jwt_decode($token, JWT_SECRET);
    if (!$payload) json_response(['success' => false, 'error' => 'Invalid or expired token'], 403);
    return $payload; // ['sub' => user_id, 'username' => ..., 'role' => ..., 'exp' => ...]
}

function require_admin($payload) {
    if (($payload['role'] ?? '') !== 'admin') {
        json_response(['success' => false, 'error' => 'Admin access required'], 403);
    }
}

// Auth endpoints
if ($path === '/auth/login' && $method === 'POST') {
    $data = parse_json_body();
    $username = trim($data['username'] ?? '');
    $password = $data['password'] ?? '';
    if ($username === '' || $password === '') {
        json_response(['success' => false, 'error' => 'Username and password required'], 400);
    }
    $pdo = db();
    $stmt = $pdo->prepare('SELECT id, username, password_hash, role FROM users WHERE username = ? AND status = "active" LIMIT 1');
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    if (!$user || !password_verify($password, $user['password_hash'])) {
        json_response(['success' => false, 'error' => 'Invalid username or password'], 401);
    }

    $exp = time() + JWT_EXPIRE_SECONDS;
    $token = jwt_encode([
        'sub' => (string)$user['id'],
        'username' => $user['username'],
        'role' => $user['role'],
        'iat' => time(),
        'exp' => $exp,
    ], JWT_SECRET);

    json_response([
        'success' => true,
        'data' => [
            'user' => [ 'id' => (string)$user['id'], 'username' => $user['username'], 'role' => $user['role'] ],
            'token' => $token,
        ],
        'message' => 'Login successful'
    ], 200);
}

if ($path === '/auth/verify' && $method === 'POST') {
    $payload = require_auth();
    json_response([
        'success' => true,
        'data' => [ 'user' => [ 'id' => $payload['sub'], 'username' => $payload['username'], 'role' => $payload['role'] ] ],
        'message' => 'Token valid'
    ], 200);
}

if ($path === '/auth/forgot-password' && $method === 'POST') {
    $data = parse_json_body();
    $username = trim($data['username'] ?? '');
    $email = trim($data['email'] ?? '');
    if ($username === '' && $email === '') {
        json_response(['success' => false, 'error' => 'Provide username or email'], 400);
    }
    $pdo = db();
    if ($username !== '') {
        $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ? LIMIT 1');
        $stmt->execute([$username]);
    } else {
        $stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? LIMIT 1');
        $stmt->execute([$email]);
    }
    $user = $stmt->fetch();
    if (!$user) json_response(['success' => false, 'error' => 'User not found'], 404);
    $otp = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $expiresAt = date('Y-m-d H:i:s', time() + 10 * 60); // 10 minutes
    $stmt = $pdo->prepare('INSERT INTO password_reset_otps (user_id, otp, expires_at, used) VALUES (?, ?, ?, 0)');
    $stmt->execute([$user['id'], $otp, $expiresAt]);

    $response = ['success' => true, 'message' => 'OTP generated'];
    if (APP_ENV !== 'production') { $response['otp'] = $otp; }
    json_response($response, 200);
}

if ($path === '/auth/reset-password' && $method === 'POST') {
    $data = parse_json_body();
    $username = trim($data['username'] ?? '');
    $otp = trim($data['otp'] ?? '');
    $newPassword = $data['newPassword'] ?? '';
    if ($username === '' || $otp === '' || $newPassword === '') {
        json_response(['success' => false, 'error' => 'username, otp, and newPassword required'], 400);
    }
    $pdo = db();
    $stmt = $pdo->prepare('SELECT id FROM users WHERE username = ? LIMIT 1');
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    if (!$user) json_response(['success' => false, 'error' => 'User not found'], 404);

    $stmt = $pdo->prepare('SELECT id, otp, expires_at, used FROM password_reset_otps WHERE user_id = ? AND used = 0 ORDER BY id DESC LIMIT 1');
    $stmt->execute([$user['id']]);
    $row = $stmt->fetch();
    if (!$row) json_response(['success' => false, 'error' => 'No OTP found'], 400);
    if ($row['used']) json_response(['success' => false, 'error' => 'OTP already used'], 400);
    if (strtotime($row['expires_at']) < time()) json_response(['success' => false, 'error' => 'OTP expired'], 400);
    if (!hash_equals($row['otp'], $otp)) json_response(['success' => false, 'error' => 'Invalid OTP'], 400);

    $hash = password_hash($newPassword, PASSWORD_BCRYPT);
    $pdo->beginTransaction();
    try {
        $stmt = $pdo->prepare('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?');
        $stmt->execute([$hash, now(), $user['id']]);
        $stmt = $pdo->prepare('UPDATE password_reset_otps SET used = 1 WHERE id = ?');
        $stmt->execute([$row['id']]);
        $pdo->commit();
    } catch (Exception $e) {
        $pdo->rollBack();
        json_response(['success' => false, 'error' => 'Failed to reset password'], 500);
    }

    json_response(['success' => true, 'message' => 'Password updated'], 200);
}

// File upload endpoint (images)
if ($path === '/upload' && $method === 'POST') {
    $payload = require_auth();
    require_admin($payload);

    // Support single file 'file' or multiple 'files[]'
    $uploadedPaths = [];
    $uploadDir = __DIR__ . '/uploads';
    if (!is_dir($uploadDir)) {
        @mkdir($uploadDir, 0775, true);
    }

    // Build absolute base URL (includes scheme and host, with port if present)
    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    $baseUrl = $scheme . '://' . $host;

    $processFile = function($name, $tmpName, $original) use (&$uploadedPaths, $uploadDir, $baseUrl) {
        if (!is_uploaded_file($tmpName)) {
            return;
        }
        // Validate mime type
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $mime = $finfo->file($tmpName);
        $allowed = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
        if (!isset($allowed[$mime])) {
            return; // skip non-image
        }
        // Sanitize filename
        $ext = $allowed[$mime];
        $base = pathinfo($original, PATHINFO_FILENAME);
        $safeBase = preg_replace('/[^a-zA-Z0-9_-]/', '-', $base);
        $filename = $safeBase . '-' . uniqid() . '.' . $ext;
        $dest = $uploadDir . '/' . $filename;
        if (move_uploaded_file($tmpName, $dest)) {
            // Return absolute URL for client usage
            $uploadedPaths[] = $baseUrl . '/api/uploads/' . $filename;
        }
    };

    if (isset($_FILES['file'])) {
        $file = $_FILES['file'];
        $processFile('file', $file['tmp_name'], $file['name']);
    }
    if (isset($_FILES['files'])) {
        if (is_array($_FILES['files']['tmp_name'])) {
            foreach ($_FILES['files']['tmp_name'] as $idx => $tmp) {
                $name = $_FILES['files']['name'][$idx] ?? ('file-' . $idx);
                $processFile('files', $tmp, $name);
            }
        } else {
            $processFile('files', $_FILES['files']['tmp_name'], $_FILES['files']['name']);
        }
    }

    if (!$uploadedPaths) {
        json_response(['success' => false, 'error' => 'No valid image files uploaded'], 400);
    }
    json_response(['success' => true, 'data' => $uploadedPaths, 'count' => count($uploadedPaths)], 200);
}

// Properties endpoints
if ($path === '/properties' && $method === 'GET') {
    $pdo = db();
    // Filters
    $q = [];
    $w = [];
    $params = [];
    // Basic filters from query string
    $qs = $_GET;
    if (!empty($qs['type'])) { $w[] = 'type = ?'; $params[] = $qs['type']; }
    if (!empty($qs['status'])) { $w[] = 'status = ?'; $params[] = $qs['status']; }
    if (!empty($qs['location'])) { $w[] = 'location LIKE ?'; $params[] = '%' . $qs['location'] . '%'; }
    if (!empty($qs['subLocation'])) { $w[] = 'sub_location LIKE ?'; $params[] = '%' . $qs['subLocation'] . '%'; }
    if (!empty($qs['bedrooms'])) { $w[] = 'bedrooms >= ?'; $params[] = (int)$qs['bedrooms']; }
    if (!empty($qs['bathrooms'])) { $w[] = 'bathrooms >= ?'; $params[] = (int)$qs['bathrooms']; }
    if (!empty($qs['minPrice'])) { $w[] = 'price >= ?'; $params[] = (float)$qs['minPrice']; }
    if (!empty($qs['maxPrice'])) { $w[] = 'price <= ?'; $params[] = (float)$qs['maxPrice']; }

    $sql = 'SELECT * FROM properties';
    if ($w) { $sql .= ' WHERE ' . implode(' AND ', $w); }
    // Simple sort option
    if (!empty($qs['sort'])) {
        $s = $qs['sort'];
        if ($s === 'price_asc') $sql .= ' ORDER BY price ASC';
        else if ($s === 'price_desc') $sql .= ' ORDER BY price DESC';
        else $sql .= ' ORDER BY created_at DESC';
    } else {
        $sql .= ' ORDER BY created_at DESC';
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $rows = $stmt->fetchAll();

    $data = array_map(function ($p) {
        return [
            'id' => (string)$p['id'],
            'title' => $p['title'],
            'description' => $p['description'],
            'price' => (float)$p['price'],
            'location' => $p['location'],
            'subLocation' => $p['sub_location'],
            'type' => $p['type'],
            'status' => $p['status'],
            'bedrooms' => (int)$p['bedrooms'],
            'bathrooms' => (int)$p['bathrooms'],
            'area' => (int)$p['area'],
            'landArea' => $p['land_area'] !== null ? (int)$p['land_area'] : null,
            'floors' => $p['floors'] !== null ? (int)$p['floors'] : null,
            'images' => $p['images'] ? json_decode($p['images'], true) ?: [] : [],
            'features' => $p['features'] ? json_decode($p['features'], true) ?: [] : [],
            'whatsappNumber' => $p['whatsapp_number'],
            'igUrl' => $p['ig_url'],
            'tiktokUrl' => $p['tiktok_url'],
            'createdAt' => $p['created_at'],
            'updatedAt' => $p['updated_at'],
        ];
    }, $rows);

    json_response(['success' => true, 'data' => $data, 'count' => count($data)], 200);
}

if ($path === '/properties' && $method === 'POST') {
    $payload = require_auth();
    // only admin can create
    require_admin($payload);
    $pdo = db();
    $data = parse_json_body();
    // basic validations
    $title = trim($data['title'] ?? '');
    $price = (float)($data['price'] ?? 0);
    $location = trim($data['location'] ?? '');
    $subLocation = trim($data['subLocation'] ?? $location);
    $type = $data['type'] ?? '';
    $status = $data['status'] ?? '';
    $bedrooms = (int)($data['bedrooms'] ?? 0);
    $bathrooms = (int)($data['bathrooms'] ?? 0);
    $area = (int)($data['area'] ?? 0);
    $landArea = isset($data['landArea']) ? (int)$data['landArea'] : null;
    $floors = isset($data['floors']) ? (int)$data['floors'] : null;
    $images = isset($data['images']) ? json_encode($data['images']) : json_encode(['/images/p1.png']);
    $features = isset($data['features']) ? json_encode($data['features']) : json_encode([]);
    $whatsapp = trim($data['whatsappNumber'] ?? '');
    $igUrl = isset($data['igUrl']) ? trim($data['igUrl']) : null;
    $tiktokUrl = isset($data['tiktokUrl']) ? trim($data['tiktokUrl']) : null;

    if ($title === '' || $price <= 0 || $location === '' || $subLocation === '' || !in_array($type, ['rumah','apartemen','tanah','ruko']) || !in_array($status, ['dijual','disewa'])) {
        json_response(['success' => false, 'error' => 'Invalid property data'], 400);
    }
    // floors required and must be non-negative integer
    if (!isset($data['floors']) || !is_numeric($data['floors']) || (int)$data['floors'] < 0) {
        json_response(['success' => false, 'error' => 'floors is required and must be a non-negative integer'], 400);
    }

    // Fix: VALUES must have 19 placeholders matching 19 columns
    $stmt = $pdo->prepare('INSERT INTO properties (title, description, price, location, sub_location, type, status, bedrooms, bathrooms, area, land_area, floors, images, features, whatsapp_number, ig_url, tiktok_url, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    $stmt->execute([
        $title,
        $data['description'] ?? null,
        $price,
        $location,
        $subLocation,
        $type,
        $status,
        $bedrooms,
        $bathrooms,
        $area,
        $landArea,
        $floors,
        $images,
        $features,
        $whatsapp,
        $igUrl,
        $tiktokUrl,
        now(),
        now(),
    ]);

    $id = (string)db()->lastInsertId();
    json_response(['success' => true, 'data' => ['id' => $id]], 201);
}

if (preg_match('#^/properties/(\d+)$#', $path, $m)) {
    $id = (int)$m[1];

    if ($method === 'GET') {
        $pdo = db();
        $stmt = $pdo->prepare('SELECT id, title, description, price, location, sub_location, type, status, bedrooms, bathrooms, area, land_area, floors, images, features, whatsapp_number, ig_url, tiktok_url, created_at, updated_at FROM properties WHERE id = ? LIMIT 1');
        $stmt->execute([$id]);
        $p = $stmt->fetch();
        if (!$p) {
            json_response(['success' => false, 'error' => 'Property not found'], 404);
        }
        $data = [
            'id' => (string)$p['id'],
            'title' => $p['title'],
            'description' => $p['description'],
            'price' => (float)$p['price'],
            'location' => $p['location'],
            'subLocation' => $p['sub_location'],
            'type' => $p['type'],
            'status' => $p['status'],
            'bedrooms' => (int)$p['bedrooms'],
            'bathrooms' => (int)$p['bathrooms'],
            'area' => (int)$p['area'],
            'landArea' => $p['land_area'] !== null ? (int)$p['land_area'] : null,
            'floors' => $p['floors'] !== null ? (int)$p['floors'] : null,
            'images' => $p['images'] ? json_decode($p['images'], true) ?: [] : [],
            'features' => $p['features'] ? json_decode($p['features'], true) ?: [] : [],
            'whatsappNumber' => $p['whatsapp_number'],
            'igUrl' => $p['ig_url'],
            'tiktokUrl' => $p['tiktok_url'],
            'createdAt' => $p['created_at'],
            'updatedAt' => $p['updated_at'],
        ];
        json_response(['success' => true, 'data' => $data], 200);
    }

    if ($method === 'PUT') {
        $payload = require_auth();
        require_admin($payload);
        $pdo = db();
        $data = parse_json_body();

        // Prepare update set
        $fields = [];
        $params = [];
        $mapping = [
            'title' => 'title',
            'description' => 'description',
            'price' => 'price',
            'location' => 'location',
            'subLocation' => 'sub_location',
            'type' => 'type',
            'status' => 'status',
            'bedrooms' => 'bedrooms',
            'bathrooms' => 'bathrooms',
            'area' => 'area',
            'landArea' => 'land_area',
            'floors' => 'floors',
            'whatsappNumber' => 'whatsapp_number',
            'igUrl' => 'ig_url',
            'tiktokUrl' => 'tiktok_url',
        ];
        foreach ($mapping as $k => $col) {
            if (array_key_exists($k, $data)) {
                $fields[] = "$col = ?";
                $params[] = $data[$k];
            }
        }
        // Validate floors if provided
        if (array_key_exists('floors', $data)) {
            if (!is_numeric($data['floors']) || (int)$data['floors'] < 0) {
                json_response(['success' => false, 'error' => 'floors must be a non-negative integer'], 400);
            }
        }
        if (array_key_exists('images', $data)) {
            $fields[] = 'images = ?';
            $params[] = json_encode($data['images']);
        }
        if (array_key_exists('features', $data)) {
            $fields[] = 'features = ?';
            $params[] = json_encode($data['features']);
        }
        $fields[] = 'updated_at = ?';
        $params[] = now();

        if (!$fields) json_response(['success' => false, 'error' => 'No fields to update'], 400);

        $sql = 'UPDATE properties SET ' . implode(', ', $fields) . ' WHERE id = ?';
        $params[] = $id;
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        json_response(['success' => true, 'message' => 'Property updated'], 200);
    }

    if ($method === 'DELETE') {
        $payload = require_auth();
        require_admin($payload);
        $pdo = db();
        $stmt = $pdo->prepare('DELETE FROM properties WHERE id = ?');
        $stmt->execute([$id]);
        json_response(['success' => true, 'message' => 'Property deleted successfully'], 200);
    }
}

// Admin change credentials
if ($path === '/admin/change-credentials' && $method === 'POST') {
    $payload = require_auth();
    require_admin($payload);
    $pdo = db();
    $data = parse_json_body();
    $currentPassword = $data['currentPassword'] ?? '';
    $newUsername = trim($data['newUsername'] ?? '');
    $newPassword = $data['newPassword'] ?? '';
    if ($currentPassword === '' || $newUsername === '' || $newPassword === '') {
        json_response(['success' => false, 'error' => 'currentPassword, newUsername, newPassword required'], 400);
    }
    $stmt = $pdo->prepare('SELECT id, password_hash FROM users WHERE id = ? LIMIT 1');
    $stmt->execute([(int)$payload['sub']]);
    $user = $stmt->fetch();
    if (!$user) json_response(['success' => false, 'error' => 'User not found'], 404);
    if (!password_verify($currentPassword, $user['password_hash'])) {
        json_response(['success' => false, 'error' => 'Current password is incorrect'], 403);
    }

    $hash = password_hash($newPassword, PASSWORD_BCRYPT);
    $stmt = $pdo->prepare('UPDATE users SET username = ?, password_hash = ?, updated_at = ? WHERE id = ?');
    $stmt->execute([$newUsername, $hash, now(), (int)$payload['sub']]);

    json_response(['success' => true, 'message' => 'Credentials updated successfully'], 200);
}

// Health endpoint
if ($path === '/health' && $method === 'GET') {
    json_response(['success' => true, 'status' => 'OK', 'timestamp' => date('c')]);
}

// Not found
json_response(['success' => false, 'error' => 'Not found'], 404);
<?php
// backend/php/utils/utils.php
require_once __DIR__ . '/../config.php';

function json_response($payload, $code = 200) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($payload);
    exit;
}

function parse_json_body() {
    $raw = file_get_contents('php://input');
    if (!$raw) return [];
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

function get_auth_token() {
    $headers = getallheaders();
    $auth = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    if (!$auth) return null;
    if (stripos($auth, 'Bearer ') === 0) {
        return trim(substr($auth, 7));
    }
    return null;
}

function cors_preflight_if_needed() {
    header('Access-Control-Allow-Origin: ' . CORS_ORIGIN);
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Max-Age: 86400');
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}

function now() {
    return date('Y-m-d H:i:s');
}
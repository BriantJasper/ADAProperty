<?php
// backend/php/utils/jwt.php
require_once __DIR__ . '/../config.php';

function b64url_encode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function b64url_decode($data) {
    $remainder = strlen($data) % 4;
    if ($remainder) {
        $data .= str_repeat('=', 4 - $remainder);
    }
    return base64_decode(strtr($data, '-_', '+/'));
}

function jwt_encode(array $payload, string $secret) {
    $header = ['alg' => 'HS256', 'typ' => 'JWT'];
    $header_b64 = b64url_encode(json_encode($header));
    $payload_b64 = b64url_encode(json_encode($payload));
    $signature = hash_hmac('sha256', "$header_b64.$payload_b64", $secret, true);
    $signature_b64 = b64url_encode($signature);
    return "$header_b64.$payload_b64.$signature_b64";
}

function jwt_decode(string $token, string $secret) {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;
    [$h, $p, $s] = $parts;
    $signature_check = b64url_encode(hash_hmac('sha256', "$h.$p", $secret, true));
    if (!hash_equals($signature_check, $s)) return null;
    $payload_json = b64url_decode($p);
    $payload = json_decode($payload_json, true);
    if (!is_array($payload)) return null;
    // Expiration check
    if (isset($payload['exp']) && time() > $payload['exp']) return null;
    return $payload;
}
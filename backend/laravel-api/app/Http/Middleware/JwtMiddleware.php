<?php

namespace App\Http\Middleware;

use Closure;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class JwtMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $auth = $request->header('Authorization');
        if (!$auth || !str_starts_with($auth, 'Bearer ')) {
            return response()->json(['success' => false, 'error' => 'Unauthorized'], 401);
        }
        $token = substr($auth, 7);
        try {
            // Get JWT secret from env if provided; otherwise fallback to APP_KEY (base64 decoded if needed)
            $secret = env('JWT_SECRET');
            if (!$secret || !is_string($secret) || $secret === '') {
                $appKey = config('app.key');
                if (is_string($appKey) && Str::startsWith($appKey, 'base64:')) {
                    $secret = base64_decode(substr($appKey, 7));
                } else {
                    $secret = is_string($appKey) ? $appKey : '';
                }
            }
            if ($secret === '') {
                return response()->json(['success' => false, 'error' => 'JWT secret not configured'], 500);
            }
            $decoded = JWT::decode($token, new Key($secret, 'HS256'));
            $request->merge(['auth_user' => (array)$decoded]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => 'Invalid token'], 401);
        }
        return $next($request);
    }
}

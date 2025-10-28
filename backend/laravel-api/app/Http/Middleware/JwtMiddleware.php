<?php

namespace App\Http\Middleware;

use Closure;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Illuminate\Http\Request;

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
            $decoded = JWT::decode($token, new Key(env('JWT_SECRET'), 'HS256'));
            $request->merge(['auth_user' => (array)$decoded]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'error' => 'Invalid token'], 401);
        }
        return $next($request);
    }
}
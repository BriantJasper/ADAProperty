<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Firebase\JWT\JWT;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $username = $request->input('username');
        $password = $request->input('password');

        if (!$username || !$password) {
            return response()->json(['success' => false, 'error' => 'Username and password required'], 400);
        }

        // Cari user di database berdasarkan username
        $user = DB::table('users')->where('username', $username)->first();

        if (!$user || !Hash::check($password, $user->password)) {
            return response()->json(['success' => false, 'error' => 'Invalid username or password'], 400);
        }

        // Generate JWT token (30-minute expiry)
        $payload = [
            'sub' => $user->username,
            'user_id' => $user->id,
            'role' => $user->role,
            'jti' => bin2hex(random_bytes(16)),
            'iat' => time(),
            'exp' => time() + (60 * 30), // 30 minutes
        ];

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
            return response()->json([
                'success' => false,
                'error' => 'JWT secret is not configured. Set JWT_SECRET in .env or ensure APP_KEY is set.'
            ], 500);
        }

        $token = JWT::encode($payload, $secret, 'HS256');

        return response()->json([
            'success' => true,
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'username' => $user->username,
                    'name' => $user->name,
                    'role' => $user->role
                ]
            ]
        ]);
    }

    public function verify(Request $r)
    {
        return response()->json(['success' => true]);
    }

    public function forgotPassword(Request $r)
    {
        return response()->json(['success' => true, 'message' => 'OTP sent']);
    }

    public function resetPassword(Request $r)
    {
        return response()->json(['success' => true, 'message' => 'Password reset']);
    }
}

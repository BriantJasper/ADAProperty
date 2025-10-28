<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Firebase\JWT\JWT;
use Exception;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        try {
            // Log the incoming request for debugging
            Log::info('Login attempt', [
                'username' => $request->input('username'),
                'ip' => $request->ip()
            ]);

            // Validate input
            $validator = Validator::make($request->all(), [
                'username' => 'required|string',
                'password' => 'required|string'
            ]);

            if ($validator->fails()) {
                Log::warning('Login validation failed', ['errors' => $validator->errors()]);
                return response()->json([
                    'success' => false,
                    'error' => 'Validation failed',
                    'details' => $validator->errors()
                ], 400);
            }

            $username = $request->input('username');
            $password = $request->input('password');

            // Check if JWT_SECRET is configured
            $jwtSecret = env('JWT_SECRET');
            if (!$jwtSecret) {
                Log::error('JWT_SECRET is not configured in .env file');
                return response()->json([
                    'success' => false,
                    'error' => 'Server configuration error: JWT_SECRET not set'
                ], 500);
            }

            // Find user in database
            $user = DB::table('users')->where('username', $username)->first();

            if (!$user) {
                Log::info('User not found', ['username' => $username]);
                return response()->json([
                    'success' => false,
                    'error' => 'Invalid username or password'
                ], 401);
            }

            // Verify password
            if (!Hash::check($password, $user->password)) {
                Log::info('Invalid password attempt', ['username' => $username]);
                return response()->json([
                    'success' => false,
                    'error' => 'Invalid username or password'
                ], 401);
            }

            // Generate JWT token
            $payload = [
                'sub' => $user->username,
                'user_id' => $user->id,
                'role' => $user->role,
                'iat' => time(),
                'exp' => time() + 60 * 60 * 24, // 24 hours
            ];

            $token = JWT::encode($payload, $jwtSecret, 'HS256');

            Log::info('Login successful', [
                'user_id' => $user->id,
                'username' => $user->username,
                'role' => $user->role
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'token' => $token,
                    'user' => [
                        'id' => $user->id,
                        'username' => $user->username,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role
                    ]
                ]
            ]);
        } catch (Exception $e) {
            // Log the full exception for debugging
            Log::error('Login error', [
                'message' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'An error occurred during login',
                'message' => config('app.debug') ? $e->getMessage() : 'Internal server error',
                'details' => config('app.debug') ? [
                    'file' => $e->getFile(),
                    'line' => $e->getLine()
                ] : null
            ], 500);
        }
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

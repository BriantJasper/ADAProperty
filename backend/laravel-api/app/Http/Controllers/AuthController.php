<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
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
            return response()->json(['success' => false, 'error' => 'Invalid username or password'], 401);
        }

        // Generate JWT token
        $payload = [
            'sub' => $user->username,
            'user_id' => $user->id,
            'role' => $user->role,
            'iat' => time(),
            'exp' => time() + 60 * 60 * 24, // 24 hours
        ];
        
        $token = JWT::encode($payload, env('JWT_SECRET'), 'HS256');
        
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
        return response()->json(['success'=>true]);
    }

    public function forgotPassword(Request $r)
    {
        return response()->json(['success'=>true,'message'=>'OTP sent']);
    }

    public function resetPassword(Request $r)
    {
        return response()->json(['success'=>true,'message'=>'Password reset']);
    }
}
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class AdminController extends Controller
{
    public function changeCredentials(Request $request)
    {
        try {
            // Validasi input
            $request->validate([
                'currentPassword' => 'required|string',
                'newUsername' => 'required|string|min:3|max:50',
                'newPassword' => 'required|string|min:6',
            ]);

            // Ambil token dari header Authorization
            $authHeader = $request->header('Authorization');
            if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
                return response()->json(['success' => false, 'error' => 'Token required'], 401);
            }

            $token = substr($authHeader, 7);
            
            try {
                $decoded = JWT::decode($token, new Key(env('JWT_SECRET'), 'HS256'));
                $username = $decoded->sub;
            } catch (\Exception $e) {
                return response()->json(['success' => false, 'error' => 'Invalid token'], 401);
            }

            // Cari user berdasarkan username dari token
            $user = DB::table('users')->where('username', $username)->first();
            if (!$user) {
                return response()->json(['success' => false, 'error' => 'User not found'], 404);
            }

            // Verifikasi password saat ini
            if (!Hash::check($request->currentPassword, $user->password)) {
                return response()->json(['success' => false, 'error' => 'Current password is incorrect'], 403);
            }

            // Cek apakah username baru sudah digunakan (kecuali oleh user saat ini)
            $existingUser = DB::table('users')
                ->where('username', $request->newUsername)
                ->where('id', '!=', $user->id)
                ->first();
            
            if ($existingUser) {
                return response()->json(['success' => false, 'error' => 'Username already exists'], 409);
            }

            // Update kredensial
            DB::table('users')
                ->where('id', $user->id)
                ->update([
                    'username' => $request->newUsername,
                    'password' => Hash::make($request->newPassword),
                    'updated_at' => now(),
                ]);

            return response()->json([
                'success' => true, 
                'message' => 'Credentials updated successfully'
            ]);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false, 
                'error' => 'Validation failed: ' . implode(', ', $e->validator->errors()->all())
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'error' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }
}
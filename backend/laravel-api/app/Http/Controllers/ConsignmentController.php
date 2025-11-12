<?php

namespace App\Http\Controllers;

use App\Models\Consignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class ConsignmentController extends Controller
{
    /**
     * Get all consignments (admin only)
     * Now includes images as they are stored as URLs (not base64)
     */
    public function index()
    {
        $consignments = Consignment::orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'data' => $consignments
        ]);
    }

    /**
     * Get a single consignment with images (admin only)
     */
    public function show($id)
    {
        $consignment = Consignment::find($id);

        if (!$consignment) {
            return response()->json([
                'success' => false,
                'error' => 'Consignment not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $consignment
        ]);
    }

    /**
     * Create a new consignment (public)
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'seller_name' => 'required|string|max:255',
            'seller_whatsapp' => 'required|string|max:255',
            'seller_email' => 'nullable|email|max:255',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'location' => 'required|string|max:255',
            'sub_location' => 'nullable|string|max:255',
            'type' => 'required|string|max:255',
            'bedrooms' => 'nullable|integer|min:0',
            'bathrooms' => 'nullable|integer|min:0',
            'area' => 'nullable|numeric|min:0',
            'land_area' => 'nullable|numeric|min:0',
            'floors' => 'nullable|integer|min:0',
            'images' => 'nullable|array|max:5',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()->first()
            ], 422);
        }

        $consignment = Consignment::create([
            'seller_name' => $request->seller_name,
            'seller_whatsapp' => $request->seller_whatsapp,
            'seller_email' => $request->seller_email,
            'title' => $request->title,
            'description' => $request->description,
            'price' => $request->price,
            'location' => $request->location,
            'sub_location' => $request->sub_location,
            'type' => $request->type,
            'bedrooms' => $request->bedrooms,
            'bathrooms' => $request->bathrooms,
            'area' => $request->area,
            'land_area' => $request->land_area,
            'floors' => $request->floors,
            'images' => $request->images ?? [],
            'status' => 'pending',
        ]);

        return response()->json([
            'success' => true,
            'data' => $consignment
        ], 201);
    }

    /**
     * Update consignment status (admin only)
     */
    public function update(Request $request, $id)
    {
        $consignment = Consignment::find($id);

        if (!$consignment) {
            return response()->json([
                'success' => false,
                'error' => 'Consignment not found'
            ], 404);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:pending,approved,rejected',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'error' => $validator->errors()->first()
            ], 422);
        }

        $consignment->status = $request->status;
        $consignment->save();

        return response()->json([
            'success' => true,
            'data' => $consignment
        ]);
    }

    /**
     * Delete a consignment (admin only)
     */
    public function destroy($id)
    {
        $consignment = Consignment::find($id);

        if (!$consignment) {
            return response()->json([
                'success' => false,
                'error' => 'Consignment not found'
            ], 404);
        }

        $consignment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Consignment deleted successfully'
        ]);
    }

    /**
     * Stream a consignment image through the API (avoids direct storage CORS issues)
     */
    public function downloadImage(Request $request)
    {
        $path = $request->query('path');

        if (!$path || !is_string($path)) {
            return response()->json([
                'success' => false,
                'error' => 'Missing image path'
            ], 400);
        }

        $parsedPath = parse_url($path, PHP_URL_PATH) ?: $path;
        $decodedPath = urldecode($parsedPath);
        $normalized = ltrim($decodedPath, '/');

        if (Str::startsWith($normalized, 'storage/')) {
            $normalized = substr($normalized, strlen('storage/'));
        }

        if (!Str::startsWith($normalized, 'uploads/')) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid image path'
            ], 400);
        }

        if (Str::contains($normalized, ['..', '\\'])) {
            return response()->json([
                'success' => false,
                'error' => 'Invalid image path'
            ], 400);
        }

        if (!Storage::disk('public')->exists($normalized)) {
            return response()->json([
                'success' => false,
                'error' => 'Image not found'
            ], 404);
        }

        $downloadName = $request->query('filename');
        if (!is_string($downloadName) || trim($downloadName) === '') {
            $downloadName = basename($normalized);
        }

        $fullPath = Storage::disk('public')->path($normalized);
        $mime = mime_content_type($fullPath) ?: 'application/octet-stream';
        $stream = Storage::disk('public')->readStream($normalized);

        if (!$stream) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to read image'
            ], 500);
        }

        return response()->streamDownload(function () use ($stream) {
            fpassthru($stream);
            if (is_resource($stream)) {
                fclose($stream);
            }
        }, $downloadName, [
            'Content-Type' => $mime,
        ]);
    }
}

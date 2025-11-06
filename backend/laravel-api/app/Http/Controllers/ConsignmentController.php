<?php

namespace App\Http\Controllers;

use App\Models\Consignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ConsignmentController extends Controller
{
    /**
     * Get all consignments (admin only)
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
}

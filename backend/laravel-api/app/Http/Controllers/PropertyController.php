<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    // Allow any non-empty type string for flexibility
    private array $allowedStatuses = ['dijual', 'disewa'];

    public function index()
    {
        $props = Property::query()->orderByDesc('id')->get();
        return response()->json(['success' => true, 'data' => $props->map(fn($p) => $this->toFrontend($p))]);
    }

    public function show($id)
    {
        $p = Property::find($id);
        if (!$p) return response()->json(['success' => false, 'error' => 'Not found'], 404);
        return response()->json(['success' => true, 'data' => $this->toFrontend($p)]);
    }

    public function store(Request $r)
    {
        $data = $r->all();
        $type = strtolower(trim((string)($data['type'] ?? '')));
        $status = strtolower(trim((string)($data['status'] ?? '')));
        if (empty($type) || !in_array($status, $this->allowedStatuses)) {
            return response()->json(['success' => false, 'error' => 'Invalid property data'], 400);
        }
        if (($data['price'] ?? 0) <= 0 || empty($data['title']) || empty($data['location']) || empty($data['subLocation'])) {
            return response()->json(['success' => false, 'error' => 'Invalid property data'], 400);
        }

        $p = Property::create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'price' => (int)$data['price'],
            'location' => $data['location'],
            'sub_location' => $data['subLocation'],
            'type' => $type,
            'status' => $status,
            'bedrooms' => (int)($data['bedrooms'] ?? 0),
            'bathrooms' => (int)($data['bathrooms'] ?? 0),
            'area' => (int)($data['area'] ?? 0),
            'land_area' => (int)($data['landArea'] ?? 0),
            'floors' => (int)($data['floors'] ?? 0),
            'images' => json_encode($data['images'] ?? ['/images/p1.png']),
            'features' => json_encode($data['features'] ?? []),
            'whatsapp_number' => $data['whatsappNumber'] ?? null,
            'ig_url' => $data['igUrl'] ?? null,
            'tiktok_url' => $data['tiktokUrl'] ?? null,
            'tour_url' => $data['tourUrl'] ?? null,
            'financing' => isset($data['financing']) ? json_encode($data['financing']) : null,
        ]);

        return response()->json(['success' => true, 'data' => $this->toFrontend($p)]);
    }

    public function update($id, Request $r)
    {
        $p = Property::find($id);
        if (!$p) return response()->json(['success' => false, 'error' => 'Not found'], 404);

        $payload = $r->all();
        if (isset($payload['type'])) {
            $t = strtolower(trim((string)$payload['type']));
            if (empty($t)) return response()->json(['success' => false, 'error' => 'Invalid type'], 400);
            $payload['type'] = $t;
        }
        if (isset($payload['status'])) {
            $s = strtolower(trim((string)$payload['status']));
            if (!in_array($s, $this->allowedStatuses)) return response()->json(['success' => false, 'error' => 'Invalid status'], 400);
            $payload['status'] = $s;
        }

        $map = [
            'title' => 'title',
            'description' => 'description',
            'price' => 'price',
            'location' => 'location',
            'subLocation' => 'sub_location',
            'type' => 'type',
            'status' => 'status',
            'bedrooms' => 'bedrooms',
            'bathrooms' => 'bathrooms',
            'area' => 'area',
            'landArea' => 'land_area',
            'floors' => 'floors',
            'whatsappNumber' => 'whatsapp_number',
            'igUrl' => 'ig_url',
            'tiktokUrl' => 'tiktok_url',
            'tourUrl' => 'tour_url',
        ];

        foreach ($map as $k => $col) {
            if (array_key_exists($k, $payload)) {
                $p->$col = $payload[$k];
            }
        }
        if (array_key_exists('images', $payload)) $p->images = json_encode($payload['images']);
        if (array_key_exists('features', $payload)) $p->features = json_encode($payload['features']);
        if (array_key_exists('financing', $payload)) $p->financing = json_encode($payload['financing']);

        $p->save();
        return response()->json(['success' => true, 'data' => $this->toFrontend($p)]);
    }

    public function destroy($id)
    {
        $p = Property::find($id);
        if (!$p) return response()->json(['success' => false, 'error' => 'Not found'], 404);
        $p->delete();
        return response()->json(['success' => true, 'message' => 'Property deleted successfully']);
    }

    private function toFrontend(Property $p)
    {
        $images = $this->parse($p->images, ['/images/p1.png']);
        $features = $this->parse($p->features, []);
        $financing = $this->parse($p->financing, null);

        return [
            'id' => (string)$p->id,
            'title' => $p->title,
            'description' => $p->description ?? '',
            'price' => (int)$p->price,
            'location' => $p->location,
            'subLocation' => $p->sub_location,
            'type' => $p->type,
            'status' => $p->status,
            'bedrooms' => (int)$p->bedrooms,
            'bathrooms' => (int)$p->bathrooms,
            'area' => (int)$p->area,
            'landArea' => (int)$p->land_area,
            'floors' => (int)$p->floors,
            'images' => $images,
            'features' => $features,
            'whatsappNumber' => $p->whatsapp_number,
            'igUrl' => $p->ig_url,
            'tiktokUrl' => $p->tiktok_url,
            'tourUrl' => $p->tour_url ?? '',
            'financing' => $financing,
            'createdAt' => $p->created_at?->toIso8601String(),
            'updatedAt' => $p->updated_at?->toIso8601String(),
        ];
    }

    private function parse($raw, $fallback)
    {
        if (!$raw) return $fallback;
        if (is_array($raw)) return $raw;
        try {
            $j = json_decode($raw, true);
            return $j ?? $fallback;
        } catch (\Throwable $e) {
            return $fallback;
        }
    }
}

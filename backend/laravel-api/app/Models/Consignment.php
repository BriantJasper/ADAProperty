<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Consignment extends Model
{
    protected $fillable = [
        'seller_name',
        'seller_whatsapp',
        'seller_email',
        'title',
        'description',
        'price',
        'location',
        'sub_location',
        'type',
        'bedrooms',
        'bathrooms',
        'area',
        'land_area',
        'floors',
        'garage',
        'images',
        'status',
    ];

    protected $casts = [
        'images' => 'array',
        'price' => 'decimal:2',
        'area' => 'decimal:2',
        'land_area' => 'decimal:2',
        'bedrooms' => 'integer',
        'bathrooms' => 'integer',
        'floors' => 'integer',
        'garage' => 'integer',
    ];
}

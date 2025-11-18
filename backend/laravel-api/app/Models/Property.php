<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    protected $fillable = [
        'title',
        'description',
        'price',
        'location',
        'sub_location',
        'type',
        'status',
        'bedrooms',
        'bathrooms',
        'area',
        'land_area',
        'floors',
        'images',
        'features',
        'whatsapp_number',
        'ig_url',
        'tiktok_url',
        'tour_url',
        'financing',
        'garage'
    ];
}

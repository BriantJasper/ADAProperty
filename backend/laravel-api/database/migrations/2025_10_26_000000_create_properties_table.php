<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->bigInteger('price')->default(0);
            $table->string('location');
            $table->string('sub_location')->nullable();
            $table->string('type');
            $table->string('status');
            $table->unsignedInteger('bedrooms')->default(0);
            $table->unsignedInteger('bathrooms')->default(0);
            $table->unsignedInteger('area')->default(0);
            $table->unsignedInteger('land_area')->default(0);
            $table->unsignedInteger('floors')->default(0);
            $table->unsignedInteger('garage')->default(0);
            $table->text('images')->nullable();
            $table->text('features')->nullable();
            $table->string('whatsapp_number')->nullable();
            $table->string('ig_url')->nullable();
            $table->string('tiktok_url')->nullable();
            $table->string('tour_url')->nullable();
            $table->mediumText('financing')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('properties');
    }
};

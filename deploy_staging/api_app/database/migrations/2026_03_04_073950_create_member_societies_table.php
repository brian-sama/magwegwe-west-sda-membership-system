<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('member_societies', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->cascadeOnDelete();
            $table->foreignId('society_id')->constrained('societies')->cascadeOnDelete();
            $table->text('skills')->nullable();
            $table->timestamps();

            $table->unique(['member_id', 'society_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('member_societies');
    }
};

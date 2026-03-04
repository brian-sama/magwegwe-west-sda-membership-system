<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendance', function (Blueprint $table) {
            $table->id();
            $table->foreignId('member_id')->constrained('members')->cascadeOnDelete();
            $table->enum('event_type', ['Sabbath', 'Youth', 'Society', 'Campmeeting'])->index();
            $table->date('date')->index();
            $table->enum('status', ['Present', 'Absent', 'Late'])->default('Present');
            $table->timestamps();

            $table->unique(['member_id', 'event_type', 'date']);
            $table->index(['member_id', 'event_type', 'date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance');
    }
};

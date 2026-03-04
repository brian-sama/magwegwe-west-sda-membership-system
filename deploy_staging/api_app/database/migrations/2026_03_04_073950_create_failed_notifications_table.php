<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('failed_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('notification_id')->nullable()->constrained('notifications')->nullOnDelete();
            $table->string('provider')->nullable();
            $table->string('recipient', 30)->nullable();
            $table->text('message')->nullable();
            $table->text('reason');
            $table->json('payload')->nullable();
            $table->timestamp('failed_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('failed_notifications');
    }
};

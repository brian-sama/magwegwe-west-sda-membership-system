<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('channel')->default('sms');
            $table->string('provider')->default('africastalking');
            $table->string('recipient', 30)->index();
            $table->text('message');
            $table->enum('status', ['PENDING', 'SENT', 'FAILED'])->default('PENDING')->index();
            $table->json('response_payload')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};

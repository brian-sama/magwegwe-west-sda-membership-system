<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name')->index();
            $table->enum('gender', ['Male', 'Female', 'Other'])->nullable();
            $table->string('phone', 30)->nullable()->index();
            $table->string('email')->nullable()->index();
            $table->string('national_id')->nullable()->index();
            $table->date('date_of_birth')->nullable();
            $table->text('address')->nullable();
            $table->date('baptism_date')->nullable();
            $table->foreignId('society_id')->nullable()->constrained('societies')->nullOnDelete();
            $table->enum('status', ['BAPTIZED', 'TRANSFERRED_IN', 'ACTIVE', 'INACTIVE', 'TRANSFERRED_OUT'])->default('ACTIVE')->index();
            $table->string('department')->nullable();
            $table->string('previous_church')->nullable();
            $table->string('destination_church')->nullable();
            $table->timestamp('transfer_date')->nullable();
            $table->date('board_approval_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};

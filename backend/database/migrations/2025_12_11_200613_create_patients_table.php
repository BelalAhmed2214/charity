<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('patients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');

            $table->string('name');
            $table->integer('age')->nullable();
            $table->string('ssn')->unique();
            $table->string('phone')->nullable();
            $table->enum('martial_status', ['single', 'married', 'divorced', 'widowed'])->nullable();
            $table->enum('status', ['pending', 'complete'])->nullable()->default("pending");
            $table->integer('childrens')->default(0);
            $table->string('governorate')->nullable();
            $table->text('address')->nullable();
            $table->text('diagnosis')->nullable();
            $table->text('solution')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patients');
    }
};

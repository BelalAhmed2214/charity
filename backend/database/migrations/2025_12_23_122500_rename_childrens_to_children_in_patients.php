<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('patients')) {
            if (!Schema::hasColumn('patients', 'children')) {
                Schema::table('patients', function (Blueprint $table) {
                    $table->integer('children')->default(0)->after('status');
                });
            }
            if (Schema::hasColumn('patients', 'childrens')) {
                DB::statement("UPDATE patients SET children = COALESCE(childrens, 0)");
                Schema::table('patients', function (Blueprint $table) {
                    $table->dropColumn('childrens');
                });
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('patients')) {
            if (!Schema::hasColumn('patients', 'childrens')) {
                Schema::table('patients', function (Blueprint $table) {
                    $table->integer('childrens')->default(0)->after('status');
                });
            }
            if (Schema::hasColumn('patients', 'children')) {
                DB::statement("UPDATE patients SET childrens = COALESCE(children, 0)");
                Schema::table('patients', function (Blueprint $table) {
                    $table->dropColumn('children');
                });
            }
        }
    }
};

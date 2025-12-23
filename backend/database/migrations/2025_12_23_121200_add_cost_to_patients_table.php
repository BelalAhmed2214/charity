<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add 'cost' column to patients if it doesn't exist
        if (!Schema::hasColumn('patients', 'cost')) {
            Schema::table('patients', function (Blueprint $table) {
                $table->decimal('cost', 12, 2)->default(0.00)->after('solution');
            });
        }

        // Backfill 'cost' from 'cost_total' if present
        if (Schema::hasColumn('patients', 'cost_total')) {
            DB::table('patients')->orderBy('id')->chunkById(500, function ($patients) {
                foreach ($patients as $p) {
                    $current = (float) ($p->cost ?? 0.0);
                    $total = (float) ($p->cost_total ?? 0.0);
                    if ($current === 0.0 && $total > 0.0) {
                        DB::table('patients')
                            ->where('id', $p->id)
                            ->update(['cost' => round($total, 2)]);
                    }
                }
            });
        }
    }

    public function down(): void
    {
        // Remove 'cost' column
        if (Schema::hasColumn('patients', 'cost')) {
            Schema::table('patients', function (Blueprint $table) {
                $table->dropColumn('cost');
            });
        }
    }
};

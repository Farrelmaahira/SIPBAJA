<?php

use App\Models\Pengadaan;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('perlengkapan:check', function () {
    $items = Pengadaan::with(['Permohonan', 'Kontrak', 'Penerimaan'])->get();
    $this->info('Total Pengadaan: '.$items->count());
    foreach ($items as $p) {
        $this->line("ID: {$p->id} | Judul: ".($p->Permohonan?->judul ?? '-')." | Status: {$p->status} | Kontrak: ".($p->Kontrak ? $p->Kontrak->nomor : 'NULL').' | Penerimaan: '.($p->Penerimaan ? 'YES' : 'NO'));
    }
});

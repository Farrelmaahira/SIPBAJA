<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RkaklBidang2Controller extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Bidang2/Rkakl/Index');
    }
}

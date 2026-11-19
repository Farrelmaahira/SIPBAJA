<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        $parsedRoles = [];
        foreach ($roles as $role) {
            foreach (explode(',', $role) as $r) {
                $trimmed = trim($r);
                if ($trimmed !== '') {
                    $parsedRoles[] = $trimmed;
                }
            }
        }

        if (! $user) {
            abort(401, 'Unauthenticated.');
        }

        if (! ($user->isActive ?? true)) {
            abort(403, 'Akun Anda telah dinonaktifkan. Silakan hubungi administrator.');
        }

        if (! $user->hasRole($parsedRoles)) {
            abort(403, 'Akses ditolak untuk peran Anda.');
        }

        return $next($request);
    }
}

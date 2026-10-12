<?php

use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Session\TokenMismatchException;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*') || $request->expectsJson()) {
                return null;
            }

            if ($e instanceof ValidationException || $e instanceof AuthenticationException) {
                return null;
            }

            if ($e instanceof TokenMismatchException) {
                $status = 419;
            } elseif ($e instanceof HttpExceptionInterface) {
                $status = $e->getStatusCode();
            } elseif (app()->hasDebugModeEnabled()) {
                return null;
            } else {
                $status = 500;
            }

            if (! in_array($status, [403, 404, 419, 429, 500, 503], true)) {
                return null;
            }

            $headers = $e instanceof HttpExceptionInterface ? $e->getHeaders() : [];

            $response = Inertia::render("Errors/{$status}", ['status' => $status])
                ->toResponse($request);
            $response->setStatusCode($status);
            $response->headers->add($headers);

            return $response;
        });
    })->create();

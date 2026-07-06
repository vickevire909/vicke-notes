import { createFileRoute, Outlet } from "@tanstack/solid-router";

export const Route = createFileRoute("/_app")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div class="flex min-h-screen flex-col items-center bg-stone-900 text-stone-300">
      <main class="h-0 w-full flex-1">
        <Outlet />
      </main>
    </div>
  );
}

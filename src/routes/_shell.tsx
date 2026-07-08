import { createFileRoute, Link, Outlet, useLocation } from '@tanstack/solid-router';
import { type } from 'arktype';
import { type Accessor } from 'solid-js';

const shellSearchSchema = type({
  isSidebarOpen: 'boolean = false',
});

export const Route = createFileRoute('/_shell')({
  validateSearch: shellSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const search = Route.useSearch();
  const location = useLocation();
  const isSidebarOpen = () => search().isSidebarOpen;
  const navigate = Route.useNavigate();
  const setIsDrawerOpen = (value: boolean) => {
    void navigate({
      to: location().pathname,
      search: (prev) => ({ ...prev, isSidebarOpen: value }),
    });
  };

  return (
    <div class="min-h-screen bg-stone-900 text-stone-300">
      <Overlay isDrawerOpen={isSidebarOpen} />
      <nav
        class="fixed top-0 left-0 z-50 h-full w-72 -translate-x-full border-r border-stone-700 bg-stone-800 p-4 shadow-lg transition-transform"
        classList={{
          'translate-x-0': isSidebarOpen(),
          '-translate-x-full': !isSidebarOpen(),
        }}
        aria-label="Sidebar navigation"
      >
        <ul>
          <li>
            <button
              onClick={() => {
                setIsDrawerOpen(false);
              }}
            >
              Close
            </button>
          </li>
          <li>
            <Link to="/">Home</Link>
          </li>
        </ul>
      </nav>
      <main class="min-h-screen">
        <button
          class="m-4"
          onClick={() => {
            setIsDrawerOpen(true);
          }}
          aria-label="Open navigation drawer"
        >
          Menu
        </button>
        <Outlet />
      </main>
    </div>
  );
}

interface OverlayProps {
  isDrawerOpen: Accessor<boolean>;
  onClick?: Accessor<void>;
}
function Overlay(props: OverlayProps) {
  return (
    <div
      class="fixed inset-0 z-40 bg-black/20 transition-opacity"
      classList={{
        'pointer-events-none opacity-0': !props.isDrawerOpen(),
        'opacity-100': props.isDrawerOpen(),
      }}
      aria-hidden={!props.isDrawerOpen()}
      hidden={!props.isDrawerOpen()}
      onClick={() => props.onClick?.()}
    />
  );
}

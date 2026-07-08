import { RouterProvider, createRouter } from '@tanstack/solid-router';

import { routeTree } from './routeTree.gen';

const router = createRouter({ routeTree });

declare module '@tanstack/solid-router' {
  interface Register {
    router: typeof router;
  }
}

export const Main = () => {
  return <RouterProvider router={router} />;
};

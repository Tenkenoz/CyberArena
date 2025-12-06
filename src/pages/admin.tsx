import { lazy, Suspense, useMemo, useState } from 'react';
import { AdminTable } from '@/components/admin_c/AdminTable';

// La definición de lazy va aquí o al final del archivo, pero como una constante separada.
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';



const ReactQueryDevtoolsProduction = lazy(() =>
  import('@tanstack/react-query-devtools/build/modern/production.js').then(
    (d) => ({
      default: d.ReactQueryDevtools,
    }),
  ),
);

const queryClient = new QueryClient();

// Este es el componente que envuelve todo y que debe ser exportado.
const Admin = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AdminTable />
      <Suspense fallback={null}>
        <ReactQueryDevtoolsProduction />
      </Suspense>
    </QueryClientProvider>
  );
};

export default Admin;
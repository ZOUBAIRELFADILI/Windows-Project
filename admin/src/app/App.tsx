import { RouterProvider } from 'react-router-dom';
import { AdminStoreProvider } from '@/store/AdminStore';
import { router } from './router';

export function App() {
  return (
    <AdminStoreProvider>
      <RouterProvider router={router} />
    </AdminStoreProvider>
  );
}

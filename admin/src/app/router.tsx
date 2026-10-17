import { createBrowserRouter, Outlet } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { LibraryPage } from '@/features/library/LibraryPage';
import { NotFoundPage } from '@/features/misc/NotFoundPage';
import { SettingsPage } from '@/features/misc/SettingsPage';
import { OrdersPage } from '@/features/orders/OrdersPage';
import { ProductEditorPage } from '@/features/products/editor/ProductEditorPage';
import { ProductsPage } from '@/features/products/ProductsPage';
import { PromotionsPage } from '@/features/promotions/PromotionsPage';
import { UiProvider } from '@/store/UiStore';

/** UiProvider sits inside the router so the tour can navigate. */
function Root() {
  return (
    <UiProvider>
      <Outlet />
    </UiProvider>
  );
}

export const router = createBrowserRouter([
  {
    element: <Root />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'produits', element: <ProductsPage /> },
          { path: 'produits/:productId', element: <ProductEditorPage /> },
          { path: 'bibliotheque', element: <LibraryPage /> },
          { path: 'promotions', element: <PromotionsPage /> },
          { path: 'commandes', element: <OrdersPage /> },
          { path: 'commandes/:orderId', element: <OrdersPage /> },
          { path: 'parametres', element: <SettingsPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);

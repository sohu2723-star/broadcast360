import { type ReactNode, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import AdminLayout from '@/components/admin/layout';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

import AdminPage from '@/pages/admin';
import AdminAdsPage from '@/pages/admin-ads';
import AdminAdsIdPage from '@/pages/admin-ads-id';
import AdminAdsCreatePage from '@/pages/admin-ads-create';
import AdminAdsEditIdPage from '@/pages/admin-ads-edit-id';
import AdminEntertainmentsPage from '@/pages/admin-entertainments';
import AdminEntertainmentsIdPage from '@/pages/admin-entertainments-id';
import AdminEntertainmentsCreatePage from '@/pages/admin-entertainments-create';
import AdminEntertainmentsEditIdPage from '@/pages/admin-entertainments-edit-id';
import AdminLoginPage from '@/pages/admin-login';
import AdminMoviesPage from '@/pages/admin-movies';
import AdminMoviesIdPage from '@/pages/admin-movies-id';
import AdminMoviesCreatePage from '@/pages/admin-movies-create';
import AdminMoviesEditIdPage from '@/pages/admin-movies-edit-id';
import AdminNewsPage from '@/pages/admin-news';
import AdminNewsIdPage from '@/pages/admin-news-id';
import AdminNewsCreatePage from '@/pages/admin-news-create';
import AdminNotFoundPage from '@/pages/admin-not-found';
import NotFoundPage from '@/pages/not-found';
import AdminPaymentsPage from '@/pages/admin-payments';
import AdminPaymentsIdPage from '@/pages/admin-payments-id';
import AdminProfilePage from '@/pages/admin-profile';
import AdminSchedulesPage from '@/pages/admin-schedules';
import AdminSchedulesIdPage from '@/pages/admin-schedules-id';
import AdminSeriesPage from '@/pages/admin-series';
import AdminSeriesIdPage from '@/pages/admin-series-id';
import AdminSeriesIdEpisodesEpisodeidPage from '@/pages/admin-series-id-episodes-episodeId';
import AdminSeriesIdEpisodesCreatePage from '@/pages/admin-series-id-episodes-create';
import AdminSeriesIdEpisodesEditEpisodeidPage from '@/pages/admin-series-id-episodes-edit-episodeId';
import AdminSeriesCreatePage from '@/pages/admin-series-create';
import AdminSeriesEditIdPage from '@/pages/admin-series-edit-id';
import AdminSubscriptionOptionsPage from '@/pages/admin-subscription-options';
import AdminSubscriptionPlansPage from '@/pages/admin-subscription-plans';
import AdminSubscriptionsPage from '@/pages/admin-subscriptions';
import AdminSubscriptionsIdPage from '@/pages/admin-subscriptions-id';
import AdminSupportChatsPage from '@/pages/admin-support-chats';
import AdminSupportChatsIdPage from '@/pages/admin-support-chats-id';
import AdminSupportContactsPage from '@/pages/admin-support-contacts';
import AdminSupportReactivationPage from '@/pages/admin-support-reactivation';
import LoginPage from '@/pages/login';
import RegisterPage from '@/pages/register';
import AdminUsersPage from '@/pages/admin-users';
import AdminUsersIdPage from '@/pages/admin-users-id';
import AdminUsersIdEditPage from '@/pages/admin-users-id-edit';
import AdminUsersCreatePage from '@/pages/admin-users-create';

const queryClient = new QueryClient();

function Router() {
  return (
    <RoutedErrorBoundary>
      <AdminLayout>
        <Switch>
          <Route path="/" component={AdminPage} />
          <Route path="/ads" component={AdminAdsPage} />
          <Route path="/ads/:id" component={AdminAdsIdPage} />
          <Route path="/ads/create" component={AdminAdsCreatePage} />
          <Route path="/ads/edit/:id" component={AdminAdsEditIdPage} />
          <Route path="/entertainments" component={AdminEntertainmentsPage} />
          <Route path="/entertainments/:id" component={AdminEntertainmentsIdPage} />
          <Route path="/entertainments/create" component={AdminEntertainmentsCreatePage} />
          <Route path="/entertainments/edit/:id" component={AdminEntertainmentsEditIdPage} />
          <Route path="/login" component={AdminLoginPage} />
          <Route path="/movies" component={AdminMoviesPage} />
          <Route path="/movies/:id" component={AdminMoviesIdPage} />
          <Route path="/movies/create" component={AdminMoviesCreatePage} />
          <Route path="/movies/edit/:id" component={AdminMoviesEditIdPage} />
          <Route path="/news" component={AdminNewsPage} />
          <Route path="/news/:id" component={AdminNewsIdPage} />
          <Route path="/news/create" component={AdminNewsCreatePage} />
          <Route path="/not-found" component={AdminNotFoundPage} />
          <Route path="/not/found" component={NotFoundPage} />
          <Route path="/payments" component={AdminPaymentsPage} />
          <Route path="/payments/:id" component={AdminPaymentsIdPage} />
          <Route path="/profile" component={AdminProfilePage} />
          <Route path="/schedules" component={AdminSchedulesPage} />
          <Route path="/schedules/:id" component={AdminSchedulesIdPage} />
          <Route path="/series" component={AdminSeriesPage} />
          <Route path="/series/:id" component={AdminSeriesIdPage} />
          <Route path="/series/:id/episodes/:episodeId" component={AdminSeriesIdEpisodesEpisodeidPage} />
          <Route path="/series/:id/episodes/create" component={AdminSeriesIdEpisodesCreatePage} />
          <Route path="/series/:id/episodes/edit/:episodeId" component={AdminSeriesIdEpisodesEditEpisodeidPage} />
          <Route path="/series/create" component={AdminSeriesCreatePage} />
          <Route path="/series/edit/:id" component={AdminSeriesEditIdPage} />
          <Route path="/subscription/options" component={AdminSubscriptionOptionsPage} />
          <Route path="/subscription/plans" component={AdminSubscriptionPlansPage} />
          <Route path="/subscriptions" component={AdminSubscriptionsPage} />
          <Route path="/subscriptions/:id" component={AdminSubscriptionsIdPage} />
          <Route path="/support/chats" component={AdminSupportChatsPage} />
          <Route path="/support/chats/:id" component={AdminSupportChatsIdPage} />
          <Route path="/support/contacts" component={AdminSupportContactsPage} />
          <Route path="/support/reactivation" component={AdminSupportReactivationPage} />
          <Route path="/user-login" component={LoginPage} />
          <Route path="/user-register" component={RegisterPage} />
          <Route path="/users" component={AdminUsersPage} />
          <Route path="/users/:id" component={AdminUsersIdPage} />
          <Route path="/users/:id/edit" component={AdminUsersIdEditPage} />
          <Route path="/users/create" component={AdminUsersCreatePage} />
          <Route component={NotFound} />
        </Switch>
      </AdminLayout>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

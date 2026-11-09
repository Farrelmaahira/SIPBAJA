import {
  AppLayout,
  type AppLayoutProps,
  type AppNavItem,
  type AppTopbarUser,
  type BreadcrumbItem,
} from './AppLayout';

export type {
  AppNavItem as PpNavItem,
  AppLayoutProps as PpLayoutProps,
  AppTopbarUser as PpTopbarUser,
  BreadcrumbItem,
};

export const PpLayout = AppLayout;
export default AppLayout;

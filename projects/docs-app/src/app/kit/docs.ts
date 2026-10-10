import { LucideAppWindow, LucideEllipsisVertical, LucideKeyRound, LucideLayoutPanelTop, LucideLoader, LucidePanelLeft, LucideSquarePen, LucideTable, LucideTextCursorInput, LucideType } from '@lucide/angular';
import { DocLib } from '../docs/types';
import { KitStartPage } from './_start-page/kit-start-page';
import { AuthPage } from './auth/auth.page';
import { DialogsPage } from './dialogs/dialogs.page';
import { FormControlsPage } from './form-controls/form-controls.page';
import { FormsPage } from './forms/forms.page';
import { LoadingPage } from './loading/loading.page';
import { MenuPage } from './menu/menu.page';
import { PageHeaderPage } from './page-header/page-header.page';
import { ShellPage } from './shell/shell.page';
import { TablePage } from './table/table.page';
import { TypographyPage } from './typography/typography.page';

export const KIT_LIB: DocLib = {
  name: 'Kit',
  path: 'kit',
  libName: '@jchpro/ngx-kit',
  desc: 'Admin-app UI kit built on CDK',
  component: KitStartPage,
  pages: [
    {
      fullName: 'Layout shell',
      menuName: 'Shell',
      path: 'shell',
      icon: LucidePanelLeft,
      desc: 'Header, collapsible sidenav and footer composition',
      component: ShellPage
    },
    {
      fullName: 'Loading state',
      menuName: 'Loading',
      path: 'loading',
      icon: LucideLoader,
      desc: 'Busy buttons and panels, global loading bar',
      component: LoadingPage
    },
    {
      fullName: 'Menus',
      menuName: 'Menus',
      path: 'menu',
      icon: LucideEllipsisVertical,
      desc: 'Contextual menus on CDK overlays',
      component: MenuPage
    },
    {
      fullName: 'Page header',
      menuName: 'Page header',
      path: 'page-header',
      icon: LucideLayoutPanelTop,
      desc: 'Breadcrumb, title and the page\'s main actions',
      component: PageHeaderPage
    },
    {
      fullName: 'Dialogs',
      menuName: 'Dialogs',
      path: 'dialogs',
      icon: LucideAppWindow,
      desc: 'Dialog look, alert and confirm with Promises, labels',
      component: DialogsPage
    },
    {
      fullName: 'Data tables',
      menuName: 'Tables',
      path: 'table',
      icon: LucideTable,
      desc: 'Frame, search, filters, sortable headers, paginator and column conventions',
      component: TablePage
    },
    {
      fullName: 'Auth views',
      menuName: 'Auth',
      path: 'auth',
      icon: LucideKeyRound,
      desc: 'Sign in, forgot and set password, and the pieces to build your own',
      component: AuthPage
    },
    {
      fullName: 'Forms',
      menuName: 'Forms',
      path: 'forms',
      icon: LucideSquarePen,
      desc: 'The error line of a Signal Forms field, resetting a form',
      component: FormsPage
    },
    {
      fullName: 'Form controls',
      menuName: 'Form controls',
      path: 'form-controls',
      icon: LucideTextCursorInput,
      desc: 'Every native form control, as styled so far',
      component: FormControlsPage
    },
    {
      fullName: 'Typography',
      menuName: 'Typography',
      path: 'typography',
      icon: LucideType,
      desc: 'Interface scale and prose, element by element',
      component: TypographyPage
    }
  ]
};

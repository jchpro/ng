import { LucideKeyRound, LucideMessageSquareText, LucidePanelLeft, LucideSquarePen, LucideTable, LucideType } from '@lucide/angular';
import { DocsTabbedPage } from '../docs/tabbed-page/docs-tabbed-page';
import { DocLib } from '../docs/types';
import pkg from '../../../../@jchpro/ngx-kit/package.json';
import { KitStartPage } from './_start-page/kit-start-page';
import { AuthPage } from './auth/auth.page';
import { DialogsPage } from './feedback/dialogs/dialogs.page';
import { LoadingPage } from './feedback/loading/loading.page';
import { MenuPage } from './feedback/menu/menu.page';
import { StatusTab } from './feedback/status/status.tab';
import { ChoiceTab } from './forms/choice/choice.tab';
import { TextValuesTab } from './forms/text-values/text-values.tab';
import { FormsPage } from './forms/validation/forms.page';
import { LabelsTab } from './foundations/labels/labels.tab';
import { TokensTab } from './foundations/tokens/tokens.tab';
import { ButtonsTab } from './foundations/buttons/buttons.tab';
import { TypographyPage } from './foundations/typography/typography.page';
import { PageHeaderPage } from './layout/page-header/page-header.page';
import { ShellPage } from './layout/shell/shell.page';
import { TabsPage } from './layout/tabs/tabs.page';
import { TablePage } from './table/table.page';

export const KIT_LIB: DocLib = {
  name: 'Kit',
  path: 'kit',
  libName: '@jchpro/ngx-kit',
  version: pkg.version,
  desc: 'Admin-app UI kit built on CDK',
  component: KitStartPage,
  pages: [
    {
      fullName: 'Foundations',
      menuName: 'Foundations',
      path: 'foundations',
      icon: LucideType,
      desc: 'Typography, tokens, buttons and translatable labels',
      component: DocsTabbedPage,
      tabs: [
        { label: 'Typography', path: 'typography', component: TypographyPage },
        { label: 'Tokens', path: 'tokens', component: TokensTab },
        { label: 'Buttons', path: 'buttons', component: ButtonsTab },
        { label: 'Labels', path: 'labels', component: LabelsTab }
      ]
    },
    {
      fullName: 'Layout',
      menuName: 'Layout',
      path: 'layout',
      icon: LucidePanelLeft,
      desc: 'Shell with header and sidenav, page header, tabs',
      component: DocsTabbedPage,
      tabs: [
        { label: 'Shell', path: 'shell', component: ShellPage },
        { label: 'Page header', path: 'page-header', component: PageHeaderPage },
        { label: 'Tabs', path: 'tabs', component: TabsPage }
      ]
    },
    {
      fullName: 'Forms',
      menuName: 'Forms',
      path: 'forms',
      icon: LucideSquarePen,
      desc: 'Every native control as styled, and the helpers for Signal Forms',
      component: DocsTabbedPage,
      tabs: [
        { label: 'Text and values', path: 'text-values', component: TextValuesTab },
        { label: 'Choice', path: 'choice', component: ChoiceTab },
        { label: 'Validation', path: 'validation', component: FormsPage }
      ]
    },
    {
      fullName: 'Overlays and feedback',
      menuName: 'Feedback',
      path: 'feedback',
      icon: LucideMessageSquareText,
      desc: 'Loading state, dialogs, menus, progress and status',
      component: DocsTabbedPage,
      tabs: [
        { label: 'Loading', path: 'loading', component: LoadingPage },
        { label: 'Dialogs', path: 'dialogs', component: DialogsPage },
        { label: 'Menus', path: 'menu', component: MenuPage },
        { label: 'Status', path: 'status', component: StatusTab }
      ]
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
    }
  ]
};

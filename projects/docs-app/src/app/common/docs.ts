import { LucideBroom, LucideClipboardCopy, LucideGitBranch, LucideGlobe, LucideHardDrive, LucideHeading, LucideRoute, LucideWorkflow } from '@lucide/angular';
import { DocLib } from '../docs/types';
import { CommonStartPage } from './_start-page/common-start-page';
import { BaseIfPage } from './base-if/base-if.page';
import { ClipboardPage } from './clipboard/clipboard.page';
import { ContentPage } from './content/content.page';
import { IntlUtilsPage } from './intl-utils/intl-utils.page';
import { ReactivePage } from './reactive-directive/reactive.page';
import { RouterEventsPage } from './router-events-service/router-events.page';
import { StoragePage } from './storage/storage.page';
import { TitleServicePage } from './title-service/title-service.page';

export const COMMON_LIB: DocLib = {
  name: 'Common',
  path: 'common',
  libName: '@jchpro/ngx-common',
  desc: 'Common Angular apps mechanisms',
  component: CommonStartPage,
  pages: [
    {
      fullName: 'Internationalization utilities',
      menuName: 'Internationalization',
      path: 'intl-utils',
      icon: LucideGlobe,
      desc: 'Internationalization service and pipes',
      component: IntlUtilsPage
    },
    {
      fullName: 'Storage utilities',
      menuName: 'Storage',
      path: 'storage-utils',
      icon: LucideHardDrive,
      desc: 'Storage utilities',
      component: StoragePage
    },
    {
      fullName: 'Content rendering and projection',
      menuName: 'Rendering & projection',
      path: 'angular-content',
      icon: LucideWorkflow,
      desc: 'Things related to rendering and projection of content in Angular apps.',
      component: ContentPage
    },
    {
      fullName: 'Reactive base class',
      menuName: 'Reactive',
      path: 'reactive',
      icon: LucideBroom,
      desc: 'Effortless observable cleanup on directive/component destroy.',
      component: ReactivePage
    },
    {
      fullName: 'Router events service',
      menuName: 'Router events',
      path: 'router-events',
      icon: LucideRoute,
      desc: 'Observe router events by type and resolve the active route.',
      component: RouterEventsPage
    },
    {
      fullName: 'Browser title service',
      menuName: 'Browser title',
      path: 'browser-title',
      icon: LucideHeading,
      desc: 'Set the document title, optionally driven by route data.',
      component: TitleServicePage
    },
    {
      fullName: 'Clipboard service',
      menuName: 'Clipboard',
      path: 'clipboard',
      icon: LucideClipboardCopy,
      desc: 'Copy text to the clipboard without throwing.',
      component: ClipboardPage
    },
    {
      fullName: 'Custom structural directives',
      menuName: 'Structural directives',
      path: 'base-if',
      icon: LucideGitBranch,
      desc: 'Base class for building your own *ngIf-like structural directives.',
      component: BaseIfPage
    }
  ]
};

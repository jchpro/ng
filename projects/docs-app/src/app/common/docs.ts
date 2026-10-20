import { LucideGlobe, LucideHardDrive, LucideLanguages, LucideWorkflow } from '@lucide/angular';
import { DocsTabbedPage } from '../docs/tabbed-page/docs-tabbed-page';
import { DocLib } from '../docs/types';
import pkg from '../../../../@jchpro/ngx-common/package.json';
import { CommonStartPage } from './_start-page/common-start-page';
import { BaseIfPage } from './components/base-if/base-if.page';
import { ContentPage } from './components/content/content.page';
import { ReactivePage } from './components/reactive/reactive.page';
import { ClipboardPage } from './browser/clipboard/clipboard.page';
import { RouterEventsPage } from './browser/router-events/router-events.page';
import { ScriptLoaderPage } from './browser/script-loader/script-loader.page';
import { TitleServicePage } from './browser/title/title-service.page';
import { IntlUtilsPage } from './intl-utils/intl-utils.page';
import { StoragePage } from './storage/storage.page';

export const COMMON_LIB: DocLib = {
  name: 'Common',
  path: 'common',
  libName: '@jchpro/ngx-common',
  version: pkg.version,
  desc: 'Common Angular apps mechanisms',
  component: CommonStartPage,
  pages: [
    {
      fullName: 'Internationalization utilities',
      menuName: 'Internationalization',
      path: 'intl-utils',
      icon: LucideLanguages,
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
      fullName: 'Components and directives',
      menuName: 'Components & directives',
      path: 'components',
      icon: LucideWorkflow,
      desc: 'Content rendering and projection, structural directives, reactive cleanup.',
      component: DocsTabbedPage,
      tabs: [
        { label: 'Rendering & projection', path: 'angular-content', component: ContentPage },
        { label: 'Structural directives', path: 'base-if', component: BaseIfPage },
        { label: 'Reactive base class', path: 'reactive', component: ReactivePage }
      ]
    },
    {
      fullName: 'Browser and routing',
      menuName: 'Browser & routing',
      path: 'browser',
      icon: LucideGlobe,
      desc: 'Router events, the document title, the clipboard and loading scripts on demand.',
      component: DocsTabbedPage,
      tabs: [
        { label: 'Router events', path: 'router-events', component: RouterEventsPage },
        { label: 'Browser title', path: 'browser-title', component: TitleServicePage },
        { label: 'Clipboard', path: 'clipboard', component: ClipboardPage },
        { label: 'Script loader', path: 'script-loader', component: ScriptLoaderPage }
      ]
    }
  ]
};

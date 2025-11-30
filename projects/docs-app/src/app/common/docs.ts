import { faDiagramProject, faGlobe, faHardDrive } from '@fortawesome/free-solid-svg-icons';
import { DocLib } from '../docs/types';
import { CommonStartPage } from './_start-page/common-start-page';
import { ContentPage } from './content/content.page';
import { IntlUtilsPage } from './intl-utils/intl-utils.page';
import { StoragePage } from './storage/storage.page';

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
      icon: faGlobe,
      desc: 'Internationalization service and pipes',
      component: IntlUtilsPage
    },
    {
      fullName: 'Storage utilities',
      menuName: 'Storage',
      path: 'storage-utils',
      icon: faHardDrive,
      desc: 'Storage utilities',
      component: StoragePage
    },
    {
      fullName: 'Content rendering and projection',
      menuName: 'Rendering & projection',
      path: 'angular-content',
      icon: faDiagramProject,
      desc: 'Things related to rendering and projection of content in Angular apps.',
      component: ContentPage
    }
  ]
};

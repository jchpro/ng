import { faGlobe, faHardDrive } from '@fortawesome/free-solid-svg-icons';
import { DocLib } from '../docs/types';
import { CommonStartPage } from './_start-page/common-start-page';
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
    }
  ]
};

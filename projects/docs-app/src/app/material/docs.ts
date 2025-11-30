import { faWindowMaximize } from '@fortawesome/free-regular-svg-icons';
import { faBarsProgress, faExclamationTriangle, faFileArrowUp } from '@fortawesome/free-solid-svg-icons';
import { DocLib } from '../docs/types';
import { MaterialStartPage } from './_start-page/material-start-page';
import { Dialogs } from './dialogs/dialogs';
import { Dropzone } from './dropzone/dropzone';
import { Errors } from './errors/errors';
import { Loading } from './loading/loading';

export const MATERIAL_LIB: DocLib = {
  name: 'Material',
  path: 'material',
  libName: '@jchpro/ngx-material',
  desc: 'Built on top of Material and CDK',
  component: MaterialStartPage,
  pages: [
    {
      fullName: 'Loading indicators',
      menuName: 'Loading',
      path: 'loading',
      icon: faBarsProgress,
      desc: 'Loading overlay and global loading indicator',
      component: Loading
    },
    {
      fullName: 'File selector and dropzone',
      menuName: 'File dropzone',
      path: 'file-dropzone',
      icon: faFileArrowUp,
      desc: 'Material-styled file input button and dropzone for dragged-in files',
      component: Dropzone
    },
    {
      fullName: 'Form errors helper',
      menuName: 'Form errors',
      path: 'errors',
      icon: faExclamationTriangle,
      desc: 'Helper for displaying form errors in a simpler way',
      component: Errors
    },
    {
      fullName: 'Common dialogs',
      menuName: 'Common dialogs',
      path: 'dialogs',
      icon: faWindowMaximize,
      desc: 'Common dialogs windows for everyday use',
      component: Dialogs
    }
  ]
};

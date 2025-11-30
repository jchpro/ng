import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faFolderOpen } from '@fortawesome/free-regular-svg-icons';
import { faCheck, faTimes } from '@fortawesome/free-solid-svg-icons';
import { provideIcons as libProvideIcons } from '@jchpro/ngx-material';

export function provideIcons() {
  return libProvideIcons({
    custom: () => {
      return {
        type: FaIconComponent,
        inputName: 'icon',
        mapping: icon => {
          switch (icon) {
            case 'accept': return faCheck;
            case 'decline': return faTimes;
            case 'browse_files': return faFolderOpen;
            case 'clear_files': return faTimes;
          }
        }
      }
    }
  });
}

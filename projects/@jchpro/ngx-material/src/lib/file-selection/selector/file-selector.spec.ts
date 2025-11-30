import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ProIconRenderer } from '../../icons/pro-icon-renderer';
import { FileSelector } from './file-selector';

@Component({
  selector: 'pro-icon',
  template: '',
  standalone: true,
})
class MockProIconComponent {
  @Input() icon!: string;
}

@Component({
  template: `
    <pro-file-selector
      [showInfo]="showInfo"
      [multiple]="multiple"
      (filesChange)="onFilesChange($event)">
    </pro-file-selector>

    <ng-template #infoTpl let-files let-multiple="multiple">
      <div class="custom-info">
        custom: {{ files.length }} / multiple: {{ multiple }}
      </div>
    </ng-template>
  `,
  imports: [FileSelector],
  standalone: true,
})
class HostComponent {
  showInfo: boolean | TemplateRef<any> = true;
  multiple = false;

  lastFilesChange?: File[];

  @ViewChild('infoTpl', { static: true }) infoTpl!: TemplateRef<any>;

  onFilesChange(files: File[]) {
    this.lastFilesChange = files;
  }
}

describe('FileSelector', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const getSelectorDebugEl = () => fixture.debugElement.query(By.directive(FileSelector));
  const getSelector = () => getSelectorDebugEl().componentInstance as FileSelector;

  const getNativeInput = (): HTMLInputElement => {
    const selectorEl = getSelectorDebugEl();
    return selectorEl.query(By.css('input[type="file"]')).nativeElement as HTMLInputElement;
  };

  const getSelectButton = (): HTMLButtonElement => {
    const selectorEl = getSelectorDebugEl();
    const buttons = selectorEl.queryAll(By.css('button'));
    return buttons[0].nativeElement as HTMLButtonElement;
  };

  const getClearButton = (): HTMLButtonElement | null => {
    const selectorEl = getSelectorDebugEl();
    const buttons = selectorEl.queryAll(By.css('button'));
    if (buttons.length < 2) {
      return null;
    }
    return buttons[1].nativeElement as HTMLButtonElement;
  };

  const getSelectionInfoText = (): string => {
    const selectorEl = getSelectorDebugEl();
    const info = selectorEl.query(By.css('.selection-info'));
    if (!info) {
      return '';
    }
    return (info.nativeElement as HTMLElement).textContent?.trim() ?? '';
  };

  beforeEach(() => {
    TestBed.overrideComponent(FileSelector, {
      remove: { imports: [ProIconRenderer] },
      add: { imports: [MockProIconComponent] }
    })
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(getSelector()).toBeTruthy();
  });

  describe('opening native file dialog', () => {
    it('should call native input click when select button is clicked', () => {
      const input = getNativeInput();
      const clickSpy = spyOn(input, 'click');

      getSelectButton().click();

      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('file selection and clearing', () => {
    it('should update files signal and emit filesChange on input event', () => {
      const selector = getSelector();
      const input = getNativeInput();

      const file1 = new File(['a'], 'a.txt', { type: 'text/plain' });
      const file2 = new File(['b'], 'b.txt', { type: 'text/plain' });

      Object.defineProperty(input, 'files', {
        configurable: true,
        get: () => [file1, file2],
      });

      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(selector.files().map(f => f.name)).toEqual(['a.txt', 'b.txt']);
      expect(host.lastFilesChange?.map(f => f.name)).toEqual(['a.txt', 'b.txt']);
      expect(getClearButton()).not.toBeNull();
    });

    it('should clear native input value, clear files and emit filesChange when clear button is clicked', () => {
      const selector = getSelector();
      const input = getNativeInput();

      const file1 = new File(['a'], 'a.txt', { type: 'text/plain' });

      Object.defineProperty(input, 'files', {
        configurable: true,
        get: () => [file1],
      });

      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(selector.files().length).toBe(1);
      expect(getClearButton()).not.toBeNull();

      // Make sure the input has some value to be cleared.
      let inputValue = 'C:\\fakepath\\a.txt';
      spyOnProperty(input, 'value', 'get')
        .and.callFake(() => inputValue);
      spyOnProperty(input, 'value', 'set')
        .and.callFake((value) => inputValue = value);

      // After clear(), component calls onFileSelect() again, which reads input.files.
      // Simulate that the browser now reports no files.
      Object.defineProperty(input, 'files', {
        configurable: true,
        get: () => [],
      });

      const clearButton = getClearButton();
      expect(clearButton).not.toBeNull();

      clearButton!.click();
      fixture.detectChanges();

      expect(inputValue).toBe('');
      expect(selector.files()).toEqual([]);
      expect(host.lastFilesChange).toEqual([]);
      expect(getClearButton()).toBeNull();
    });
  });

  describe('showInfo', () => {
    it('should show built-in intl info when showInfo is true (0 files)', () => {
      host.showInfo = true;
      fixture.detectChanges();

      expect(getSelectionInfoText()).toContain('No files selected');
    });

    it('should show built-in intl info when showInfo is true (1 file)', () => {
      host.showInfo = true;
      fixture.detectChanges();

      const input = getNativeInput();
      const file1 = new File(['a'], 'a.txt', { type: 'text/plain' });

      Object.defineProperty(input, 'files', {
        configurable: true,
        get: () => [file1],
      });

      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(getSelectionInfoText()).toContain('File "a.txt" selected');
    });

    it('should show built-in intl info when showInfo is true (many files)', () => {
      host.showInfo = true;
      fixture.detectChanges();

      const input = getNativeInput();
      const file1 = new File(['a'], 'a.txt', { type: 'text/plain' });
      const file2 = new File(['b'], 'b.txt', { type: 'text/plain' });
      const file3 = new File(['c'], 'c.txt', { type: 'text/plain' });

      Object.defineProperty(input, 'files', {
        configurable: true,
        get: () => [file1, file2, file3],
      });

      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      expect(getSelectionInfoText()).toContain('3 files selected');
    });

    it('should not render selection info when showInfo is false', () => {
      host.showInfo = false;
      fixture.detectChanges();

      const selectorEl = getSelectorDebugEl();
      expect(selectorEl.query(By.css('.selection-info'))).toBeNull();
    });

    it('should render custom template when showInfo is a TemplateRef and pass correct context', () => {
      host.multiple = true;
      host.showInfo = host.infoTpl;
      fixture.detectChanges();

      const input = getNativeInput();
      const file1 = new File(['a'], 'a.txt', { type: 'text/plain' });
      const file2 = new File(['b'], 'b.txt', { type: 'text/plain' });

      Object.defineProperty(input, 'files', {
        configurable: true,
        get: () => [file1, file2],
      });

      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();

      const selectorEl = getSelectorDebugEl();
      const customInfo = selectorEl.query(By.css('.custom-info'));
      expect(customInfo).not.toBeNull();

      const text = (customInfo.nativeElement as HTMLElement).textContent?.replace(/\s+/g, ' ').trim() ?? '';
      expect(text).toContain('custom: 2 / multiple: true');
    });

    it('should hide selection info when dropzone is attached, even if showInfo is true', () => {
      host.showInfo = true;
      fixture.detectChanges();

      const selector = getSelector();
      expect(getSelectionInfoText()).toContain('No files selected');

      selector.dropzoneAttached();
      fixture.detectChanges();

      const selectorEl = getSelectorDebugEl();
      expect(selectorEl.query(By.css('.selection-info'))).toBeNull();

      selector.dropzoneDetached();
      fixture.detectChanges();

      expect(getSelectionInfoText()).toContain('No files selected');
    });
  });
});

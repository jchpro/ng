import { Component, signal, TemplateRef, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FileSelectorInfoContext } from '../selector/file-selector';
import { FileDropzone } from './file-dropzone';

@Component({
  selector: 'pro-file-selector',
  template: ``,
  standalone: true,
})
class MockFileSelector {

  readonly accept = signal<string | undefined>(undefined);
  readonly showInfo = signal<boolean | TemplateRef<FileSelectorInfoContext>>(false);
  readonly files = signal<File[]>([]);
  readonly multiple = signal<boolean>(false);

  readonly dropzoneAttachedSpy = jasmine.createSpy('dropzoneAttached');
  readonly dropzoneDetachedSpy = jasmine.createSpy('dropzoneDetached');

  readonly nativeInput = signal({
    nativeElement: {
      files: null as unknown as FileList,
      dispatchEvent: jasmine.createSpy('dispatchEvent'),
    } as unknown as HTMLInputElement
  });

  dropzoneAttached() {
    this.dropzoneAttachedSpy();
  }

  dropzoneDetached() {
    this.dropzoneDetachedSpy();
  }
}

@Component({
  template: `
    <pro-file-selector #selector></pro-file-selector>
    <pro-file-dropzone [for]="$any(selector)" (invalidFilesDrop)="onInvalidFilesDrop()"></pro-file-dropzone>
  `,
  imports: [
    FileDropzone,
    MockFileSelector
  ],
  standalone: true,
})
class HostComponent {

  invalidFilesDropCount = 0;

  readonly selector = viewChild.required<MockFileSelector>('selector');

  onInvalidFilesDrop() {
    this.invalidFilesDropCount++;
  }
}

describe('FileDropzone', () => {
  let fixture: ComponentFixture<HostComponent>;
  let host: HostComponent;

  const getDropzoneEl = (): HTMLElement => {
    return fixture.debugElement.query(By.css('pro-file-dropzone')).nativeElement as HTMLElement;
  };

  const dispatchDragEvent = (
    type: 'dragover' | 'dragleave' | 'drop',
    dataTransfer?: Partial<DataTransfer> | null
  ): DragEvent => {
    const event = new Event(type, { bubbles: true, cancelable: true }) as any;

    event.preventDefault = jasmine.createSpy('preventDefault');

    if (typeof dataTransfer !== 'undefined') {
      Object.defineProperty(event, 'dataTransfer', {
        value: dataTransfer,
        configurable: true,
      });
    }

    getDropzoneEl().dispatchEvent(event);
    fixture.detectChanges();
    return event as DragEvent;
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(HostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(host).toBeTruthy();
  });

  it('should call selector.dropzoneAttached on init', () => {
    const selector = host.selector();
    expect(selector.dropzoneAttachedSpy).toHaveBeenCalledTimes(1);
  });

  it('should call selector.dropzoneDetached on destroy', () => {
    const selector = host.selector();
    fixture.destroy();
    expect(selector.dropzoneDetachedSpy).toHaveBeenCalledTimes(1);
  });

  describe('drag events and active state', () => {
    it('should set active class on dragover and remove it on dragleave', () => {
      const el = getDropzoneEl();
      expect(el.classList.contains('active')).toBe(false);

      dispatchDragEvent('dragover');
      expect(el.classList.contains('active')).toBe(true);

      dispatchDragEvent('dragleave');
      expect(el.classList.contains('active')).toBe(false);
    });

    it('should preventDefault on dragover and dragleave', () => {
      const over = dispatchDragEvent('dragover');
      expect((over.preventDefault as unknown as jasmine.Spy)).toHaveBeenCalled();

      const leave = dispatchDragEvent('dragleave');
      expect((leave.preventDefault as unknown as jasmine.Spy)).toHaveBeenCalled();
    });
  });

  describe('tracking showInfo from selector', () => {
    it('should track selector.showInfo changes into dropzone.showInfo signal', () => {
      const dropzone = fixture.debugElement.query(By.directive(FileDropzone)).componentInstance as FileDropzone;
      const selector = host.selector();

      expect((dropzone as any).showInfo()).toBe(false);

      selector.showInfo.set(true);
      fixture.detectChanges();
      expect((dropzone as any).showInfo()).toBe(true);
    });
  });

  describe('drop handling', () => {
    it('should do nothing when drop event has no dataTransfer.files', () => {
      const selector = host.selector();
      const inputEl = selector.nativeInput().nativeElement;

      dispatchDragEvent('drop', null);

      const dispatchSpy = inputEl.dispatchEvent as unknown as jasmine.Spy;
      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('should attach dropped files to selector native input and dispatch input event', () => {
      const selector = host.selector();
      const inputEl = selector.nativeInput().nativeElement;

      const file1 = new File(['a'], 'a.txt', { type: 'text/plain' });
      const file2 = new File(['b'], 'b.txt', { type: 'text/plain' });

      const files = {
        0: file1,
        1: file2,
        length: 2,
        item: (index: number) => (index === 0 ? file1 : index === 1 ? file2 : null),
      } as unknown as FileList;

      dispatchDragEvent('drop', { files } as any);

      expect(inputEl.files).toBe(files);

      const dispatchSpy = inputEl.dispatchEvent as unknown as jasmine.Spy;
      expect(dispatchSpy).toHaveBeenCalledTimes(1);

      const dispatchedEvent = dispatchSpy.calls.mostRecent().args[0] as Event;
      expect(dispatchedEvent.type).toBe('input');
    });

    it('should emit invalidFilesDrop and not attach files when accept does not match', () => {
      const selector = host.selector();
      selector.accept.set('image/*');

      const inputEl = selector.nativeInput().nativeElement;

      const file1 = new File(['a'], 'a.txt', { type: 'text/plain' });
      const files = {
        0: file1,
        length: 1,
        item: (index: number) => (index === 0 ? file1 : null),
      } as unknown as FileList;

      dispatchDragEvent('drop', { files } as any);

      expect(host.invalidFilesDropCount).toBe(1);

      const dispatchSpy = inputEl.dispatchEvent as unknown as jasmine.Spy;
      expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('should attach files when accept is not set', () => {
      const selector = host.selector();
      selector.accept.set(undefined);

      const inputEl = selector.nativeInput().nativeElement;

      const file1 = new File(['a'], 'a.txt', { type: 'text/plain' });
      const files = {
        0: file1,
        length: 1,
        item: (index: number) => (index === 0 ? file1 : null),
      } as unknown as FileList;

      dispatchDragEvent('drop', { files } as any);

      expect(host.invalidFilesDropCount).toBe(0);
      expect(inputEl.files).toBe(files);

      const dispatchSpy = inputEl.dispatchEvent as unknown as jasmine.Spy;
      expect(dispatchSpy).toHaveBeenCalledTimes(1);

      const dispatchedEvent = dispatchSpy.calls.mostRecent().args[0] as Event;
      expect(dispatchedEvent.type).toBe('input');
    });

    it('should preventDefault and clear active state on drop', () => {
      dispatchDragEvent('dragover');
      expect(getDropzoneEl().classList.contains('active')).toBe(true);

      const drop = dispatchDragEvent('drop', null);
      expect((drop.preventDefault as unknown as jasmine.Spy)).toHaveBeenCalled();
      expect(getDropzoneEl().classList.contains('active')).toBe(false);
    });
  });
});

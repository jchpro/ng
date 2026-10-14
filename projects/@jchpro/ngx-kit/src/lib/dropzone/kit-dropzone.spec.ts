import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { KitDropzone, kitAcceptsFile } from './kit-dropzone.directive';

describe('kitAcceptsFile', () => {

  const file = (name: string, type: string) => new File(['x'], name, { type });

  it('should accept anything without an accept list', () => {
    expect(kitAcceptsFile(file('a.bin', ''), '')).toBeTrue();
  });

  it('should match extensions, MIME types and wildcards, ignoring the case', () => {
    expect(kitAcceptsFile(file('Photo.PNG', 'image/png'), '.png')).toBeTrue();
    expect(kitAcceptsFile(file('a.jpg', 'image/jpeg'), 'image/png, image/jpeg')).toBeTrue();
    expect(kitAcceptsFile(file('a.gif', 'image/gif'), 'image/*')).toBeTrue();
  });

  it('should refuse what no entry of the list allows', () => {
    expect(kitAcceptsFile(file('a.pdf', 'application/pdf'), 'image/*,.png')).toBeFalse();
  });

});

describe('KitDropzone', () => {

  @Component({
    selector: 'kit-dropzone-test',
    imports: [KitDropzone],
    template: `
      <label id="zone" kitDropzone (files)="taken.set($event)" (rejected)="refused.set($event)">
        <input class="kit-dropzone__input" type="file" [accept]="accept()" [multiple]="multiple()" [disabled]="disabled()">
        <span class="kit-dropzone__title">Drop here</span>
      </label>
    `
  })
  class TestCmp {
    readonly accept = signal('image/*');
    readonly multiple = signal(true);
    readonly disabled = signal(false);
    readonly taken = signal<File[] | null>(null);
    readonly refused = signal<File[] | null>(null);
  }

  const png = (name = 'a.png') => new File(['x'], name, { type: 'image/png' });
  const pdf = (name = 'a.pdf') => new File(['x'], name, { type: 'application/pdf' });

  function create() {
    const fixture = TestBed.createComponent(TestCmp);
    fixture.detectChanges();
    const zone: HTMLElement = fixture.nativeElement.querySelector('#zone');
    const input: HTMLInputElement = zone.querySelector('input')!;
    const changes: Event[] = [];
    input.addEventListener('change', event => changes.push(event));
    const drag = (type: string, files: File[] = [png()]) => {
      const transfer = new DataTransfer();
      files.forEach(file => transfer.items.add(file));
      const event = new DragEvent(type, { dataTransfer: transfer, bubbles: true, cancelable: true });
      zone.dispatchEvent(event);
      fixture.detectChanges();
      return event;
    };
    const names = (files: File[] | FileList | null) => Array.from(files ?? []).map(file => file.name);
    return { fixture, cmp: fixture.componentInstance, zone, input, changes, drag, names };
  }

  it('should be a kit-dropzone', () => {
    expect(create().zone.classList).toContain('kit-dropzone');
  });

  it('should mark the zone active while files are over it, and again off when they leave', () => {
    // Given
    const { zone, drag } = create();

    // When
    drag('dragenter');

    // Then
    expect(zone.classList).toContain('kit-dropzone--active');

    // When
    drag('dragleave');

    // Then
    expect(zone.classList).not.toContain('kit-dropzone--active');
  });

  it('should stay active while the pointer crosses the children of the zone', () => {
    // Given
    const { zone, drag } = create();
    drag('dragenter');
    drag('dragenter');

    // When
    drag('dragleave');

    // Then
    expect(zone.classList).toContain('kit-dropzone--active');
  });

  it('should allow the drop on dragover', () => {
    // When
    const event = create().drag('dragover');

    // Then
    expect(event.defaultPrevented).toBeTrue();
  });

  it('should ignore a drag that carries no files', () => {
    // Given
    const { zone, fixture } = create();

    // When
    const event = new DragEvent('dragenter', { dataTransfer: new DataTransfer(), bubbles: true, cancelable: true });
    zone.dispatchEvent(event);
    fixture.detectChanges();

    // Then
    expect(zone.classList).not.toContain('kit-dropzone--active');
    expect(event.defaultPrevented).toBeFalse();
  });

  it('should put the dropped files in the input, tell it as the picker would and emit them', () => {
    // Given
    const { cmp, input, changes, drag, names, zone } = create();
    drag('dragenter');

    // When
    const event = drag('drop', [png('a.png'), png('b.png')]);

    // Then
    expect(event.defaultPrevented).toBeTrue();
    expect(names(input.files)).toEqual(['a.png', 'b.png']);
    expect(changes.length).toBe(1);
    expect(names(cmp.taken())).toEqual(['a.png', 'b.png']);
    expect(cmp.refused()).toBeNull();
    expect(zone.classList).not.toContain('kit-dropzone--active');
  });

  it('should reject what the accept list does not allow, and leave it out of the input', () => {
    // Given
    const { cmp, input, drag, names } = create();

    // When
    drag('drop', [png('a.png'), pdf('b.pdf')]);

    // Then
    expect(names(input.files)).toEqual(['a.png']);
    expect(names(cmp.taken())).toEqual(['a.png']);
    expect(names(cmp.refused())).toEqual(['b.pdf']);
  });

  it('should leave the input alone when everything dropped is rejected', () => {
    // Given
    const { cmp, input, changes, drag, names } = create();
    drag('drop', [png('keep.png')]);
    changes.length = 0;

    // When
    drag('drop', [pdf()]);

    // Then
    expect(names(input.files)).toEqual(['keep.png']);
    expect(changes.length).toBe(0);
    expect(names(cmp.refused())).toEqual(['a.pdf']);
  });

  it('should take only the first file for an input that is not multiple, rejecting the rest', () => {
    // Given
    const { cmp, fixture, input, drag, names } = create();
    cmp.multiple.set(false);
    fixture.detectChanges();

    // When
    drag('drop', [png('a.png'), png('b.png')]);

    // Then
    expect(names(input.files)).toEqual(['a.png']);
    expect(names(cmp.refused())).toEqual(['b.png']);
  });

  it('should take no drop while the input is disabled', () => {
    // Given
    const { cmp, fixture, input, drag } = create();
    cmp.disabled.set(true);
    fixture.detectChanges();

    // When
    const event = drag('drop');

    // Then
    expect(event.defaultPrevented).toBeFalse();
    expect(input.files!.length).toBe(0);
    expect(cmp.taken()).toBeNull();
  });

  it('should emit the files of the picker, too', () => {
    // Given
    const { cmp, input, fixture, names } = create();
    const transfer = new DataTransfer();
    transfer.items.add(png('picked.png'));

    // When
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();

    // Then
    expect(names(cmp.taken())).toEqual(['picked.png']);
  });

  it('should drop files from the picker that the accept list does not allow', () => {
    // Given
    const { cmp, input, fixture, names } = create();
    const transfer = new DataTransfer();
    transfer.items.add(png('a.png'));
    transfer.items.add(pdf('b.pdf'));

    // When
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    fixture.detectChanges();

    // Then
    expect(names(input.files)).toEqual(['a.png']);
    expect(names(cmp.taken())).toEqual(['a.png']);
    expect(names(cmp.refused())).toEqual(['b.pdf']);
  });

});

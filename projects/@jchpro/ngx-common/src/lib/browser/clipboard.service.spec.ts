import { TestBed } from '@angular/core/testing';
import { WINDOW } from '../tokens/window';
import { ClipboardService } from './clipboard.service';

describe('ClipboardService', () => {

  function create(navigator: unknown): ClipboardService {
    TestBed.configureTestingModule({ providers: [{ provide: WINDOW, useValue: { navigator } }] });
    return TestBed.inject(ClipboardService);
  }

  it('should write the text to the clipboard and answer true', async () => {
    // Given
    const writeText = jasmine.createSpy('writeText').and.resolveTo();
    const service = create({ clipboard: { writeText } });

    // When
    const copied = await service.copy('some text');

    // Then
    expect(copied).toBeTrue();
    expect(writeText).toHaveBeenCalledOnceWith('some text');
  });

  it('should answer false when the browser refuses', async () => {
    // Given
    const service = create({ clipboard: { writeText: () => Promise.reject(new DOMException('denied', 'NotAllowedError')) } });

    // Then
    expect(await service.copy('text')).toBeFalse();
  });

  it('should answer false when the page has no clipboard (an insecure origin)', async () => {
    // Given
    const service = create({});

    // Then
    expect(await service.copy('text')).toBeFalse();
  });

});

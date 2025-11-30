import { validateFiles } from './validate-files';

describe('validateFiles', () => {

  const createFile = (name: string, type: string): File => {
    return new File([''], name, { type });
  };

  const jpgFile = createFile('vacation.jpg', 'image/jpeg');
  const pngFile = createFile('screenshot.png', 'image/png');
  const pdfFile = createFile('document.pdf', 'application/pdf');
  const txtFile = createFile('notes.txt', 'text/plain');
  const unknownTypeFile = createFile('data.csv', ''); // Czasem typ jest pusty

  describe('Empty accept string', () => {
    it('should return true if accept string is empty', () => {
      expect(validateFiles([jpgFile], '')).toBeTrue();
    });

    it('should return true if accept string is null/undefined (simulated by empty string check)', () => {
      expect(validateFiles([jpgFile], null as any)).toBeTrue();
      expect(validateFiles([jpgFile], undefined as any)).toBeTrue();
    });
  });

  describe('File Extensions', () => {
    it('should validate based on single extension', () => {
      expect(validateFiles([jpgFile], '.jpg')).toBeTrue();
      expect(validateFiles([pngFile], '.jpg')).toBeFalse();
    });

    it('should be case insensitive', () => {
      const upperCaseFile = createFile('IMAGE.JPG', 'image/jpeg');
      expect(validateFiles([upperCaseFile], '.jpg')).toBeTrue();
      expect(validateFiles([jpgFile], '.JPG')).toBeTrue();
    });

    it('should work even if file.type is missing but extension matches', () => {
      expect(validateFiles([unknownTypeFile], '.csv')).toBeTrue();
    });
  });

  describe('Exact MIME Types', () => {
    it('should validate based on exact mime type', () => {
      expect(validateFiles([pdfFile], 'application/pdf')).toBeTrue();
      expect(validateFiles([txtFile], 'application/pdf')).toBeFalse();
    });

    it('should handle multiple mime types (OR logic)', () => {
      const accept = 'application/pdf, text/plain';
      expect(validateFiles([pdfFile], accept)).toBeTrue();
      expect(validateFiles([txtFile], accept)).toBeTrue();
      expect(validateFiles([jpgFile], accept)).toBeFalse();
    });
  });

  describe('Wildcard MIME Types (e.g. image/*)', () => {
    it('should validate general type with wildcard', () => {
      expect(validateFiles([jpgFile], 'image/*')).toBeTrue();
      expect(validateFiles([pngFile], 'image/*')).toBeTrue();
    });

    it('should reject different main type', () => {
      expect(validateFiles([pdfFile], 'image/*')).toBeFalse();
    });
  });

  describe('Multiple Files (AND logic)', () => {
    it('should return true only if ALL files are valid', () => {
      const files = [jpgFile, pngFile];
      expect(validateFiles(files, 'image/*')).toBeTrue();
    });

    it('should return false if AT LEAST ONE file is invalid', () => {
      const files = [jpgFile, txtFile];
      expect(validateFiles(files, 'image/*')).toBeFalse();
    });

    it('should return true for empty file list (vacuously true)', () => {
      expect(validateFiles([], 'image/*')).toBeTrue();
    });
  });

  describe('Complex Scenarios & Edge Cases', () => {
    it('should handle mixed rules (extensions and mimes)', () => {
      const accept = 'image/*, .pdf';
      expect(validateFiles([jpgFile], accept)).toBeTrue();
      expect(validateFiles([pdfFile], accept)).toBeTrue();
      expect(validateFiles([txtFile], accept)).toBeFalse();
    });

    it('should ignore whitespace around commas in accept string', () => {
      const accept = ' .jpg ,  image/png ';
      expect(validateFiles([jpgFile], accept)).toBeTrue();
      expect(validateFiles([pngFile], accept)).toBeTrue();
    });

    it('should handle weird parsing cases like empty segments', () => {
      const accept = 'image/*,,.pdf';
      expect(validateFiles([jpgFile], accept)).toBeTrue();
    });
  });
});

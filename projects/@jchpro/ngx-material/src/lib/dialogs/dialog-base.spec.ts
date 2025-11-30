import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { timer } from 'rxjs';
import { DialogBase } from './dialog-base';

describe('DialogBase', () => {
  @Component({
    template: ''
  })
  class TestDialogComponent extends DialogBase<any, any, any> {
    beforeAsyncCalled = false;

    get loading() {
      return this.isLoading;
    }

    protected override beforeAsync() {
      this.beforeAsyncCalled = true;
    }

    runAsync(options?: { disableClose?: boolean }) {
      return timer(0).pipe(this.asyncWithLoadingState(options));
    }
  }

  let dialog: TestDialogComponent;
  let _disableClose = false;
  let disableCloseChanges: boolean[] = [];
  let mockDialogRef: {
    disableClose: boolean;
  }

  beforeEach(() => {
    _disableClose = false;
    disableCloseChanges = [];
    mockDialogRef = {
      get disableClose() { return _disableClose; },
      set disableClose(val: boolean) { _disableClose = val; disableCloseChanges.push(val); },
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { foo: 'bar' } },
        { provide: MatDialogRef, useValue: mockDialogRef }
      ],
      imports: [TestDialogComponent]
    });
    dialog = TestBed.createComponent(TestDialogComponent).componentInstance;
  });

  it('should call beforeAsync when observable completes', (done) => {
    expect(dialog.beforeAsyncCalled).toBe(false);

    dialog.runAsync().subscribe({
      next: () => {},
      complete: () => {
        expect(dialog.beforeAsyncCalled).toBe(true);
        done();
      }
    });
  });

  it('should set isLoading true during observable and false after', (done) => {
    const loadingStates: boolean[] = [];

    // Patch dialog['isLoading'].set to record state changes
    const originalSet = dialog['isLoading'].set.bind(dialog['isLoading']);
    spyOn(dialog['isLoading'], 'set').and.callFake((v: boolean) => {
      loadingStates.push(v);
      originalSet(v);
    });

    dialog.runAsync().subscribe({
      next: () => {},
      complete: () => {
        setTimeout(() => {
          expect(loadingStates[0]).toBe(true);
          expect(loadingStates[loadingStates.length - 1]).toBe(false);
          done();
        });
      }
    });

    expect(dialog['isLoading']()).toBe(true);
  });

  it('should restore dialogRef.disableClose after observable', (done) => {
    expect(mockDialogRef.disableClose).toBe(false);
    dialog.runAsync({ disableClose: true }).subscribe({
      complete: () => {
        setTimeout(() => {
          expect(disableCloseChanges.length).toBe(2);
          expect(disableCloseChanges[0]).toBe(true);
          expect(mockDialogRef.disableClose).toBe(false);
          done();
        });
      }
    });
    expect(mockDialogRef.disableClose).toBe(true);
  });

  it('should not change dialogRef.disableClose if option is false', (done) => {
    expect(mockDialogRef.disableClose).toBe(false);
    dialog.runAsync({ disableClose: false }).subscribe({
      complete: () => {
        setTimeout(() => {
          expect(disableCloseChanges.length).toBe(1);
          done();
        });
      }
    });
  });
});

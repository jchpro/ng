import { Subject } from 'rxjs';
import { ReactiveDirective } from './reactive.directive';

describe('ReactiveDirective', () => {

  it('should create an instance', () => {
    const directive = new ReactiveDirective();
    expect(directive).toBeTruthy();
  });

  it('should observe stream until destruction of the directive', () => {

    // Given
    class MyDir extends ReactiveDirective {
      private stream = new Subject<number>();
      private i: number = 0;
      emit() {
        this.stream.next(this.i++);
      }
      observe() {
        return this.stream.asObservable()
          .pipe(this.observeUntilDestroy());
      }
      public override ngOnDestroy() {
        super.ngOnDestroy();
      }
    }
    const dir = new MyDir();
    let lastEmitted: number = -1;
    dir.observe()
       .subscribe(val => lastEmitted = val);

    // When
    dir.emit();
    dir.emit();

    // Then
    expect(lastEmitted).toBe(1);

    // When
    dir.ngOnDestroy();
    dir.emit();
    dir.emit();

    // Then
    expect(lastEmitted).toBe(1);
  });

});

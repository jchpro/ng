import { booleanAttribute, ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';
import { formatKitLabel } from '../labels/kit-labels';
import { KIT_TABLE_LABELS } from './kit-table-labels';

/**
 * The button of a row that opens and closes its detail row: a chevron that turns when open,
 * `aria-expanded`, and an accessible name that includes the row ("Show details of Ada Lovelace").
 * It holds no state, you bind it to your `kitTableExpansion()`.
 *
 * ```html
 * <td class="kit-cell--expand">
 *   <kit-expand-toggle [row]="user.name" [expanded]="expansion.isExpanded(user)" (toggle)="expansion.toggle(user)" />
 * </td>
 * ```
 */
@Component({
  selector: 'kit-expand-toggle',
  imports: [LucideChevronRight],
  templateUrl: './kit-expand-toggle.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'kit-expand-toggle'
  }
})
export class KitExpandToggle {

  protected readonly labels = inject(KIT_TABLE_LABELS);

  /** The row's name, for the button's accessible name. */
  readonly row = input.required<string>();

  readonly expanded = input(false, { transform: booleanAttribute });

  /** The button was pressed: open the row if it is closed, close it if open. */
  readonly toggle = output<void>();

  protected readonly label = computed(() => {
    const { expand, collapse } = this.labels().expansion;
    return formatKitLabel(this.expanded() ? collapse : expand, { row: this.row() });
  });

}

import {ElementRef} from '@angular/core';

export const GROUPS_COUNT = 5;

/**
 * Interface describing a selection group (day, month, year, hour, or minute).
 * - `value` - Numeric value of the group.
 * - `start` - Start index of the selection.
 * - `end` - End index of the selection.
 * - `touched` - Indicates whether the group has been modified at least once after `setGroup` was called.
 * - `leadingZero` - Indicates whether the first typed digit was zero after `setGroup` was called.
 */
export interface SelectionGroup {
    value: number;
    start: number;
    end: number;
    touched: boolean;
    leadingZero: boolean;
}

export enum SelectionGroupType {
    DAY = 0,
    MONTH = 1,
    YEAR = 2,
    HOUR = 3,
    MINUTE = 4
}

export class SelectionGroupController {
    private dateInputRef: ElementRef<HTMLInputElement>;

    private selectedGroup: SelectionGroupType = SelectionGroupType.DAY;

    private groups: Record<SelectionGroupType, SelectionGroup> = {
        0: {value: 0, start: 0, end: 2, touched: false, leadingZero: false},
        1: {value: 0, start: 3, end: 5, touched: false, leadingZero: false},
        2: {value: 0, start: 6, end: 10, touched: false, leadingZero: false},
        3: {value: 0, start: 11, end: 13, touched: false, leadingZero: false},
        4: {value: 0, start: 14, end: 16, touched: false, leadingZero: false},
    };

    public setDateInputRef(ref: ElementRef<HTMLInputElement>) {
        this.dateInputRef = ref;
    }

    /* Setting group */
    public setGroupForCursor(cursorIndex: number): void {
        if (cursorIndex <= this.groups[SelectionGroupType.DAY].end) this.setGroup(SelectionGroupType.DAY);
        else if (cursorIndex <= this.groups[SelectionGroupType.MONTH].end) this.setGroup(SelectionGroupType.MONTH);
        else if (cursorIndex <= this.groups[SelectionGroupType.YEAR].end) this.setGroup(SelectionGroupType.YEAR);
        else if (cursorIndex <= this.groups[SelectionGroupType.HOUR].end) this.setGroup(SelectionGroupType.HOUR);
        else this.setGroup(SelectionGroupType.MINUTE);
    }

    public setPrevGroup(): void {
        const prevGroup = this.selectedGroup > 0 ? this.selectedGroup - 1 : 0;
        this.setGroup(prevGroup);
    }

    public setNextGroup(): void {
        const nextGroup = this.selectedGroup < GROUPS_COUNT - 1 ? this.selectedGroup + 1 : GROUPS_COUNT - 1;
        this.setGroup(nextGroup);
    }

    public setGroupOnFocus(): void {
        this.setGroup(this.selectedGroup);
    }

    private setGroup(i: SelectionGroupType): void {
        this.selectedGroup = i;
        this.groups[i].touched = false;
        this.groups[i].leadingZero = false;
        this.setSelection();
    }

    public setSelection(): void {
        this.dateInputRef.nativeElement.setSelectionRange(this.groups[this.selectedGroup].start, this.groups[this.selectedGroup].end);
    }
    //

    public clearGroup(): void {
        if (this.groups[this.selectedGroup].value === 0) {
            this.setPrevGroup();
        } else {
            this.groups[this.selectedGroup].value = 0;
        }
    }

    public insertDigit(digit: string) {
        this.insertDigitForGroup(digit);
        this.setSelection();
    }

    private insertDigitForGroup(digit: string) {
        if (!this.groups[this.selectedGroup].touched) {
            this.groups[this.selectedGroup].touched = true;
            this.groups[this.selectedGroup].value = 0;

            if (digit === '0') {
                this.groups[this.selectedGroup].leadingZero = true;
            }
        }

        if (this.checkGroupFull(this.selectedGroup, this.groups[this.selectedGroup].value * 10 + parseInt(digit))) {
            this.setNextGroup();
            this.insertDigitForGroup(digit);
            return;
        }

        this.groups[this.selectedGroup].value = this.groups[this.selectedGroup].value * 10 + parseInt(digit);

        if (this.checkGroupFull(this.selectedGroup, this.groups[this.selectedGroup].value * 10) || this.checkZeroTypedManually()) {
            this.setNextGroup();
        }
    }

    private checkGroupFull(groupIndex: number, newValue: number): boolean {
        const limits = [31, 12, 9999, 23, 59];
        return newValue > (limits[groupIndex] ?? 0);
    }

    private checkZeroTypedManually(): boolean {
        return this.groups[this.selectedGroup].leadingZero
            && this.groups[this.selectedGroup].value !== 0
            && this.selectedGroup !== SelectionGroupType.YEAR;
    }

    public getValue() {
        return this.addLeadingZeros(this.groups[SelectionGroupType.DAY].value, 2)
            + '.' + this.addLeadingZeros(this.groups[SelectionGroupType.MONTH].value, 2)
            + '.' + this.addLeadingZeros(this.groups[SelectionGroupType.YEAR].value, 4)
            + ' ' + this.addLeadingZeros(this.groups[SelectionGroupType.HOUR].value, 2)
            + ':' + this.addLeadingZeros(this.groups[SelectionGroupType.MINUTE].value, 2);
    }

    private addLeadingZeros(value: number, maskSize: number): string {
        return "0".repeat(maskSize - value.toString().length) + value.toString();
    }
}

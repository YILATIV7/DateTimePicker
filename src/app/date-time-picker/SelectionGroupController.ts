import {EventEmitter} from '@angular/core';

/**
 * Interface describing a selection group (day, month, year, hour, or minute).
 * - `value` - Numeric value of the group.
 * - `start` - Start index of the selection.
 * - `end` - End index of the selection.
 * - `touched` - Indicates whether the group has been modified at least once after `setGroup` was called.
 * - `leadingZero` - Indicates whether the first typed digit was zero after `setGroup` was called.
 */
export interface SelectionGroup extends SelectionRange {
    value: number;
    touched: boolean;
    leadingZero: boolean;
}

export interface SelectionRange {
    start: number;
    end: number;
}

export interface SelectionGroupOutputModel {
    fullValue: string,
    selectionStart: number,
    selectionEnd: number
}

export enum SelectionGroupType {
    DAY = 0,
    MONTH = 1,
    YEAR = 2,
    HOURS = 3,
    MINUTES = 4
}

export class SelectionGroupController {

    public valueChanges = new EventEmitter<SelectionGroupOutputModel>();
    private selectedGroup: SelectionGroupType = SelectionGroupType.DAY;
    private type: 'date' | 'date-time' = 'date-time';

    public setType(type: 'date-time' | 'date'): void {
        this.type = type;
    }

    public isTimeTouched(): boolean {
        return this.groups[SelectionGroupType.HOURS].touched || this.groups[SelectionGroupType.MINUTES].touched;
    }

    private groups: Record<SelectionGroupType, SelectionGroup> = {
        [SelectionGroupType.DAY]: {value: 0, start: 0, end: 2, touched: false, leadingZero: false},
        [SelectionGroupType.MONTH]: {value: 0, start: 3, end: 5, touched: false, leadingZero: false},
        [SelectionGroupType.YEAR]: {value: 0, start: 6, end: 10, touched: false, leadingZero: false},
        [SelectionGroupType.HOURS]: {value: 0, start: 11, end: 13, touched: false, leadingZero: false},
        [SelectionGroupType.MINUTES]: {value: 0, start: 14, end: 16, touched: false, leadingZero: false},
    };

    private emitValueChanges() {
        this.valueChanges.emit({
            fullValue: this.getStringValue(),
            selectionStart: this.groups[this.selectedGroup].start,
            selectionEnd: this.groups[this.selectedGroup].end,
        });
    }

    // <editor-fold desc="Setting groups">
    public setGroupForCursor(cursorIndex: number): void {
        if (cursorIndex <= this.groups[SelectionGroupType.DAY].end) this.setGroup(SelectionGroupType.DAY);
        else if (cursorIndex <= this.groups[SelectionGroupType.MONTH].end) this.setGroup(SelectionGroupType.MONTH);
        else if (cursorIndex <= this.groups[SelectionGroupType.YEAR].end) this.setGroup(SelectionGroupType.YEAR);
        else if (cursorIndex <= this.groups[SelectionGroupType.HOURS].end) this.setGroup(SelectionGroupType.HOURS);
        else this.setGroup(SelectionGroupType.MINUTES);
    }

    public setPrevGroup(): void {
        const prevGroup = this.selectedGroup > 0 ? this.selectedGroup - 1 : 0;
        this.setGroup(prevGroup);
    }

    public setNextGroup(): void {
        const groupsCount = this.type === 'date-time' ? 5 : 3;
        const nextGroup = this.selectedGroup < groupsCount - 1 ? this.selectedGroup + 1 : groupsCount - 1;
        this.setGroup(nextGroup);
    }

    public setGroup(i?: SelectionGroupType): void {
        if (i !== undefined) {
            this.selectedGroup = i;
        }

        this.groups[this.selectedGroup].touched = false;
        this.groups[this.selectedGroup].leadingZero = false;
        this.emitValueChanges();
    }

    public clearGroup(): void {
        if (this.groups[this.selectedGroup].value === 0) {
            this.setPrevGroup();
        } else {
            this.groups[this.selectedGroup].value = 0;
            this.groups[this.selectedGroup].touched = false;
            this.groups[this.selectedGroup].leadingZero = false;
            this.emitValueChanges();
        }
    }

    // </editor-fold>

    // <editor-fold desc="Inserting digits">
    public insertDigit(digit: string) {
        this.insertDigitForGroup(digit);
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

        this.emitValueChanges();
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

    // </editor-fold>

    // <editor-fold desc="Setting value">
    /**
     * Receives day, month and year from the Date object
     */
    public setDate(date: Date) {
        const values = [
            date.getDate(),
            date.getMonth() + 1,
            date.getFullYear()
        ];

        for (let i: SelectionGroupType = 0; i < 3; i++) {
            this.groups[i].value = values[i];
            this.groups[i].touched = false;
            this.groups[i].leadingZero = false;
        }

        this.emitValueChanges();
    }

    /**
     * Receives hours
     */
    public setHours(hours: number) {
        this.groups[SelectionGroupType.HOURS].value = hours;
        this.groups[SelectionGroupType.HOURS].touched = false;
        this.groups[SelectionGroupType.HOURS].leadingZero = false;
        this.emitValueChanges();
    }

    /**
     * Receives minutes
     */
    public setMinutes(minutes: number) {
        this.groups[SelectionGroupType.MINUTES].value = minutes;
        this.groups[SelectionGroupType.MINUTES].touched = false;
        this.groups[SelectionGroupType.MINUTES].leadingZero = false;
        this.emitValueChanges();
    }

    // </editor-fold>

    public getRawValue(): Record<string, number> {
        return {
            day: this.groups[SelectionGroupType.DAY].value,
            month: this.groups[SelectionGroupType.MONTH].value,
            year: this.groups[SelectionGroupType.YEAR].value,
            hours: this.groups[SelectionGroupType.HOURS].value,
            minutes: this.groups[SelectionGroupType.MINUTES].value,
        };
    }

    private getStringValue() {
        return this.addLeadingZeros(this.groups[SelectionGroupType.DAY].value, 2)
            + '.' + this.addLeadingZeros(this.groups[SelectionGroupType.MONTH].value, 2)
            + '.' + this.addLeadingZeros(this.groups[SelectionGroupType.YEAR].value, 4)
            + (this.type == 'date-time' ? (
                ' ' + this.addLeadingZeros(this.groups[SelectionGroupType.HOURS].value, 2)
                + ':' + this.addLeadingZeros(this.groups[SelectionGroupType.MINUTES].value, 2)
            ) : '');
    }

    private addLeadingZeros(value: number, maskSize: number): string {
        return "0".repeat(maskSize - value.toString().length) + value.toString();
    }
}

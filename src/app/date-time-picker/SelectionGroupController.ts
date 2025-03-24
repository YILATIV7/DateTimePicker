import {ElementRef} from '@angular/core';

export class SelectionGroupController {
    private dateInputRef: ElementRef<HTMLInputElement>;

    private selectedGroup: number = 0;

    private groups = [
        {value: 0, start: 0, end: 2, touched: false, leadingZero: false}, // day
        {value: 0, start: 3, end: 5, touched: false, leadingZero: false}, // month
        {value: 0, start: 6, end: 10, touched: false, leadingZero: false}, // year
        {value: 0, start: 11, end: 13, touched: false, leadingZero: false}, // hours
        {value: 0, start: 14, end: 16, touched: false, leadingZero: false}, // minutes
    ];

    public setDateInputRef(ref: ElementRef<HTMLInputElement>) {
        this.dateInputRef = ref;
    }

    /* Setting group */
    public setGroupForCursor(cursorIndex: number): void {
        if (cursorIndex <= this.groups[0].end) this.setGroup(0); // select day
        else if (cursorIndex <= this.groups[1].end) this.setGroup(1); // select month
        else if (cursorIndex <= this.groups[2].end) this.setGroup(2); // select year
        else if (cursorIndex <= this.groups[3].end) this.setGroup(3); // select hours
        else this.setGroup(4); // select minutes
    }

    public setPrevGroup(): void {
        const prevGroup = this.selectedGroup > 0 ? this.selectedGroup - 1 : 0;
        this.setGroup(prevGroup);
    }

    public setNextGroup(): void {
        const nextGroup = this.selectedGroup < this.groups.length - 1 ? this.selectedGroup + 1 : this.groups.length - 1;
        this.setGroup(nextGroup);
    }

    public setGroupOnFocus(): void {
        this.setGroup(this.selectedGroup);
    }

    private setGroup(i: number): void {
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
            && this.selectedGroup !== 3;
    }

    public getValue() {
        return this.normalize(this.groups[0].value, 2)
            + '.' + this.normalize(this.groups[1].value, 2)
            + '.' + this.normalize(this.groups[2].value, 4)
            + ' ' + this.normalize(this.groups[3].value, 2)
            + ':' + this.normalize(this.groups[4].value, 2);
    }

    private normalize(value: number, maskSize: number): string {
        return "0".repeat(maskSize - value.toString().length) + value.toString();
    }
}

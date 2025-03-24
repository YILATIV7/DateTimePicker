import {ElementRef} from '@angular/core';

export class SelectionGroupController {
    private dateInputRef: ElementRef<HTMLInputElement>;
    private selectedGroup: number;

    private groups = [
        {value: 0, start: 0, end: 2}, // day
        {value: 0, start: 3, end: 5}, // month
        {value: 0, start: 6, end: 10}, // year
        {value: 0, start: 11, end: 13}, // hours
        {value: 0, start: 14, end: 16}, // minutes
    ];

    public setDateInputRef(ref: ElementRef<HTMLInputElement>) {
        this.dateInputRef = ref;
    }

    /* Setting group */
    public setGroupForCursor(cursorIndex: number): void {
        if (cursorIndex <= this.groups[0].end) this.setSelection(0); // select day
        else if (cursorIndex <= this.groups[1].end) this.setSelection(1); // select month
        else if (cursorIndex <= this.groups[2].end) this.setSelection(2); // select year
        else if (cursorIndex <= this.groups[3].end) this.setSelection(3); // select hours
        else this.setSelection(4); // select minutes
    }

    public setPrevGroup(): void {
        const prevGroup = this.selectedGroup > 0 ? this.selectedGroup - 1 : 0;
        this.setSelection(prevGroup);
    }

    public setNextGroup(): void {
        const nextGroup = this.selectedGroup < this.groups.length - 1 ? this.selectedGroup + 1 : this.groups.length - 1;
        this.setSelection(nextGroup);
    }

    public setFirstGroup(): void {
        this.setSelection(0);
    }

    public setGroup(): void {
        this.setSelection(this.selectedGroup);
    }

    private setSelection(i: number): void {
        this.dateInputRef.nativeElement.setSelectionRange(this.groups[i].start, this.groups[i].end, "forward");
        this.selectedGroup = i;
    }
    //

    public clearGroup(): void {
        this.groups[this.selectedGroup].value = 0;
    }

    public insertDigit(digit: string) {
        if (this.selectedGroup === 0) {
            this.insertDigitForGroup(digit, 0, 2);
        }
        else if (this.selectedGroup === 1) {
            this.insertDigitForGroup(digit, 1, 2);
        }
        else if (this.selectedGroup === 2) {
            this.insertDigitForGroup(digit, 2, 4);
        }
        else if (this.selectedGroup === 3) {
            this.insertDigitForGroup(digit, 3, 2);
        }
        else if (this.selectedGroup === 4) {
            this.insertDigitForGroup(digit, 4, 2);
        }

        this.setSelection(this.selectedGroup);
    }

    private insertDigitForGroup(digit: string, groupIndex: number, groupSize: number) {
        if (this.groups[groupIndex].value.toString().length === groupSize) {
            this.groups[groupIndex].value = 0;
        }

        this.groups[groupIndex].value = this.groups[groupIndex].value * 10 + parseInt(digit);

        if (this.groups[groupIndex].value.toString().length === groupSize && groupIndex < this.groups.length - 1) {
            this.selectedGroup += 1;
        }

        console.log(digit, groupIndex, groupSize);
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

import {ElementRef} from '@angular/core';

export class SelectionGroupController {
    private dateInputRef: ElementRef<HTMLInputElement>;

    private selectedGroup: number;

    private groups = [
        {value: 0, start: 0, end: 2, touched: false}, // day
        {value: 0, start: 3, end: 5, touched: false}, // month
        {value: 0, start: 6, end: 10, touched: false}, // year
        {value: 0, start: 11, end: 13, touched: false}, // hours
        {value: 0, start: 14, end: 16, touched: false}, // minutes
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

    public setFirstGroup(): void {
        this.setGroup(0);
    }

    private setGroup(i: number): void {
        this.selectedGroup = i;
        this.groups[i].touched = false;
        this.setSelection();
    }

    public setSelection(): void {
        this.dateInputRef.nativeElement.setSelectionRange(this.groups[this.selectedGroup].start, this.groups[this.selectedGroup].end);
    }
    //

    public clearGroup(): void {
        this.groups[this.selectedGroup].value = 0;
    }

    public insertDigit(digit: string) {
        this.insertDigitForGroup(digit);
        this.setSelection();
    }

    private insertDigitForGroup(digit: string) {
        console.log("State: ", this.groups);

        if (!this.groups[this.selectedGroup].touched) {
            this.groups[this.selectedGroup].touched = true;
            this.groups[this.selectedGroup].value = 0;
        }

        if (this.checkGroupFull(this.selectedGroup, this.groups[this.selectedGroup].value * 10 + parseInt(digit))) {
            this.setNextGroup();
        }

        console.log("value: ", this.groups[this.selectedGroup].value);
        this.groups[this.selectedGroup].value = this.groups[this.selectedGroup].value * 10 + parseInt(digit);
        console.log("value: ", this.groups[this.selectedGroup].value);

        if (this.checkGroupFull(this.selectedGroup, this.groups[this.selectedGroup].value * 10)) {
            this.setNextGroup();
        }
    }

    private checkGroupFull(groupIndex: number, newValue: number): boolean {
        switch (groupIndex) {
            case 0: {
                return newValue > 31
            }
            case 1: {
                return newValue > 12
            }
            case 2: {
                return newValue > 9999
            }
            case 3: {
                return newValue > 23
            }
            case 4: {
                return newValue > 59
            }
            default: {
                return true;
            }
        }
    }

    public getValue() {
        return this.normalize(this.groups[0].value, 2)
            + '.' + this.normalize(this.groups[1].value, 2)
            + '.' + this.normalize(this.groups[2].value, 4)
            + ' ' + this.normalize(this.groups[3].value, 2)
            + ':' + this.normalize(this.groups[4].value, 2);
    }

    private normalize(value: number, maskSize: number): string {
        if (maskSize - value.toString().length < 0) {
            console.log("maskSize: ", maskSize);
            console.log("value.toString().length: ", value.toString().length);
            console.log("value.toString(): ", value.toString());
        }
        return "0".repeat(maskSize - value.toString().length) + value.toString();
    }
}

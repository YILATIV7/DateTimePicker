import {ElementRef} from '@angular/core';


export class SelectionGroupController {
    private groupNumber: number;
    private dateInputRef: ElementRef<HTMLInputElement>;

    private groupValues = {
        day: 0,
        month: 0,
        year: 0,
        hour: 0,
        minute: 0,
    };

    public setDateInputRef(ref: ElementRef<HTMLInputElement>) {
        this.dateInputRef = ref;
    }

    /* Setting group */
    public setGroupForCursor(cursorIndex: number): void {
        if (cursorIndex < 3) this.setSelection(0); // select day
        else if (cursorIndex < 6) this.setSelection(1); // select month
        else if (cursorIndex < 11) this.setSelection(2); // select year
        else if (cursorIndex < 14) this.setSelection(3); // select hours
        else this.setSelection(4); // select minutes
    }

    public setPrevGroup(): void {
        this.setSelection(this.groupNumber <= 0 ? this.groupNumber : this.groupNumber - 1);
    }

    public setNextGroup(): void {
        this.setSelection(this.groupNumber >= 4 ? this.groupNumber : this.groupNumber + 1);
    }

    public setFirstGroup(): void {
        this.setSelection(0);
    }

    public invalidateSelection(): void {
        this.setSelection(this.groupNumber);
    }

    private setSelection(i: number): void {
        this.dateInputRef.nativeElement.setSelectionRange(groups[i].start, groups[i].end, "forward");
        this.groupNumber = i;
    }
    //

    public clearGroup(): void {
        switch (this.groupNumber) {
            case 0:
                this.dateInputRef.nativeElement.value = "00" + this.dateInputRef.nativeElement.value.substring(2);
                break;
            case 1:
                this.dateInputRef.nativeElement.value = this.dateInputRef.nativeElement.value.substring(0, 2) + "00" + this.dateInputRef.nativeElement.value.substring(4);
                break;
            case 2:
                this.dateInputRef.nativeElement.value = this.dateInputRef.nativeElement.value.substring(0, 4) + "0000" + this.dateInputRef.nativeElement.value.substring(8);
                break;
            case 3:
                this.dateInputRef.nativeElement.value = this.dateInputRef.nativeElement.value.substring(0, 8) + "00" + this.dateInputRef.nativeElement.value.substring(10);
                break;
            default:
                this.dateInputRef.nativeElement.value = this.dateInputRef.nativeElement.value.substring(0, 10) + "00";
                break;
        }
    }

    public insertDigit(digit: string) {
        this.setSelection(this.groupNumber);

        console.log(`InsertDigit: digit ${digit}, groupNumber: ${this.groupNumber}`);

        if (this.groupNumber === 0) {
            if (this.groupValues.day.toString().length === 2) {
                this.groupValues.day = 0;
            }
            this.groupValues.day = this.groupValues.day * 10 + parseInt(digit);

            if (this.groupValues.day.toString().length === 2) {
                this.setSelection(this.groupNumber + 1);
            }
        }

        else if (this.groupNumber === 1) {
            if (this.groupValues.month.toString().length === 2) {
                this.groupValues.month = 0;
            }
            this.groupValues.month = this.groupValues.month * 10 + parseInt(digit);

            if (this.groupValues.month.toString().length === 2) {
                this.setSelection(this.groupNumber + 1);
            }
        }

        else if (this.groupNumber === 2) {
            if (this.groupValues.year.toString().length === 4) {
                this.groupValues.year = 0;
            }
            this.groupValues.year = this.groupValues.year * 10 + parseInt(digit);

            if (this.groupValues.year.toString().length === 4) {
                this.setSelection(this.groupNumber + 1);
            }
        }
    }

    public getValue() {
        return this.normalize(this.groupValues.day, 2)
            + '.' + this.normalize(this.groupValues.month, 2)
            + '.' + this.normalize(this.groupValues.year, 4)
            + ' ' + this.normalize(this.groupValues.hour, 2)
            + ':' + this.normalize(this.groupValues.minute, 2);
    }

    private normalize(value: number, maskSize: number): string {
        return "0".repeat(maskSize - value.toString().length) + value.toString();
    }
}

const groups = [
    {start: 0, end: 2},
    {start: 3, end: 5},
    {start: 6, end: 10},
    {start: 11, end: 13},
    {start: 14, end: 16},
];

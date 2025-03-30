export class DateTimePickerController {
    private separatorPositions: number[];
    private value: string = '';

    constructor(
        private element: HTMLInputElement,
        private type: 'date-time' | 'date' | 'time'
    ) {
        if (this.type === 'date-time') {
            this.separatorPositions = [2, 5, 10, 13];
            this.value = '  .  .       :  ';

        } else if (this.type === 'date') {
            this.separatorPositions = [2, 5];
            this.value = '  .  .    ';

        } else {
            this.separatorPositions = [2];
            this.value = '  :  ';
        }

        this.element.value = this.value;
    }

    public onBeforeInput(event: InputEvent) {
        event.preventDefault();

        let cursorStart = this.element.selectionStart!;
        let cursorEnd = this.element.selectionEnd!;
        let value = this.element.value.split('');

        if (event.inputType === "deleteContentBackward") {
            if (cursorStart !== cursorEnd) {
                value = this.clearPositions(value, cursorStart, cursorEnd);
            } else {
                if (cursorStart > 0) {
                    let pos = this.separatorPositions.includes(cursorStart - 1) ? cursorStart - 2 : cursorStart - 1;
                    value[pos] = ' ';
                    cursorStart = pos;
                }
            }

        } else if (event.inputType === "deleteContentForward") {
            if (cursorStart !== cursorEnd) {
                value = this.clearPositions(value, cursorStart, cursorEnd);
            } else {
                if (cursorStart < value.length && !this.separatorPositions.includes(cursorStart)) {
                    value[cursorStart] = ' ';
                }
            }

        } else if (event.inputType === "insertText") {
            if (cursorStart !== cursorEnd) value = this.clearPositions(value, cursorStart, cursorEnd);

            let inputData = event.data?.replace(/\D/g, "");
            if (!inputData || cursorStart === this.value.length) return;

            if (this.separatorPositions.includes(cursorStart)) cursorStart += 1;
            const result = this.applyAutoComplete(value, cursorStart, inputData[0]);

            if (result.cursorPosition === cursorStart) {
                value[cursorStart] = inputData[0];
                cursorStart += 1;
                if (this.separatorPositions.includes(cursorStart)) cursorStart += 1;
            } else {
                value = result.value;
                cursorStart = result.cursorPosition;
            }

        } else if (event.inputType === "insertFromPaste") {
            const inputData = event.data?.replace(/\D/g, "");
            if (!inputData) return;

            let index = cursorStart;
            let resultCursorPosition = cursorStart;
            console.log("Cursor start: ", cursorStart);

            for (let i = 0; i < inputData.length; i++) {
                if (this.separatorPositions.includes(index)) index += 1;
                if (index >= value.length) break;
                if (cursorEnd - cursorStart > 0 && index >= cursorEnd) break;
                value[index] = inputData[i];
                index += 1;
                resultCursorPosition = index;
            }

            cursorStart = cursorStart === cursorEnd ? resultCursorPosition : cursorEnd;

        } else if (event.inputType === 'deleteByCut') {
            for (let i = cursorStart; i < cursorEnd; i++) {
                if (this.separatorPositions.includes(i)) continue;
                value[i] = ' ';
            }
        }

        this.value = value.join('');
        this.element.value = this.value;
        this.element.setSelectionRange(cursorStart, cursorStart);
    }

    private clearPositions(value: string[], start: number, end: number): string[] {
        value = [...value];
        for (let i = start; i < end; i++) {
            if (this.separatorPositions.includes(i)) continue;
            value[i] = ' ';
        }
        return value;
    }

    private applyAutoComplete(value: string[], cursorPosition: number, char: string) {
        const digit = parseInt(char);
        value = [...value];

        if (this.type.includes('date')) {
            if ((cursorPosition === 0 && digit > 3) || (cursorPosition === 3 && digit > 1)) {
                value[cursorPosition] = '0';
                value[cursorPosition + 1] = digit + '';
                cursorPosition += 3;
            } else if (cursorPosition === 1 && value[0] === '3' && digit > 1) {
                value[0] = '0';
                value[1] = '3';
                value[3] = '0';
                value[4] = digit + '';
                cursorPosition = 6;
            } else if (cursorPosition === 4 && value[3] === '1' && digit > 2) {
                value[4] = '2';
                cursorPosition = 6;
            }
        }

        if (this.type.includes('time')) {
            let timePosition = this.type === 'date-time' ? 11 : 0;

            if (cursorPosition === timePosition && digit > 2) {
                value[timePosition] = '0';
                value[timePosition + 1] = digit + '';
                cursorPosition += 3;
            } else if (cursorPosition === timePosition + 1 && value[timePosition] === '2' && digit > 5) {
                value[timePosition] = '0';
                value[timePosition + 1] = '2';
                value[timePosition + 3] = '0';
                value[timePosition + 4] = digit + '';
                cursorPosition = timePosition + 5;
            } else if (cursorPosition === timePosition + 1 && value[timePosition] === '2' && digit > 3) {
                value[timePosition] = '0';
                value[timePosition + 1] = '2';
                value[timePosition + 3] = digit + '';
                cursorPosition = timePosition + 4;
            } else if (cursorPosition === timePosition + 3 && digit > 5) {
                value[timePosition + 3] = '0';
                value[timePosition + 4] = digit + '';
                cursorPosition = timePosition + 5;
            }
        }

        return {value, cursorPosition};
    }
}

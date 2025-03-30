
export class DateTimePickerController {

    private numberPositions: number[];
    private separatorPositions: number[];
    private value: string = '';

    constructor(
        private element: HTMLInputElement,
        private type: 'date-time' | 'date' | 'time'
    ) {
        if (this.type === 'date-time') {
            this.numberPositions = [0, 1, 3, 4, 6, 7, 8, 9, 11, 12, 14, 15];
            this.separatorPositions = [2, 5, 10, 13];
            this.value = '  .  .       :  ';

        } else if (this.type === 'date') {
            this.numberPositions = [0, 1, 3, 4, 6, 7, 8, 9];
            this.separatorPositions = [2, 5];
            this.value = '  .  .    ';

        } else {
            this.numberPositions = [0, 1, 3, 4];
            this.separatorPositions = [2];
            this.value = '  :  ';
        }

        this.element.value = this.value;
    }

    public onFocus() {

    }

    public onBlur() {

    }

    public onKeyDown(event: KeyboardEvent) {

    }

    public onBeforeInput(event: InputEvent) {
        event.preventDefault();

        let cursorPosition = this.element.selectionStart!;
        let value = this.element.value.split('');

        console.log(event.inputType);

        if (event.inputType === "deleteContentBackward") {
            if (cursorPosition > 0) {
                let pos = this.separatorPositions.includes(cursorPosition - 1) ? cursorPosition - 2 : cursorPosition - 1;
                value[pos] = ' ';
                cursorPosition = pos;
            }
        }

        else if (event.inputType === "deleteContentForward") {
            if (cursorPosition < value.length && !this.separatorPositions.includes(cursorPosition)) {
                value[cursorPosition] = ' ';
            }
        }

        else if (event.inputType === "insertText") {
            let inputData = event.data?.replace(/\D/g, "");
            if (!inputData || cursorPosition === this.value.length) return;

            /* Base logic */
            // let pos = this.separatorPositions.includes(cursorPosition) ? cursorPosition + 1 : cursorPosition;
            // value[pos] = inputData[0];
            // cursorPosition = pos + 1;

            /* Date logic */
            if (this.separatorPositions.includes(cursorPosition)) cursorPosition += 1;

            const digit = parseInt(inputData[0])

            if (this.type.includes('date')) {

                if ((cursorPosition === 0 && digit > 3) || (cursorPosition === 3 && digit > 1)) {
                    value[cursorPosition] = '0';
                    value[cursorPosition + 1] = digit+'';
                    cursorPosition += 3;
                }
                else if (cursorPosition === 1 && value[0] === '3' && digit > 1) {
                    value[0] = '0';
                    value[1] = '3';
                    value[3] = '0';
                    value[4] = digit+'';
                    cursorPosition = 6;
                }
                else if (cursorPosition === 4 && value[3] === '1' && digit > 2) {
                    value[4] = '2';
                    cursorPosition = 6;
                }
                else {
                    value[cursorPosition] = digit+'';
                    cursorPosition += 1;
                    if (this.separatorPositions.includes(cursorPosition)) cursorPosition += 1;
                }
            }

            /* Hours and minutes logic */
            if (this.type.includes('time')) {
                let timePosition = this.type === 'date-time' ? 11 : 0;

            }
        }

        else if (event.inputType === "insertFromPaste") {
            // TODO:
        }

        else if (event.inputType === 'deleteByCut') {
            // TODO:
        }

        this.value = value.join('');
        this.element.value = this.value;
        this.element.setSelectionRange(cursorPosition, cursorPosition);
    }

    public onInput(event: Event) {
        console.log("onInput")
    }

    public onClick(event: MouseEvent) {

    }
}


export class DateTimePickerController {

    //private template = "__.__.____ __:__";
    private numberPositions: number[];
    private separatorPositions: number[];
    private value: string = '';

    constructor(
        private element: HTMLInputElement,
        private mask: string
    ) {
        this.parseMask();
        this.element.value = this.value;
        console.log(this.value);
    }

    private parseMask(): void {
        let numberPositions = [];
        let separatorPositions = [];

        for (let i = 0; i < this.mask.length; i++) {
            if (/^[MDYHms]$/.test(this.mask[i])) {
                numberPositions.push(i);
                this.value += ' ';
            } else {
                separatorPositions.push(i);
                this.value += this.mask[i];
            }
        }

        this.numberPositions = numberPositions;
        this.separatorPositions = separatorPositions;
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

            let pos = this.separatorPositions.includes(cursorPosition) ? cursorPosition + 1 : cursorPosition;
            value[pos] = inputData[0];
            cursorPosition = pos + 1;


        }

        else if (event.inputType === "insertFromPaste") {
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

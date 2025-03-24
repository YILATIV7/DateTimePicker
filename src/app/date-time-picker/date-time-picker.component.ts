import {AfterViewInit, Component, ElementRef, EventEmitter, forwardRef, HostBinding, Input, model, Output, ViewChild} from '@angular/core';
import {NgxDaterangepickerMd} from 'ngx-daterangepicker-material';
import {AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors} from '@angular/forms';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatCalendar} from '@angular/material/datepicker';
import {SelectionGroupController} from './SelectionGroupController';
import {NgIf, NgStyle} from '@angular/common';
import {CdkConnectedOverlay, CdkOverlayOrigin} from '@angular/cdk/overlay';
import {NgSelectComponent} from '@ng-select/ng-select';

@Component({
    selector: 'dah-date-time-picker',
    imports: [
        NgxDaterangepickerMd,
        MatCalendar,
        NgStyle,
        NgIf,
        CdkOverlayOrigin,
        CdkConnectedOverlay,
        NgSelectComponent,
    ],
    standalone: true,
    providers: [
        {
            provide: NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => DateTimePickerComponent),
            multi: true
        }, {
            provide: NG_VALIDATORS,
            useExisting: DateTimePickerComponent,
            multi: true
        },
        provideNativeDateAdapter()
    ],
    templateUrl: './date-time-picker.component.html',
    styleUrl: './date-time-picker.component.scss'
})

export class DateTimePickerComponent implements ControlValueAccessor, AfterViewInit {
    /** UI and translation */
    @Input() label: string | undefined;
    @Input() placeholder: string | undefined;
    @Input() labelMinWidth: number;
    @Input() fieldControlsWidth: number;
    @Input() iconClassName: string = 'icon-calendar';

    /** Control setup */
    @Input() type: 'date-time' | 'date' = 'date-time';
    @Input() showMaskTyped: boolean = true;
    @Input() keepCharacterPositions: boolean = true;
    @Input() minDate: string | undefined;
    @Input() maxDate: string | undefined;

    @HostBinding('attr.readonly') @Input() readonly: boolean;
    @HostBinding('attr.readonly') @Input() required: boolean;
    @HostBinding('attr.disabled') @Input() disabled: boolean;
    @HostBinding('attr.focused') focused: boolean;
    @HostBinding('attr.v4') _v4!: string;

    @Output() selected: EventEmitter<void> = new EventEmitter<void>();

    @ViewChild('dateInput') dateInputRef: ElementRef<HTMLInputElement>;

    public isOpen: boolean;
    public mask: string;

    public selectedDate = model<Date | null>(null);

    private selectionGroupController = new SelectionGroupController();

    constructor() {
        if (this.type == 'date-time') {
            this.mask = 'd0.M0.0000 Hh:m0';
        }
    }

    ngAfterViewInit() {
        this.selectionGroupController.setDateInputRef(this.dateInputRef);
        this.dateInputRef.nativeElement.value = this.selectionGroupController.getValue();
    }

    public _value: string | null;

    get value(): string | null {
        return this._value;
    }

    set value(value: string | null) {
        this._value = value;

        if (this.onChange) {
            this.onChange(this._value);
        }
    }

    onTouched: any = () => {
        // do nothing
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onChange = (_value: string | null) => {
        // do nothing
    };

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-function
    timeSelected(event: any, type: 'hour' | 'minute'): void {

    }

    writeValue(obj: any): void {
        this.value = obj;
    }

    validate(control: AbstractControl): ValidationErrors | null {
        if (!control.value && this.required) {
            return {
                required: true
            };
        }

        return null;
    }

    public onKeyDown(event: KeyboardEvent): void {
        event.preventDefault();

        if (/^[0-9]$/i.test(event.key)) {
            this.selectionGroupController.insertDigit(event.key);
        }
        else if (event.key === 'Delete' || event.key === 'Backspace') {
            this.selectionGroupController.clearGroup();
        }
        else if (event.key === 'ArrowLeft') {
            this.selectionGroupController.setPrevGroup();
        }
        else if (event.key === 'ArrowRight') {
            this.selectionGroupController.setNextGroup();
        }

        this.dateInputRef.nativeElement.value = this.selectionGroupController.getValue();
        this.selectionGroupController.setSelection();
    }

    public onClick(): void {
        const cursorIndex = this.dateInputRef.nativeElement.selectionEnd as number;
        this.selectionGroupController.setGroupForCursor(cursorIndex);
    }

    public onFocus(): void {
        this.selectionGroupController.setGroupOnFocus();
    }

    public onBlur(): void {

    }
}

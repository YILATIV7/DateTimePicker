import {AfterViewInit, Component, ElementRef, EventEmitter, forwardRef, HostBinding, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {NgxDaterangepickerMd} from 'ngx-daterangepicker-material';
import {AbstractControl, ControlValueAccessor, FormsModule, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors} from '@angular/forms';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatCalendar} from '@angular/material/datepicker';
import {Subject} from 'rxjs';
import {NgIf, NgStyle} from '@angular/common';
import {CdkConnectedOverlay, CdkOverlayOrigin} from '@angular/cdk/overlay';
import {DateTimePickerController} from './date-time-picker.controller';

@Component({
    selector: 'dah-date-time-picker',
    imports: [
        NgxDaterangepickerMd,
        FormsModule,
        CdkConnectedOverlay,
        CdkOverlayOrigin,
        NgStyle,
        NgIf,
        CdkConnectedOverlay
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

export class DateTimePickerComponent implements ControlValueAccessor, OnInit, OnDestroy, AfterViewInit {

    /** UI and translation */
    @Input() label: string | undefined;
    @Input() placeholder: string | undefined;
    @Input() labelMinWidth: number;
    @Input() fieldControlsWidth: number;
    @Input() iconClassName: string = 'icon-calendar';

    /** Control setup */
    @Input() type: 'date-time' | 'date' | 'time' = 'date-time';
    @Input() minDate: string | undefined = '1900-01-01';
    @Input() maxDate: string | undefined = '2100-12-31';

    /**
     * Defines the context for input usage and autocompletion behavior for time.
     * - `undefined`: Uses the current time (hh:mm:ss).
     * - `from`: Starts from 00:00:00.
     * - `to`: Ends at 23:59:59.
     */
    @Input() startTime: 'from' | 'to' | undefined;

    @HostBinding('attr.readonly') @Input() readonly: boolean;
    @HostBinding('attr.readonly') @Input() required: boolean;
    @HostBinding('attr.disabled') @Input() disabled: boolean;
    @HostBinding('attr.focused') focused: boolean;
    @HostBinding('attr.v4') _v4!: string;

    @Output() selected: EventEmitter<void> = new EventEmitter<void>();

    @ViewChild('dateInput') dateInputRef: ElementRef<HTMLInputElement> | undefined;
    @ViewChild('matCalendar') matCalendar: MatCalendar<Date | null>;

    public isOpen: boolean;
    public hoursArr: number[];
    public minutesArr: number[];
    public inputValue: string;
    private destroyed$ = new Subject<void>();
    private controller: DateTimePickerController;

    constructor() {
        this.hoursArr = Array.from(Array(24).keys());
        this.minutesArr = Array.from(Array(60).keys());
    }

    ngOnInit() {

    }

    ngAfterViewInit() {
        switch (this.type) {
            case 'date-time':
                this.controller = new DateTimePickerController(this.dateInputRef!.nativeElement, 'date-time');
                break;
            case 'date':
                this.controller = new DateTimePickerController(this.dateInputRef!.nativeElement, 'date');
                break;
            case 'time':
                this.controller = new DateTimePickerController(this.dateInputRef!.nativeElement, 'time');
                break;
        }
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    onTouched: () => void;
    onChange: (value: string | null) => void;

    registerOnChange(fn: any): void {
        this.onChange = fn;
    }

    registerOnTouched(fn: any): void {
        this.onTouched = fn;
    }

    writeValue(obj: string): void {

    }

    validate(control: AbstractControl): ValidationErrors | null {
        if (!control.value && this.required) {
            return {
                required: true
            };
        }

        return null;
    }

    onFocus() {
        this.controller.onFocus();
    }

    onBlur() {
        this.controller.onBlur();
    }

    onKeyDown(event: KeyboardEvent) {
        this.controller.onKeyDown(event);
    }

    onBeforeInput(event: InputEvent) {
        this.controller.onBeforeInput(event);
    }

    onClick(event: MouseEvent) {
        this.controller.onClick(event);
    }

    onInput(event: Event) {
        this.controller.onInput(event);
    }
}

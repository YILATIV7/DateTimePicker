import {Component, ElementRef, EventEmitter, forwardRef, HostBinding, Input, OnDestroy, OnInit, Output, ViewChild} from '@angular/core';
import {NgxDaterangepickerMd} from 'ngx-daterangepicker-material';
import {AbstractControl, ControlValueAccessor, FormsModule, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors} from '@angular/forms';
import {provideNativeDateAdapter} from '@angular/material/core';
import {MatCalendar} from '@angular/material/datepicker';
import {SelectionGroupController, SelectionGroupOutputModel} from './SelectionGroupController';
import dayjs from 'dayjs';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';
import {NgOptionComponent, NgSelectComponent} from '@ng-select/ng-select';
import {NgForOf, NgIf, NgStyle} from '@angular/common';
import {CdkConnectedOverlay, CdkOverlayOrigin} from '@angular/cdk/overlay';

@Component({
    selector: 'dah-date-time-picker',
    imports: [
        NgxDaterangepickerMd,
        MatCalendar,
        FormsModule,
        NgSelectComponent,
        NgOptionComponent,
        NgForOf,
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

export class DateTimePickerComponent implements ControlValueAccessor, OnInit, OnDestroy {

    /** UI and translation */
    @Input() label: string | undefined;
    @Input() placeholder: string | undefined;
    @Input() labelMinWidth: number;
    @Input() fieldControlsWidth: number;
    @Input() iconClassName: string = 'icon-calendar';

    /** Control setup */
    @Input() type: 'date-time' | 'date' = 'date-time';
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
    private format: string;
    private selectionGroupController = new SelectionGroupController();
    private destroyed$ = new Subject<void>();

    constructor() {
        this.hoursArr = Array.from(Array(24).keys());
        this.minutesArr = Array.from(Array(60).keys());
    }

    ngOnInit() {
        this.selectionGroupController.setType(this.type);
        this.format = this.type === 'date-time' ? 'YYYY-MM-DD\THH:mm' : (this.type == 'date' ? 'YYYY-MM-DD' : 'HH:mm');

        this.selectionGroupController.valueChanges.pipe(
            takeUntil(this.destroyed$)
        ).subscribe((value: SelectionGroupOutputModel) => {
            this.inputValue = value.fullValue;

            setTimeout(() => {
                if (this.dateInputRef?.nativeElement) {
                    this.dateInputRef?.nativeElement.setSelectionRange(value.selectionStart, value.selectionEnd);
                }
            })
        });
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
    }

    private _selectedDate: Date | null;
    get selectedDate(): Date | null {
        return this._selectedDate;
    }

    set selectedDate(value: Date | null) {
        if (this._selectedDate?.getTime() !== value?.getTime()) {
            this._selectedDate = value;
            console.log(this.onChange);

            if (this.onChange) {
                this.onChange(dayjs(this._selectedDate).format(this.format));
                console.log("On change: ", dayjs(this._selectedDate).format(this.format));
            }
        }
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
        if (dayjs(obj, this.format).isValid()) {
            this.selectedDate = dayjs(obj, this.format).toDate();
            this.selectionGroupController.setDate(this.selectedDate);
            this.selectionGroupController.setHours(this.selectedDate.getHours());
            this.selectionGroupController.setMinutes(this.selectedDate.getMinutes());

            console.log("Write value: ", this.selectedDate);
        }
    }

    validate(control: AbstractControl): ValidationErrors | null {
        if (!control.value && this.required) {
            return {
                required: true
            };
        }

        return null;
    }

    timeSelected(event: number, type: 'hour' | 'minute'): void {
        if (this.selectedDate) {
            if (type == 'hour') {
                this.selectedDate = dayjs(this.selectedDate).hour(event).toDate();
                this.selectionGroupController.setHours(event);
            } else {
                this.selectedDate = dayjs(this.selectedDate).minute(event).toDate();
                this.selectionGroupController.setMinutes(event);
                this.isOpen = false;
            }
        }
    }

    public selectedDateChanged(date: Date | null | undefined): void {
        if (date) {
            if (this.selectedDate) {
                this.selectedDate = dayjs(date)
                    .hour(this.selectedDate.getHours())
                    .minute(this.selectedDate.getMinutes())
                    .toDate();
            } else {
                this.selectedDate = dayjs(date).toDate();
            }

            this.selectionGroupController.setDate(this.selectedDate);
            this.matCalendar.activeDate = this.selectedDate;
        }
        this.isOpen = false;
    }

    public onKeyDown(event: KeyboardEvent): void {
        event.preventDefault();

        if (/^[0-9]$/i.test(event.key)) {
            this.selectionGroupController.insertDigit(event.key);
        } else if (event.key === 'Delete' || event.key === 'Backspace') {
            this.selectionGroupController.clearGroup();
        } else if (event.key === 'ArrowLeft') {
            this.selectionGroupController.setPrevGroup();
        } else if (event.key === 'ArrowRight') {
            this.selectionGroupController.setNextGroup();
        } else if (event.key === 'Enter') {
            this.validateInput();
        }
    }

    public onClick(): void {
        const cursorIndex = this.dateInputRef?.nativeElement.selectionEnd as number;
        this.selectionGroupController.setGroupForCursor(cursorIndex);
    }

    public validateInput(): void {
        const {day, month, year, hours, minutes} = this.selectionGroupController.getRawValue();
        const current: Date = new Date();

        const date = new Date(
            year == 0 ? current.getFullYear() : year,
            month == 0 ? current.getMonth() : month - 1,
            day == 0 ? current.getDate() : day
        );

        if (this.type === 'date-time') {
            if (hours === 0 && minutes === 0 && !this.selectionGroupController.isTimeTouched()) {
                if (this.startTime == 'from') {
                    date.setHours(0, 0);
                } else if (this.startTime == 'to') {
                    date.setHours(23, 59);
                } else {
                    date.setHours(current.getHours(), current.getMinutes());
                }
            } else {
                date.setHours(hours, minutes);
            }

            date.setSeconds(this.startTime == 'to' ? 59 : 0);
        }

        const minDate = this.parseDateString(this.minDate);
        const maxDate = this.parseDateString(this.maxDate);

        let resultDate = date;
        if (maxDate) {
            maxDate.setHours(23, 59, 59);
            if (date.getTime() > maxDate.getTime()) {
                resultDate = maxDate;
            }
        }
        if (minDate && date.getTime() < minDate.getTime()) {
            resultDate = minDate;
        }

        this.selectionGroupController.setDate(resultDate);
        this.selectionGroupController.setHours(resultDate.getHours());
        this.selectionGroupController.setMinutes(resultDate.getMinutes());
        this.selectedDate = resultDate;
    }

    public parseDateString(dateStr: string | undefined): Date | undefined {
        const result = dayjs(dateStr, 'YYYY-MM-DD');
        return result.isValid() ? result.toDate() : undefined;
    }
}

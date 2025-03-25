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
    @Input() showMaskTyped: boolean = true;
    @Input() keepCharacterPositions: boolean = true;
    @Input() minDate: string | undefined;
    @Input() maxDate: string | undefined;
    @Input() isFilterTo: boolean | undefined;

    @HostBinding('attr.readonly') @Input() readonly: boolean;
    @HostBinding('attr.readonly') @Input() required: boolean;
    @HostBinding('attr.disabled') @Input() disabled: boolean;
    @HostBinding('attr.focused') focused: boolean;
    @HostBinding('attr.v4') _v4!: string;

    @Output() selected: EventEmitter<void> = new EventEmitter<void>();

    @ViewChild('dateInput') dateInputRef: ElementRef<HTMLInputElement>;
    @ViewChild('matCalendar') matCalendar: MatCalendar<Date | null>;

    public isOpen: boolean;
    public mask: string;

    public hoursArr: number[];
    public minutesArr: number[];

    public selectedDate: Date | null;

    private selectionGroupController = new SelectionGroupController();

    private destroyed$ = new Subject<void>();

    constructor() {
        this.hoursArr = Array.from(Array(24).keys());
        this.minutesArr = Array.from(Array(60).keys());
    }

    ngOnInit() {
        this.selectionGroupController.setType(this.type);

        this.selectionGroupController.valueChanges.pipe(
            takeUntil(this.destroyed$)
        ).subscribe((value: SelectionGroupOutputModel) => {
            this.dateInputRef.nativeElement.value = value.fullValue;
            this.dateInputRef.nativeElement.setSelectionRange(value.selectionStart, value.selectionEnd);
        });
    }

    ngOnDestroy() {
        this.destroyed$.next();
        this.destroyed$.complete();
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
        const cursorIndex = this.dateInputRef.nativeElement.selectionEnd as number;
        this.selectionGroupController.setGroupForCursor(cursorIndex);
    }

    public validateInput(): void {
        // TODO: переа=вірити врахування секунд
        const value = this.dateInputRef.nativeElement.value;

        const day = parseInt(value.substring(0, 2));
        const month = parseInt(value.substring(3, 5));
        const year = parseInt(value.substring(6, 10));
        const hours = parseInt(value.substring(11, 13));
        const minutes = parseInt(value.substring(14, 16));

        const date = new Date(
            year == 0 ? new Date().getFullYear() : year,
            month == 0 ? new Date().getMonth() : month - 1,
            day == 0 ? new Date().getDate() : day
        );

        if (this.type === 'date-time') {
            if (hours === 0 && minutes === 0 && !this.selectionGroupController.isTimeTouched() && this.isFilterTo) {
                date.setHours(23, 59, 59);
            } else {
                date.setHours(hours, minutes, this.isFilterTo ? 59 : 0);
            }
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

        this.selectionGroupController.setDateTime(dayjs(resultDate).format('DD.MM.YYYY HH:mm'));
        this.selectedDate = resultDate;
    }

    public parseDateString(dateStr: string | undefined): Date | undefined {
        const result = dayjs(dateStr, 'YYYY-MM-DD');
        return result.isValid() ? result.toDate() : undefined;
    }
}

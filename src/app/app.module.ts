import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {DateTimePickerComponent} from './date-time-picker/date-time-picker.component';
import {NgxDaterangepickerMd} from 'ngx-daterangepicker-material';
import {MatCalendar} from '@angular/material/datepicker';
import {NgIf, NgStyle} from '@angular/common';
import {CdkConnectedOverlay, CdkOverlayOrigin} from '@angular/cdk/overlay';
import {NgSelectComponent} from '@ng-select/ng-select';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent
  ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        NgxDaterangepickerMd,
        MatCalendar,
        NgStyle,
        CdkOverlayOrigin,
        CdkConnectedOverlay,
        NgSelectComponent,
        NgIf,
        DateTimePickerComponent,
        ReactiveFormsModule,
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

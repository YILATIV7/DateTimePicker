import {Component, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    standalone: false,
    styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
    title = 'DateTimePicker';

    public formControl: FormControl = new FormControl('2023-02-27T05:00');
    public formControlFrom: FormControl = new FormControl('2013-05-12');
    public formControlTo: FormControl = new FormControl();

    ngOnInit() {
        this.formControlTo.valueChanges.subscribe(value => {console.log("value 1: ", value)});
        this.formControlTo.valueChanges.subscribe(value => {console.log("value 2: ", value)});
        this.formControlTo.valueChanges.subscribe(value => {console.log("value 3: ", value)});
    }
}

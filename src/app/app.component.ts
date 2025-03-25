import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'DateTimePicker';
  type: 'date-time' | 'date' = 'date-time';

  ngOnInit() {
    setTimeout(() => {
      this.type = 'date';
    }, 2000)
  }
}

import {Component} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {TranslocoPipe} from '@jsverse/transloco';

@Component({
  selector: 'shell-footer',
  imports: [
    MatIconModule,
    RouterLink,
    TranslocoPipe,
  ],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
}

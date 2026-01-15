import {ChangeDetectionStrategy, Component} from '@angular/core';
import { RouterOutlet } from "@angular/router";

@Component({
  selector: 'partner-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'partner-app',
  },
})
export class App {
}

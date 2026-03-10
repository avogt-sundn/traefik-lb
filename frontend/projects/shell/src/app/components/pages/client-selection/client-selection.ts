import {Component, inject} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import {Router, RouterLink} from '@angular/router';
import {TranslocoPipe} from '@jsverse/transloco';
import {Client, ClientSelectionService} from './client-selection.service';

@Component({
  selector: 'shell-client-selection',
  imports: [
    MatToolbarModule,
    MatIconModule,
    MatCardModule,
    RouterLink,
    TranslocoPipe,
  ],
  templateUrl: './client-selection.html',
  styleUrl: './client-selection.scss',
})
export class ClientSelection {
  clients: Client[] = [];
  private clientSelectionService = inject(ClientSelectionService);

  private router = inject(Router);

  constructor() {
    this.clients = this.clientSelectionService.getClients();
    if (this.clients.length === 1) {
      this.router.navigate([
        '/',
        this.clients[0].label,
      ]);
    }
  }
}

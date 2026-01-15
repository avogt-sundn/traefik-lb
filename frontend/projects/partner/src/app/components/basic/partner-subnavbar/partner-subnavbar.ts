import {Component} from '@angular/core';
import {MfeSubnavbar} from '@shared/components/basic/mfe-subnavbar/mfe-subnavbar';

@Component({
  selector: 'partner-subnavbar',
  imports: [MfeSubnavbar],
  templateUrl: './partner-subnavbar.html',
  styleUrl: './partner-subnavbar.scss',
})
export class PartnerSubnavbar {
  navigationItems = [{route: '../search', label: 'Partnersuche'}];
}

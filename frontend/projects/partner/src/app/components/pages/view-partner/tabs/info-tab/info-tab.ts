import {ChangeDetectionStrategy, Component, input, output, OutputEmitterRef} from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import {TranslocoPipe} from '@jsverse/transloco';
import {PartnerDto} from '../../../../../api';

@Component({
  selector: 'partner-info-tab',
  imports: [
    TranslocoPipe,
    MatCardModule,
  ],
  templateUrl: './info-tab.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoTab {
  partner = input<PartnerDto | null>(null);
  isEditMode = input<boolean>(false);

  partnerTabChanged: OutputEmitterRef<Partial<PartnerDto>> = output<Partial<PartnerDto>>();
}

import {ChangeDetectionStrategy, Component, input, output, OutputEmitterRef} from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import {TranslocoPipe} from '@jsverse/transloco';
import {PartnerDto} from '../../../../../api';

@Component({
  selector: 'partner-engagement-tab',
  imports: [
    TranslocoPipe,
    MatCardModule,
  ],
  templateUrl: './engagement-tab.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EngagementTab {
  partner = input<PartnerDto | null>(null);
  isEditMode = input<boolean>(false);

  // Output for data changes
  partnerTabChanged: OutputEmitterRef<Partial<PartnerDto>> = output<Partial<PartnerDto>>();
}

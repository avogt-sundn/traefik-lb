import {ChangeDetectionStrategy, Component, input, InputSignal, output, OutputEmitterRef} from '@angular/core';
import {MatCardModule} from "@angular/material/card";
import {PartnerDto} from '../../../../../api';
import {TranslocoPipe} from '@jsverse/transloco';

@Component({
  selector: 'partner-administration-tab',
  imports: [
    MatCardModule,
    TranslocoPipe,
  ],
  templateUrl: './administration-tab.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdministrationTab {
  partner: InputSignal<PartnerDto> = input.required<PartnerDto>();
  isEditMode: InputSignal<boolean> = input<boolean>(false);

  // Output for data changes
  partnerTabChanged: OutputEmitterRef<Partial<PartnerDto>> = output<Partial<PartnerDto>>();
}

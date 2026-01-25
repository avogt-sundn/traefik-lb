import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
  signal,
} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatCardModule} from "@angular/material/card";
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {TranslocoService} from '@jsverse/transloco';
import {PartnerDto} from '@partner/src/app/api';
import {PartnerAddressService} from '@partner/src/app/services/partner-address.service';
import {PartnerFieldValidationService} from '@partner/src/app/services/partner-field-validation.service';
import {SelectOption, ValidatedFormField} from '@shared/components/basic/validated-form-field/validated-form-field';
import {CypressIdDirective} from '@shared/directives/cypress-id';
import {DtoValidator} from '@shared/services/form-field-validation.service';
import {COUNTRY_IDS, COUNTRY_TRANSLATION_KEYS} from '@shared/util/models/countries';
import {debounceTime, distinctUntilChanged} from 'rxjs';

@Component({
  selector: 'partner-address-tab',
  imports: [
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    ValidatedFormField,
    CypressIdDirective,
  ],
  templateUrl: './address-tab.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressTab {
  partner: InputSignal<PartnerDto> = input.required<PartnerDto>();
  isEditMode: InputSignal<boolean> = input<boolean>(false);

  // Output for data changes
  partnerTabChanged: OutputEmitterRef<Partial<PartnerDto>> = output<Partial<PartnerDto>>();
  readonly validateAddressField: DtoValidator;
  readonly validateTelecommunicationField: DtoValidator;
  readonly validateContactPersonField: DtoValidator;
  readonly countryOptions: Signal<SelectOption[]>;
  addressForm: FormGroup;

  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly partnerValidators = inject(PartnerFieldValidationService);
  private readonly translocoService = inject(TranslocoService);
  private readonly partnerAddressService = inject(PartnerAddressService);
  private readonly hasUserEdited = signal(false);

  private readonly translationEvents = toSignal(
    this.translocoService.events$,
    {initialValue: null},
  );


  constructor() {
    this.validateAddressField = this.partnerValidators.createAddressValidator();
    this.validateTelecommunicationField = this.partnerValidators.createTelecommunicationValidator();
    this.validateContactPersonField = this.partnerValidators.createContactPersonValidator();
    this.countryOptions = computed<SelectOption[]>(() => {
      this.translationEvents();
      return Object.entries(COUNTRY_IDS).map(
        ([
          ,
          countryId,
        ]) => ({
          value: countryId,
          label: this.translocoService.translate(COUNTRY_TRANSLATION_KEYS[countryId]),
        }));
    });
    this.addressForm = this.fb.group({
      company1: [''],
      company2: [''],
      company3: [''],
      street: [''],
      houseNumber: [''],
      country: [''],
      postalCode: [''],
      city: [''],
      phonePrefix: [''],
      phoneNumber: [''],
      mobilePrefix: [''],
      mobileNumber: [''],
      sepaEmailNotification: [''],
      alphacode: [''],
    });


    effect((): void => {
      if (!this.isEditMode() || !this.hasUserEdited()) {
        this.hasUserEdited.set(false);
        this.loadPartnerDataToForm();
      }
    });

    this.setupEditChangeListener();
  }

  /**
   * Load partner data into form (does not trigger valueChanges emissions)
   */
  private loadPartnerDataToForm(): void {
    this.partnerAddressService.populateFormFromPartner(this.addressForm, this.partner());
  }


  /**
   * Setup form change listener for user interactions
   */
  private setupEditChangeListener(): void {
    this.addressForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
      )
      .subscribe(formData => {
        if (this.isEditMode()) {
          // Mark that user has started editing to prevent form reloading
          this.hasUserEdited.set(true);

          const partnerUpdate = this.partnerAddressService.convertFormToPartnerDto(formData, this.partner());
          this.partnerTabChanged.emit(partnerUpdate);
        }
      });
  }
}

/* eslint-disable max-lines*/
// TODO FIT-406: fix linting error
// Assisted by AI
import {Component, computed, inject, Signal} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {TranslocoModule, TranslocoService} from '@jsverse/transloco';
import {toSignal} from '@angular/core/rxjs-interop';
import {ContactPersonDto} from '@partner/src/app/api';
import {PARTNER_FUNCTION_IDS, SALUTATION_CODES, TELKOM_TYPE_IDS} from '@partner/src/app/util/model/partner.constants';
import {SelectOption, ValidatedFormField} from '@shared/components/basic/validated-form-field/validated-form-field';
import {DtoValidator} from '@shared/services/form-field-validation.service';
import {PartnerFieldValidationService} from '@partner/src/app/services/partner-field-validation.service';
import {TelecommunicationBuilderService} from '@partner/src/app/services/telecommunication-builder.service';

export interface ContactPersonDialogData {
  contactPerson: ContactPersonDto | null;
  isEditMode: boolean;
}

@Component({
  selector: 'partner-contact-person-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    TranslocoModule,
    ValidatedFormField,
  ],
  templateUrl: './contact-person-dialog.html',
  styleUrl: './contact-person-dialog.scss',
})
export class ContactPersonDialog {
  readonly contactForm: FormGroup;
  readonly data = inject<ContactPersonDialogData>(MAT_DIALOG_DATA);
  readonly isEditMode = this.data.isEditMode;
  readonly functionOptions: Signal<SelectOption[]>;
  readonly salutationOptions: Signal<SelectOption[]>;
  readonly validateContactPersonField: DtoValidator;
  readonly validateAddressField: DtoValidator;
  readonly validateTelecommunicationField: DtoValidator;
  private readonly dialogRef = inject(MatDialogRef<ContactPersonDialog>);
  private readonly fb = inject(FormBuilder);
  private readonly translocoService = inject(TranslocoService);
  private readonly partnerValidators = inject(PartnerFieldValidationService);
  private readonly telecomBuilder = inject(TelecommunicationBuilderService);
  private readonly translationEvents = toSignal(
    this.translocoService.events$,
    {initialValue: null},
  );

  constructor() {
    this.validateContactPersonField = this.partnerValidators.createContactPersonValidator();
    this.validateAddressField = this.partnerValidators.createAddressValidator();
    this.validateTelecommunicationField = this.partnerValidators.createTelecommunicationValidator();
    this.functionOptions = computed<SelectOption[]>(() => {
      this.translationEvents();
      return [
        {
          value: PARTNER_FUNCTION_IDS.INHABER,
          label: this.translocoService.translate('partner.view.contact.functions.owner'),
        },
        {
          value: PARTNER_FUNCTION_IDS.GESCHAEFTSFUEHRER,
          label: this.translocoService.translate('partner.view.contact.functions.ceo'),
        },
        {
          value: PARTNER_FUNCTION_IDS.VORSTAND,
          label: this.translocoService.translate('partner.view.contact.functions.board'),
        },
      ];
    });
    this.salutationOptions = computed<SelectOption[]>(() => {
      this.translationEvents();
      return Object.entries(SALUTATION_CODES)
        .map(([
          code,
          label,
        ]) => ({
          value: Number(code),
          label: label,
        }));
    });
    this.contactForm = this.createContactForm();
  }

  getDialogTitle(): string {
    return this.isEditMode
      ? this.translocoService.translate('partner.view.contact.dialog.titleEdit')
      : this.translocoService.translate('partner.view.contact.dialog.titleNew');
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSave(): void {
    this.contactForm.markAllAsTouched();
    if (this.contactForm.valid) {
      const formValue = this.contactForm.getRawValue();
      const dateOfBirth = formValue.birthDate instanceof Date
        ? formValue.birthDate.toISOString().split('T')[0]
        : formValue.birthDate;
      const personId = this.data.contactPerson?.personId;
      const addressId = this.data.contactPerson?.addresses?.[0]?.addressId;
      const mergedTelecommunications = this.telecomBuilder.mergeTelecommunications(
        this.data.contactPerson?.addresses?.[0]?.telecommunications || [],
        formValue,
        personId,
        addressId,
      );
      const result: ContactPersonDto = {
        ...this.data.contactPerson,
        personId,
        partnerNumber: this.data.contactPerson?.partnerNumber,
        salutationCode: formValue.salutationCode,
        title: formValue.title,
        firstName: formValue.firstName,
        name1: formValue.lastName,
        alphaCode: formValue.alphaCode,
        departmentName: formValue.department,
        dateOfBirth: dateOfBirth,
        partnerFunctionId: formValue.function,
        partnerFunction: formValue.function ? {
          partnerFunctionId: formValue.function,
          functionDescription: this.functionOptions().find(opt => opt.value === formValue.function)?.label || '',
        } : this.data.contactPerson?.partnerFunction,
        addresses: [
          {
            addressId,
            addressTypeId: this.data.contactPerson?.addresses?.[0]?.addressTypeId,
            personId,
            street: formValue.street,
            houseNumber: formValue.houseNumber,
            postalCode: formValue.postalCode,
            city: formValue.city,
            telecommunications: mergedTelecommunications,
          },
        ],
      } as ContactPersonDto;
      this.dialogRef.close(result);
    }
  }

  private createContactForm(): FormGroup {
    const contact = this.data.contactPerson;
    const address = contact?.addresses?.[0];
    const phone = address?.telecommunications?.find((t) => t.telecommunicationType === TELKOM_TYPE_IDS.HAUPTNUMMER);
    const mobile = address?.telecommunications?.find((t) => t.telecommunicationType === TELKOM_TYPE_IDS.MOBILTELEFON);
    const email =
      address?.telecommunications?.find((t) => t.telecommunicationType === TELKOM_TYPE_IDS.EMAIL);
    return this.fb.group({
      salutationCode: [contact?.salutationCode || null],
      title: [contact?.title || ''],
      firstName: [contact?.firstName || ''],
      lastName: [contact?.name1 || ''],
      alphaCode: [contact?.alphaCode || ''],
      department: [contact?.departmentName || ''],
      street: [address?.street || ''],
      houseNumber: [address?.houseNumber || ''],
      country: ['Deutschland'],
      postalCode: [address?.postalCode || ''],
      city: [address?.city || ''],
      phonePrefix: [phone?.areaCode || ''],
      phoneNumber: [phone?.phoneNumber || ''],
      mobilePrefix: [mobile?.areaCode || ''],
      mobileNumber: [mobile?.phoneNumber || ''],
      birthDate: [contact?.dateOfBirth || null],
      function: [contact?.partnerFunctionId || null],
      email: [email?.email || ''],
    });
  }
}

/* eslint-disable max-lines */
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  signal,
} from '@angular/core';
import {AbstractControl, AsyncValidatorFn, ReactiveFormsModule, ValidationErrors, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {DtoValidator} from '@shared/services/form-field-validation.service';
import {catchError, map, Observable, of, switchMap, timer} from 'rxjs';
import {EditableTable} from '@shared/components/basic/editable-table/editable-table';
import {TableColumn, TableRowData} from '@shared/components/basic/editable-table/editable-table.types';
import {BankConnectionDto, IbanValidationResultDto, PartnerDto, PartnerGatewayService} from '../../../../../api';
import {formatDateToDDMMYYYY} from '@shared/util/date';
import {PartnerFieldValidationService} from '../../../../../services/partner-field-validation.service';

// Bank connection table data type
type BankConnectionTableData = BankConnectionDto & TableRowData & {
  status: string;
};

@Component({
  selector: 'partner-bank-tab',
  imports: [
    MatChipsModule,
    MatTableModule,
    MatIconModule,
    ReactiveFormsModule,
    MatButtonModule,
    EditableTable,

  ],
  templateUrl: './bank-tab.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BankTab {
  partnerTabChanged: OutputEmitterRef<Partial<PartnerDto>> = output<Partial<PartnerDto>>();
  readonly partner: InputSignal<PartnerDto> = input.required<PartnerDto>();
  readonly isEditMode: InputSignal<boolean> = input<boolean>(false);
  readonly bankConnections = computed(() => {
    return (this.partner().bankConnections || []).map(connection => ({
      sequenceNumber: connection.sequenceNumber,
      bankName: connection.bankName || '',
      iban: connection.bankDetails?.iban || '',
      accountHolder: connection.bankDetails?.accountHolder || '',
      paymentMethod: 'Kein Lastschrifteinzug', // Mocked field - default value
      mandateReference: connection.bankDetails?.mandateReference || '',
      mandateSignatureDate: connection.bankDetails?.mandateSignatureDate || '',
      status: connection.bankDetails?.blockFlag ? 'inaktiv' : 'aktiv',
    } as BankConnectionTableData));
  });
  readonly bankColumns = signal<TableColumn<BankConnectionTableData>[]>([
    {
      key: 'sequenceNumber',
      header: 'partner.view.bank.nr',
      type: 'number',
      validators: [this.createDtoValidatorFn('sequenceNumber')],
      readonly: true,
    },
    {
      key: 'iban',
      header: 'partner.view.bank.iban',
      type: 'text',
      validators: [this.createDtoValidatorFn('iban')],
      asyncValidators: [this.ibanValidator()],
    },
    {
      key: 'bankName',
      header: 'partner.view.bank.bankName',
      type: 'text',
      validators: [this.createDtoValidatorFn('bankName')],
      readonly: true,
    },
    {
      key: 'accountHolder',
      header: 'partner.view.bank.accountHolder',
      type: 'text',
      validators: [this.createDtoValidatorFn('accountHolder')],
      hiddenOnInit: true,
    },
    {
      key: 'paymentMethod', // TODO: BE//DB Anbindung (FIT-213)
      header: 'partner.view.bank.paymentMethod',
      type: 'select',
      selectOptions: [
        'Kein Lastschrifteinzug',
        'LS-Ermächtigung',
        'LS-Abbuchung',
        'Firmenlastschrift (B2B)',
        'Basislastschrift (CORE)',
        'Sonstige',
      ],
      hiddenOnInit: true,
    },
    {
      key: 'mandateReference',
      header: 'partner.view.bank.mandateReference',
      type: 'text',
      validators: [this.createDtoValidatorFn('mandateReference')],
      hiddenOnInit: true,
    },
    {
      key: 'mandateSignatureDate',
      header: 'partner.view.bank.mandateSignatureDate',
      type: 'date',
      displayFormatter: (value) => formatDateToDDMMYYYY(value),
      hiddenOnInit: true,
    },
    {
      key: 'status',
      header: 'partner.view.bank.status',
      type: 'select',
      selectOptions: [
        'aktiv',
        'inaktiv',
      ],
      validators: [Validators.required],
    },
  ]);
  private readonly partnerGatewayService = inject(PartnerGatewayService);
  // Store IBAN validation results for auto-filling bank data
  private readonly ibanValidationResults = new Map<string, IbanValidationResultDto>();
  private readonly partnerValidators = inject(PartnerFieldValidationService);
  // DTO validator functions for bank connection and bank details fields
  private readonly validateBankConnectionField: DtoValidator = this.partnerValidators.createBankConnectionValidator();
  private readonly validateBankDetailsField: DtoValidator = this.partnerValidators.createBankDetailsValidator();

  // Assisted by AI
  readonly newBankConnectionDefaults = () => {
    const existingConnections = this.partner().bankConnections || [];
    const maxSequenceNumber = existingConnections.length > 0
      ? Math.max(...existingConnections.map(conn => conn.sequenceNumber || 0))
      : 0;

    return {
      sequenceNumber: maxSequenceNumber + 1,
    } as Partial<BankConnectionTableData>;
  };

  protected onBankConnectionsChanged(data: BankConnectionTableData[]): void {
    // Convert table data back to BankConnectionDto format
    // Note: paymentMethod is mocked and not saved to DTO (TODO FIT-213)
    const bankConnections: BankConnectionDto[] = data.map(row => {
      const iban = String(row['iban'] || '');

      // Get validation result for auto-filling bank data
      const validationResult = this.ibanValidationResults.get(iban);
      let bankName = String(row['bankName'] || '');
      let bankCode = '';  // Always from validation, not stored in table
      let accountNumber = '';  // Always from validation, not stored in table

      // Auto-fill bank data if we have validation result for this IBAN
      if (validationResult && iban.length >= 20) {
        bankName = validationResult.bankName || bankName;
        bankCode = validationResult.bankCode || '';
        accountNumber = validationResult.accountNumber || '';
      }

      return {
        sequenceNumber: Number(row['sequenceNumber']),
        bankName,
        bankCode,
        accountNumber,
        bankDetails: {
          sequenceNumber: Number(row['sequenceNumber']),
          iban,
          accountHolder: String(row['accountHolder'] || ''),
          mandateReference: String(row['mandateReference'] || ''),
          mandateSignatureDate: String(row['mandateSignatureDate'] || ''),
          blockFlag: row['status'] === 'inaktiv',
        },
      };
    });
    this.partnerTabChanged.emit({bankConnections});
  }

  // Assisted by AI
  /**
   * Creates an Angular ValidatorFn that wraps the DTO validator for a specific field
   * Uses appropriate validator based on field (BankConnection vs BankDetails)
   */
  private createDtoValidatorFn(fieldName: string) {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      // Fields from BankDetailsDto: iban, accountHolder, mandateReference, mandateSignatureDate
      const bankDetailsFields =
        [
          'iban',
          'accountHolder',
          'mandateReference',
          'mandateSignatureDate',
        ];
      const validator = bankDetailsFields.includes(fieldName)
        ? this.validateBankDetailsField
        : this.validateBankConnectionField;

      const error = validator(fieldName, value);

      if (!error) {
        return null;
      }

      // Convert DTO validation error to Angular ValidationErrors format
      if (typeof error === 'object' && 'key' in error) {
        return {dtoValidation: error};
      }

      return {dtoValidation: {key: error}};
    };
  }

  /**
   * IBAN validator with server-side validation
   */
  private ibanValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      if (!control.value) {
        return of(null); // Let required validator handle empty values
      }

      const iban = control.value.toString().trim();
      if (iban.length < 20) { // TODO: Use BE-Validator for Length (FIT-213)
        return of({ibanInvalid: true});
      }

      return timer(500).pipe(
        switchMap(() => this.partnerGatewayService.validateIban(iban)),
        map((result: IbanValidationResultDto) => {
          if (result.isValid) {
            this.ibanValidationResults.set(iban, result);
            return null;
          } else {
            this.ibanValidationResults.delete(iban);
            return {ibanInvalid: true};
          }
        }),
        catchError(() => {
          this.ibanValidationResults.delete(iban);
          return of({ibanInvalid: true});
        }),
      );
    };
  }
}

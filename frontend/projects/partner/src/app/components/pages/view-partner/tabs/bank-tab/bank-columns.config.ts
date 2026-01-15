import {signal} from '@angular/core';
import {AsyncValidatorFn, Validators} from '@angular/forms';
import {TableColumn} from '@shared/components/basic/editable-table/editable-table.types';
import {formatDateToDDMMYYYY} from '@shared/util/date';

// Bank connection table data type
export type BankConnectionTableData = Record<string, string | number> & {
  sequenceNumber: number;
  iban: string;
  bankName: string;
  accountHolder: string;
  paymentMethod: string;
  mandateReference: string;
  mandateSignatureDate: string;
  status: string;
};

// Assisted by AI
export const createBankColumns = (ibanValidator: () => AsyncValidatorFn) =>
  signal<TableColumn<BankConnectionTableData>[]>([
    {
      key: 'sequenceNumber',
      header: 'partner.view.bank.nr',
      type: 'number',
      validators: [
        Validators.required,
        Validators.min(1),
      ],
      readonly: true,
    },
    {
      key: 'iban',
      header: 'partner.view.bank.iban',
      type: 'text',
      validators: [Validators.required],
      asyncValidators: [ibanValidator()],
    },
    {key: 'bankName', header: 'partner.view.bank.bankName', type: 'text', readonly: true},
    {key: 'accountHolder', header: 'partner.view.bank.accountHolder', type: 'text', hiddenOnInit: true},
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
    {key: 'mandateReference', header: 'partner.view.bank.mandateReference', type: 'text', hiddenOnInit: true},
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

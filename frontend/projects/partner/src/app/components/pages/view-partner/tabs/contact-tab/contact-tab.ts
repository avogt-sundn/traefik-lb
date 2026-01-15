import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  OutputEmitterRef,
  ViewContainerRef,
} from '@angular/core';
import {EditableTable} from '@shared/components/basic/editable-table/editable-table';
import {TableColumn, TableRowData} from '@shared/components/basic/editable-table/editable-table.types';
import {ContactPersonDto, PartnerDto} from '@partner/src/app/api';
import {PARTNER_FUNCTION_IDS} from '@partner/src/app/util/model/partner.constants';
import {MatDialog} from '@angular/material/dialog';
import {ContactPersonDialog, ContactPersonDialogData} from './contact-person-dialog/contact-person-dialog';
import {PartnerContactService} from '@partner/src/app/services/partner-contact.service';

type ContactPersonTableData = TableRowData & {
  id?: number;
  name: string;
  address: string;
  birthDate: string;
  phone: string;
  mobile: string;
  function: string;
  _originalData?: ContactPersonDto;
};

// Assisted by AI
@Component({
  selector: 'partner-contact-tab',
  imports: [EditableTable],
  templateUrl: './contact-tab.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactTab {
  partner = input.required<PartnerDto>();
  isEditMode = input<boolean>(false);

  // Output for data changes
  partnerTabChanged: OutputEmitterRef<Partial<PartnerDto>> = output<Partial<PartnerDto>>();
  readonly contactPersons = computed(() => {
    const contactPersonsList = this.partner().contactPersons || [];
    return this.contactService
      .filterOutMainAddress(contactPersonsList)
      .map(contactPerson => ({
        id: contactPerson.personId,
        name: this.contactService.getPersonName(contactPerson),
        address: this.contactService.getPersonAddress(contactPerson),
        birthDate: this.contactService.getFormattedBirthDate(contactPerson),
        phone: this.contactService.getPhoneNumber(contactPerson),
        mobile: this.contactService.getMobileNumber(contactPerson),
        function: this.contactService.getFunctionName(contactPerson),
        _originalData: contactPerson,
      } as ContactPersonTableData));
  });
  readonly contactColumns = computed<TableColumn<ContactPersonTableData>[]>(() => [
    {key: 'name', header: 'partner.view.contact.name', type: 'text'},
    {key: 'address', header: 'partner.view.contact.address', type: 'text'},
    {key: 'birthDate', header: 'partner.view.contact.birthDate', type: 'date'},
    {key: 'phone', header: 'partner.view.contact.phone', type: 'text'},
    {key: 'mobile', header: 'partner.view.contact.mobile', type: 'text'},
    {key: 'function', header: 'partner.view.contact.function', type: 'text'},
  ]);
  private readonly dialog = inject(MatDialog);
  private readonly contactService = inject(PartnerContactService);
  private readonly viewContainerRef = inject(ViewContainerRef);

  readonly customEditHandler = (row: ContactPersonTableData, index: number) =>
    this.openContactPersonDialog(row._originalData || null, true, index);
  readonly customAddHandler = () => this.openContactPersonDialog(null, false);

  openContactPersonDialog(contactPerson: ContactPersonDto | null, isEditMode: boolean, index?: number): void {
    const dialogRef = this.dialog.open(ContactPersonDialog, {
      data: {contactPerson, isEditMode} as ContactPersonDialogData,
      viewContainerRef: this.viewContainerRef,
    });

    dialogRef.afterClosed().subscribe((result: ContactPersonDto | null) => {
      if (result) {
        this.handleContactPersonSaved(result, isEditMode, index);
      }
    });
  }

  onContactPersonsChanged(data: (ContactPersonTableData & { _originalData?: ContactPersonDto })[]): void {
    const currentPartner = this.partner();
    if (!currentPartner) return;
    const updatedContactPersons: ContactPersonDto[] = data.map(row =>
      this.contactService.parseContactPersonFromTableRow(
        row,
        row._originalData,
        currentPartner.partnerNumber,
      ),
    );
    // Merge with existing contact persons (keep PARTNER_HAUPTANSCHRIFT)
    const mainAddress = currentPartner.contactPersons?.find(
      cp => cp.partnerFunctionId === PARTNER_FUNCTION_IDS.PARTNER_HAUPTANSCHRIFT,
    );
    const allContactPersons = mainAddress
      ? [
        mainAddress,
        ...updatedContactPersons,
      ]
      : updatedContactPersons;
    this.partnerTabChanged.emit({contactPersons: allContactPersons});
  }

  private handleContactPersonSaved(contactPerson: ContactPersonDto, isEditMode: boolean, index?: number): void {
    const currentPartner = this.partner();
    if (!currentPartner) return;

    const updatedList = this.contactService.updateOrAddContactPerson(
      currentPartner.contactPersons || [],
      contactPerson,
      isEditMode,
      index,
    );

    this.partnerTabChanged.emit({contactPersons: updatedList});
  }

}

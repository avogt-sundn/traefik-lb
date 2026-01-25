/* eslint-disable max-lines */
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
  signal,
} from '@angular/core';
import {AbstractControl, ReactiveFormsModule, ValidationErrors, Validators} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {TranslocoPipe} from '@jsverse/transloco';
import {ChipTabItem} from '@shared/components/basic/chip-tabs/chip-tab-item';
import {ChipTabs} from '@shared/components/basic/chip-tabs/chip-tabs';
import {EditableTable} from '@shared/components/basic/editable-table/editable-table';
import {TableColumn, TableRowData} from '@shared/components/basic/editable-table/editable-table.types';
import {DtoValidator} from '@shared/services/form-field-validation.service';
import {AddressDto, GroupAssignmentDto, PartnerDto} from '../../../../../api';
import {PartnerGroupService} from '../../../../../services/partner-group.service';
import {PartnerFieldValidationService} from '../../../../../services/partner-field-validation.service';

// Type aliases using intersection types to make DTOs compatible with TableRowData
type GroupAssignmentTableData = GroupAssignmentDto & TableRowData;
type AddressTableData = AddressDto & TableRowData & {
  addressTypeDescription: string;
};

@Component({
  selector: 'partner-group-tab',
  imports: [
    MatChipsModule,
    MatTableModule,
    MatIconModule,
    ReactiveFormsModule,
    MatButtonModule,
    EditableTable,
    ChipTabs,
    ChipTabItem,
    TranslocoPipe,
  ],
  templateUrl: './group-tab.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupTab {
  readonly locationColumns = signal<TableColumn<AddressTableData>[]>([
    {key: 'addressTypeDescription', header: 'partner.view.site', type: 'text'},
    {key: 'postalCode', header: 'partner.view.postcode', type: 'text', validators: [Validators.required]},
    {key: 'city', header: 'partner.view.location', type: 'text', validators: [Validators.required]},
  ]);

  readonly partner: InputSignal<PartnerDto> = input.required<PartnerDto>();
  readonly isEditMode: InputSignal<boolean> = input<boolean>(false);

  readonly groupAssignments = computed(() => {
    const assignments = this.partner().groupAssignments || [];
    return assignments
      .filter(assignment => assignment !== null && assignment !== undefined)
      .map(assignment => {
        // If no groupId is set, try to find it by name
        let groupId = assignment.groupId;
        if (!groupId && assignment.name1) {
          const foundGroup = this.partnerGroupService.findGroupByName(assignment.name1);
          groupId = foundGroup?.groupId || 0;
        }

        return {
          groupId: groupId || 0,
          name1: assignment.name1 || '',
          participation: assignment.participation || 0,
          kwgFlag: assignment.kwgFlag || 'N',
          engaFlag: assignment.engaFlag || 'N',
        };
      });
  });

  readonly hasGroupAssignment = computed(() => {
    const assignments = this.partner().groupAssignments || [];
    return assignments.length > 0;
  });
  readonly groupColumns = computed<TableColumn<GroupAssignmentTableData>[]>(() => [
    {
      key: 'groupId',
      header: 'partner.view.groupID',
      type: 'number',
      readonly: true,
    },
    {
      key: 'name1',
      header: 'partner.view.group',
      type: 'select',
      selectOptions: this.partnerGroupService.getGroupSelectOptions(),
      validators: [Validators.required],
    },
    {
      key: 'participation',
      header: 'partner.view.participation',
      type: 'number',
      validators: [
        Validators.min(0),
        Validators.max(100),
        this.createDtoValidatorFn('participation'),
      ],
    },
    {
      key: 'kwgFlag',
      header: 'partner.view.bankingAct',
      type: 'select',
      selectOptions: [
        'J',
        'N',
      ],
      validators: [this.createDtoValidatorFn('kwgFlag')],
    },
    {
      key: 'engaFlag',
      header: 'partner.view.engagementAttribution',
      type: 'select',
      selectOptions: [
        'J',
        'N',
      ],
      validators: [this.createDtoValidatorFn('engaFlag')],
    },
  ]);
  readonly locationData = computed(() => {
    const contacts = this.partner().contactPersons || [];
    return contacts
      .flatMap(contact => contact.addresses || [])
      .map(address => ({
        postalCode: address.postalCode || '',
        city: address.city || '',
        addressTypeDescription: address.addressType?.addressDescription || address.addressType?.tableText || '',
      } as AddressTableData));
  });

  // Output for data changes
  partnerTabChanged: OutputEmitterRef<Partial<PartnerDto>> = output<Partial<PartnerDto>>();
  private readonly partnerGroupService = inject(PartnerGroupService);
  private readonly partnerValidators = inject(PartnerFieldValidationService);
  private readonly validateGroupAssignmentField: DtoValidator = this.partnerValidators.createGroupAssignmentValidator();

  // Assisted by AI
  private readonly groupsLoaded = signal<boolean>(false);

  constructor() {
    effect(() => {
      const partnerData = this.partner();
      if (partnerData && !this.groupsLoaded()) {
        const existingGroupNames = partnerData.groupAssignments
          ?.map(assignment => assignment.name1)
          .filter((name): name is string => Boolean(name)) || [];
        this.partnerGroupService.loadGroups(existingGroupNames).subscribe(() => {
          this.groupsLoaded.set(true);
        });
      }
    });
  }

  onGroupAssignmentsChanged(data: GroupAssignmentTableData[]): void {
    // Ensure data is always treated as an array (never null/undefined)
    const safeData = Array.isArray(data) ? data : [];

    // Convert table data back to GroupAssignmentDto format
    const groupAssignments: GroupAssignmentDto[] = safeData.map(row => {
      const groupName = String(row['name1'] || '');

      // Find the group by name to get the groupId
      const foundGroup = this.partnerGroupService.findGroupByName(groupName);
      const autoGroupId = foundGroup?.groupId || 0;

      return {
        groupId: autoGroupId,
        name1: groupName,
        participation: Number(row['participation'] || 0),
        kwgFlag: String(row['kwgFlag'] || 'N'),
        engaFlag: String(row['engaFlag'] || 'N'),
        assignmentType: this.partner().partnerNumber ? 'P' : 'V',
      };
    });

    // Emit the change to parent component - always emit an array, never null
    this.partnerTabChanged.emit({groupAssignments});
  }

  onLocationDataChanged(data: AddressTableData[]): void {
    void data; // Placeholder to satisfy linter
    // Location data changes are more complex as they affect contactPersons structure
    // TODO: Implement proper location data conversion if needed
  }

  // Assisted by AI
  /**
   * Creates an Angular ValidatorFn that wraps the DTO validator for a specific field
   */
  private createDtoValidatorFn(fieldName: string) {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      const error = this.validateGroupAssignmentField(fieldName, value);

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

}

/* eslint-disable @typescript-eslint/no-explicit-any */
import {Injectable} from '@angular/core';
import {FormControl} from '@angular/forms';
import {DtoValidator} from '@shared/services/form-field-validation.service';
import {
  AddressDtoValidator,
  BankConnectionDtoValidator,
  BankDetailsDtoValidator,
  ContactPersonDtoValidator,
  GroupAssignmentDtoValidator,
  TelecommunicationDtoValidator,
} from '../validators/generated';
import {DtoValidationError} from 'projects/shared/services/validation-error.service';

@Injectable({
  providedIn: 'root',
})
export class PartnerFieldValidationService {

  /**
   * Creates a validator function for Address DTO fields
   */
  createAddressValidator(): DtoValidator {
    return this.createDtoValidator(AddressDtoValidator.validate, 'addressDto');
  }

  /**
   * Creates a validator function for Telecommunication DTO fields
   */
  createTelecommunicationValidator(): DtoValidator {
    return this.createDtoValidator(TelecommunicationDtoValidator.validate, 'telecommunicationDto');
  }

  /**
   * Creates a validator function for Contact Person DTO fields
   */
  createContactPersonValidator(): DtoValidator {
    return this.createDtoValidator(ContactPersonDtoValidator.validate, 'contactPersonDto');
  }

  /**
   * Creates a validator function for Bank Connection DTO fields
   */
  createBankConnectionValidator(): DtoValidator {
    return this.createDtoValidator(BankConnectionDtoValidator.validate, 'bankConnectionDto');
  }

  /**
   * Creates a validator function for Bank Details DTO fields
   */
  createBankDetailsValidator(): DtoValidator {
    return this.createDtoValidator(BankDetailsDtoValidator.validate, 'bankDetailsDto');
  }

  /**
   * Creates a validator function for Group Assignment DTO fields
   */
  createGroupAssignmentValidator(): DtoValidator {
    return this.createDtoValidator(GroupAssignmentDtoValidator.validate, 'groupAssignmentDto');
  }

  /**
   * Creates a generic validator function for any DTO
   */
  createDtoValidator(
    validatorFunction: (control: FormControl) => any,
    dtoKey: string,
  ): DtoValidator {
    return (fieldName: string, value: any): string | DtoValidationError | null => {
      const testDto: any = {[fieldName]: value};
      const testControl = new FormControl(testDto);
      const validationResult = validatorFunction(testControl);
      return validationResult?.[dtoKey]?.[fieldName] ?? null;
    }
  }
}

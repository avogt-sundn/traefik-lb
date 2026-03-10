import {ValidatorFn, Validators} from '@angular/forms';

/**
 * API Parameter Validators
 * Auto-generated from OpenAPI schema
 */
export class ApiParameterValidators {
  /**
   * IBAN to validate (spaces will be automatically removed)
   */
  static ibanValidators(): ValidatorFn[] {
    return [
      Validators.required,
      Validators.minLength(15),
      Validators.maxLength(34),
      Validators.pattern("^[A-Za-z0-9\\s]+$")
    ];
  }
  /**
   * Partner number for exact match search
   */
  static partnerNumberValidators(): ValidatorFn[] {
    return [
      Validators.minLength(3),
      Validators.maxLength(20),
      Validators.pattern("^[0-9]+$")
    ];
  }
  /**
   * Alpha code (3-10 characters). Use * for wildcard search
   */
  static alphaCodeValidators(): ValidatorFn[] {
    return [
      Validators.minLength(3),
      Validators.maxLength(10),
      Validators.pattern("^[A-Za-z0-9*]+$")
    ];
  }
  /**
   * Partner name for partial search in name fields 1-3 (3-35 characters)
   */
  static nameValidators(): ValidatorFn[] {
    return [
      Validators.minLength(3),
      Validators.maxLength(35),
      Validators.pattern("^[A-Za-zÄÖÜäöüß0-9\\s.\\-+&]+$")
    ];
  }
  /**
   * Postcode (3-5 characters). Use * for wildcard search
   */
  static postalCodeValidators(): ValidatorFn[] {
    return [
      Validators.minLength(3),
      Validators.maxLength(5),
      Validators.pattern("^[0-9*]+$")
    ];
  }
  /**
   * City (2-35 characters). Use * for wildcard search
   */
  static cityValidators(): ValidatorFn[] {
    return [
      Validators.minLength(2),
      Validators.maxLength(35),
      Validators.pattern("^[A-Za-zÄÖÜäöüß\\s.\\-*]+$")
    ];
  }
  /**
   * Street (3-35 characters). Use * for wildcard search
   */
  static streetValidators(): ValidatorFn[] {
    return [
      Validators.minLength(3),
      Validators.maxLength(35),
      Validators.pattern("^[A-Za-zÄÖÜäöüß0-9\\s.\\-*]+$")
    ];
  }
  /**
   * Group number to find members for
   */
  static groupNumberValidators(): ValidatorFn[] {
    return [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(20),
      Validators.pattern("^[0-9]+$")
    ];
  }

  /**
   * All validators as FormGroup config
   */
  static createFormValidators(): { [key: string]: ValidatorFn[] } {
    return {
      iban: ApiParameterValidators.ibanValidators(),
      partnerNumber: ApiParameterValidators.partnerNumberValidators(),
      alphaCode: ApiParameterValidators.alphaCodeValidators(),
      name: ApiParameterValidators.nameValidators(),
      postalCode: ApiParameterValidators.postalCodeValidators(),
      city: ApiParameterValidators.cityValidators(),
      street: ApiParameterValidators.streetValidators(),
      groupNumber: ApiParameterValidators.groupNumberValidators()
    };
  }
}

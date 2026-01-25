import {Injectable} from '@angular/core';
import {FormControl} from '@angular/forms';
import {PartnerDto} from '../api';
import {PartnerDtoValidator} from '../validators/generated';

export interface SaveValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Assisted by AI
@Injectable({
  providedIn: 'root',
})
export class PartnerSaveValidationService {

  /**
   * Validates the complete PartnerDto before saving
   * Returns field-specific errors for debugging/logging
   */
  validateBeforeSave(partner: PartnerDto): SaveValidationResult {
    const control = new FormControl(partner);
    const validationResult = PartnerDtoValidator.validate(control);

    const errors: Record<string, string> = {};

    // Extract all validation errors (including nested DTOs)
    if (validationResult) {
      this.extractErrors(validationResult, '', errors);
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Recursively extract errors from nested validation result
   */
  private extractErrors(obj: object, path: string, errors: Record<string, string>): void {
    if (!obj || typeof obj !== 'object') return;

    Object.entries(obj).forEach(([
      key,
      value,
    ]) => {
      const currentPath = path ? `${path}.${key}` : key;

      if (typeof value === 'string') {
        // This is an error message
        errors[currentPath] = value;
      } else if (typeof value === 'object') {
        // Recursively process nested objects/arrays
        this.extractErrors(value, currentPath, errors);
      }
    });
  }
}

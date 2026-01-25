/* eslint-disable @typescript-eslint/no-explicit-any, max-lines */
// TODO FIT-218: fix linting errors
import {Injectable} from '@angular/core';
import {ContactPersonDto, PartnerDto} from '../api';

/**
 * Service for merging PartnerDTO and nested DTO structures
 * Handles proper deep merging without data loss
 */
@Injectable({
  providedIn: 'root',
})
export class PartnerDataMergeService {

  /**
   * Merge partial partner data into existing partner
   * Preserves all existing data while updating with new values
   */
  mergePartnerData(
    currentPartner: PartnerDto,
    updates: Partial<PartnerDto>,
  ): PartnerDto {
    if (!currentPartner || !updates) {
      throw new Error('Cannot merge partner data: missing current partner or updates');
    }

    try {
      return {
        ...currentPartner,
        ...updates,
        // Handle nested arrays with proper merging
        contactPersons: updates.contactPersons
          ? this.mergeContactPersons(
            currentPartner.contactPersons || [],
            updates.contactPersons,
          )
          : currentPartner.contactPersons || [],

        bankConnections: updates.bankConnections
          ? this.mergeBankConnections(
            currentPartner.bankConnections || [],
            updates.bankConnections,
          )
          : currentPartner.bankConnections || [],

        groupAssignments: updates.groupAssignments
          ? this.mergeGroupAssignments(
            currentPartner.groupAssignments || [],
            updates.groupAssignments,
          )
          : currentPartner.groupAssignments || [],
      };
    } catch (error) {
      throw new Error(`Failed to merge partner data: ${error}`);
    }
  }

  /**
   * Merge contact persons arrays by personId (or partnerFunctionId for PARTNER_HAUPTANSCHRIFT)
   * The updates list contains the complete new state of contact persons that were visible/editable
   */
  private mergeContactPersons(
    existing: ContactPersonDto[],
    updates: ContactPersonDto[],
  ): ContactPersonDto[] {
    if (!Array.isArray(existing) || !Array.isArray(updates)) {
      return existing || [];
    }
    return updates.map(updatedPerson => {
      if (!updatedPerson.partnerFunctionId) {
        return updatedPerson;
      }
      const existingPerson = updatedPerson.personId
        ? existing.find(cp => cp.personId === updatedPerson.personId)
        : existing.find(cp => cp.partnerFunctionId === updatedPerson.partnerFunctionId);
      if (existingPerson) {
        return {
          ...existingPerson,
          ...updatedPerson,
          addresses: updatedPerson.addresses || existingPerson.addresses || [],
        };
      }
      return updatedPerson;
    });
  }


  /**
   * Replace bank connections array entirely
   * The editable table manages the complete state, so we replace rather than merge
   */
  private mergeBankConnections(existing: any[], updates: any[]): any[] {
    if (!Array.isArray(updates)) {
      return existing || [];
    }
    return updates;
  }

  /**
   * Merge group assignments arrays (simple array replacement for now)
   */
  private mergeGroupAssignments(existing: any[], updates: any[]): any[] {
    if (!Array.isArray(updates)) {
      return existing || [];
    }

    // For group assignments, we might want to replace the entire array
    // This can be refined based on specific business requirements
    return updates;
  }
}

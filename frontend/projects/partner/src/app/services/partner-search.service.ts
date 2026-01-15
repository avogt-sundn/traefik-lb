import {inject, Injectable} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {FormGroup} from '@angular/forms';
import {PartnerTreetableService, SearchCriteria} from './partner-treetable-service/partner-treetable.service';
import {FormValidationService} from '@shared/services/form-validation.service';

export interface SearchState {
  partnerTreetableService: PartnerTreetableService | null;
  searchPerformed: boolean;
  hasResults: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PartnerSearchService {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly injectedPartnerTreetableService = inject(PartnerTreetableService);
  private readonly formValidationService = inject(FormValidationService);

  updateUrlParams(searchForm: FormGroup): void {
    const formValues = searchForm.value;
    const queryParams: Record<string, string> = {};

    // Only add parameters that have values (clean URL parameters)
    Object.keys(formValues).forEach(key => {
      const value = formValues[key];
      if (value && value.toString().trim() !== '') {
        queryParams[key] = value;
      }
    });

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'replace',
    });
  }

  async performSearch(searchForm: FormGroup): Promise<SearchState> {
    if (!this.formValidationService.validateForm(searchForm)) {
      return {
        partnerTreetableService: null,
        searchPerformed: false,
        hasResults: false,
      };
    }

    try {
      const searchCriteria: SearchCriteria = {
        partnerNr: searchForm.value.partnerNr || undefined,
        alphacode: searchForm.value.alphacode || undefined,
        name: searchForm.value.name || undefined,
        street: searchForm.value.street || undefined,
        postalCode: searchForm.value.postalCode || undefined,
        city: searchForm.value.city || undefined,
      };

      // Initialize search
      await this.injectedPartnerTreetableService.initializeWithSearch(searchCriteria);

      // Check results
      const initialTree = await this.injectedPartnerTreetableService.getInitialTree();
      const hasResults = initialTree.length > 0;

      return {
        partnerTreetableService: this.injectedPartnerTreetableService,
        searchPerformed: true,
        hasResults,
      };

    } catch {
      return {
        partnerTreetableService: null,
        searchPerformed: true,
        hasResults: false,
      };
    }
  }

  resetSearch(searchForm: FormGroup): SearchState {
    this.formValidationService.resetForm(searchForm);

    // Clear URL parameters
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {},
      queryParamsHandling: 'replace',
    });

    return {
      partnerTreetableService: null,
      searchPerformed: false,
      hasResults: false,
    };
  }

}

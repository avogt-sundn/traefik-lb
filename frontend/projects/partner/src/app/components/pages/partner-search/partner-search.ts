import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostListener,
  inject,
  OnInit,
  viewChild,
} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {ActivatedRoute, Router} from '@angular/router';
import {TranslocoPipe, TranslocoService} from '@jsverse/transloco';
import {PartnerSearchConfig} from '@partner/src/app/components/pages/partner-search/partner-search.config';
import {CypressIdDirective} from '@shared/directives/cypress-id';
import {Treetable} from '../../basic/treetable/treetable';
import {FlatNode} from '../../basic/treetable/treetable.types';
import {
  PartnerTreetableService,
} from '../../../services/partner-treetable-service/partner-treetable.service';
import {PartnerGroupSearchDto} from '../../../api';
import {ApiParameterValidators} from '../../../validators/generated';
import {searchFormValidator} from '../../../validators/validator.constants';
import {PartnerSearchService, SearchState} from '../../../services/partner-search.service';
import {PartnerDetailService} from '../../../services/partner-detail.service';
import {FormValidationService} from '@shared/services/form-validation.service';
import {InfoPanel} from '@shared/components/basic/info-panel/info-panel';
import {MfeContent} from '@shared/components/basic/mfe-content/mfe-content';
import {PartnerSubnavbar} from '@partner/src/app/components/basic/partner-subnavbar/partner-subnavbar';
import {
  ValidatedFormField,
} from '@shared/components/basic/validated-form-field/validated-form-field';

@Component({
  selector: 'partner-partner-search',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    TranslocoPipe,
    Treetable,
    MfeContent,
    PartnerSubnavbar,
    InfoPanel,
    ValidatedFormField,
    CypressIdDirective,
  ],
  templateUrl: './partner-search.html',
  styleUrl: './partner-search.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartnerSearch implements OnInit {
  searchForm: FormGroup;
  partnerTreetableService: PartnerTreetableService | null = null;
  searchPerformed = false;
  hasResults = false;
  readonly partnerNrValidators = ApiParameterValidators.partnerNumberValidators();
  readonly alphacodeValidators = ApiParameterValidators.alphaCodeValidators();
  readonly nameValidators = ApiParameterValidators.nameValidators();
  readonly streetValidators = ApiParameterValidators.streetValidators();
  readonly postalCodeValidators = ApiParameterValidators.postalCodeValidators();
  readonly cityValidators = ApiParameterValidators.cityValidators();

  private readonly treetableComponent = viewChild.required<Treetable<PartnerGroupSearchDto>>(Treetable);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly searchService = inject(PartnerSearchService);
  private readonly partnerDetailService = inject(PartnerDetailService);
  private readonly formValidationService = inject(FormValidationService);
  private readonly translocoService = inject(TranslocoService);
  private readonly fb = inject(FormBuilder);
  private readonly partnerConfig = new PartnerSearchConfig(this.translocoService);

  constructor() {
    this.searchForm = this.fb.group({
      partnerNr: [''],
      alphacode: [''],
      name: [''],
      street: [''],
      postalCode: [''],
      city: [''],
    }, {validators: searchFormValidator, updateOn: 'blur'});
  }

  get partnerDisplayedColumns() {
    return this.partnerConfig.partnerDisplayedColumns;
  }

  get partnerIconConfigs() {
    return this.partnerConfig.partnerIconConfigs;
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (Object.keys(params).length > 0) {
        this.searchForm.patchValue({
          partnerNr: params['partnerNr'] || '',
          alphacode: params['alphacode'] || '',
          name: params['name'] || '',
          street: params['street'] || '',
          postalCode: params['postalCode'] || '',
          city: params['city'] || '',
        });
        this.performSearch();
      }
    });
  }

  search() {
    this.searchService.updateUrlParams(this.searchForm);
    this.performSearch();
  }

  resetForm() {
    this.formValidationService.resetForm(this.searchForm);
    this.updateSearchState(this.searchService.resetSearch(this.searchForm));
  }

  resetField(formControlName: string) {
    this.formValidationService.clearField(this.searchForm, formControlName);
  }

  createNewPartner(): void {
    this.partnerDetailService.createNewPartner();
    this.router.navigate([PartnerSearchConfig.PARTNER_ROUTES.VIEW], {relativeTo: this.route});
  }

  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      // Trigger validation on current field before search
      const activeElement = event.target as HTMLInputElement;
      if (activeElement?.blur) {
        activeElement.blur();
      }
      requestAnimationFrame(() => this.search());
    }
  }

  async onRowClick(node: FlatNode<PartnerGroupSearchDto>) {
    const {data} = node;
    if (data.type === 'P' && data.partnerNumber) {
      this.router.navigate([
        PartnerSearchConfig.PARTNER_ROUTES.VIEW,
        data.partnerNumber,
      ], {relativeTo: this.route});
    } else if (data.type === 'V' && this.partnerTreetableService && node.expandable && this.treetableComponent()) {
      await this.treetableComponent().toggleNode(node);
    }
  }

  private async performSearch() {
    this.updateSearchState(PartnerSearchConfig.SEARCH_DEFAULTS);
    const searchState = await this.searchService.performSearch(this.searchForm);
    this.updateSearchState(searchState);
  }

  private updateSearchState(searchState: SearchState) {
    this.searchPerformed = searchState.searchPerformed;
    this.hasResults = searchState.hasResults;
    this.partnerTreetableService = searchState.partnerTreetableService;
    this.cdr.detectChanges();
  }
}

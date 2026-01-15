import {Component, computed, inject, OnInit, Signal, WritableSignal} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {MatTabsModule} from '@angular/material/tabs';
import {MatCardModule} from "@angular/material/card";
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {TranslocoPipe} from '@jsverse/transloco';
import {ContactTab} from "./tabs/contact-tab/contact-tab";
import {AddressTab} from "./tabs/address-tab/address-tab";
import {InfoTab} from "./tabs/info-tab/info-tab";
import {EngagementTab} from "./tabs/engagement-tab/engagement-tab";
import {GroupTab} from "./tabs/group-tab/group-tab";
import {BankTab} from "./tabs/bank-tab/bank-tab";
import {AdministrationTab} from "./tabs/administration-tab/administration-tab";
import {AdvisorTab} from "./tabs/advisor-tab/advisor-tab";
import {ShortOverview, ShortOverviewSection} from '@shared/components/short-overview/short-overview';
import {formatDateToDDMMYYYY} from '@shared/util/date';
import {PartnerDto, PartnerSummaryDto} from '../../../api';
import {MfeContent} from '@shared/components/basic/mfe-content/mfe-content';
import {PartnerSubnavbar} from '@partner/src/app/components/basic/partner-subnavbar/partner-subnavbar';
import {PartnerViewStateService} from '../../../services/partner-view-state.service';
import {PartnerSaveValidationService} from '../../../services/partner-save-validation.service';
import {showSnackbar} from 'projects/shared/util/snackbar.util';

@Component({
  selector: 'partner-view-partner',
  imports: [
    TranslocoPipe,
    MatTabsModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    ContactTab,
    AddressTab,
    InfoTab,
    EngagementTab,
    GroupTab,
    BankTab,
    AdministrationTab,
    AdvisorTab,
    ShortOverview,
    MfeContent,
    PartnerSubnavbar,
  ],
  providers: [PartnerViewStateService],
  templateUrl: './view-partner.html',
  styleUrl: './view-partner.scss',
})
export class ViewPartner implements OnInit {
  readonly isEditMode: WritableSignal<boolean>
  readonly partner: Signal<PartnerDto | null>;
  readonly partnerSummary: Signal<PartnerSummaryDto | null>;
  readonly displayPartner: Signal<PartnerDto>;
  readonly shortOverviewSections: Signal<ShortOverviewSection[]>;

  private readonly viewState = inject(PartnerViewStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly saveValidationService = inject(PartnerSaveValidationService);
  private readonly snackbar = showSnackbar();

  constructor() {
    this.isEditMode = this.viewState.isEditMode;
    this.partner = this.viewState.partner;
    this.partnerSummary = this.viewState.partnerSummary;
    this.displayPartner = this.viewState.displayPartner;
    this.shortOverviewSections = computed<ShortOverviewSection[]>(() => {
      const partnerData = this.partner();
      const summaryData = this.partnerSummary();
      if (!partnerData) return [];

      return [
        {
          titleTranslationKey: 'partner.view.shortOverview.sections.responsibility',
          fields: [
            {
              labelTranslationKey: 'partner.view.shortOverview.advisor',
              value: summaryData?.advisor,
            },
            {
              labelTranslationKey: 'partner.view.shortOverview.branchNumber',
              value: summaryData?.branchDesignation,
            },
            {
              labelTranslationKey: 'partner.view.shortOverview.modificationDate',
              value: summaryData?.lastChangeTimestamp ?
                formatDateToDDMMYYYY(summaryData.lastChangeTimestamp) : undefined,
            },
            {
              labelTranslationKey: 'partner.view.shortOverview.modifierId',
              value: summaryData?.lastChangeFullName ||
                (summaryData?.lastChangeFirstName && summaryData?.lastChangeLastName
                  ? `${summaryData.lastChangeFirstName} ${summaryData.lastChangeLastName}`
                  : undefined),
            },
            {
              labelTranslationKey: 'partner.view.shortOverview.customerSince',
              value: summaryData?.creationTimestamp ? formatDateToDDMMYYYY(summaryData.creationTimestamp) : undefined,
            },
          ],
        },
      ];
    });
  }

  ngOnInit(): void {
    const partnerId = this.route.snapshot.paramMap.get('partnerId');
    this.viewState.initializeFromUrl(partnerId ? +partnerId : undefined);
  }

  closePartnerDetails(): void {
    this.viewState.closePartnerDetails();
  }

  enableEditMode(): void {
    this.viewState.enableEditMode();
  }

  savePartner(): void {
    // Get the current editable partner data
    const currentPartner = this.viewState.editablePartner();
    if (!currentPartner) {
      return;
    }

    // Final validation before save (backup security layer)
    const validationResult = this.saveValidationService.validateBeforeSave(currentPartner);

    if (validationResult.isValid) {
      this.viewState.savePartner();
    } else {
      this.snackbar.showValidationError();
    }
  }

  cancelEdit(): void {
    this.viewState.cancelEdit();
  }

  // Tab event handlers - delegate to service
  onAdministrationTabChanged(adminData: Partial<PartnerDto>): void {
    this.viewState.mergeTabData('administration', adminData);
  }

  onAddressTabChanged(addressData: Partial<PartnerDto>): void {
    this.viewState.mergeTabData('address', addressData);
  }

  onContactTabChanged(contactData: Partial<PartnerDto>): void {
    this.viewState.mergeTabData('contact', contactData);
  }

  onInfoTabChanged(infoData: Partial<PartnerDto>): void {
    this.viewState.mergeTabData('info', infoData);
  }

  onEngagementTabChanged(engagementData: Partial<PartnerDto>): void {
    this.viewState.mergeTabData('engagement', engagementData);
  }

  onGroupTabChanged(groupData: Partial<PartnerDto>): void {
    this.viewState.mergeTabData('group', groupData);
  }

  onBankTabChanged(bankData: Partial<PartnerDto>): void {
    this.viewState.mergeTabData('bank', bankData);
  }

  onAdvisorTabChanged(advisorData: Partial<PartnerDto>): void {
    this.viewState.mergeTabData('advisor', advisorData);
  }
}

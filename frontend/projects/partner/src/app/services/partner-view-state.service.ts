import {computed, effect, inject, Injectable, signal, Signal} from '@angular/core';
import {Location} from '@angular/common';
import {ActivatedRoute, Router} from '@angular/router';
import {PartnerDto, PartnerGatewayService, PartnerSummaryDto} from '../api';
import {PartnerDetailService} from './partner-detail.service';
import {PartnerDataMergeService} from './partner-data-merge.service';
import {showSnackbar} from 'projects/shared/util/snackbar.util';
import {TranslocoService} from '@jsverse/transloco';

@Injectable()
export class PartnerViewStateService {
  readonly isEditMode = signal<boolean>(false);
  readonly editablePartner = signal<PartnerDto | null>(null);
  readonly partner: Signal<PartnerDto | null>;
  readonly partnerSummary: Signal<PartnerSummaryDto | null>;
  readonly displayPartner: Signal<PartnerDto>;
  readonly isNewPartner = computed(() => !this.partner()?.partnerNumber);
  private readonly partnerGatewayService = inject(PartnerGatewayService);
  private readonly partnerDataMergeService = inject(PartnerDataMergeService);
  private readonly partnerDetailService = inject(PartnerDetailService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly snackbar = showSnackbar();
  private readonly transloco = inject(TranslocoService);

  private readonly emptyPartnerTemplate: Readonly<PartnerDto> = Object.freeze({
    creditFlag: false,
    leasingFlag: false,
    factoringFlag: false,
    commercialFlag: false,
    recordingFlag: false,
    deletionFlag: false,
    schufaFlag: false,
    baselFlag: false,
    insolvencyFlag: false,
    freelancerFlag: false,
    craftsmanFlag: false,
    nonProfitFlag: false,
    privateParticipationFlag: false,
    riskFlag: true,
    contactPersons: [],
    groupAssignments: [],
    bankConnections: [],
  });

  constructor() {
    this.partner = this.partnerDetailService.partner;
    this.partnerSummary = this.partnerDetailService.summary;
    this.displayPartner = computed(() => {
      if (this.isEditMode()) {
        return this.editablePartner() || this.partner() || this.emptyPartnerTemplate;
      }
      return this.partner() || this.emptyPartnerTemplate;
    });

    // Automatically enable edit mode when creating a new partner
    effect(() => {
      const partner = this.partner();
      const isVisible = this.partnerDetailService.isVisible();

      if (isVisible && !partner) {
        this.enableEditMode();
      }
    });
  }

  initializeFromUrl(partnerId?: number): void {
    if (partnerId && !this.partner()) {
      this.loadPartnerFromUrl(partnerId);
    } else if (!partnerId) {
      this.partnerDetailService.createNewPartner();
    }
  }

  enableEditMode(): void {
    this.isEditMode.set(true);
    const currentPartner = this.partner();
    if (currentPartner) {
      this.editablePartner.set(structuredClone(currentPartner));
    } else {
      this.editablePartner.set(structuredClone(this.emptyPartnerTemplate));
    }
  }

  cancelEdit(): void {
    this.isEditMode.set(false);
    this.editablePartner.set(null);
  }

  closePartnerDetails(): void {
    this.isEditMode.set(false);
    this.editablePartner.set(null);
    this.partnerDetailService.hidePartnerDetails();
    this.navigateBack();
  }

  savePartner(): void {
    const partnerData = this.editablePartner();
    if (!partnerData) return;
    const isCreatingNew = this.isNewPartner();

    this.partnerGatewayService.savePartner(partnerData).subscribe({
      next: (savedPartner: PartnerDto) => {
        // Update the displayed partner with the complete returned DTO
        // Always refresh partner details to ensure summary is reloaded
        if (savedPartner.partnerNumber) {
          this.partnerDetailService.showPartnerDetails(savedPartner);
        } else {
          this.partnerDetailService.setPartner(savedPartner);
        }

        this.isEditMode.set(false);
        this.editablePartner.set(null);

        // TODO Fix in FIT-135 - wir wollen im Frontend immer nur Validierungsmeldungen anzeigen,
        //  ein Snackbarfehler (wird durch error message directive ausgelöst) spricht für einen Backendfehler
        const successKey = isCreatingNew ? 'messages.partner.createSuccess' : 'messages.partner.updateSuccess';
        const successMessage = this.transloco.translate(successKey);
        this.snackbar.showSuccess(successMessage, {autoClose: true, duration: 3000});
      },
      error: () => {
        // TODO Fix in FIT-135 - wir wollen im Frontend immer nur Validierungsmeldungen anzeigen,
        //  ein Snackbarfehler (wird durch error message directive ausgelöst) spricht für einen Backendfehler
        const errorKey = isCreatingNew ? 'messages.partner.createError' : 'messages.partner.updateError';
        const errorMessage = this.transloco.translate(errorKey);
        this.snackbar.showError(errorMessage, {autoClose: true, duration: 5000});
      },
    });
  }

  /**
   * Merge data from any tab into the editable partner
   */
  mergeTabData(tabName: string, tabData: Partial<PartnerDto>): void {
    const currentPartner = this.editablePartner();
    if (!currentPartner || !tabData) {
      return;
    }

    try {
      const mergedPartner = this.partnerDataMergeService.mergePartnerData(
        currentPartner,
        tabData,
      );
      this.editablePartner.set(mergedPartner);
    } catch (error) {
      throw new Error(`Failed to merge ${tabName} data: ${error}`);
    }
  }

  private navigateBack(): void {
    const searchPath = this.router.url.split('?')[0].replace(/\/partner\/view.*/, '/partner/search');
    this.router.navigate([searchPath], {
      queryParamsHandling: 'preserve',
    });
  }

  private loadPartnerFromUrl(partnerId: number): void {
    this.partnerGatewayService.findByPartnerNumber(partnerId).subscribe({
      next: (partnerDetails) => {
        if (partnerDetails) {
          this.partnerDetailService.showPartnerDetails(partnerDetails);
        }
      },
      error: () => {
        this.navigateBack();
      },
    });
  }
}

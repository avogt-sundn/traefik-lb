import {inject, Injectable, Signal, signal} from '@angular/core';
import {PartnerDto, PartnerGatewayService, PartnerSummaryDto} from '../api';

@Injectable({
  providedIn: 'root',
})
export class PartnerDetailService {
  readonly partner: Signal<PartnerDto | null>
  readonly summary: Signal<PartnerSummaryDto | null>;
  readonly isVisible: Signal<boolean>

  private readonly partnerGatewayService = inject(PartnerGatewayService);
  private readonly selectedPartner = signal<PartnerDto | null>(null);
  private readonly partnerSummary = signal<PartnerSummaryDto | null>(null);
  private readonly isViewingPartner = signal<boolean>(false);

  constructor() {
    this.partner = this.selectedPartner.asReadonly();
    this.summary = this.partnerSummary.asReadonly();
    this.isVisible = this.isViewingPartner.asReadonly();
  }

  /**
   * Set the selected partner and show the detail view
   */
  showPartnerDetails(partner: PartnerDto): void {
    this.selectedPartner.set(partner);
    this.isViewingPartner.set(true);

    if (partner.partnerNumber) {
      this.partnerGatewayService.getPartnerSummary(partner.partnerNumber).subscribe({
        next: (summary) => {
          this.partnerSummary.set(summary);
        },
        error: () => {
          this.partnerSummary.set(null);
          // TODO Fix in FIT-135 - wir wollen im Frontend immer nur Validierungsmeldungen anzeigen,
          //  ein Snackbarfehler (wird durch error message directive ausgelöst) spricht für einen Backendfehler
          //throw new Error(`Error loading partner summary: ${error}`);
        },
      });
    }
  }

  /**
   * Hide the partner detail view and clear the selected partner
   */
  hidePartnerDetails(): void {
    this.isViewingPartner.set(false);
    this.selectedPartner.set(null);
    this.partnerSummary.set(null);
  }

  /**
   * Update the current partner with new data (e.g., after save operation)
   */
  setPartner(partner: PartnerDto): void {
    this.selectedPartner.set(partner);
  }

  /**
   * Create a new partner by clearing current partner and showing the detail view
   */
  createNewPartner(): void {
    this.selectedPartner.set(null);
    this.partnerSummary.set(null);
    this.isViewingPartner.set(true);
  }

}

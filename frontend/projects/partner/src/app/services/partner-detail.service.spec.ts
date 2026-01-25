import {TestBed} from '@angular/core/testing';
import {of, throwError} from 'rxjs';
import {PartnerGatewayService, PartnerSummaryDto} from '../api';
import {PartnerDetailService} from './partner-detail.service';
import {PartnerDto} from '../api';
import {Mock} from 'vitest';

describe('PartnerDetailService', () => {
  let service: PartnerDetailService;
  let mockPartnerGatewayService: { getPartnerSummary: Mock };

  const mockPartner: PartnerDto = {partnerNumber: 1234};
  const mockSummary: PartnerSummaryDto = {
    partnerNumber: 1234,
    advisor: "Max Mustermann",
  };

  beforeEach(() => {
    mockPartnerGatewayService = {
      getPartnerSummary: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        PartnerDetailService,
        {provide: PartnerGatewayService, useValue: mockPartnerGatewayService},
      ],
    });

    service = TestBed.inject(PartnerDetailService);
  });

  describe('showPartnerDetails', () => {
    it('should get details of partner and save in partnerSummary', () => {
      // Given
      vi.fn(mockPartnerGatewayService.getPartnerSummary).mockReturnValue(of(mockSummary));

      // When
      service.showPartnerDetails(mockPartner);

      // Then
      expect(service.partner()).toEqual(mockPartner);
      expect(service.isVisible()).toBeTruthy();
      expect(mockPartnerGatewayService.getPartnerSummary).toHaveBeenCalledWith(1234);
      expect(service.summary()).toEqual(mockSummary);
    });

    it('should handle error when fetching partner summary fails', () => {
      // Given
      const mockError = new Error('Network error');
      vi.fn(mockPartnerGatewayService.getPartnerSummary).mockReturnValue(throwError(() => mockError));

      // When
      service.showPartnerDetails(mockPartner);

      // Then
      expect(service.partner()).toEqual(mockPartner);
      expect(service.isVisible()).toBeTruthy();
      expect(mockPartnerGatewayService.getPartnerSummary).toHaveBeenCalledWith(1234);
      expect(service.summary()).toBeNull();
    });
  });

  describe('hidePartnerDetails', () => {
    it('should hide partner detail view and clear all partner data', () => {
      // Given
      vi.fn(mockPartnerGatewayService.getPartnerSummary).mockReturnValue(of(mockSummary));
      service.showPartnerDetails(mockPartner);

      // When
      service.hidePartnerDetails();

      // Then
      expect(service.isVisible()).toBeFalsy();
      expect(service.partner()).toBeNull();
      expect(service.summary()).toBeNull();
    });
  });

  describe('setPartner', () => {
    it('should update the current partner with new data', () => {
      // Given
      const updatedPartner: PartnerDto = {partnerNumber: 5678};
      vi.fn(mockPartnerGatewayService.getPartnerSummary).mockReturnValue(of(mockSummary));
      service.showPartnerDetails(mockPartner);

      // When
      service.setPartner(updatedPartner);

      // Then
      expect(service.partner()).toEqual(updatedPartner);
      expect(service.isVisible()).toBeTruthy();
    });
  });

  describe('createNewPartner', () => {
    it('should clear partner data and show detail view for new partner creation', () => {
      // Given
      vi.fn(mockPartnerGatewayService.getPartnerSummary).mockReturnValue(of(mockSummary));
      service.showPartnerDetails(mockPartner);

      // When
      service.createNewPartner();

      // Then
      expect(service.partner()).toBeNull();
      expect(service.summary()).toBeNull();
      expect(service.isVisible()).toBeTruthy();
    });
  });
});

import {inject, Injectable} from '@angular/core';
import {firstValueFrom} from 'rxjs';
import {ContractSearchDto, ContractSearchResponse, LoanGatewayService} from '../api';

@Injectable({
  providedIn: 'root',
})
export class SearchLoanService {
  private readonly loanGatewayService = inject(LoanGatewayService)

  async searchLoans(searchCriteria: ContractSearchDto): Promise<ContractSearchResponse> {
    try {
      return await firstValueFrom(
        this.loanGatewayService.searchContracts(
          "BDK", //TODO FIT-574: aktuell gewählten Mandant übergeben
          searchCriteria.contractNumber,
          searchCriteria.applicationNumber,
          searchCriteria.partnerNumber,
          searchCriteria.firstName,
          searchCriteria.name,
          searchCriteria.dateOfBirth,
          searchCriteria.postalCode,
          searchCriteria.city,
          searchCriteria.vehicleLicensePlate,
        ),
      );
    } catch (error) {
      throw new Error(`Error searching loans: ${error}`)
    }
  }
}

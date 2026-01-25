import {inject, Injectable} from '@angular/core';
import {firstValueFrom} from 'rxjs';

import {TreetableBaseService} from '../../components/basic/treetable/treetable-base.service';
import {TreeNode} from '../../components/basic/treetable/treetable.types';
import {PartnerGatewayService, PartnerGroupSearchDto} from '../../api';

export interface SearchCriteria {
  partnerNr?: string;
  alphacode?: string;
  name?: string;
  street?: string;
  postalCode?: string;
  city?: string;
}

export enum PartnerType {
  InternerVerbund = 'INTERNAL',
  NormalerVerbund = 'EXTERNAL',
  Partner = 'PARTNER'
}

export function getPartnerType(dto: PartnerGroupSearchDto): PartnerType {
  if (dto.type === 'P') {
    return PartnerType.Partner;
  }
  if (dto.type === 'V') {
    if (dto.groupType === 'INTERN') {
      return PartnerType.InternerVerbund;
    } else {
      return PartnerType.NormalerVerbund;
    }
  }
  return PartnerType.Partner;
}


@Injectable({
  providedIn: 'root',
})
export class PartnerTreetableService extends TreetableBaseService<PartnerGroupSearchDto> {
  private readonly partnerGatewayService = inject(PartnerGatewayService);
  private searchResults: PartnerGroupSearchDto[] = [];
  private searchCriteria: SearchCriteria = {};

  /**
   * Reset the service state
   */
  reset(): void {
    this.searchResults = [];
    this.searchCriteria = {};
  }

  /**
   * Initialize with search criteria and fetch data from backend
   */
  async initializeWithSearch(criteria: SearchCriteria): Promise<void> {
    // Reset state before new search
    this.reset();
    this.searchCriteria = criteria;

    try {
      const response = await firstValueFrom(
        this.partnerGatewayService.searchPartnersAndGroups(
          criteria.partnerNr,
          criteria.alphacode,
          criteria.name,
          criteria.postalCode,
          criteria.city,
          criteria.street,
        ),
      );

      this.searchResults = response.partners || [];
    } catch (error) {
      this.searchResults = [];
      throw new Error(`Error searching partners and groups: ${error}`);
    }
  }

  /**
   * Get initial tree with search results (collapsed)
   */
  async getInitialTree(): Promise<TreeNode<PartnerGroupSearchDto>[]> {
    return this.searchResults.map(dto => ({
      data: dto,
      // Groups have children (empty array = expandable), partners don't
      // 'V' = Verbund (Group), 'P' = Partner
      children: dto.type === 'V' ? [] : undefined,
    }));
  }

  /**
   * Get children for a group node (lazy loading)
   */
  async getChildren(nodeData: PartnerGroupSearchDto): Promise<TreeNode<PartnerGroupSearchDto>[]> {
    // 'V' = Verbund (Group)
    if (nodeData.type !== 'V' || !nodeData.groupNumber) {
      return [];
    }

    try {
      const response = await firstValueFrom(
        this.partnerGatewayService.getGroupMembers(nodeData.groupNumber.toString()),
      );

      return (response.members || []).map(member => ({
        data: {
          partnerNumber: member.partnerNumber,
          groupNumber: member.groupNumber,
          type: member.type || 'P',
          alphaCode: member.alphaCode,
          name1: member.name1,
          name2: member.name2,
          name3: member.name3,
          groupType: undefined,
        },
        // If member is also a group, it can have children
        // 'V' = Verbund (Group)
        children: member.type === 'V' ? [] : undefined,
      }));
    } catch (error) {
      throw new Error(`Error loading group members: ${error}`);
    }
  }

}

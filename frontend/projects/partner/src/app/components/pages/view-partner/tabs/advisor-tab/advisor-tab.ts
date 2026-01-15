/* eslint-disable max-lines */
// TODO FIT-218: fix linting error
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  InputSignal,
  OnInit,
  output,
  OutputEmitterRef,
  signal,
  viewChild,
} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatCardModule} from "@angular/material/card";
import {MatButtonModule} from '@angular/material/button';
import {MatIconModule} from '@angular/material/icon';
import {MatTabsModule} from '@angular/material/tabs';
import {CypressIdDirective} from '@shared/directives/cypress-id';
import {TranslocoPipe} from '@jsverse/transloco';
import {PartnerDto, SalesAreaFocusDto} from '../../../../../api';
import {
  ValidatedFormField,
} from '@shared/components/basic/validated-form-field/validated-form-field';
import {Treetable} from '../../../../basic/treetable/treetable';
import {FlatNode} from '../../../../basic/treetable/treetable.types';
import {
  AdvisorTreeNodeData,
  AdvisorTreetableService,
} from '../../../../../services/advisor-treetable-service/advisor-treetable.service';
import {InfoPanel} from '@shared/components/basic/info-panel/info-panel';
import {PartnerAdvisorService} from '../../../../../services/partner-advisor.service';

@Component({
  selector: 'partner-advisor-tab',
  imports: [
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    ValidatedFormField,
    CypressIdDirective,
    Treetable,
    InfoPanel,
    TranslocoPipe,
  ],
  templateUrl: './advisor-tab.html',
  styleUrl: './advisor-tab.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [AdvisorTreetableService],
})
export class AdvisorTab implements OnInit {
  partner: InputSignal<PartnerDto> = input.required<PartnerDto>();
  isEditMode: InputSignal<boolean> = input<boolean>(false);

  partnerTabChanged: OutputEmitterRef<Partial<PartnerDto>> = output<Partial<PartnerDto>>();

  readonly advisorTreetableService = inject(AdvisorTreetableService);
  readonly isTreeViewLoading = signal<boolean>(false);
  readonly selectedAdvisorFromTree = signal<string>('');
  readonly selectedBranchFromTree = signal<string>('');
  readonly infoPanelMessage = signal<string>('');
  readonly treeIconConfigs = computed(() => this.partnerAdvisorService.treeIconConfigs);
  readonly treeDisplayedColumns = computed(() => this.partnerAdvisorService.getTreeDisplayedColumns());
  private readonly treetableComponent = viewChild<Treetable<AdvisorTreeNodeData>>(Treetable);
  private readonly partnerAdvisorService = inject(PartnerAdvisorService);

  constructor() {
    effect(() => {
      const partner = this.partner();
      const advisor = partner?.advisor;

      if (advisor && this.advisorTreetableService.advisorsData?.length > 0) {
        this.updateSelectedAdvisorDisplay(advisor);
      }
    });
  }

  ngOnInit() {
    this.initializeAdvisorTree();
  }

  // Assisted by AI
  async initializeAdvisorTree(): Promise<void> {
    this.isTreeViewLoading.set(true);
    try {
      await this.advisorTreetableService.initializeWithSalesAreaData();
    } catch {
      this.infoPanelMessage.set('partner.view.advisor.messages.loadingError');
    } finally {
      this.isTreeViewLoading.set(false);
      const currentAdvisor = this.partner().advisor;
      if (currentAdvisor) {
        this.updateSelectedAdvisorDisplay(currentAdvisor);
      }
    }
  }

  // Assisted by AI
  async onTreeNodeClick(node: FlatNode<AdvisorTreeNodeData>): Promise<void> {
    // Handle expandable branch nodes
    if (node.data.type === 'branch' && node.expandable) {
      const treetable = this.treetableComponent();
      if (treetable) {
        await treetable.toggleNode(node);
      }
    }

    const selectionResult = this.partnerAdvisorService.shouldEmitAdvisorChange(
      node.data.type,
      node.data.advisorNumber,
      node.data.isActive,
      this.isEditMode(),
    );

    if (selectionResult.shouldEmitChange && selectionResult.advisorNumber) {
      this.updateSelectedAdvisorDisplay(selectionResult.advisorNumber);
      this.partnerTabChanged.emit({advisor: selectionResult.advisorNumber});
    } else if (node.data.type === 'advisor' && node.data.advisorNumber) {
      this.updateSelectedAdvisorDisplay(node.data.advisorNumber.trim());
    }
  }

  // Assisted by AI
  async onAssignByPostalCode(): Promise<void> {
    const partner = this.partner();
    this.infoPanelMessage.set('');
    // Validate permissions using service
    const validationError = this.partnerAdvisorService.validateAssignmentPermissions(
      this.isEditMode(),
      this.partnerAdvisorService.getMainAddressPostalCode(partner),
    );
    if (validationError) {
      this.infoPanelMessage.set(validationError);
      return;
    }

    // Attempt assignment using service
    const result = await this.partnerAdvisorService.assignAdvisorByPostalCode(partner);
    if (!result.success) {
      this.infoPanelMessage.set(result.errorMessage!);
      return;
    }

    // Find advisor and update
    const advisor = this.advisorTreetableService.findAdvisorByAreaNumber(result.advisorNumber!);
    if (advisor?.advisorNumber) {
      const trimmedAdvisorNumber = advisor.advisorNumber.trim();
      this.partnerTabChanged.emit({advisor: trimmedAdvisorNumber});
      this.updateSelectedAdvisorDisplay(trimmedAdvisorNumber);

      // Expand the branch containing this advisor
      const treetable = this.treetableComponent();
      if (treetable) {
        await this.expandBranchForAdvisor(advisor, treetable);
      }
    } else {
      this.infoPanelMessage.set('partner.view.advisor.messages.noAdvisorForArea');
    }
  }

  // Assisted by AI
  private updateSelectedAdvisorDisplay(advisorNumber: string): void {
    const displayInfo = this.partnerAdvisorService.createAdvisorDisplayInfo(
      advisorNumber,
      this.advisorTreetableService,
    );
    this.selectedAdvisorFromTree.set(displayInfo.advisorDisplay);
    this.selectedBranchFromTree.set(displayInfo.branchDisplay);
  }

  // Assisted by AI
  private async expandBranchForAdvisor(
    advisor: SalesAreaFocusDto,
    treetable: Treetable<AdvisorTreeNodeData>): Promise<void> {
    const branchNumber = advisor.branchNumber;
    if (!branchNumber) {
      return;
    }
    await this.collapseAllBranches(treetable);
    await this.expandSpecificBranch(treetable, branchNumber);
  }

  // Assisted by AI
  private async collapseAllBranches(treetable: Treetable<AdvisorTreeNodeData>): Promise<void> {
    for (const node of treetable.dataSource.data) {
      if (node.expandable && treetable.isExpanded(node)) {
        await treetable.toggleNode(node);
      }
    }
  }

  // Assisted by AI
  private async expandSpecificBranch(treetable: Treetable<AdvisorTreeNodeData>, branchNumber: number): Promise<void> {
    const branchFlatNode = treetable.dataSource.data.find(node =>
      node.data.type === 'branch' && node.data.branchNumber === branchNumber,
    );
    if (branchFlatNode && branchFlatNode.expandable && !treetable.isExpanded(branchFlatNode)) {
      await treetable.toggleNode(branchFlatNode);
    }
  }
}

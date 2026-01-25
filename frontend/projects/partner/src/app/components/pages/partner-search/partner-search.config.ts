import {TranslocoService} from '@jsverse/transloco';
import {PartnerGroupSearchDto} from '@partner/src/app/api';
import {ColumnIconConfig} from '@partner/src/app/components/basic/treetable/treetable.types';
import {
  getPartnerType,
  PartnerType,
} from '@partner/src/app/services/partner-treetable-service/partner-treetable.service';

type SearchFormField = 'partnerNr' | 'alphacode' | 'name' | 'street' | 'postalCode' | 'city';

export class PartnerSearchConfig {
  static readonly SEARCH_FORM_FIELDS: readonly SearchFormField[] = [
    'partnerNr',
    'alphacode',
    'name',
    'street',
    'postalCode',
    'city',
  ] as const;

  static readonly PARTNER_ROUTES = {
    VIEW: '../view',
    RELATIVE: true,
  } as const;

  static readonly SEARCH_DEFAULTS = {
    searchPerformed: false,
    hasResults: false,
    partnerTreetableService: null,
  } as const;

  constructor(private translocoService: TranslocoService) {}

  get partnerDisplayedColumns() {
    return [
      {key: 'type', label: ""},
      {key: 'groupNumber', label: this.translocoService.translate('partner.search.table.columns.groupNumber')},
      {key: 'partnerNumber', label: this.translocoService.translate('partner.search.table.columns.partnerNumber')},
      {key: 'alphaCode', label: this.translocoService.translate('partner.search.table.columns.alphacode')},
      {key: 'name', label: this.translocoService.translate('forms.fields.name')},
    ];
  }

  get partnerIconConfigs(): ColumnIconConfig<PartnerGroupSearchDto>[] {
    return [
      {
        columnKey: 'type',
        valueFormatter: (dto) => getPartnerType(dto),
        iconMap: new Map([
          [
            PartnerType.InternerVerbund,
            'groups',
          ],
          [
            PartnerType.NormalerVerbund,
            'groups',
          ],
          [
            PartnerType.Partner,
            'person',
          ],
        ]),
        colorMap: new Map([
          [
            PartnerType.InternerVerbund,
            'var(--core-finance-icon-primary)',
          ],
          [
            PartnerType.NormalerVerbund,
            'var(--core-finance-icon-secondary)',
          ],
          [
            PartnerType.Partner,
            'var(--core-finance-icon-tertiary)',
          ],
        ]),
      },
    ];
  }
}

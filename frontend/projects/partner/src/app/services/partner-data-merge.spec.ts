import {
  AddressDto,
  BankConnectionDto,
  ContactPersonDto,
  GroupAssignmentDto,
  PartnerDto,
  TelecommunicationDto,
} from '@partner/src/app/api';
import {PartnerDataMergeService} from './partner-data-merge.service';

const createPartnerDto = (overrides?: Partial<PartnerDto>): PartnerDto => ({
  partnerNumber: 12345,
  creditFlag: false,
  leasingFlag: false,
  areaPostalCode: '1111',
  contactPersons: [],
  bankConnections: [],
  groupAssignments: [],
  ...overrides,
});

const createContactPersonDto = (overrides?: Partial<ContactPersonDto>): ContactPersonDto => ({
  partnerFunctionId: 1,
  personId: 1,
  name1: 'Doe',
  alphaCode: 'ABCD',
  addresses: [],
  ...overrides,
});

const createGroupAssignmentDto = (overrides?: Partial<GroupAssignmentDto>): GroupAssignmentDto => ({
  groupId: 1,
  advisorNumber: '12345',
  ...overrides,
});

const createBankConnectionDto = (overrides?: Partial<BankConnectionDto>): BankConnectionDto => ({
  sequenceNumber: 1,
  accountNumber: '11111111',
  ...overrides,
});

const createAddressDto = (overrides?: Partial<AddressDto>): AddressDto => ({
  addressTypeId: 1,
  postalCode: '11111',
  street: 'Test street',
  city: 'Test location',
  houseNumber: '2',
  ...overrides,
});

const createTelecommunicationDto = (overrides?: Partial<TelecommunicationDto>): TelecommunicationDto => ({
  telecommunicationId: 1,
  telecommunicationType: 1,
  countryCode: '+49',
  areaCode: '30',
  phoneNumber: '12345678',
  ...overrides,
});

// Assisted by AI
describe('PartnerDataMergeService', () => {
  let service: PartnerDataMergeService;

  beforeEach(() => {
    service = new PartnerDataMergeService();
  });

  describe('mergePartnerData - properties', () => {

    it('should preserve unchanged properties', () => {
      // GIVEN: Partner with multiple properties
      const currentPartner = createPartnerDto({
        creditFlag: false,
      });
      const updates: Partial<PartnerDto> = {
        creditFlag: true,
      };

      // WHEN: Updating only one property
      const result = service.mergePartnerData(currentPartner, updates);

      // THEN: Other properties remain unchanged
      expect(result.partnerNumber).toBe(12345);
      expect(result.areaPostalCode).toBe('1111');
      expect(result.leasingFlag).toBe(false);
    });

    it('should merge new values of properties', () => {
      // GIVEN: Partner with initial values
      const currentPartner = createPartnerDto({
        creditFlag: false,
        advisor: 'OldID',
        branchNumber: 100,
        areaPostalCode: '1111',
      });
      const updates: Partial<PartnerDto> = {
        creditFlag: true,
        advisor: 'NewID',
        branchNumber: 102,
        areaPostalCode: '3333',
      };

      // WHEN: Merging multiple updates
      const result = service.mergePartnerData(currentPartner, updates);

      // THEN: All updates should be applied
      expect(result.creditFlag).toBe(true);
      expect(result.advisor).toBe('NewID');
      expect(result.areaPostalCode).toBe('3333');
      expect(result.branchNumber).toBe(102);
    });
  });

  describe('mergePartnerData - array properties', () => {
    describe('contact persons', () => {
      it('should merge contact person by partnerFunctionId', () => {

        // GIVEN: Partner with existing contact person
        const existingContact = createContactPersonDto({
          partnerFunctionId: 1,
          firstName: 'John',
          addresses: [],
        });
        const currentPartner = createPartnerDto({
          contactPersons: [existingContact],
        });

        const updatedContact = createContactPersonDto({
          partnerFunctionId: 1,
          firstName: 'Jane',
          addresses: [],
        });
        const updates: Partial<PartnerDto> = {
          contactPersons: [updatedContact],
        };

        // WHEN: Merging with same partnerFunctionId
        const result = service.mergePartnerData(currentPartner, updates);

        // THEN: Should update existing contact person, not add new one
        expect(result.contactPersons).toHaveLength(1);
        expect(result.contactPersons).toEqual(expect.arrayContaining(
          [expect.objectContaining({firstName: 'Jane', partnerFunctionId: 1})],
        ));
      });

      it('should replace contact persons with updates (realistic UI behavior)', () => {
        // GIVEN: Partner with multiple contact persons
        const currentPartner = createPartnerDto({
          contactPersons: [
            createContactPersonDto({
              partnerFunctionId: 1,
              firstName: 'John',
            }),
            createContactPersonDto({
              partnerFunctionId: 2,
              firstName: 'Jane',
            }),
          ],
        });

        // WHEN: UI sends updates for only the visible/editable contact person
        // (e.g., only partnerFunctionId: 2 is shown in the current tab/table)
        const updatedContact = createContactPersonDto({
          partnerFunctionId: 2,
          firstName: 'Jane Updated',
        });

        const updates: Partial<PartnerDto> = {
          contactPersons: [updatedContact],
        };

        const result = service.mergePartnerData(currentPartner, updates);

        // THEN: Should only contain the updated visible contact person
        // Non-visible contacts are preserved by the main merge logic (...currentPartner spread)
        expect(result.contactPersons).toHaveLength(1);
        expect(result.contactPersons)
          .toEqual([expect.objectContaining({firstName: 'Jane Updated', partnerFunctionId: 2})]);
      });

      it('should handle empty contact persons array', () => {
        // GIVEN: Partner without contact persons
        const currentPartner = createPartnerDto({
          contactPersons: [],
        });
        const updates: Partial<PartnerDto> = {
          contactPersons: [createContactPersonDto()],
        };

        // WHEN: Adding first contact person
        const result = service.mergePartnerData(currentPartner, updates);

        // THEN: Should contain the new contact
        expect(result.contactPersons).toHaveLength(1);
      });


      it('should preserve contact persons when updates do not include them', () => {
        // GIVEN: Partner with contact persons
        const currentPartner = createPartnerDto({
          contactPersons: [
            createContactPersonDto({partnerFunctionId: 1}),
            createContactPersonDto({partnerFunctionId: 2}),
          ],
        });
        const updates: Partial<PartnerDto> = {
          creditFlag: true,
        };

        // WHEN: Updating other properties
        const result = service.mergePartnerData(currentPartner, updates);

        // THEN: Contact persons should remain unchanged
        expect(result.contactPersons).toHaveLength(2);
        expect(result.contactPersons).toEqual(expect.arrayContaining(
          [
            expect.objectContaining({partnerFunctionId: 1}),
            expect.objectContaining({partnerFunctionId: 2}),
          ],
        ));
      });

      it('should handle multiple contact person updates at once', () => {
        // GIVEN: Partner with existing contact persons
        const currentPartner = createPartnerDto({
          contactPersons: [
            createContactPersonDto({partnerFunctionId: 1, firstName: 'John'}),
            createContactPersonDto({partnerFunctionId: 2, firstName: 'Jane'}),
            createContactPersonDto({partnerFunctionId: 3, firstName: 'Jim'}),
          ],
        });

        // WHEN: UI sends updates for multiple visible/editable contact persons
        // (e.g., a table showing partnerFunctionId 1 and 3, where user updated both)
        const updates: Partial<PartnerDto> = {
          contactPersons: [
            createContactPersonDto({partnerFunctionId: 1, firstName: 'Jack'}), // Updated
            createContactPersonDto({partnerFunctionId: 3, firstName: 'Jill'}), // Updated
          ],
        };

        const result = service.mergePartnerData(currentPartner, updates);

        // THEN: Should only contain the updated visible contact persons
        // Jane (partnerFunctionId: 2) was not visible/editable, so not included in updates
        expect(result.contactPersons).toHaveLength(2);
        expect(result.contactPersons).toEqual(expect.arrayContaining(
          [
            expect.objectContaining({firstName: 'Jack', partnerFunctionId: 1}),
            expect.objectContaining({firstName: 'Jill', partnerFunctionId: 3}),
          ],
        ));
      });

      describe('addresses', () => {
        it('should merge addresses within contact persons by addressTypeId', () => {
          // GIVEN: Contact person with existing address
          const existingAddress = createAddressDto({
            addressTypeId: 1,
            street: 'OldStreet',
          });
          const existingContact = createContactPersonDto({
            partnerFunctionId: 1,
            addresses: [existingAddress],
          });
          const currentPartner = createPartnerDto({
            contactPersons: [existingContact],
          });

          const updatedAddress = createAddressDto({
            addressTypeId: 1,
            street: 'NewStreet',
          });
          const updatedContact = createContactPersonDto({
            partnerFunctionId: 1,
            addresses: [updatedAddress],
          });
          const updates: Partial<PartnerDto> = {
            contactPersons: [updatedContact],
          };

          // WHEN: Merging address with same addressTypeId
          const result = service.mergePartnerData(currentPartner, updates);

          // THEN: Should update address, not add new one
          expect(result.contactPersons).toEqual(expect.arrayContaining(
            [
              expect.objectContaining(
                {
                  addresses: expect.arrayContaining([expect.objectContaining({street: 'NewStreet', addressTypeId: 1})]),
                },
              ),
            ],
          ));
        });

        it('should replace addresses with complete new state (realistic UI behavior)', () => {
          // GIVEN: Contact person with existing addresses
          const currentPartner = createPartnerDto({
            contactPersons: [
              createContactPersonDto({
                partnerFunctionId: 1,
                addresses: [
                  createAddressDto({addressTypeId: 1}),
                  createAddressDto({addressTypeId: 2}),
                ],
              }),
            ],
          });

          // WHEN: UI sends complete new state of addresses for this contact person
          // (e.g., user edited addresses and UI sends all visible addresses)
          const updates: Partial<PartnerDto> = {
            contactPersons: [
              createContactPersonDto({
                partnerFunctionId: 1,
                addresses: [
                  createAddressDto({addressTypeId: 2}), // Keep existing
                  createAddressDto({addressTypeId: 3}), // Add new
                ],
              }),
            ],
          };

          const result = service.mergePartnerData(currentPartner, updates);

          // THEN: Should replace addresses with the new complete state
          // addressTypeId: 1 is removed, 2 is kept, 3 is added
          expect(result.contactPersons).toEqual(expect.arrayContaining(
            [
              expect.objectContaining(
                {
                  addresses: expect.arrayContaining(
                    [
                      expect.objectContaining({addressTypeId: 2}),
                      expect.objectContaining({addressTypeId: 3}),
                    ],
                  ),
                },
              ),
            ],
          ));
          // Ensure addressTypeId: 1 is not present
          expect(result.contactPersons![0].addresses).toHaveLength(2);
        });

        it('should replace contact persons with complete new state including addresses', () => {
          // GIVEN: Contact person with existing addresses
          const currentPartner = createPartnerDto({
            contactPersons: [
              createContactPersonDto({
                partnerFunctionId: 1,
                addresses: [
                  createAddressDto({addressTypeId: 1}),
                  createAddressDto({addressTypeId: 2}),
                ],
              }),
            ],
          });

          // WHEN: UI sends complete new state of contact persons
          // (e.g., user replaced contact person 1 with contact person 2)
          const updates: Partial<PartnerDto> = {
            contactPersons: [
              createContactPersonDto({
                partnerFunctionId: 2, // New contact person
                addresses: [createAddressDto({addressTypeId: 3})], // New Address
              }),
            ],
          };

          const result = service.mergePartnerData(currentPartner, updates);

          // THEN: Should replace with new complete state
          // Original contact person (1) with addresses is removed, new contact person (2) is added
          expect(result.contactPersons).toHaveLength(1);
          expect(result.contactPersons).toEqual(expect.arrayContaining(
            [
              expect.objectContaining(
                {
                  partnerFunctionId: 2,
                  addresses: expect.arrayContaining(
                    [expect.objectContaining({addressTypeId: 3})],
                  ),
                },
              ),
            ],
          ));
        });


        describe('telecommunications', () => {
          it('should merge telecommunications by type within addresses', () => {
            // GIVEN: Address with existing phone number
            const existingTelecom = createTelecommunicationDto({
              telecommunicationType: 1,
              phoneNumber: '111111',
            });
            const currentPartner = createPartnerDto({
              contactPersons: [
                createContactPersonDto({
                  partnerFunctionId: 1,
                  addresses: [
                    createAddressDto({
                      addressTypeId: 1,
                      telecommunications: [existingTelecom],
                    }),
                  ],
                }),
              ],
            });

            const updatedTelecom = createTelecommunicationDto({
              telecommunicationType: 1,
              phoneNumber: '222222',
            });
            const updates: Partial<PartnerDto> = {
              contactPersons: [
                createContactPersonDto({
                  partnerFunctionId: 1,
                  addresses: [
                    createAddressDto({
                      addressTypeId: 1,
                      telecommunications: [updatedTelecom],
                    }),
                  ],
                }),
              ],
            };

            // WHEN: Updating phone number
            const result = service.mergePartnerData(currentPartner, updates);

            // THEN: Should update existing telecommunication
            expect(result.contactPersons).toEqual(expect.arrayContaining(
              [
                expect.objectContaining(
                  {
                    addresses: expect.arrayContaining(
                      [
                        expect.objectContaining({
                          telecommunications: expect.arrayContaining(
                            [expect.objectContaining({phoneNumber: '222222'})]),
                        }),
                      ],
                    ),
                  },
                ),
              ],
            ));
          });

          it('should replace telecommunications with complete new state (realistic UI behavior)', () => {
            // GIVEN: Address with existing telecommunications
            const currentPartner = createPartnerDto({
              contactPersons: [
                createContactPersonDto({
                  partnerFunctionId: 1,
                  addresses: [
                    createAddressDto({
                      addressTypeId: 1,
                      telecommunications: [
                        createTelecommunicationDto({telecommunicationType: 1, phoneNumber: '123456'}),
                        createTelecommunicationDto({telecommunicationType: 2, email: 'old@test.com'}),
                      ],
                    }),
                  ],
                }),
              ],
            });

            // WHEN: UI sends complete new state of telecommunications for this address
            // (e.g., user edited telecommunications and UI sends all current telecommunications)
            const updates: Partial<PartnerDto> = {
              contactPersons: [
                createContactPersonDto({
                  partnerFunctionId: 1,
                  addresses: [
                    createAddressDto({
                      addressTypeId: 1,
                      telecommunications: [
                        createTelecommunicationDto({telecommunicationType: 2, email: 'new@test.com'}), // Updated
                        createTelecommunicationDto({telecommunicationType: 3, phoneNumber: '789012'}), // New
                      ],
                    }),
                  ],
                }),
              ],
            };

            const result = service.mergePartnerData(currentPartner, updates);

            // THEN: Should replace telecommunications with new complete state
            // Type 1 is removed, Type 2 is updated, Type 3 is added
            expect(result.contactPersons).toEqual(expect.arrayContaining(
              [
                expect.objectContaining(
                  {
                    addresses: expect.arrayContaining(
                      [
                        expect.objectContaining({
                          telecommunications: expect.arrayContaining([
                            expect.objectContaining({telecommunicationType: 2, email: 'new@test.com'}),
                            expect.objectContaining({telecommunicationType: 3}),
                          ]),
                        }),
                      ],
                    ),
                  },
                ),
              ],
            ));
            // Ensure only 2 telecommunications exist
            expect(result.contactPersons![0].addresses![0].telecommunications).toHaveLength(2);
          });


          it('should replace all addresses with new complete state (realistic UI behavior)', () => {
            // GIVEN: Contact person with existing address containing telecommunications
            const currentPartner = createPartnerDto({
              contactPersons: [
                createContactPersonDto({
                  partnerFunctionId: 1,
                  addresses: [
                    createAddressDto({
                      addressTypeId: 1,
                      telecommunications: [
                        createTelecommunicationDto({telecommunicationType: 1}),
                        createTelecommunicationDto({telecommunicationType: 2}),
                      ],
                    }),
                    createAddressDto({
                      addressTypeId: 2,
                    }),
                  ],
                }),
              ],
            });

            // WHEN: UI sends complete new state of addresses for this contact person
            // (e.g., user removed address 1 and added address 3)
            const updates: Partial<PartnerDto> = {
              contactPersons: [
                createContactPersonDto({
                  partnerFunctionId: 1,
                  addresses: [
                    createAddressDto({addressTypeId: 2}), // Keep existing
                    createAddressDto({addressTypeId: 3}), // Add new
                  ],
                }),
              ],
            };

            const result = service.mergePartnerData(currentPartner, updates);

            // THEN: Should replace addresses with new complete state
            // Address 1 (with telecommunications) is removed, Address 2 is kept, Address 3 is added
            expect(result.contactPersons![0].addresses).toHaveLength(2);
            expect(result.contactPersons).toEqual(expect.arrayContaining(
              [
                expect.objectContaining(
                  {
                    addresses: expect.arrayContaining(
                      [
                        expect.objectContaining({addressTypeId: 2}),
                        expect.objectContaining({addressTypeId: 3}),
                      ],
                    ),
                  },
                ),
              ],
            ));
          });
        });
      });
    });

    describe('bank connections', () => {
      it('should replace bank connections', () => {

        // GIVEN: Partner with existing bank connection
        const existingBankConnection = createBankConnectionDto({
          sequenceNumber: 1,
          bankName: 'oldName',
        });
        const currentPartner = createPartnerDto({
          bankConnections: [existingBankConnection],
        });

        const updatedBankConnection = createBankConnectionDto({
          sequenceNumber: 1,
          bankName: 'newName',
        });
        const updates: Partial<PartnerDto> = {
          bankConnections: [updatedBankConnection],
        };

        // WHEN: Merging with same sequence number
        const result = service.mergePartnerData(currentPartner, updates);

        // THEN: Should replace existing bank connection
        expect(result.bankConnections).toHaveLength(1);
        expect(result.bankConnections).toEqual(expect.arrayContaining(
          [expect.objectContaining({bankName: 'newName', sequenceNumber: 1})],
        ));
      });

      it('should handle empty bank connections array', () => {
        // GIVEN: Partner without bank connections
        const currentPartner = createPartnerDto({
          bankConnections: [],
        });
        const updates: Partial<PartnerDto> = {
          bankConnections: [createBankConnectionDto()],
        };

        // WHEN: Adding first bank connection
        const result = service.mergePartnerData(currentPartner, updates);

        // THEN: Should contain the new bank connection
        expect(result.bankConnections).toHaveLength(1);
      });

      it('should preserve bank connections when updates do not include them', () => {
        // GIVEN: Partner with bank connections
        const currentPartner = createPartnerDto({
          bankConnections: [
            createBankConnectionDto({sequenceNumber: 1}),
            createBankConnectionDto({sequenceNumber: 2}),
          ],
        });
        const updates: Partial<PartnerDto> = {
          creditFlag: true,
        };

        // WHEN: Updating other properties
        const result = service.mergePartnerData(currentPartner, updates);

        // THEN: Bank connections should remain unchanged
        expect(result.bankConnections).toHaveLength(2);
        expect(result.bankConnections).toEqual(expect.arrayContaining(
          [
            expect.objectContaining({sequenceNumber: 1}),
            expect.objectContaining({sequenceNumber: 2}),
          ],
        ));
      });
    });

    describe('group assignments', () => {
      it('should replace the current group assignments', () => {
        // GIVEN: Partner with group assignments
        const currentPartner = createPartnerDto({
          groupAssignments: [
            createGroupAssignmentDto({groupId: 1}),
            createGroupAssignmentDto({groupId: 2}),
          ],
        });
        const updates: Partial<PartnerDto> = {
          groupAssignments: [
            createGroupAssignmentDto({groupId: 4}),
            createGroupAssignmentDto({groupId: 5}),
          ],
        };

        // WHEN: Updating group assignments
        const result = service.mergePartnerData(currentPartner, updates);

        // THEN: Current group assignments should be replaced by updated group assignments
        expect(result.groupAssignments).toHaveLength(2);
        expect(result.groupAssignments).toEqual(expect.arrayContaining(
          [
            expect.objectContaining({groupId: 4}),
            expect.objectContaining({groupId: 5}),
          ],
        ));
      });

      it('should preserve group assignments when updates do not include them', () => {
        // GIVEN: Partner with group assignments
        const currentPartner = createPartnerDto({
          groupAssignments: [
            createGroupAssignmentDto({groupId: 1}),
            createGroupAssignmentDto({groupId: 2}),
          ],
        });
        const updates: Partial<PartnerDto> = {
          creditFlag: true,
        };

        // WHEN: Updating other properties
        const result = service.mergePartnerData(currentPartner, updates);

        // THEN: Group assignments should remain unchanged
        expect(result.groupAssignments).toHaveLength(2);
        expect(result.groupAssignments).toEqual(expect.arrayContaining(
          [
            expect.objectContaining({groupId: 1}),
            expect.objectContaining({groupId: 2}),
          ],
        ));
      });
    });
  });
});

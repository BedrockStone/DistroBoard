export interface Order {
    TxnID: string;
    StoreNumber: number;
    ShippingInformationFullName: string;
    ShippingInformationPhone: string;
    ShippingInformationCity: string;
    ShippingInformationStreet: string;
    ShippingInformationState: string;
    ShippingInformationPostalCode: string;
    Cashier: string;
    TimeModified: string;
    TimeCreated: string;
    SpecialInstructions: string;
    JobNumber: string;
    receiptItems: any;
    ShipDate: any;

}

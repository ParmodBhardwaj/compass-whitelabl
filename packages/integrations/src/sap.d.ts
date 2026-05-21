import * as soap from 'soap';
/** SAP SOAP client wrapper. WSDL + sandbox endpoint to be supplied by user. */
export interface SapConfig {
    wsdlUrl: string;
    username?: string;
    password?: string;
}
export declare function initSap(c: SapConfig): void;
export declare function getSapClient(): Promise<soap.Client>;
export declare function callSap<T = any>(operation: string, args: object): Promise<T>;

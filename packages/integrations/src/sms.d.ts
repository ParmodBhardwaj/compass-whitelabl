export interface SmsConfig {
    apiUrl: string;
    apiKey: string;
}
export declare function initSms(c: SmsConfig): void;
export declare function sendSms(to: string, message: string): Promise<import("axios").AxiosResponse<any, any, {}>>;

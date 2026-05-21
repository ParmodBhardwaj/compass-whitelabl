/** kPoint video platform — embed and metadata fetch. Endpoint TBD. */
export interface KpointConfig {
    baseUrl: string;
    apiKey?: string;
}
export declare function initKpoint(c: KpointConfig): void;
export declare function getKpointVideoMeta(videoId: string): Promise<any>;

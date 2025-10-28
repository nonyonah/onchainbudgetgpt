declare module '@mono.co/connect.js' {
  export interface MonoConnectOptions {
    key: string;
    scope?: string;
    data?: {
      customer?: {
        name?: string;
        email?: string;
      };
    };
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
    onClose?: () => void;
  }

  export class MonoConnect {
    constructor(options: MonoConnectOptions);
    open(): void;
    close(): void;
  }
}
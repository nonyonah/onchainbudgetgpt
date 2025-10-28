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
    onLoad?: () => void;
    onEvent?: (event: any) => void;
    [key: string]: any; // Allow additional properties
  }

  export interface MonoConnectInstance {
    setup(config?: any): void;
    close(): void;
    key: string;
    config: any;
    onLoad: () => void;
    onClose: () => void;
    onSuccess: (data: any) => void;
    onEvent: (event: any) => void;
  }

  // The main connect function
  export function connect(options: MonoConnectOptions): MonoConnectInstance;
  
  // Default export is the connect function
  export default connect;
}
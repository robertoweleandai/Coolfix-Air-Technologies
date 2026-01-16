
export enum PaymentMethod {
  MPESA = 'MPESA',
  CARD = 'CARD'
}

export interface InternetPackage {
  id: string;
  name: string;
  speed: string;
  price: number;
  duration: string;
  type: 'Fiber' | 'Hotspot';
  devices: number;
  features: string[];
  isPopular?: boolean;
  color: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface UserUsage {
  date: string;
  download: number;
  upload: number;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  method: PaymentMethod;
  status: 'Completed' | 'Pending' | 'Failed';
  description: string;
}

export type AppView = 'home' | 'portal' | 'residential' | 'networking' | 'consulting' | 'contact';

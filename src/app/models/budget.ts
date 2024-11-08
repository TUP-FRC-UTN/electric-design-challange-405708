export interface Budget {
  id?: string;
  client: string;
  date: Date;
  zone: string
  moduleType:ModuleType[]
}

export enum Zone {
  LIVING = 'Living',
  COMEDOR = 'Comedor',
  KITCHEN = 'Cocina',
  ROOM = 'Dormitorio'
}

export interface ModuleType {
  id: string;
  name: string;
  slots: number;
  price: number;
  zone: Zone;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  createdAt: string;
}

export interface Professional {
  id: string;
  name: string;
  role: string;
  phone: string;
  email: string;
  color?: string;
}

export interface Service {
  id: string;
  name: string;
  durationMin: number;
  price: number;
  category: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  serviceName: string;
  date: string;
  time: string;
  status: 'pendente' | 'confirmado' | 'concluido' | 'cancelado';
  price: number;
  notified: boolean;
  professional: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  quantity: number;
  minQuantity: number;
  priceCost: number;
  priceSell: number;
  lastRestocked: string;
}

export interface Transaction {
  id: string;
  type: 'receita' | 'despesa';
  description: string;
  amount: number;
  date: string;
  category: string;
  appointmentId?: string;
}

export interface NotificationSetting {
  id: string;
  timeBeforeHours: number;
  channel: string; // 'WhatsApp' | 'SMS' | 'E-mail'
  template: string;
  isActive: boolean;
}

// Beautiful initial mock data
export const INITIAL_CLIENTS: Client[] = [
  {
    id: "c-1",
    name: "Ana Silva",
    phone: "(11) 98765-4321",
    email: "ana.silva@email.com",
    notes: "Cabelo fragilizado, prefere produtos sem sulfato. Alergia a amônia.",
    createdAt: "2026-05-15"
  },
  {
    id: "c-2",
    name: "Beatriz Santos",
    phone: "(11) 97654-3210",
    email: "beatriz.s@email.com",
    notes: "Fazer hidratação profunda a cada 15 dias. Gosta de tons acobreados.",
    createdAt: "2026-05-18"
  },
  {
    id: "c-3",
    name: "Camila Oliveira",
    phone: "(11) 96543-2109",
    email: "camila.oli@email.com",
    notes: "Usa unhas em gel. Prefere esmaltes tons nude.",
    createdAt: "2026-05-20"
  },
  {
    id: "c-4",
    name: "Gabriela Costa",
    phone: "(21) 99887-6655",
    email: "gabi.costa@email.com",
    notes: "Design de sobrancelha com henna.",
    createdAt: "2026-05-22"
  }
];

export const INITIAL_SERVICES: Service[] = [
  {
    id: "s-1",
    name: "Corte Feminino & Escova",
    durationMin: 60,
    price: 150.00,
    category: "Cabelo"
  },
  {
    id: "s-2",
    name: "Coloração Orgânica",
    durationMin: 90,
    price: 220.00,
    category: "Cabelo"
  },
  {
    id: "s-3",
    name: "Manicure & Pedicure",
    durationMin: 75,
    price: 85.00,
    category: "Unhas"
  },
  {
    id: "s-4",
    name: "Maquiagem Social Elegante",
    durationMin: 60,
    price: 180.00,
    category: "Maquiagem"
  },
  {
    id: "s-5",
    name: "Limpeza de Pele Profunda",
    durationMin: 80,
    price: 130.00,
    category: "Estética"
  }
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: "a-1",
    clientId: "c-1",
    clientName: "Ana Silva",
    clientPhone: "(11) 98765-4321",
    serviceId: "s-1",
    serviceName: "Corte Feminino & Escova",
    date: "2026-06-02",
    time: "10:00",
    status: "confirmado",
    price: 150.00,
    notified: false,
    professional: "Fran Oliveira"
  },
  {
    id: "a-2",
    clientId: "c-2",
    clientName: "Beatriz Santos",
    clientPhone: "(11) 97654-3210",
    serviceId: "s-2",
    serviceName: "Coloração Orgânica",
    date: "2026-06-02",
    time: "14:00",
    status: "pendente",
    price: 220.00,
    notified: false,
    professional: "Fran Oliveira"
  },
  {
    id: "a-3",
    clientId: "c-3",
    clientName: "Camila Oliveira",
    clientPhone: "(11) 96543-2109",
    serviceId: "s-3",
    serviceName: "Manicure & Pedicure",
    date: "2026-06-03",
    time: "09:30",
    status: "concluido",
    price: 85.00,
    notified: true,
    professional: "Mayara Sousa"
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "p-1",
    name: "Shampoo Nutritivo de Argila",
    brand: "BioFlora",
    category: "Shampoo",
    quantity: 12,
    minQuantity: 5,
    priceCost: 25.00,
    priceSell: 52.00,
    lastRestocked: "2026-05-10"
  },
  {
    id: "p-2",
    name: "Máscara de Hidratação Sálvia & Mel",
    brand: "BioFlora",
    category: "Máscara",
    quantity: 3,
    minQuantity: 4, // Alerta! quantity <= minQuantity
    priceCost: 35.00,
    priceSell: 78.00,
    lastRestocked: "2026-05-10"
  },
  {
    id: "p-3",
    name: "Óleo Finalizador de Argan Orgânico",
    brand: "NaturaTerra",
    category: "Finalizadores",
    quantity: 15,
    minQuantity: 3,
    priceCost: 42.00,
    priceSell: 95.00,
    lastRestocked: "2026-05-12"
  },
  {
    id: "p-4",
    name: "Tônico Capilar Fortificante de Sálvia",
    brand: "EcoVibe",
    category: "Tônico",
    quantity: 1,
    minQuantity: 3, // Alerta! quantity <= minQuantity
    priceCost: 18.00,
    priceSell: 45.00,
    lastRestocked: "2026-05-15"
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: "t-1",
    type: "receita",
    description: "Serviço: Manicure & Pedicure - Camila Oliveira",
    amount: 85.00,
    date: "2026-06-01",
    category: "Serviço",
    appointmentId: "a-3"
  },
  {
    id: "t-2",
    type: "despesa",
    description: "Aluguel da Sala Comercial",
    amount: 1500.00,
    date: "2026-05-28",
    category: "Contas"
  },
  {
    id: "t-3",
    type: "receita",
    description: "Venda: Shampoo Nutritivo de Argila",
    amount: 52.00,
    date: "2026-06-01",
    category: "Venda"
  },
  {
    id: "t-4",
    type: "despesa",
    description: "Aquisição de Lanche para Recepção",
    amount: 120.00,
    date: "2026-05-30",
    category: "Contas"
  }
];

export const INITIAL_NOTIFICATION_SETTINGS: NotificationSetting[] = [
  {
    id: "n-1",
    timeBeforeHours: 24,
    channel: "WhatsApp",
    template: "Olá {cliente}! Lembrando do seu momento de cuidado 'Fran Hair' amanhã às {hora} com o profissional {profissional} para realizar {servico}. Aguardamos você!",
    isActive: true
  },
  {
    id: "n-2",
    timeBeforeHours: 3,
    channel: "SMS",
    template: "Fran Hair: {cliente}, seu horário de {servico} é hoje às {hora} com {profissional}. Até já!",
    isActive: false
  },
  {
    id: "n-3",
    timeBeforeHours: 24,
    channel: "E-mail",
    template: "Olá, {cliente}. Confirmamos seu agendamento no Fran Hair para o dia {data} às {hora} ({servico}) com {profissional}. Se precisar reagendar, entre em contato.",
    isActive: true
  }
];

export const INITIAL_PROFESSIONALS: Professional[] = [
  {
    id: "prof_1",
    name: "Fran Oliveira",
    role: "Cabeleireira & Visagista",
    phone: "(11) 99999-1111",
    email: "fran@fran-hair.com",
    color: "#4d6b53"
  },
  {
    id: "prof_2",
    name: "Mayara Sousa",
    role: "Manicure & Pedicure",
    phone: "(11) 99999-2222",
    email: "mayara@fran-hair.com",
    color: "#c2a990"
  }
];

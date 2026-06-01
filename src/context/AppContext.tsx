import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Client, Service, Appointment, Product, Transaction, NotificationSetting, Professional,
  INITIAL_CLIENTS, INITIAL_SERVICES, INITIAL_APPOINTMENTS, INITIAL_PRODUCTS, 
  INITIAL_TRANSACTIONS, INITIAL_NOTIFICATION_SETTINGS, INITIAL_PROFESSIONALS
} from '../types';
import { 
  isFirebaseConfigured, auth, db, googleProvider,
  OperationType, handleFirestoreError 
} from '../lib/firebase';
import { 
  onAuthStateChanged, signInWithPopup, signOut, User 
} from 'firebase/auth';
import { 
  collection, doc, setDoc, deleteDoc, onSnapshot, query, where, writeBatch 
} from 'firebase/firestore';

interface AppContextType {
  clients: Client[];
  services: Service[];
  appointments: Appointment[];
  products: Product[];
  transactions: Transaction[];
  notificationSettings: NotificationSetting[];
  user: User | null;
  isLoggedIn: boolean;
  isOfflineMode: boolean; // True if they chose Local Mode or bypass login
  isFirebaseSetup: boolean; // True if Firebase configuration exists
  isLoading: boolean;
  hasUnsyncedData: boolean;
  
  // Auth actions
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  enterLocalMode: () => void;
  syncLocalToCloud: () => Promise<void>;
  
  // Data actions
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Promise<string>;
  deleteClient: (id: string) => Promise<void>;
  editClient: (client: Client) => Promise<void>;
  
  addService: (service: Omit<Service, 'id'>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  
  addAppointment: (appointment: Omit<Appointment, 'id' | 'notified'>) => Promise<void>;
  editAppointment: (appointment: Appointment) => Promise<void>;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  
  addProduct: (product: Omit<Product, 'id' | 'lastRestocked'>) => Promise<void>;
  restockProduct: (id: string, amount: number) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;

  updateNotificationSetting: (id: string, template: string, isActive: boolean, timeBeforeHours: number) => Promise<void>;

  professionals: Professional[];
  addProfessional: (professional: Omit<Professional, 'id'>) => Promise<void>;
  deleteProfessional: (id: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(() => {
    return localStorage.getItem('fran_hair_offline_mode') === 'true';
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasUnsyncedData, setHasUnsyncedData] = useState(() => {
    return localStorage.getItem('fran_hair_is_unsynced') === 'true';
  });

  // Load static seed values or load existing Cache on startup
  useEffect(() => {
    const localClients = localStorage.getItem('fran_hair_clients');
    const localServices = localStorage.getItem('fran_hair_services');
    const localAppointments = localStorage.getItem('fran_hair_appointments');
    const localProducts = localStorage.getItem('fran_hair_products');
    const localTransactions = localStorage.getItem('fran_hair_transactions');
    const localSettings = localStorage.getItem('fran_hair_settings');
    const localProfessionals = localStorage.getItem('fran_hair_professionals');

    if (!localClients && !localServices && !localAppointments && !localProducts && !localTransactions && !localSettings && !localProfessionals) {
      // First boot: load mock seeds
      setClients(INITIAL_CLIENTS);
      setServices(INITIAL_SERVICES);
      setAppointments(INITIAL_APPOINTMENTS);
      setProducts(INITIAL_PRODUCTS);
      setTransactions(INITIAL_TRANSACTIONS);
      setNotificationSettings(INITIAL_NOTIFICATION_SETTINGS);
      setProfessionals(INITIAL_PROFESSIONALS);

      localStorage.setItem('fran_hair_clients', JSON.stringify(INITIAL_CLIENTS));
      localStorage.setItem('fran_hair_services', JSON.stringify(INITIAL_SERVICES));
      localStorage.setItem('fran_hair_appointments', JSON.stringify(INITIAL_APPOINTMENTS));
      localStorage.setItem('fran_hair_products', JSON.stringify(INITIAL_PRODUCTS));
      localStorage.setItem('fran_hair_transactions', JSON.stringify(INITIAL_TRANSACTIONS));
      localStorage.setItem('fran_hair_settings', JSON.stringify(INITIAL_NOTIFICATION_SETTINGS));
      localStorage.setItem('fran_hair_professionals', JSON.stringify(INITIAL_PROFESSIONALS));
    } else {
      // Load cache
      if (localClients) setClients(JSON.parse(localClients));
      if (localServices) setServices(JSON.parse(localServices));
      if (localAppointments) setAppointments(JSON.parse(localAppointments));
      if (localProducts) setProducts(JSON.parse(localProducts));
      if (localTransactions) setTransactions(JSON.parse(localTransactions));
      if (localSettings) setNotificationSettings(JSON.parse(localSettings));
      
      if (localProfessionals) {
        setProfessionals(JSON.parse(localProfessionals));
      } else {
        setProfessionals(INITIAL_PROFESSIONALS);
        localStorage.setItem('fran_hair_professionals', JSON.stringify(INITIAL_PROFESSIONALS));
      }
    }
    
    setIsLoading(false);
  }, []);

  // Sync to localStorage whenever local states change (Offline Cache)
  useEffect(() => {
    if (clients.length > 0) localStorage.setItem('fran_hair_clients', JSON.stringify(clients));
  }, [clients]);
  useEffect(() => {
    if (services.length > 0) localStorage.setItem('fran_hair_services', JSON.stringify(services));
  }, [services]);
  useEffect(() => {
    if (appointments.length > 0) localStorage.setItem('fran_hair_appointments', JSON.stringify(appointments));
  }, [appointments]);
  useEffect(() => {
    if (products.length > 0) localStorage.setItem('fran_hair_products', JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    if (transactions.length > 0) localStorage.setItem('fran_hair_transactions', JSON.stringify(transactions));
  }, [transactions]);
  useEffect(() => {
    if (notificationSettings.length > 0) localStorage.setItem('fran_hair_settings', JSON.stringify(notificationSettings));
  }, [notificationSettings]);
  useEffect(() => {
    if (professionals.length > 0) localStorage.setItem('fran_hair_professionals', JSON.stringify(professionals));
  }, [professionals]);

  // Auth Listener setup if Firebase is configured
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      return onAuthStateChanged(auth, (currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          setIsLoggedIn(true);
          setIsOfflineMode(false);
          localStorage.setItem('fran_hair_offline_mode', 'false');
        } else {
          setUser(null);
          setIsLoggedIn(false);
        }
      });
    }
  }, []);

  // Firebase Firestore Reactive Data listeners (onSnapshot)
  useEffect(() => {
    if (isLoggedIn && user && isFirebaseConfigured && db) {
      setIsLoading(true);
      const uid = user.uid;

      // Subscribe to all 6 collections
      const unsubClients = onSnapshot(
        query(collection(db, 'clients'), where('userId', '==', uid)),
        (snapshot) => {
          const list: Client[] = [];
          snapshot.forEach((doc) => {
            list.push({ ...(doc.data() as Omit<Client, 'id'>), id: doc.id });
          });
          if (list.length > 0) {
            setClients(list);
          }
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'clients')
      );

      const unsubServices = onSnapshot(
        query(collection(db, 'services'), where('userId', '==', uid)),
        (snapshot) => {
          const list: Service[] = [];
          snapshot.forEach((doc) => {
            list.push({ ...(doc.data() as Omit<Service, 'id'>), id: doc.id });
          });
          if (list.length > 0) {
            setServices(list);
          }
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'services')
      );

      const unsubAppointments = onSnapshot(
        query(collection(db, 'appointments'), where('userId', '==', uid)),
        (snapshot) => {
          const list: Appointment[] = [];
          snapshot.forEach((doc) => {
            list.push({ ...(doc.data() as Omit<Appointment, 'id'>), id: doc.id });
          });
          if (list.length > 0) {
            setAppointments(list);
          }
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'appointments')
      );

      const unsubProducts = onSnapshot(
        query(collection(db, 'products'), where('userId', '==', uid)),
        (snapshot) => {
          const list: Product[] = [];
          snapshot.forEach((doc) => {
            list.push({ ...(doc.data() as Omit<Product, 'id'>), id: doc.id });
          });
          if (list.length > 0) {
            setProducts(list);
          }
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'products')
      );

      const unsubTransactions = onSnapshot(
        query(collection(db, 'transactions'), where('userId', '==', uid)),
        (snapshot) => {
          const list: Transaction[] = [];
          snapshot.forEach((doc) => {
            list.push({ ...(doc.data() as Omit<Transaction, 'id'>), id: doc.id });
          });
          if (list.length > 0) {
            setTransactions(list);
          }
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'transactions')
      );

      const unsubSettings = onSnapshot(
        query(collection(db, 'notificationSettings'), where('userId', '==', uid)),
        (snapshot) => {
          const list: NotificationSetting[] = [];
          snapshot.forEach((doc) => {
            list.push({ ...(doc.data() as Omit<NotificationSetting, 'id'>), id: doc.id });
          });
          if (list.length > 0) {
            setNotificationSettings(list);
          }
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'notificationSettings')
      );

      const unsubProfessionals = onSnapshot(
        query(collection(db, 'professionals'), where('userId', '==', uid)),
        (snapshot) => {
          const list: Professional[] = [];
          snapshot.forEach((doc) => {
            list.push({ ...(doc.data() as Omit<Professional, 'id'>), id: doc.id });
          });
          if (list.length > 0) {
            setProfessionals(list);
          }
        },
        (err) => handleFirestoreError(err, OperationType.LIST, 'professionals')
      );

      setIsLoading(false);

      return () => {
        unsubClients();
        unsubServices();
        unsubAppointments();
        unsubProducts();
        unsubTransactions();
        unsubSettings();
        unsubProfessionals();
      };
    }
  }, [isLoggedIn, user]);

  // Actions
  const loginWithGoogle = async () => {
    if (isFirebaseConfigured && auth && googleProvider) {
      try {
        await signInWithPopup(auth, googleProvider);
      } catch (error) {
        console.error("Login failed:", error);
      }
    } else {
      console.warn("Firebase is not configured yet. Mode simulator...");
      // Simulate login for testing
      setIsLoggedIn(true);
      setIsOfflineMode(false);
      localStorage.setItem('fran_hair_offline_mode', 'false');
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
        setUser(null);
        setIsLoggedIn(false);
      } catch (error) {
        console.error("Sign out failed:", error);
      }
    } else {
      setUser(null);
      setIsLoggedIn(false);
    }
  };

  const enterLocalMode = () => {
    setIsOfflineMode(true);
    localStorage.setItem('fran_hair_offline_mode', 'true');
  };

  // Sync Offline (localStorage) data to Cloud (Firestore)
  const syncLocalToCloud = async () => {
    if (!isLoggedIn || !user || !isFirebaseConfigured || !db) return;
    
    setIsLoading(true);
    try {
      const uid = user.uid;
      const batch = writeBatch(db);

      // We upload local state of clients, services, etc. 
      // with userId assigned. If they match dummy ids like c-1, a-1, we generate random ids or leave them.
      for (const c of clients) {
        const id = c.id.startsWith('c-') ? 'client_' + Math.random().toString(36).substr(2, 9) : c.id;
        const ref = doc(db, 'clients', id);
        batch.set(ref, {
          name: c.name,
          phone: c.phone,
          email: c.email,
          notes: c.notes,
          createdAt: c.createdAt,
          userId: uid
        });
      }

      for (const s of services) {
        const id = s.id.startsWith('s-') ? 'service_' + Math.random().toString(36).substr(2, 9) : s.id;
        const ref = doc(db, 'services', id);
        batch.set(ref, {
          name: s.name,
          durationMin: s.durationMin,
          price: s.price,
          category: s.category,
          userId: uid
        });
      }

      for (const a of appointments) {
        const id = a.id.startsWith('a-') ? 'appointment_' + Math.random().toString(36).substr(2, 9) : a.id;
        const ref = doc(db, 'appointments', id);
        batch.set(ref, {
          clientId: a.clientId,
          clientName: a.clientName,
          clientPhone: a.clientPhone,
          serviceId: a.serviceId,
          serviceName: a.serviceName,
          date: a.date,
          time: a.time,
          status: a.status,
          price: a.price,
          notified: a.notified,
          professional: a.professional,
          userId: uid
        });
      }

      for (const p of products) {
        const id = p.id.startsWith('p-') ? 'product_' + Math.random().toString(36).substr(2, 9) : p.id;
        const ref = doc(db, 'products', id);
        batch.set(ref, {
          name: p.name,
          brand: p.brand,
          category: p.category,
          quantity: p.quantity,
          minQuantity: p.minQuantity,
          priceCost: p.priceCost,
          priceSell: p.priceSell,
          lastRestocked: p.lastRestocked,
          userId: uid
        });
      }

      for (const t of transactions) {
        const id = t.id.startsWith('t-') ? 'transaction_' + Math.random().toString(36).substr(2, 9) : t.id;
        const ref = doc(db, 'transactions', id);
        batch.set(ref, {
          type: t.type,
          description: t.description,
          amount: t.amount,
          date: t.date,
          category: t.category,
          ...(t.appointmentId ? { appointmentId: t.appointmentId } : {}),
          userId: uid
        });
      }

      for (const ns of notificationSettings) {
        const id = ns.id.startsWith('n-') ? 'setting_' + Math.random().toString(36).substr(2, 9) : ns.id;
        const ref = doc(db, 'notificationSettings', id);
        batch.set(ref, {
          timeBeforeHours: ns.timeBeforeHours,
          channel: ns.channel,
          template: ns.template,
          isActive: ns.isActive,
          userId: uid
        });
      }

      for (const prof of professionals) {
        const id = prof.id.startsWith('prof-') || prof.id.startsWith('prof_') ? 'professional_' + Math.random().toString(36).substr(2, 9) : prof.id;
        const ref = doc(db, 'professionals', id);
        batch.set(ref, {
          name: prof.name,
          role: prof.role,
          phone: prof.phone,
          email: prof.email,
          color: prof.color || '',
          userId: uid
        });
      }

      await batch.commit();
      
      setHasUnsyncedData(false);
      localStorage.setItem('fran_hair_is_unsynced', 'false');
    } catch (err) {
      console.error("Local sync error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to mark unsynced changes
  const markUnsynced = () => {
    if (!isLoggedIn) {
      setHasUnsyncedData(true);
      localStorage.setItem('fran_hair_is_unsynced', 'true');
    }
  };

  // Client CRUDS
  const addClient = async (newClient: Omit<Client, 'id' | 'createdAt'>): Promise<string> => {
    const id = 'client_' + Math.random().toString(36).substr(2, 9);
    const clientItem: Client = {
      ...newClient,
      id,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setClients(prev => [clientItem, ...prev]);
    markUnsynced();

    if (isLoggedIn && user && isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'clients', id), {
          ...clientItem,
          userId: user.uid
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'clients/' + id);
      }
    }
    return id;
  };

  const editClient = async (editedClient: Client) => {
    setClients(prev => prev.map(c => c.id === editedClient.id ? editedClient : c));
    markUnsynced();

    if (isLoggedIn && user && isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'clients', editedClient.id), {
          name: editedClient.name,
          phone: editedClient.phone,
          email: editedClient.email,
          notes: editedClient.notes,
          createdAt: editedClient.createdAt,
          userId: user.uid
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'clients/' + editedClient.id);
      }
    }
  };

  const deleteClient = async (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    markUnsynced();

    if (isLoggedIn && user && isFirebaseConfigured && db) {
      try {
        if (!id.startsWith('c-')) {
          await deleteDoc(doc(db, 'clients', id));
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'clients/' + id);
      }
    }
  };

  // Service CRUDS
  const addService = async (newServ: Omit<Service, 'id'>) => {
    const id = 'service_' + Math.random().toString(36).substr(2, 9);
    const serviceItem: Service = {
      ...newServ,
      id
    };

    setServices(prev => [...prev, serviceItem]);
    markUnsynced();

    if (isLoggedIn && user && isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'services', id), {
          ...serviceItem,
          userId: user.uid
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'services/' + id);
      }
    }
  };

  const deleteService = async (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
    markUnsynced();

    if (isLoggedIn && user && isFirebaseConfigured && db) {
      try {
        if (!id.startsWith('s-')) {
          await deleteDoc(doc(db, 'services', id));
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'services/' + id);
      }
    }
  };

  // Appointment CRUDS & side effect flow
  const addAppointment = async (newApp: Omit<Appointment, 'id' | 'notified'>) => {
    const id = 'appointment_' + Math.random().toString(36).substr(2, 9);
    const appItem: Appointment = {
      ...newApp,
      id,
      notified: false
    };

    setAppointments(prev => [appItem, ...prev]);
    markUnsynced();

    if (isLoggedIn && user && isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'appointments', id), {
          ...appItem,
          userId: user.uid
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'appointments/' + id);
      }
    }

    // Side effect: If status is concluded, generate general income transaction
    if (appItem.status === 'concluido') {
      await addTransaction({
        type: 'receita',
        description: `Serviço Concluído: ${appItem.serviceName} - ${appItem.clientName}`,
        amount: appItem.price,
        date: appItem.date,
        category: 'Serviço',
        appointmentId: appItem.id
      });
    }
  };

  const editAppointment = async (edited: Appointment) => {
    setAppointments(prev => prev.map(a => a.id === edited.id ? edited : a));
    markUnsynced();

    if (isLoggedIn && user && isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'appointments', edited.id), {
          clientId: edited.clientId,
          clientName: edited.clientName,
          clientPhone: edited.clientPhone,
          serviceId: edited.serviceId,
          serviceName: edited.serviceName,
          date: edited.date,
          time: edited.time,
          status: edited.status,
          price: edited.price,
          notified: edited.notified,
          professional: edited.professional,
          userId: user.uid
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'appointments/' + edited.id);
      }
    }
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']) => {
    const oldApp = appointments.find(a => a.id === id);
    if (!oldApp) return;

    const updatedApp: Appointment = {
      ...oldApp,
      status
    };

    setAppointments(prev => prev.map(a => a.id === id ? updatedApp : a));
    markUnsynced();

    if (isLoggedIn && user && isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'appointments', id), {
          clientId: updatedApp.clientId,
          clientName: updatedApp.clientName,
          clientPhone: updatedApp.clientPhone,
          serviceId: updatedApp.serviceId,
          serviceName: updatedApp.serviceName,
          date: updatedApp.date,
          time: updatedApp.time,
          status: updatedApp.status,
          price: updatedApp.price,
          notified: updatedApp.notified,
          professional: updatedApp.professional,
          userId: user.uid
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'appointments/' + id);
      }
    }

    // Side effect: If status transitioned to completed, generate general income transaction
    if (status === 'concluido' && oldApp.status !== 'concluido') {
      await addTransaction({
        type: 'receita',
        description: `Serviço Concluído: ${updatedApp.serviceName} - ${updatedApp.clientName}`,
        amount: updatedApp.price,
        date: updatedApp.date,
        category: 'Serviço',
        appointmentId: id
      });
    }
  };

  const deleteAppointment = async (id: string) => {
    // If appointment deleted, also optionally clean related transaction
    setAppointments(prev => prev.filter(a => a.id !== id));
    markUnsynced();

    if (isLoggedIn && user && isFirebaseConfigured && db) {
      try {
        if (!id.startsWith('a-')) {
          await deleteDoc(doc(db, 'appointments', id));
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'appointments/' + id);
      }
    }
  };

  // Product Inventory + Side effects Flow
  const addProduct = async (newProd: Omit<Product, 'id' | 'lastRestocked'>) => {
    const id = 'product_' + Math.random().toString(36).substr(2, 9);
    const prodItem: Product = {
      ...newProd,
      id,
      lastRestocked: new Date().toISOString().split('T')[0]
    };

    setProducts(prev => [...prev, prodItem]);
    markUnsynced();

    if (isLoggedIn && user && isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'products', id), {
          ...prodItem,
          userId: user.uid
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'products/' + id);
      }
    }
  };

  const restockProduct = async (id: string, amount: number) => {
    const p = products.find(prod => prod.id === id);
    if (!p) return;

    const restockedDate = new Date().toISOString().split('T')[0];
    const updatedProd: Product = {
      ...p,
      quantity: p.quantity + amount,
      lastRestocked: restockedDate
    };

    setProducts(prev => prev.map(prod => prod.id === id ? updatedProd : prod));
    markUnsynced();

    if (isLoggedIn && user && isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'products', id), {
          name: updatedProd.name,
          brand: updatedProd.brand,
          category: updatedProd.category,
          quantity: updatedProd.quantity,
          minQuantity: updatedProd.minQuantity,
          priceCost: updatedProd.priceCost,
          priceSell: updatedProd.priceSell,
          lastRestocked: updatedProd.lastRestocked,
          userId: user.uid
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'products/' + id);
      }
    }

    // Side effect: Automatically register general cash outflow transaction (despesa)
    const totalCost = p.priceCost * amount;
    await addTransaction({
      type: 'despesa',
      description: `Reposição Automática: +${amount}x ${p.name} (${p.brand})`,
      amount: totalCost,
      date: restockedDate,
      category: 'Estoque'
    });
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    markUnsynced();

    if (isLoggedIn && user && isFirebaseConfigured && db) {
      try {
        if (!id.startsWith('p-')) {
          await deleteDoc(doc(db, 'products', id));
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'products/' + id);
      }
    }
  };

  // Transaction CRUDS
  const addTransaction = async (newTx: Omit<Transaction, 'id'>) => {
    const id = 'transaction_' + Math.random().toString(36).substr(2, 9);
    const txItem: Transaction = {
      ...newTx,
      id
    };

    setTransactions(prev => [txItem, ...prev]);
    markUnsynced();

    if (isLoggedIn && user && isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'transactions', id), {
          ...txItem,
          userId: user.uid
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'transactions/' + id);
      }
    }
  };

  const deleteTransaction = async (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    markUnsynced();

    if (isLoggedIn && user && isFirebaseConfigured && db) {
      try {
        if (!id.startsWith('t-')) {
          await deleteDoc(doc(db, 'transactions', id));
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'transactions/' + id);
      }
    }
  };

  // Notification configuration update
  const updateNotificationSetting = async (id: string, template: string, isActive: boolean, timeBeforeHours: number) => {
    const updatedSetting: NotificationSetting = {
      id,
      template,
      isActive,
      timeBeforeHours,
      channel: notificationSettings.find(n => n.id === id)?.channel || 'WhatsApp'
    };

    setNotificationSettings(prev => prev.map(ns => ns.id === id ? updatedSetting : ns));
    markUnsynced();

    if (isLoggedIn && user && isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'notificationSettings', id), {
          timeBeforeHours: updatedSetting.timeBeforeHours,
          channel: updatedSetting.channel,
          template: updatedSetting.template,
          isActive: updatedSetting.isActive,
          userId: user.uid
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'notificationSettings/' + id);
      }
    }
  };

  // Professional CRUDS
  const addProfessional = async (newProf: Omit<Professional, 'id'>) => {
    const id = 'professional_' + Math.random().toString(36).substr(2, 9);
    const profItem: Professional = {
      ...newProf,
      id
    };

    setProfessionals(prev => [...prev, profItem]);
    markUnsynced();

    if (isLoggedIn && user && isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'professionals', id), {
          ...profItem,
          userId: user.uid
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, 'professionals/' + id);
      }
    }
  };

  const deleteProfessional = async (id: string) => {
    setProfessionals(prev => prev.filter(p => p.id !== id));
    markUnsynced();

    if (isLoggedIn && user && isFirebaseConfigured && db) {
      try {
        if (!id.startsWith('prof_')) {
          await deleteDoc(doc(db, 'professionals', id));
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, 'professionals/' + id);
      }
    }
  };

  return (
    <AppContext.Provider value={{
      clients,
      services,
      appointments,
      products,
      transactions,
      notificationSettings,
      user,
      isLoggedIn,
      isOfflineMode,
      isFirebaseSetup: isFirebaseConfigured,
      isLoading,
      hasUnsyncedData,
      
      loginWithGoogle,
      logout,
      enterLocalMode,
      syncLocalToCloud,
      
      addClient,
      deleteClient,
      editClient,
      
      addService,
      deleteService,
      
      addAppointment,
      editAppointment,
      updateAppointmentStatus,
      deleteAppointment,
      
      addProduct,
      restockProduct,
      deleteProduct,
      
      addTransaction,
      deleteTransaction,
      
      updateNotificationSetting,

      professionals,
      addProfessional,
      deleteProfessional
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp deve ser usado dentro de AppProvider');
  }
  return context;
};

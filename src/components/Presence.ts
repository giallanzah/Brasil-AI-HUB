import { db, auth } from '../lib/firebase';
import { doc, setDoc, onSnapshot, collection, query, serverTimestamp, updateDoc, where, getDocs } from 'firebase/firestore';

export interface UserPresence {
  userId: string;
  displayName: string;
  photoURL?: string;
  x: number;
  y: number;
  status: 'online' | 'absent' | 'in-meeting' | 'offline';
  room: string;
  updatedAt: any;
}

export class PresenceManager {
  private userId: string;
  private lastUpdate: number = 0;
  private throttleMs: number = 100;

  constructor(userId: string) {
    this.userId = userId;
    this.setupCleanup();
  }

  // 1. Atualizar posição e sala (usando a coleção 'presence' devidamente conforme as regras)
  async updatePosition(x: number, y: number, room: string) {
    const now = Date.now();
    if (now - this.lastUpdate < this.throttleMs) return;

    try {
      this.lastUpdate = now;
      // Escrever na coleção de presença conforme firestore.rules
      await setDoc(doc(db, 'presence', this.userId), {
        userId: this.userId,
        x,
        y,
        scene: room || 'Hub',
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error("Erro ao atualizar posição na coleção presence:", e);
    }
  }

  // 2. Atualizar status de disponibilidade (na coleção de usuários)
  async updateStatus(status: UserPresence['status']) {
    if (status === 'offline') return;
    try {
      await updateDoc(doc(db, 'users', this.userId), {
        status,
        lastSeen: serverTimestamp()
      });
    } catch (e) {
      console.error("Erro ao atualizar status:", e);
    }
  }

  // 3. Escutar todos os usuários (todos que logaram) no Hub
  static subscribeToUsers(callback: (users: UserPresence[]) => void) {
    let latestUsers: any[] = [];
    const latestPresence = new Map<string, any>();
    
    const processUpdates = () => {
      let maxServerTime = 0;
      
      latestPresence.forEach((pData) => {
        const updatedAt = pData.updatedAt?.toDate()?.getTime() || 0;
        if (updatedAt > maxServerTime) {
          maxServerTime = updatedAt;
        }
      });
      
      const allUsers: UserPresence[] = [];
      const now = Date.now();
      const currentUid = auth.currentUser?.uid;
      
      latestUsers.forEach((uData) => {
        const userId = uData.userId;
        const pData = latestPresence.get(userId);
        let isOnline = false;
        let x = 750;
        let y = 395;
        let room = 'Offline';
        
        if (userId === currentUid) {
          // O usuário logado está SEMPRE online!
          isOnline = true;
          if (pData) {
            x = pData.x || 750;
            y = pData.y || 395;
            room = pData.scene || 'Hub';
          } else {
            x = 750;
            y = 395;
            room = 'Hub';
          }
        } else if (pData) {
          const updatedAt = pData.updatedAt?.toDate() || new Date();
          const referenceTime = maxServerTime > 0 ? maxServerTime : now;
          const timeDiff = referenceTime - updatedAt.getTime();
          
          // Considerar online se atualizou nos últimos 120 segundos
          if (timeDiff < 120000) {
            isOnline = true;
            x = pData.x || 750;
            y = pData.y || 395;
            room = pData.scene || 'Hub';
          }
        }
        
        allUsers.push({
          userId,
          displayName: uData.displayName || 'Membro',
          photoURL: uData.photoURL || undefined,
          x,
          y,
          status: isOnline ? (uData.status || 'online') : 'offline',
          room: isOnline ? room : 'Offline',
          updatedAt: pData?.updatedAt || uData.lastSeen
        });
      });
      
      // Sort: Active users on top, offline at bottom
      allUsers.sort((a, b) => {
        const statusOrder = { 'online': 0, 'in-meeting': 1, 'absent': 2, 'offline': 3 };
        const aOrder = statusOrder[a.status] !== undefined ? statusOrder[a.status] : 4;
        const bOrder = statusOrder[b.status] !== undefined ? statusOrder[b.status] : 4;
        if (aOrder !== bOrder) return aOrder - bOrder;
        return (a.displayName || '').localeCompare(b.displayName || '');
      });
      
      callback(allUsers);
    };

    const unsubscribeUsers = onSnapshot(query(collection(db, 'users')), (usersSnapshot) => {
      latestUsers = [];
      usersSnapshot.forEach((doc) => {
        latestUsers.push({ userId: doc.id, ...doc.data() });
      });
      processUpdates();
    }, (err) => {
      console.error("Erro ao assinar users:", err);
    });

    const unsubscribePresence = onSnapshot(query(collection(db, 'presence')), (presenceSnapshot) => {
      latestPresence.clear();
      presenceSnapshot.forEach((doc) => {
        latestPresence.set(doc.id, doc.data({ serverTimestamps: 'estimate' }));
      });
      processUpdates();
    }, (err) => {
      console.error("Erro ao assinar presence:", err);
    });

    return () => {
      unsubscribeUsers();
      unsubscribePresence();
    };
  }

  // 4. Marcar como offline ao fechar aba
  private setupCleanup() {
    window.addEventListener('beforeunload', () => {
      this.setOffline();
    });
  }

  async setOffline() {
    try {
      await updateDoc(doc(db, 'users', this.userId), {
        status: 'absent',
        lastSeen: serverTimestamp()
      });
    } catch (e) {
      // Ignorar erros no fechamento
    }
  }
}

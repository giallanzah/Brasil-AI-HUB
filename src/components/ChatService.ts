import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp,
  doc,
  setDoc,
  deleteDoc
} from 'firebase/firestore';

export interface ChatMessage {
  id?: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: any;
}

export class ChatService {
  /**
   * Envia uma mensagem para uma sala específica
   */
  static async sendMessage(roomId: string, senderId: string, senderName: string, text: string) {
    if (!text.trim()) return;
    
    try {
      await addDoc(collection(db, `chats/${roomId}/messages`), {
        senderId,
        senderName,
        text,
        timestamp: serverTimestamp()
      });
      // Limpar status de digitando ao enviar
      await this.setTypingStatus(roomId, senderId, false);
    } catch (e) {
      console.error("Erro ao enviar mensagem:", e);
    }
  }

  /**
   * Escuta mensagens de uma sala em tempo real
   */
  static subscribeToMessages(roomId: string, callback: (messages: ChatMessage[]) => void) {
    const q = query(
      collection(db, `chats/${roomId}/messages`),
      orderBy('timestamp', 'asc'),
      limit(50)
    );

    return onSnapshot(q, (snapshot) => {
      const messages: ChatMessage[] = [];
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as ChatMessage);
      });
      callback(messages);
    });
  }

  /**
   * Atualiza o status de "digitando" do usuário
   */
  static async setTypingStatus(roomId: string, userId: string, isTyping: boolean) {
    const typingDoc = doc(db, `chats/${roomId}/typing`, userId);
    try {
      if (isTyping) {
        await setDoc(typingDoc, {
          isTyping: true,
          updatedAt: serverTimestamp()
        });
      } else {
        await deleteDoc(typingDoc);
      }
    } catch (e) {
      console.error("Erro ao atualizar status de digitando:", e);
    }
  }

  /**
   * Escuta quem está digitando na sala (exceto o próprio usuário)
   */
  static subscribeToTyping(roomId: string, currentUserId: string, callback: (isPartnerTyping: boolean) => void) {
    const q = query(collection(db, `chats/${roomId}/typing`));
    
    return onSnapshot(q, (snapshot) => {
      let isPartnerTyping = false;
      snapshot.forEach((doc) => {
        if (doc.id !== currentUserId) {
          const data = doc.data();
          // Considerar apenas se foi atualizado recentemente (ex: 10s)
          const updatedAt = data.updatedAt?.toDate();
          if (updatedAt && (Date.now() - updatedAt.getTime() < 10000)) {
            isPartnerTyping = true;
          }
        }
      });
      callback(isPartnerTyping);
    });
  }
}

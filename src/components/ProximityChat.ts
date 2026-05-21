/**
 * Gerenciador de Video Chat por Proximidade usando Jitsi Meet External API
 */
export class ProximityChatManager {
  private api: any = null;
  private currentPartnerId: string | null = null;
  private containerId: string = 'jitsi-container';
  private localUser: { displayName: string; email?: string };

  constructor(localUser: { displayName: string; email?: string }) {
    this.localUser = localUser;
  }

  /**
   * Inicia uma chamada com um parceiro
   * @param partnerId ID único do parceiro
   * @param partnerName Nome visível do parceiro
   */
  startCall(partnerId: string, partnerName: string, localUid: string) {
    if (this.currentPartnerId === partnerId) return;
    
    this.endCall(); // Finaliza chamada anterior se houver

    this.currentPartnerId = partnerId;
    const roomId = `BrasilStartups_Hub_${[localUid, partnerId].sort().join('_')}`;
    
    console.log(`Iniciando Proximity Chat com ${partnerName} na sala ${roomId}`);

    const domain = 'meet.jit.si';
    const options = {
      roomName: roomId,
      width: 320,
      height: 240,
      parentNode: document.getElementById(this.containerId),
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: true,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: ['microphone', 'camera', 'hangup'],
        VIDEO_LAYOUT_FIT: 'both',
      },
      userInfo: {
        displayName: this.localUser.displayName,
        email: this.localUser.email
      }
    };

    // @ts-ignore
    this.api = new window.JitsiMeetExternalAPI(domain, options);
    
    // UI Feedback
    const container = document.getElementById(this.containerId);
    if (container) container.style.display = 'block';
  }

  /**
   * Finaliza a chamada ativa
   */
  endCall() {
    if (this.api) {
      this.api.dispose();
      this.api = null;
    }
    this.currentPartnerId = null;
    
    const container = document.getElementById(this.containerId);
    if (container) container.style.display = 'none';
  }

  get isBusy() {
    return !!this.api;
  }
  
  get partnerId() {
    return this.currentPartnerId;
  }
}

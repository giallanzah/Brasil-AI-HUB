import Phaser from 'phaser';
import { PresenceManager, UserPresence } from '../components/Presence';
import { ProximityChatManager } from '../components/ProximityChat';

/**
 * Cena principal do Escritório Virtual Brasil Startups Hub
 */
export class HubScene extends Phaser.Scene {
  private playerContainer!: Phaser.GameObjects.Container;
  private playerBody!: Phaser.GameObjects.Rectangle;
  private playerRing!: Phaser.GameObjects.Arc;
  private playerStatusDot!: Phaser.GameObjects.Arc;
  private playerEyeLeft!: Phaser.GameObjects.Rectangle;
  private playerEyeRight!: Phaser.GameObjects.Rectangle;
  private mapGraphics!: Phaser.GameObjects.Graphics;
  private camX: number = 0;
  private camY: number = 0;
  private prevX: number = 0;
  private prevY: number = 0;
  private otherPlayers: Map<string, { 
    sprite: Phaser.GameObjects.Rectangle, 
    shadow: Phaser.GameObjects.Rectangle,
    label: Phaser.GameObjects.Text, 
    pulseRing?: Phaser.GameObjects.Arc, 
    statusColor: number,
    tween?: Phaser.Tweens.Tween
  }> = new Map();
  private lastPresenceTransmitTime: number = 0;
  private cursorKeys!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys!: any;
  private presenceManager!: PresenceManager;
  private proximityChat!: ProximityChatManager;
  private userId: string = '';
  private userDisplayName: string = '';
  
  // Grupos de física
  private walls!: Phaser.Physics.Arcade.StaticGroup;
  private furniture!: Phaser.Physics.Arcade.StaticGroup;
  private roomZones!: Phaser.Physics.Arcade.StaticGroup;

  // UI elements
  private popupText!: Phaser.GameObjects.Text;
  private currentRoom: string = 'Entrada';
  private proximityGraphics!: Phaser.GameObjects.Graphics;
  private minimapRoomText!: Phaser.GameObjects.Text;
  private minimapHighlight!: Phaser.GameObjects.Graphics;
  private minimapRooms: Map<string, { x: number, y: number, w: number, h: number }> = new Map();
  private globalKeys: Record<string, boolean> = {};
  
  // Parâmetros de Proximity Chat
  private readonly PROXIMITY_JOIN = 150; // Distância para conectar
  private readonly PROXIMITY_LEAVE = 200; // Distância para desconectar (Hysteresis)
  private activePartnerId: string | null = null;
  private externalActionHandler: ((e: any) => void) | null = null;
  private footstepSound!: Phaser.Sound.BaseSound;
  private footstepTimer: number = 0;
  private moveTarget: Phaser.Math.Vector2 | null = null;
  private lastDistanceToTarget: number = 99999;
  private stuckTicks: number = 0;
  private zoomLevel: number = 1.0;
  private minZoom: number = 0.5;
  private maxZoom: number = 2.0;

  constructor() {
    super('HubScene');
  }

  preload() {
    this.load.audio('step', 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
  }

  init(data: { userId: string, displayName: string }) {
    this.userId = data.userId;
    this.userDisplayName = data.displayName;
    this.presenceManager = new PresenceManager(this.userId);
    this.proximityChat = new ProximityChatManager({ displayName: data.displayName });
  }

  create() {
    // 0. CORREÇÃO 1: Foco de teclado e listeners globais
    // Adicionamos listeners globais para garantir que o WASD funcione mesmo se o canvas perder o foco
    this.setupKeyboardListeners();

    // Configurações do Mundo (40x30 tiles de 32px = 1280x960)
    const worldWidth = 1280;
    const worldHeight = 960;
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

    // BACKGROUND GRAPHICS (CORREÇÃO VISUAL)
    this.mapGraphics = this.add.graphics();
    this.drawMapVisuals(worldWidth, worldHeight);

    // 2. PAREDES
    this.walls = this.physics.add.staticGroup();
    
    // 3. MÓVEIS DETALHADOS
    this.furniture = this.physics.add.staticGroup();

    // POPULAÇÃO DO CORREDOR SUPERIOR (y: 0 a 260px)
    
    // 1. SALA "Servidores"
    this.drawRoom(170, 30, 200, 120, 0xf1f5f9, 0x94a3b8, "⚙️ Infra & TI");
    // 4 server racks
    const rackPos = [{x:20,y:30}, {x:36,y:30}, {x:52,y:30}, {x:68,y:30}];
    rackPos.forEach(p => this.add.rectangle(170 - 100 + p.x + 6, 30 + p.y + 12, 12, 24, 0x1e293b).setStrokeStyle(1, 0x94a3b8, 0.2));

    // 2. SALA "Corredor / Recepção"
    this.drawRoom(370, 30, 180, 120, 0xf8fafc, 0xe2e8f0, "🚪 Recepção");
    // Sofá e mesa
    this.add.rectangle(370 - 90 + 30 + 10, 30 + 60 + 7, 60, 14, 0x6c63e8);
    this.add.circle(370 - 90 + 50 + 9, 30 + 55 + 9, 9, 0xffffff).setStrokeStyle(1, 0x6c63e8, 0.1);
    this.drawPlant(370 - 90 + 140, 30 + 20);

    // 3. SALA "Biblioteca" (Superior)
    this.drawRoom(550, 30, 220, 120, 0xf0fdf4, 0x4ade80, "📚 Biblioteca");
    const bookPos = [{x:20,y:20}, {x:36,y:20}, {x:52,y:20}, {x:68,y:20}];
    bookPos.forEach(p => this.add.rectangle(550 - 110 + p.x + 7, 30 + p.y + 14, 14, 28, 0x795548));
    this.drawPlant(550 - 110 + 150, 30 + 20);
    this.add.rectangle(550 - 110 + 90 + 25, 30 + 55 + 12, 50, 24, 0x4e342e);

    // 4. SALA "Reuniões Alpha" (Superior Direita)
    this.drawRoom(780, 30, 220, 120, 0xfff0f0, 0xf87171, "🤝 Reuniões Alpha");
    const alphaTableX = 890;
    const alphaTableY = 90;
    this.add.ellipse(alphaTableX, alphaTableY, 100, 50, 0xfff0f0).setStrokeStyle(1, 0xf87171, 0.1);
    // Cadeiras Corais
    for (let i = 0; i < 4; i++) {
        this.drawChair(alphaTableX - 45 + (i * 30), alphaTableY - 35, 0xf87171);
        this.drawChair(alphaTableX - 45 + (i * 30), alphaTableY + 35, 0xf87171);
    }
    this.drawChair(alphaTableX - 65, alphaTableY, 0xf87171);
    this.drawChair(alphaTableX + 65, alphaTableY, 0xf87171);
    this.drawPlant(980, 50);

    // 5. SALA "Reuniões Beta" (Canto Superior Direito)
    this.drawRoom(1010, 30, 240, 120, 0xe6faf5, 0x5dcaa5, "☕ Reuniões Beta");
    // Estilo informal: Sofás e mesa de centro
    this.add.rectangle(1050, 90, 60, 30, 0x5dcaa5).setStrokeStyle(1, 0x5dcaa5, 0.2); // Sofa Left
    this.add.rectangle(1210, 90, 60, 30, 0x5dcaa5).setStrokeStyle(1, 0x5dcaa5, 0.2); // Sofa Right
    this.add.rectangle(1130, 90, 40, 25, 0x1a1a2e).setStrokeStyle(1, 0x5dcaa5, 0.1); // Coffee Table
    this.drawPlant(1030, 50);
    this.drawPlant(1230, 130);

    // Divisórias principais (estilo Gather)
    this.drawWall(475, 780, 10, 360); // Boardroom / Library separation
    this.drawWall(350, 260, 680, 10); // Horizontal core separation
    this.drawWall(930, 260, 680, 10); 

    // 3. MOBILIÁRIO DETALHADO (REPRODUZINDO A IMAGEM)
    
    // --- BOARDROOM (CONFERENCE) ---
    const tableX = 250, tableY = 780;
    this.drawDetailedFurniture(tableX, tableY, 200, 80, 0xfff0f0, "CONFERÊNCIA");
    // Cadeiras Corais
    for (let i = 0; i < 5; i++) {
        this.drawChair(tableX - 80 + i * 40, tableY - 55, 0xf87171);
        this.drawChair(tableX - 80 + i * 40, tableY + 55, 0xf87171);
    }
    this.drawChair(tableX - 115, tableY, 0xf87171);
    this.drawChair(tableX + 115, tableY, 0xf87171);

    // --- WORKSPACES (LOOR & DEEPTECHS) ---
    this.drawWorkstationCluster(220, 340, "LOOR");
    this.drawWorkstationCluster(220, 430, "LOOR");
    this.drawWorkstationCluster(420, 340, "DEEPTECH");
    this.drawWorkstationCluster(420, 430, "DEEPTECH");

    // --- WORKSPACES (BRASIL STARTUPS & AUREA) ---
    this.drawWorkstationCluster(820, 340, "BS HUB");
    this.drawWorkstationCluster(820, 430, "BS HUB");
    this.drawWorkstationCluster(1020, 340, "AUREA");
    this.drawWorkstationCluster(1020, 430, "AUREA");

    // --- LOUNGE CENTRAL ---
    this.drawDetailedFurniture(640, 340, 80, 30, 0xfff9e6, "Sofa");
    this.drawDetailedFurniture(640, 460, 80, 30, 0xfff9e6, "Sofa");
    this.drawDeco(640, 400, 0xfde68a, 30, 30, "T"); // Coffee Table
    this.drawPlant(580, 340);
    this.drawPlant(700, 460);

    // --- LIBRARY (QUIET ZONE) ---
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 2; col++) {
             this.drawBookshelf(840 + col * 200, 680 + row * 100);
        }
    }
    this.drawDetailedFurniture(1100, 780, 120, 180, 0xf0fdf4, "Estudo"); // Mesa de Estudo

    // 4. ZONAS INTERATIVAS
    this.roomZones = this.physics.add.staticGroup();
    this.createRoomZone(250, 780, 450, 320, 'Sala de Conferência', 'https://meet.google.com/abc-def-ghi');
    this.createRoomZone(890, 90, 220, 120, 'Sala de Reuniões Alpha', 'https://meet.google.com/new');
    this.createRoomZone(1130, 90, 240, 120, 'Sala de Reuniões Beta', 'https://meet.google.com/new-beta');
    this.createRoomZone(350, 400, 380, 250, 'Loor & Deeptechs', '');
    this.createRoomZone(640, 400, 180, 250, 'Lounge Brasil Startups', '');
    this.createRoomZone(930, 400, 380, 250, 'Brasil Startups Workspace', 'https://meet.google.com/xyz-123');
    this.createRoomZone(1000, 780, 450, 320, 'Biblioteca & Quiet Zone', '');

    // 5. AVATAR LOCAL DETALHADO (CORREÇÃO 1 & AVATAR SYSTEM)
    const startX = 750;
    const startY = 395;
    const avatarType = localStorage.getItem('BS_AVATAR') || 'male';
    
    this.playerContainer = this.add.container(startX, startY);
    
    // Shadow Feet (16x4px)
    const shadow = this.add.rectangle(0, 10, 16, 4, 0x000000, 0.3);
    
    // Body (16x20px) - Shirt color based on type
    const shirtColor = avatarType === 'male' ? 0x6c63e8 : 0xf87171; // Indigo vs Coral
    this.playerBody = this.add.rectangle(0, 0, 16, 20, shirtColor);
    
    // Hair 
    let hair;
    if (avatarType === 'male') {
        hair = this.add.rectangle(0, -9, 14, 6, 0x312e81); // Darker Indigo hair
    } else {
        hair = this.add.rectangle(0, -6, 18, 14, 0xfde68b); // Yellow hair
    }

    // Eyes (3x3px white dots)
    this.playerEyeLeft = this.add.rectangle(-3, -4, 2, 2, 0xffffff);
    this.playerEyeRight = this.add.rectangle(3, -4, 2, 2, 0xffffff);
    
    // Pulsing Ring (Indigo)
    this.playerRing = this.add.arc(0, 0, 14, 0, 360, false, 0x9d97f0, 0);
    this.playerRing.setStrokeStyle(1.5, 0x9d97f0, 0.5);
    this.tweens.add({
      targets: this.playerRing,
      scale: 1.3,
      alpha: 0,
      duration: 2000,
      repeat: -1
    });
    
    // Status Dot (Teal online)
    this.playerStatusDot = this.add.circle(8, -10, 3.5, 0x22c55e);
    
    // Name Tag
    const nameTagLabel = this.add.text(0, 24, this.userDisplayName, {
      fontSize: '9px',
      fontStyle: 'bold',
      color: '#e8e6ff',
      backgroundColor: 'rgba(26,23,50,0.65)',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5);
    
    this.playerContainer.add([this.playerRing, shadow, hair, this.playerBody, this.playerEyeLeft, this.playerEyeRight, this.playerStatusDot, nameTagLabel]);
    this.playerContainer.setDepth(10);

    this.physics.add.existing(this.playerContainer);
    const body = this.playerContainer.body as Phaser.Physics.Arcade.Body;
    body.setCollideWorldBounds(true);
    // Reduzir o corpo físico para apenas os pés (8x4px) para facilitar a movimentação entre móveis
    body.setSize(10, 6);
    body.setOffset(-5, 8); 
    
    // 6. CÂMERA (CORREÇÃO 2 & 3: Seguir o Personagem)
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.startFollow(this.playerContainer, true, 0.1, 0.1);
    this.cameras.main.setZoom(this.zoomLevel);
    this.cameras.main.setRoundPixels(true);

    // 7. COLISÕES
    this.physics.add.collider(this.playerContainer, this.walls);
    this.physics.add.collider(this.playerContainer, this.furniture);

    // 8. CONTROLES
    this.cursorKeys = this.input.keyboard!.createCursorKeys();
    this.wasdKeys = this.input.keyboard!.addKeys('W,A,S,D');
    this.input.keyboard!.clearCaptures();

    // 9. SINCRONIZAÇÃO
    PresenceManager.subscribeToUsers((users) => {
      this.updateOtherPlayers(users);
    });

    // 10. UI OVERLAY
    this.popupText = this.add.text(worldWidth / 2, 20, 'Escritório Virtual • Brasil Startups Hub', {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold',
      backgroundColor: '#6c63e8',
      padding: { x: 20, y: 10 }
    }).setScrollFactor(0).setOrigin(0.5).setDepth(100);

    // 11. PROXIMITY GRAPHICS
    this.proximityGraphics = this.add.graphics();
    this.proximityGraphics.setDepth(5);

    // 12. MINI-MAPA
    this.createMinimap(worldWidth, worldHeight);

    // 13. MARCADORES DE SALA PARA O MINI-MAPA
    this.createMinimapMarkers();

    // 14. HIGHLIGHT DE PULSO NO MINI-MAPA
    this.minimapHighlight = this.add.graphics();
    this.minimapHighlight.setDepth(2);
    this.cameras.main.ignore(this.minimapHighlight);
    
    this.tweens.add({
      targets: this.minimapHighlight,
      alpha: 0.3,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // 15. CORREÇÃO 2: Garantir que o usuário local apareça na lista de presença
    this.presenceManager.updatePosition(startX, startY, this.currentRoom);

    // 15. GERENCIADOR DE AÇÕES EXTERNAS (React -> Phaser)
    this.footstepSound = this.sound.add('step');
    this.externalActionHandler = (e: any) => {
      const { type, userId, x, y, room } = e.detail;
      if (type === 'TELEPORT_TO_USER') {
        const target = this.otherPlayers.get(userId);
        if (target) {
          this.playerContainer.setPosition(target.sprite.x, target.sprite.y);
          this.popupText.setText(`TELEPORTADO PARA ${target.label.text.toUpperCase()}`);
          this.popupText.setColor('#4ade80');
          this.time.delayedCall(3000, () => {
             if (this.popupText.text.includes('TELEPORTADO')) {
               this.popupText.setText(`VOCÊ ESTÁ EM: ${this.currentRoom.toUpperCase()}`);
               this.popupText.setColor('#94a3b8');
             }
          });
          this.setFacingDirection('down');
          this.moveTarget = null;
          this.presenceManager.updatePosition(target.sprite.x, target.sprite.y, this.currentRoom);
        }
      } else if (type === 'TELEPORT_TO_COORD') {
        this.playerContainer.setPosition(x, y);
        this.currentRoom = room || 'Hub';
        this.popupText.setText(`TELEPORTADO PARA: ${this.currentRoom.toUpperCase()}`);
        this.popupText.setColor('#4ade80');
        this.time.delayedCall(3000, () => {
           this.popupText.setText(`VOCÊ ESTÁ EM: ${this.currentRoom.toUpperCase()}`);
           this.popupText.setColor('#94a3b8');
         });
         
         const targetIndicator = this.add.circle(x, y, 6, 0x6c63e8, 0.4);
         targetIndicator.setDepth(1);
         this.tweens.add({
           targets: targetIndicator,
           scale: 3,
           alpha: 0,
           duration: 800,
           repeat: 1,
           onComplete: () => targetIndicator.destroy()
         });
         
         this.setFacingDirection('down');
         this.moveTarget = null;
         this.presenceManager.updatePosition(x, y, this.currentRoom);
      }
    };
    window.addEventListener('PHASER_ACTION', this.externalActionHandler);

    this.events.on('shutdown', () => {
      if (this.externalActionHandler) {
        window.removeEventListener('PHASER_ACTION', this.externalActionHandler);
      }
    });

    // 16. CLICK TO MOVE / TELEPORT (Auxílio na navegação livre pelo mapa)
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      // Ignorar cliques na navbar ou HUD
      if (pointer.y < 64) return;
      
      const worldPoint = pointer.positionToCamera(this.cameras.main) as Phaser.Math.Vector2;
      this.moveTo(worldPoint.x, worldPoint.y);
    });

    // 17. ZOOM CONTROLS (Mouse Wheel & Keyboard)
    this.input.on('wheel', (pointer: Phaser.Input.Pointer, gameObjects: any, deltaX: number, deltaY: number, deltaZ: number) => {
      const zoomAmount = deltaY > 0 ? -0.1 : 0.1;
      this.applyZoom(this.zoomLevel + zoomAmount);
    });
  }

  private applyZoom(newZoom: number) {
    this.zoomLevel = Phaser.Math.Clamp(newZoom, this.minZoom, this.maxZoom);
    
    this.tweens.add({
      targets: this.cameras.main,
      zoom: this.zoomLevel,
      duration: 300,
      ease: 'Cubic.easeOut'
    });
  }

  private moveTo(x: number, y: number) {
    if (!this.playerContainer) return;

    this.moveTarget = new Phaser.Math.Vector2(x, y);
    this.lastDistanceToTarget = 99999;
    this.stuckTicks = 0;

    // Feedback visual sutil (Pulsar no destino com a cor Indigo do Gather Town)
    const targetIndicator = this.add.circle(x, y, 6, 0x6c63e8, 0.4);
    targetIndicator.setDepth(1);
    
    // Animação de pulsar fraco
    this.tweens.add({
      targets: targetIndicator,
      scale: 3,
      alpha: 0,
      duration: 800,
      repeat: 1,
      onComplete: () => targetIndicator.destroy()
    });
  }

  private createMinimapMarkers() {
    const markers = this.add.graphics();
    markers.lineStyle(2, 0x9d97f0, 0.5);
    markers.fillStyle(0x9d97f0, 0.1);

    // Boardroom
    markers.fillRect(25, 620, 450, 320);
    
    // Workspaces
    markers.fillRect(160, 275, 380, 250);
    markers.fillRect(740, 275, 380, 250);

    // Lounge
    markers.fillRect(550, 275, 180, 250);

    // Library
    markers.fillRect(785, 620, 450, 320);

    // Suites (Topo)
    for (let i = 0; i < 7; i++) {
        markers.fillRect(55 + i * 170, 20, 150, 240);
    }

    // Alpha Meeting Room
    markers.fillRect(780, 30, 220, 120);

    markers.setDepth(1);
    this.cameras.main.ignore(markers);
  }

  private drawDetailedFurniture(x: number, y: number, w: number, h: number, color: number, label: string) {
    this.add.rectangle(x + 4, y + 4, w, h, 0x000000, 0.15); // Shadow
    const item = this.add.rectangle(x, y, w, h, color);
    item.setStrokeStyle(1, 0x000000, 0.1);
    
    if (label) {
      this.add.text(x, y, label, { fontSize: '8px', color: '#000000' }).setOrigin(0.5).setAlpha(0.4);
    }

    this.physics.add.existing(item, true);
    this.furniture.add(item);
  }

  private drawWorkstationCluster(x: number, y: number, label: string) {
    // Mesa - Madeira Gather Town
    this.drawDetailedFurniture(x, y, 160, 40, 0xe8e6ff, label);
    // Monitores (Pequenos retângulos escuros)
    this.add.rectangle(x - 40, y - 10, 30, 4, 0x1a1a2e).setDepth(2);
    this.add.rectangle(x + 40, y - 10, 30, 4, 0x1a1a2e).setDepth(2);
    // Cadeira Roxo
    this.drawChair(x, y + 35, 0x6c63e8);
  }

  private drawChair(x: number, y: number, color: number) {
    const chair = this.add.rectangle(x, y, 24, 24, color).setStrokeStyle(1, 0x000000, 0.2);
    this.physics.add.existing(chair, true);
    this.furniture.add(chair);
  }

  private drawPlant(x: number, y: number) {
    const pot = this.add.rectangle(x, y + 10, 16, 12, 0x795548);
    const leaves = this.add.circle(x, y - 5, 14, 0x33691e);
    this.physics.add.existing(pot, true);
    this.furniture.add(pot);
  }

  private drawBookshelf(x: number, y: number) {
    const shelf = this.add.rectangle(x, y, 120, 24, 0x6d4c41).setStrokeStyle(1, 0x4e342e);
    // Padrão de Livros
    for (let i = 0; i < 8; i++) {
        const color = i % 2 === 0 ? 0xf5a623 : 0xe8e6ff;
        this.add.rectangle(x - 50 + i * 14, y, 10, 18, color, 0.6);
    }
    this.physics.add.existing(shelf, true);
    this.furniture.add(shelf);
  }

  private drawDeco(x: number, y: number, color: number, w: number, h: number, label: string) {
    const item = this.add.rectangle(x, y, w, h, color).setStrokeStyle(1, 0x000000, 0.1);
    if (label) {
        this.add.text(x, y, label, { fontSize: '10px', color: '#000000' }).setOrigin(0.5).setAlpha(0.3);
    }
    this.physics.add.existing(item, true);
    this.furniture.add(item);
  }

  private createMinimap(worldWidth: number, worldHeight: number) {
    const mapWidth = 180;
    const mapHeight = 135;
    const padding = 20;
    const scale = 0.14; // Zoom para caber o mapa 1280x960 no mini-mapa

    // Câmera do Mini-mapa
    const minimap = this.cameras.add(
      this.scale.width - mapWidth - padding, 
      padding, 
      mapWidth, 
      mapHeight
    ).setZoom(scale).setName('minimap').setBackgroundColor(0x1a1732);

    // Centralizar a visualização do mini-mapa no mundo
    minimap.scrollX = (worldWidth / 2) - (mapWidth / scale) / 2;
    minimap.scrollY = (worldHeight / 2) - (mapHeight / scale) / 2;
    minimap.setBounds(0, 0, worldWidth, worldHeight);

    // Moldura do Mini-mapa (Fixa na UI)
    const frame = this.add.graphics();
    frame.lineStyle(3, 0x6c63e8, 0.3);
    frame.strokeRect(
      this.scale.width - mapWidth - padding - 2, 
      padding - 2, 
      mapWidth + 4, 
      mapHeight + 4
    );
    frame.setScrollFactor(0).setDepth(200);

    // Label da Sala Atual no Mini-mapa
    this.minimapRoomText = this.add.text(
      this.scale.width - (mapWidth / 2) - padding, 
      padding + mapHeight + 10, 
      'ENTRADA', 
      {
        fontSize: '10px',
        fontStyle: '900',
        color: '#9d97f0',
        backgroundColor: '#1a1732aa',
        padding: { x: 8, y: 4 }
      }
    ).setOrigin(0.5, 0).setScrollFactor(0).setDepth(201);

    // Ignorar elementos de UI na câmera do mini-mapa
    minimap.ignore([this.popupText, this.proximityGraphics, frame, this.minimapRoomText]);
  }

  private setupKeyboardListeners() {
    this.globalKeys = {};
    const handleKeyDown = (e: KeyboardEvent) => {
      // Se o usuário estiver focando em algum campo de entrada, ignorar e limpar estados
      const activeEl = document.activeElement;
      const isInputActive = activeEl && activeEl.isConnected && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        (activeEl as HTMLElement).isContentEditable
      );
      if (isInputActive) {
        this.globalKeys = {};
        return;
      }

      this.globalKeys[e.code] = true;
      
      // Atalhos de Zoom
      if (e.key === '+' || e.key === '=') this.applyZoom(this.zoomLevel + 0.1);
      if (e.key === '-' || e.key === '_') this.applyZoom(this.zoomLevel - 0.1);

      // Prevenir scroll com WASD / Setas
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space'].includes(e.code)) {
        e.preventDefault();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInputActive = activeEl && activeEl.isConnected && (
        activeEl.tagName === 'INPUT' || 
        activeEl.tagName === 'TEXTAREA' || 
        (activeEl as HTMLElement).isContentEditable
      );
      if (isInputActive) {
        this.globalKeys = {};
        return;
      }
      this.globalKeys[e.code] = false;
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    this.events.on('shutdown', () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    });
  }

  update(time: number, delta: number) {
    if (!this.playerContainer) return;

    // Gerenciar habilitar/desabilitar captura de teclado do Phaser para permitir digitação no chat
    const activeEl = document.activeElement;
    const isInputActive = activeEl && activeEl.isConnected && (
      activeEl.tagName === 'INPUT' || 
      activeEl.tagName === 'TEXTAREA' || 
      (activeEl as HTMLElement).isContentEditable
    );

    if (isInputActive) {
      if (this.input.keyboard && this.input.keyboard.enabled) {
        this.input.keyboard.enabled = false;
        this.globalKeys = {};
        if (this.cursorKeys) {
          this.cursorKeys.left?.reset();
          this.cursorKeys.right?.reset();
          this.cursorKeys.up?.reset();
          this.cursorKeys.down?.reset();
        }
        if (this.wasdKeys) {
          this.wasdKeys.W?.reset();
          this.wasdKeys.A?.reset();
          this.wasdKeys.S?.reset();
          this.wasdKeys.D?.reset();
        }
        this.moveTarget = null;
      }
    } else {
      if (this.input.keyboard && !this.input.keyboard.enabled) {
        this.input.keyboard.enabled = true;
      }
    }

    this.updatePlayerMovement(delta);
    
    // EFEITO SONORO DE PASSOS
    const body = this.playerContainer.body as Phaser.Physics.Arcade.Body;
    if (body.velocity.x !== 0 || body.velocity.y !== 0) {
      this.footstepTimer -= delta;
      if (this.footstepTimer <= 0) {
        this.footstepTimer = 300; // Intervalo entre passos

        // Variação baseada no "piso" (sala atual)
        let pitch = 1.0;
        let volume = 0.2;

        if (this.currentRoom.includes('Servidores')) {
          pitch = 1.4; // Som mais agudo/metálico
          volume = 0.3;
        } else if (this.currentRoom.includes('Biblioteca')) {
          pitch = 0.7; // Som mais abafado/carpete
          volume = 0.15;
        } else if (this.currentRoom.includes('Brasil Startups')) {
          pitch = 1.1;
          volume = 0.25;
        }

        this.footstepSound.play({
          detune: (Math.random() - 0.5) * 100, // Variação randômica sutil
          rate: pitch,
          volume: volume
        });
      }
    } else {
      this.footstepTimer = 0; // Reset ao parar
    }

    // Sincronização periódica inteligente (Keepalive 12s parado, 800ms em movimento)
    const isMoving = (body.velocity.x !== 0 || body.velocity.y !== 0);
    const interval = isMoving ? 800 : 12000;
    if (time - this.lastPresenceTransmitTime > interval) {
      this.lastPresenceTransmitTime = time;
      this.presenceManager.updatePosition(this.playerContainer.x, this.playerContainer.y, this.currentRoom);
    }

    // Atualização do Highlight do Mini-mapa
    this.updateMinimapHighlight();

    this.updateProximity();
  }

  private updatePlayerMovement(delta: number) {
    const body = this.playerContainer.body as Phaser.Physics.Arcade.Body;
    const speed = 180;
    
    body.setVelocity(0);

    // Se o usuário estiver focado em algum campo de entrada, cancelar movimento e retornar
    const activeEl = document.activeElement;
    const isInputActive = activeEl && activeEl.isConnected && (
      activeEl.tagName === 'INPUT' || 
      activeEl.tagName === 'TEXTAREA' || 
      (activeEl as HTMLElement).isContentEditable
    );
    if (isInputActive) {
      this.moveTarget = null;
      return;
    }

    let dx = 0;
    let dy = 0;

    const cursors = this.cursorKeys;
    const wKey = this.wasdKeys?.W;
    const aKey = this.wasdKeys?.A;
    const sKey = this.wasdKeys?.S;
    const dKey = this.wasdKeys?.D;

    if (this.globalKeys['ArrowLeft'] || this.globalKeys['KeyA'] || cursors?.left?.isDown || aKey?.isDown) dx -= 1;
    if (this.globalKeys['ArrowRight'] || this.globalKeys['KeyD'] || cursors?.right?.isDown || dKey?.isDown) dx += 1;
    if (this.globalKeys['ArrowUp'] || this.globalKeys['KeyW'] || cursors?.up?.isDown || wKey?.isDown) dy -= 1;
    if (this.globalKeys['ArrowDown'] || this.globalKeys['KeyS'] || cursors?.down?.isDown || sKey?.isDown) dy += 1;

    if (dx !== 0 || dy !== 0) {
      // Teclado cancela movimentação automática do mouse
      this.moveTarget = null;

      const length = Math.sqrt(dx * dx + dy * dy);
      body.setVelocityX((dx / length) * speed);
      body.setVelocityY((dy / length) * speed);
    } else if (this.moveTarget) {
      const distance = Phaser.Math.Distance.Between(this.playerContainer.x, this.playerContainer.y, this.moveTarget.x, this.moveTarget.y);
      
      // Se já está no destino ou super próximo, para
      if (distance < 6) {
        body.setVelocity(0);
        this.moveTarget = null;
      } else {
        // Prevenir ficar travado indefinidamente se colidir e não houver progresso real de distância
        const isCurrentlyColliding = body.blocked.none === false || body.touching.none === false;
        if (distance >= this.lastDistanceToTarget && isCurrentlyColliding) {
          this.stuckTicks += 1;
        } else {
          this.stuckTicks = 0;
        }
        
        // Se ficou preso por mais de 90 frames (1.5 segundos), cancela para não tremer
        if (this.stuckTicks > 90) {
          body.setVelocity(0);
          this.moveTarget = null;
        } else {
          this.lastDistanceToTarget = distance;
          
          // Mover em direção ao ponto alvo
          const angle = Phaser.Math.Angle.Between(this.playerContainer.x, this.playerContainer.y, this.moveTarget.x, this.moveTarget.y);
          body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
        }
      }
    }

    // Atualizar direção visual baseada na velocidade
    if (Math.abs(body.velocity.x) > Math.abs(body.velocity.y)) {
      if (body.velocity.x < 0) {
        this.setFacingDirection('left');
      } else if (body.velocity.x > 0) {
        this.setFacingDirection('right');
      }
    } else if (Math.abs(body.velocity.y) > 0) {
      if (body.velocity.y < 0) {
        this.setFacingDirection('up');
      } else if (body.velocity.y > 0) {
        this.setFacingDirection('down');
      }
    }
  }

  private setFacingDirection(direction: 'up' | 'down' | 'left' | 'right') {
    if (!this.playerEyeLeft || !this.playerEyeRight) return;
    
    switch (direction) {
      case 'left':
        this.playerEyeLeft.setVisible(true).setPosition(-5, -4);
        this.playerEyeRight.setVisible(true).setPosition(-1, -4);
        break;
      case 'right':
        this.playerEyeLeft.setVisible(true).setPosition(1, -4);
        this.playerEyeRight.setVisible(true).setPosition(5, -4);
        break;
      case 'up':
        this.playerEyeLeft.setVisible(false);
        this.playerEyeRight.setVisible(false);
        break;
      case 'down':
        this.playerEyeLeft.setVisible(true).setPosition(-3, -4);
        this.playerEyeRight.setVisible(true).setPosition(3, -4);
        break;
    }
  }

  private updateMinimapHighlight() {
    if (!this.minimapHighlight) return;
    
    this.minimapHighlight.clear();
    const room = this.minimapRooms.get(this.currentRoom);
    
    if (room) {
      this.minimapHighlight.fillStyle(0x4ade80, 0.6);
      this.minimapHighlight.fillRect(room.x, room.y, room.w, room.h);
      this.minimapHighlight.lineStyle(4, 0xffffff, 0.8);
      this.minimapHighlight.strokeRect(room.x, room.y, room.w, room.h);
    }

    const minimapTextElement = document.getElementById('minimap-room');
    if (minimapTextElement) {
      minimapTextElement.textContent = this.currentRoom.toUpperCase();
    }
  }

  private updateProximity() {
    this.proximityGraphics.clear();
    let closestUser: { id: string, data: any } | null = null;
    let minDistance = this.PROXIMITY_JOIN;

    this.otherPlayers.forEach((data, id) => {
      const distance = Phaser.Math.Distance.Between(
        this.playerContainer.x, this.playerContainer.y,
        data.sprite.x, data.sprite.y
      );

      // Feedback Visual: Linha de conexão quando está perto
      if (distance < this.PROXIMITY_LEAVE) {
        const opacity = Phaser.Math.Clamp(1 - (distance / this.PROXIMITY_LEAVE), 0.1, 0.6);
        this.proximityGraphics.lineStyle(2, 0x9d97f0, opacity);
        this.proximityGraphics.lineBetween(
          this.playerContainer.x, this.playerContainer.y,
          data.sprite.x, data.sprite.y
        );

        if (distance < minDistance) {
          minDistance = distance;
          closestUser = { id, data };
        }
      }

      // Ring pulsar se estiver próximo (preparando para conectar) ou em chamada
      const isNearby = distance < this.PROXIMITY_JOIN;
      const isActive = this.activePartnerId === id;

      if (isNearby || isActive) {
        if (!data.pulseRing) {
          data.pulseRing = this.add.circle(data.sprite.x, data.sprite.y, 40, data.statusColor, 0.2);
          data.pulseRing.setDepth(4);
          this.tweens.add({
            targets: data.pulseRing,
            radius: 50,
            alpha: 0,
            duration: 1000,
            repeat: -1
          });
        }
        // Atualiza cor e posição (usa cor de status)
        data.pulseRing.setFillStyle(data.statusColor, 0.2);
        data.pulseRing.setPosition(data.sprite.x, data.sprite.y);
      } else if (data.pulseRing) {
        data.pulseRing.destroy();
        data.pulseRing = undefined;
      }
    });

    // Lógica Automática de Conexão
    if (closestUser) {
      if (this.activePartnerId !== closestUser.id) {
        this.activePartnerId = closestUser.id;
        const partnerName = closestUser.data.label.text;
        
        // Iniciar Video Chat
        this.proximityChat.startCall(closestUser.id, partnerName, this.userId);
        
        // Iniciar Chat de Texto (Emitir evento para o React)
        const roomId = `BrasilStartups_Hub_${[this.userId, closestUser.id].sort().join('_')}`;
        window.dispatchEvent(new CustomEvent('PHASER_CHAT', {
          detail: { 
            type: 'START_CHAT', 
            roomId, 
            partnerName, 
            partnerId: closestUser.id 
          }
        }));

        this.popupText.setText(`CONECTADO COM ${partnerName.toUpperCase()}`);
        this.popupText.setColor('#4ade80');
      }
    } else if (this.activePartnerId) {
      // Verifica se o parceiro atual saiu do range extendido (Hysteresis)
      const activeData = this.otherPlayers.get(this.activePartnerId);
      if (activeData) {
        const distance = Phaser.Math.Distance.Between(
          this.playerContainer.x, this.playerContainer.y,
          activeData.sprite.x, activeData.sprite.y
        );
        
        if (distance > this.PROXIMITY_LEAVE) {
          this.closeConnections();
        }
      } else {
        this.closeConnections();
      }
    }
  }

  private closeConnections() {
    this.proximityChat.endCall();
    this.activePartnerId = null;
    this.popupText.setText(`VOCÊ ESTÁ EM: ${this.currentRoom.toUpperCase()}`);
    this.popupText.setColor('#94a3b8');
    
    // Encerrar Chat de Texto no React
    window.dispatchEvent(new CustomEvent('PHASER_CHAT', {
      detail: { type: 'END_CHAT' }
    }));
  }

  private drawRoom(x: number, y: number, w: number, h: number, bg: number, border: number, label: string) {
    this.add.rectangle(x + w/2, y + h/2, w, h, bg).setStrokeStyle(2, border, 0.4);
    this.add.text(x + w/2, y + 15, label, { 
      fontSize: '10px', 
      fontStyle: 'bold', 
      color: '#ffffff'
    }).setOrigin(0.5).setAlpha(0.7);
    
    // Registrar para o mini-mapa
    this.minimapRooms.set(label, { x, y, w, h });

    // Adicionar colisões de parede ao redor da sala
    this.drawWall(x + w/2, y, w, 4);
    this.drawWall(x + w/2, y + h, w, 4);
    this.drawWall(x, y + h/2, 4, h);
    this.drawWall(x + w, y + h/2, 4, h);
  }

  private drawMapVisuals(MAP_W: number, MAP_H: number) {
    const g = this.mapGraphics;
    g.clear();

    // PISO GERAL (Bege Gather.town)
    g.fillStyle(0xe8d5b0);
    g.fillRect(0, 0, MAP_W, MAP_H);

    // BORDAS EXTERNAS (Grama verde natural)
    g.fillStyle(0x8bc34a);
    g.fillRect(0, 0, MAP_W, 28); // Top
    g.fillRect(0, MAP_H - 28, MAP_W, 28); // Bottom
    g.fillRect(0, 0, 28, MAP_H); // Left
    g.fillRect(MAP_W - 28, 0, 28, MAP_H); // Right

    // GRID DE TILES (Sutil Roxo)
    g.lineStyle(0.5, 0x6c63e8, 0.06);
    for (let x = 28; x < MAP_W - 28; x += 32) {
      g.lineBetween(x, 28, x, MAP_H - 28);
    }
    for (let y = 28; y < MAP_H - 28; y += 32) {
      g.lineBetween(28, y, MAP_W - 28, y);
    }

    // LAGO/FONTE (Topo centro) - Teal mid
    const lakeX = 490 * 2;
    const lakeY = 76 * 2;
    g.fillStyle(0x5dcaa5, 0.2);
    g.fillEllipse(lakeX, lakeY, 110, 76);
    g.lineStyle(1.5, 0x5dcaa5, 0.5);
    g.strokeEllipse(lakeX, lakeY, 110, 76);
    
    // Reflexo do Lago
    g.fillStyle(0xb3e5fc, 0.5);
    g.fillEllipse(lakeX - 16, lakeY - 16, 56, 32);

    // ÁRVORES (8 posições específicas)
    const treePositions = [
      {x:4, y:4}, {x:630, y:4}, {x:4, y:430}, {x:630, y:430},
      {x:290, y:4}, {x:140, y:440}, {x:470, y:440}, {x:530, y:4}
    ];

    treePositions.forEach(p => {
      this.drawTreeGraphics(p.x * 2, p.y * 2);
    });
  }

  private drawTreeGraphics(x: number, y: number) {
    const g = this.mapGraphics;
    
    // Tronco (#795548)
    g.fillStyle(0x795548);
    g.fillRect(x + 14, y + 32, 12, 16); // Escala x2 (7*2, 16*2, 6*2, 8*2)

    // Copa principal (#33691e)
    g.fillStyle(0x33691e);
    g.fillEllipse(x + 20, y + 20, 20, 18); // Escala x2 (10*2, 9*2)

    // Sombra da copa (#1b5e20, Alpha 0.3)
    g.fillStyle(0x1b5e20, 0.3);
    g.fillEllipse(x + 24, y + 28, 14, 10); // Escala x2 (12*2, 14*2 as offset? No, ellipse radii)
  }

  private drawWall(x: number, y: number, w: number, h: number) {
    const wall = this.add.rectangle(x, y, w, h, 0x1e293b, 0.6); // Paredes Gather style
    wall.setStrokeStyle(1, 0x6c63e8, 0.2);
    this.physics.add.existing(wall, true);
    this.walls.add(wall);
  }

  private drawFurniture(x: number, y: number, w: number, h: number, color: number) {
    const item = this.add.rectangle(x, y, w, h, color);
    this.physics.add.existing(item, true);
    this.furniture.add(item);
  }

  private createRoomZone(x: number, y: number, w: number, h: number, roomName: string, meetUrl: string) {
    const zone = this.add.rectangle(x, y, w, h, 0x4ade80, 0.03);
    this.roomZones.add(zone);
    
    // Registrar para o mini-mapa
    this.minimapRooms.set(roomName, { x: x - w/2, y: y - h/2, w, h });

    this.add.text(x, y - (h/2) + 20, roomName.toUpperCase(), { 
      fontSize: '10px', color: '#6c63e8', fontStyle: 'bold', letterSpacing: 2
    }).setOrigin(0.5);

    this.physics.add.overlap(this.playerContainer, zone, () => {
      if (this.currentRoom !== roomName) {
        this.currentRoom = roomName;
        if (meetUrl) {
          this.popupText.setText(`PRESSIONE [F] PARA ENTRAR NO GOOGLE MEET: ${roomName}`);
          this.popupText.setColor('#fbbf24');
          this.input.keyboard!.once('keydown-F', () => {
             if (this.currentRoom === roomName) window.open(meetUrl, '_blank');
          });
        } else {
          this.popupText.setText(`VOCÊ ESTÁ EM: ${roomName.toUpperCase()}`);
          this.popupText.setColor('#94a3b8');
        }
      }
    });
  }

  private updateOtherPlayers(users: UserPresence[]) {
    // Apenas mostrar e atualizar usuários que estão ativos/online (não offline)
    const activeUsers = users.filter(u => u.status !== 'offline');
    const currentIds = new Set(activeUsers.map(u => u.userId));
    
    this.otherPlayers.forEach((data, id) => {
      if (!currentIds.has(id)) {
        data.sprite.destroy();
        data.shadow.destroy();
        data.label.destroy();
        if (data.pulseRing) data.pulseRing.destroy();
        if (data.tween) data.tween.stop();
        this.otherPlayers.delete(id);
      }
    });

    activeUsers.forEach(u => {
      const statusColors: any = {
        online: 0x22c55e,
        absent: 0xf5a623,
        'in-meeting': 0xf87171
      };
      const color = statusColors[u.status] || 0x22c55e;

      if (u.userId === this.userId) {
        // Atualizar cor do anel e status dot do próprio jogador
        if (this.playerRing) {
          this.playerRing.setStrokeStyle(1.5, color, 0.5);
        }
        if (this.playerStatusDot) {
          this.playerStatusDot.setFillStyle(color);
        }
        return;
      }
      
      const isCalling = this.activePartnerId === u.userId;
      const displayName = `${isCalling ? '🎙️ ' : ''}${u.displayName || 'Membro'}`;

      if (this.otherPlayers.has(u.userId)) {
        const data = this.otherPlayers.get(u.userId)!;
        
        // Mover o sprite do outro player e a sua sombra de forma suave
        const dist = Phaser.Math.Distance.Between(data.sprite.x, data.sprite.y, u.x, u.y);
        if (dist > 1) {
          if (dist > 200) {
            if (data.tween) data.tween.stop();
            data.sprite.setPosition(u.x, u.y);
            data.shadow.setPosition(u.x, u.y + 10);
            data.label.setPosition(u.x, u.y - 35);
            if (data.pulseRing) data.pulseRing.setPosition(u.x, u.y);
          } else {
            if (data.tween) data.tween.stop();
            data.tween = this.tweens.add({
              targets: data.sprite,
              x: u.x,
              y: u.y,
              duration: 400,
              ease: 'Linear',
              onUpdate: () => {
                data.shadow.setPosition(data.sprite.x, data.sprite.y + 10);
                data.label.setPosition(data.sprite.x, data.sprite.y - 35);
                if (data.pulseRing) data.pulseRing.setPosition(data.sprite.x, data.sprite.y);
              }
            });
          }
        }
        
        data.label.setText(displayName);
        data.statusColor = color;
        if (isCalling) data.label.setColor('#4ade80');
        else data.label.setColor('#ffffff');
        
        // Se houver um anel de pulso (proximity), atualizar cor baseado no status
        if (data.pulseRing) {
          data.pulseRing.setFillStyle(color, 0.35); // Mais opaco para visibilidade
        }
      } else {
        const sprite = this.add.rectangle(u.x, u.y, 16, 20, color);
        // Shadow for other player
        const shadow = this.add.rectangle(u.x, u.y + 10, 16, 4, 0x000000, 0.3).setDepth(sprite.depth - 1);
        const label = this.add.text(u.x, u.y - 35, displayName, {
          fontSize: '10px', fontStyle: 'bold', color: '#ffffff', backgroundColor: '#1e293b', padding: { x: 6, y: 3 }
        }).setOrigin(0.5);
        this.otherPlayers.set(u.userId, { sprite, shadow, label, statusColor: color });
      }
    });
  }
}


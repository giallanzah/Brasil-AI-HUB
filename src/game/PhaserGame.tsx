import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { HubScene } from '../scenes/HubScene';

interface PhaserGameProps {
  userId: string;
  displayName: string;
}

export default function PhaserGame({ userId, displayName }: PhaserGameProps) {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: 'game-container',
      width: '100%',
      height: '100%',
      physics: {
        default: 'arcade',
        arcade: { debug: false }
      },
      scene: [HubScene],
      backgroundColor: '#0f172a',
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };

    const game = new Phaser.Game(config);
    game.scene.start('HubScene', { userId, displayName });
    gameRef.current = game;

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, [userId, displayName]);

  return <div id="game-container" className="w-full h-full" />;
}


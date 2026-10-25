// arte.js - generación de texturas por tipo para Phaser 4
(function(){
  function crearTexturas(scene){
    if(!scene || !scene.textures) return;
    const t = scene.textures;
    // tierra: 3 variantes
    for(let v=0; v<3; v++){
      const key = 'tex_tierra_'+v;
      if(t.exists(key)) continue;
      const g = scene.add.graphics();
      g.fillStyle(0xB0895B, 1);
      g.fillRect(0,0,32,32);
      g.fillStyle(0x9B7F58, 0.5);
      for(let i=0;i<6;i++){
        const x = 2 + Math.random()*26;
        const y = 2 + Math.random()*26;
        g.fillRect(x,y,1,1);
      }
      g.fillStyle(0xC49A6C, 0.4);
      for(let i=0;i<4;i++){
        const x = 4 + Math.random()*24;
        const y = 4 + Math.random()*24;
        g.fillRect(x,y,1,1);
      }
      g.generateTexture(key, 32, 32);
      g.destroy();
    }
    // pasto alto
    for(let v=0; v<3; v++){
      const key = 'tex_pasto_alto_'+v;
      if(t.exists(key)) continue;
      const g = scene.add.graphics();
      g.fillStyle(0x7FA63A, 1);
      g.fillRect(0,0,32,32);
      g.lineStyle(1, 0x6F962E, 0.9);
      for(let i=0;i<8;i++){
        const x = 2 + i*3 + (v%2)*1.5;
        g.beginPath();
        g.moveTo(x, 32);
        g.lineTo(x-1, 20);
        g.lineTo(x+1, 12);
        g.strokePath();
      }
      g.generateTexture(key, 32, 32);
      g.destroy();
    }
    // barro
    for(let v=0; v<2; v++){
      const key = 'tex_barro_'+v;
      if(t.exists(key)) continue;
      const g = scene.add.graphics();
      g.fillStyle(0x6B4A2C, 1);
      g.fillRect(0,0,32,32);
      g.fillStyle(0x5C3B24, 0.6);
      g.fillCircle(10+v*6, 12, 4);
      g.fillCircle(20-v*4, 22, 3);
      g.fillStyle(0x7F5A3C, 0.4);
      g.fillRect(6, 18, 8, 2);
      g.generateTexture(key, 32, 32);
      g.destroy();
    }
    // expuesta
    for(let v=0; v<2; v++){
      const key = 'tex_expuesta_'+v;
      if(t.exists(key)) continue;
      const g = scene.add.graphics();
      g.fillStyle(0xE9A95C, 1);
      g.fillRect(0,0,32,32);
      g.fillStyle(0xF0B86C, 0.5);
      g.fillRect(0,0,32,6);
      g.generateTexture(key, 32, 32);
      g.destroy();
    }
    // piedra
    for(let v=0; v<2; v++){
      const key = 'tex_piedra_'+v;
      if(t.exists(key)) continue;
      const g = scene.add.graphics();
      g.fillStyle(0x3F3F3F, 1);
      g.fillRoundedRect(4, 6, 24, 20, 6);
      g.fillStyle(0x2F2F2F, 0.6);
      g.fillRoundedRect(6, 8, 10, 8, 4);
      g.lineStyle(1, 0x000000, 0.7);
      g.strokeRoundedRect(4, 6, 24, 20, 6);
      g.generateTexture(key, 32, 32);
      g.destroy();
    }
  }

  function obtenerKey(tipo, x, y){
    if(tipo === 'piedra') return 'tex_piedra_'+(Math.abs(x*131542391+y) % 2);
    if(tipo === 'barro') return 'tex_barro_'+(Math.abs(x*1009+y*9176) % 2);
    if(tipo === 'expuesta') return 'tex_expuesta_'+(Math.abs(x*9176+y*1009) % 2);
    if(tipo === 'pasto_alto') return 'tex_pasto_alto_'+(Math.abs(x*131542391+y*1000000009) % 3);
    if(tipo === 'tierra') return 'tex_tierra_'+(Math.abs(x*7919+y*104729) % 3);
    return 'tex_tierra_0';
  }

  if(typeof window !== 'undefined'){
    window.Arte = { crearTexturas: crearTexturas, obtenerKey: obtenerKey };
  }
})();

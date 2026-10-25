// hormigaVisual.js - dibujo y animación de la hormiga para Phaser 4
(function(){
  function crearHormigaVisual(scene, x, y){
    const cont = scene.add.container(x,y);
    cont.setDepth(100);
    const g = scene.add.graphics();
    // cuerpo
    g.fillStyle(0x111111, 1);
    g.fillEllipse(0, 2, 6, 10); // abdomen
    g.fillEllipse(0, -4, 5, 6); // tórax
    g.fillCircle(0, -9, 3); // cabeza
    // ojos
    g.fillStyle(0xFFFFFF, 1);
    g.fillCircle(-1, -9, 1);
    g.fillCircle(1, -9, 1);
    g.fillStyle(0x000000, 1);
    g.fillCircle(-1, -9, 0.4);
    g.fillCircle(1, -9, 0.4);
    // antenas
    g.lineStyle(1, 0x000000, 1);
    g.beginPath(); g.moveTo(-1, -11); g.lineTo(-2, -14); g.strokePath();
    g.beginPath(); g.moveTo(1, -11); g.lineTo(2, -14); g.strokePath();
    // patas
    g.lineStyle(1, 0x000000, 1);
    const patas = [];
    // 6 patas
    for(let i=0;i<6;i++){
      const angBase = -Math.PI/2 + (i-2.5)*0.4;
      const p = scene.add.graphics();
      p.lineStyle(1, 0x000000, 1);
      patas.push({g:p, angBase: angBase, i:i});
      cont.add(p);
    }
    cont.add(g);
    cont._gfxCuerpo = g;
    cont._patas = patas;
    cont._ultimoAngulo = -Math.PI/2;
    cont._fasePatas = 0;
    return cont;
  }

  function actualizarHormigaVisual(cont, hormiga, estadoFSM, velocidadSim){
    if(!cont || !hormiga) return;
    // angulo - conserva último cuando quieta
    let ang = cont._ultimoAngulo;
    if(ang === undefined || ang === null) ang = -Math.PI/2;
    if(hormiga.enMovimiento && !hormiga.pausado && hormiga.objetivoPaso){
      const dx = hormiga.objetivoPaso.x - hormiga.origenPaso.x;
      const dy = hormiga.objetivoPaso.y - hormiga.origenPaso.y;
      if(dx !== 0 || dy !== 0){
        ang = Math.atan2(dy, dx);
        cont._ultimoAngulo = ang;
      }
    }
    cont.rotation = ang + Math.PI/2;
    // patas
    const quieto = (estadoFSM === 'RECOGER' || estadoFSM === 'DESCANSAR') || !hormiga.enMovimiento || hormiga.pausado;
    const vel = velocidadSim || 1.0;
    if(!quieto){
      cont._fasePatas += 0.25 * vel;
    } else {
      cont._fasePatas += 0;
    }
    const patas = cont._patas || [];
    for(let i=0;i<patas.length;i++){
      const p = patas[i];
      p.g.clear();
      p.g.lineStyle(1, 0x000000, 1);
      const a = p.angBase + Math.sin(cont._fasePatas + i*0.4)*0.5;
      const len = 6;
      p.g.beginPath();
      p.g.moveTo(0,0);
      p.g.lineTo(Math.cos(a)*len, Math.sin(a)*len);
      p.g.strokePath();
    }
  }

  if(typeof window !== 'undefined'){
    window.HormigaVisual = { crearHormigaVisual: crearHormigaVisual, actualizarHormigaVisual: actualizarHormigaVisual };
  }
})();

/* ============================================================================
   SIMULADOR DE TURNO — ocho decisiones de un día real de trabajo.
   Cada opción mueve los indicadores del local; al cierre se arma el informe.
============================================================================ */

let turnoEnCurso = null;

function renderTurno() {
  if (turnoEnCurso) { pintarEvento(); return; }

  const t = CONTENIDO.turno;
  const historial = E.turnos;
  const mejor = historial.reduce((m, x) => Math.max(m, x.puntaje), 0);

  $('#v-turno').innerHTML = `
    <div class="brief">
      <div class="e">⏱️</div>
      <h2>Simulador de turno</h2>
      <div class="lema">Un día completo, ocho decisiones.</div>
      <ul>
        <li>Cada decisión mueve la merma, los quiebres y la exactitud del inventario.</li>
        <li>No hay respuestas de relleno: las tres opciones son cosas que pasan.</li>
        <li>Al cerrar el turno vas a ver tu desvío contra el estándar del local.</li>
      </ul>
      <div class="ind">Estándar del local: merma <b>≤ ${t.estandar.merma} %</b> · quiebres <b>${t.estandar.quiebres}</b> · exactitud <b>≥ ${t.estandar.exactitud} %</b></div>
    </div>

    ${historial.length ? `
      <div class="card" style="margin-top:14px">
        <div class="kicker">Tu historial</div>
        <h3 style="margin-top:5px">${historial.length} ${historial.length === 1 ? 'turno simulado' : 'turnos simulados'} · mejor puntaje ${mejor} %</h3>
        <p class="sub">El tablero guarda cada turno para que veas la tendencia, no un dato suelto.</p>
      </div>` : ''}

    <div class="btn-row"><button class="btn" id="empezar">${historial.length ? 'Simular otro turno' : 'Empezar el turno'}</button></div>`;

  $('#empezar').onclick = () => {
    turnoEnCurso = {
      i: 0, puntos: 0,
      merma: t.inicial.merma, quiebres: t.inicial.quiebres, exactitud: t.inicial.exactitud,
      decisiones: []
    };
    pintarEvento();
  };
}

function hud() {
  const t = CONTENIDO.turno, s = turnoEnCurso;
  const ev = t.eventos[Math.min(s.i, t.eventos.length - 1)];
  const mermaPct = (s.merma / t.compras) * 100;

  return `
    <div class="hud">
      <div class="hud-reloj">
        <span class="h">${ev.hora}</span>
        <span class="barra"><i style="width:${(s.i / t.eventos.length) * 100}%"></i></span>
        <span class="h">${s.i + 1}/${t.eventos.length}</span>
      </div>
      <div class="hud-fila">
        <div class="hud-item"><small>Merma</small><b class="${mermaPct > t.estandar.merma ? 'peor' : ''}">${mermaPct.toFixed(1)}%</b></div>
        <div class="hud-item"><small>Quiebres</small><b class="${s.quiebres > t.estandar.quiebres ? 'peor' : ''}">${s.quiebres}</b></div>
        <div class="hud-item"><small>Exactitud</small><b class="${s.exactitud < t.estandar.exactitud ? 'peor' : ''}">${s.exactitud}%</b></div>
      </div>
    </div>`;
}

function pintarEvento() {
  const t = CONTENIDO.turno, s = turnoEnCurso;
  const ev = t.eventos[s.i];

  $('#v-turno').innerHTML = `
    ${hud()}
    <div class="evento">
      <div class="e">${ev.icono}</div>
      <p class="situacion">${esc(ev.situacion)}</p>
      <div class="acciones">
        ${ev.opciones.map((o, n) => `
          <button class="accion" data-op="${n}">
            <span class="ic">${n + 1}</span>
            <span><strong>${esc(o.texto)}</strong></span>
          </button>`).join('')}
      </div>
      <div id="fb"></div>
    </div>`;

  $$('#v-turno .accion').forEach(b => b.onclick = () => elegirOpcion(+b.dataset.op));
}

function elegirOpcion(n) {
  const t = CONTENIDO.turno, s = turnoEnCurso;
  const ev = t.eventos[s.i], op = ev.opciones[n];
  const ef = op.efecto || {};

  s.merma     += ef.merma || 0;
  s.quiebres  += ef.quiebres || 0;
  s.exactitud += ef.exactitud || 0;
  s.puntos    += op.puntos;
  s.decisiones.push({ hora: ev.hora, texto: op.texto, puntos: op.puntos, nota: op.nota });

  const buena = op.puntos >= 8;
  vibrar(buena ? 15 : 40);

  $$('#v-turno .accion').forEach((b, i) => {
    b.disabled = true;
    if (i === n) b.classList.add(buena ? 'elegida-bien' : 'elegida-mal');
  });

  // Se muestra qué movió esta decisión en los indicadores.
  const cambios = [];
  if (ef.merma)     cambios.push(`+${pesos(ef.merma)} de merma`);
  if (ef.quiebres)  cambios.push(`+${ef.quiebres} ${ef.quiebres === 1 ? 'quiebre' : 'quiebres'}`);
  if (ef.exactitud) cambios.push(`${ef.exactitud} punto${Math.abs(ef.exactitud) === 1 ? '' : 's'} de exactitud`);

  $('#fb').innerHTML =
    `<div class="efecto">${cambios.length
        ? cambios.map(c => `<span>${esc(c)}</span>`).join('')
        : '<span class="nada">Sin impacto en los indicadores</span>'}</div>` +
    devolucion(buena, esc(op.nota)) +
    `<div class="btn-row"><button class="btn sm" id="sigue">${s.i + 1 < t.eventos.length ? 'Seguir el turno ›' : 'Cerrar el turno'}</button></div>`;

  $('#sigue').onclick = () => {
    s.i++;
    if (s.i < t.eventos.length) { pintarEvento(); window.scrollTo({ top: 0 }); }
    else cerrarTurno();
  };
}

function cerrarTurno() {
  const t = CONTENIDO.turno, s = turnoEnCurso;
  const maxPuntos = t.eventos.length * 10;
  const puntaje = Math.round((s.puntos / maxPuntos) * 100);
  const mermaPct = +((s.merma / t.compras) * 100).toFixed(1);
  const exactitud = Math.max(0, s.exactitud);

  E.turnos.push({ fecha: hoyISO(), puntaje, mermaPct, quiebres: s.quiebres, exactitud, merma: s.merma });
  if (E.turnos.length > 20) E.turnos = E.turnos.slice(-20);   // historial acotado
  guardar();
  sincronizar(true);

  const bien = puntaje >= CONTENIDO.metas.notaMinima;
  const flojas = s.decisiones.filter(d => d.puntos < 8);

  $('#v-turno').innerHTML = `
    <div class="card resultado">
      <div class="emo">${puntaje === 100 ? '🏆' : bien ? '✅' : '🔁'}</div>
      <div class="nota" style="color:${bien ? 'var(--bien)' : 'var(--critico)'}">${puntaje}%</div>
      <h2>Turno cerrado</h2>
      <p>${bien ? 'Buen turno: tus decisiones sostuvieron los indicadores.'
                : 'El turno cerró con desvíos. Mirá abajo qué decisiones los causaron.'}</p>
    </div>

    <div class="sec">
      <div class="sec-head"><div class="kicker">Cierre del turno</div><h2>Tus indicadores contra el estándar</h2></div>
      <div class="card">
        ${medidor('% de merma', mermaPct, t.estandar.merma, 6, '%', true)}
        ${medidor('Quiebres de stock', s.quiebres, t.estandar.quiebres, 4, '', true)}
        ${medidor('Exactitud de inventario', exactitud, t.estandar.exactitud, 100, '%', false)}
      </div>
      <p class="sub">Merma del turno: <b>${pesos(s.merma)}</b> sobre compras por ${pesos(t.compras)}.</p>
    </div>

    ${flojas.length ? `
      <div class="sec">
        <div class="sec-head"><div class="kicker">Acción correctiva</div><h2>Qué revisar</h2></div>
        <div class="card">
          ${flojas.map(d => `
            <div class="feedback mal" style="margin-top:0;margin-bottom:9px">
              <span class="ic">${esc(d.hora)}</span><span>${esc(d.nota)}</span>
            </div>`).join('')}
        </div>
      </div>` : `
      <div class="sec"><div class="card">
        <h3>Sin desvíos</h3>
        <p class="sub">Las ocho decisiones fueron las correctas. Ese es el estándar del puesto.</p>
      </div></div>`}

    <div class="btn-row">
      <button class="btn sm ghost" id="otraVez">Simular otro turno</button>
      <button class="btn sm" id="alTablero">Ver el tablero</button>
    </div>`;

  turnoEnCurso = null;
  $('#otraVez').onclick = () => { renderTurno(); window.scrollTo({ top: 0 }); };
  $('#alTablero').onclick = () => ir('tablero');
}

/* ============================================================================
   TABLERO — indicadores, gráficos y certificación.

   Los colores de los datos NO son los de la marca: usan una paleta validada
   para daltonismo y contraste. Los estados (bien / alerta / crítico) siempre
   van acompañados de ícono y texto, nunca color solo.
============================================================================ */

const SERIE = '#2A78D6';        // color de la línea de datos
const GRILLA = '#E9E4DA';
const MUTE = '#8C7B69';

/* ---------------------------------------------------------------- */
/* Medidor: un indicador contra su objetivo                          */
/* menorEsMejor = true para merma y quiebres; false para exactitud.  */
/* ---------------------------------------------------------------- */
function medidor(rotulo, valor, objetivo, max, unidad, menorEsMejor) {
  const cumple = menorEsMejor ? valor <= objetivo : valor >= objetivo;
  const lejos  = menorEsMejor ? valor > objetivo * 2 + 0.01 : valor < objetivo - 8;
  const color = cumple ? 'var(--bien)' : lejos ? 'var(--critico)' : 'var(--alerta)';
  const pin   = cumple ? 'bien' : lejos ? 'critico' : 'alerta';
  const icono = cumple ? '✓' : lejos ? '⚠' : '!';
  const texto = cumple ? 'Dentro del estándar' : lejos ? 'Desvío grave' : 'Desvío';

  const ancho = Math.max(2, Math.min(100, (valor / max) * 100));
  const posObjetivo = Math.max(0, Math.min(100, (objetivo / max) * 100));

  return `
    <div class="medidor">
      <div class="fila">
        <strong>${esc(rotulo)}</strong>
        <span class="v" style="color:${color}">${valor}${unidad}</span>
      </div>
      <div class="pista">
        <i style="width:${ancho}%;background:${color}"></i>
        <span class="obj" style="left:${posObjetivo}%"></span>
      </div>
      <div class="pie">
        <span class="estado-pin ${pin}" style="margin-top:4px">${icono} ${texto}</span>
        <span style="align-self:flex-end">objetivo ${objetivo}${unidad}</span>
      </div>
    </div>`;
}

/* ---------------------------------------------------------------- */
/* Gráfico de línea (una sola serie, así que no lleva leyenda)       */
/* ---------------------------------------------------------------- */
function graficoLinea(datos, op = {}) {
  const ancho = 320, alto = op.alto || 170;
  const pad = { t: 12, r: 30, b: 22, l: 28 };
  const maxY = op.maxY || Math.max(...datos.map(d => d.y), 1);
  const tope = Math.ceil(maxY / 5) * 5 || 5;

  const px = i => datos.length === 1 ? pad.l : pad.l + (i * (ancho - pad.l - pad.r)) / (datos.length - 1);
  const py = v => alto - pad.b - (v / tope) * (alto - pad.t - pad.b);

  const ticks = [0, tope / 2, tope];
  const grilla = ticks.map(t => `
    <line x1="${pad.l}" y1="${py(t).toFixed(1)}" x2="${ancho - pad.r}" y2="${py(t).toFixed(1)}"
          stroke="${GRILLA}" stroke-width="1"></line>
    <text x="${pad.l - 6}" y="${(py(t) + 3.5).toFixed(1)}" text-anchor="end"
          font-size="9" fill="${MUTE}">${t}</text>`).join('');

  // Con muchos puntos se saltean etiquetas para que no se pisen.
  const saltoX = Math.ceil(datos.length / 7);
  const ejeX = datos.map((d, i) => (i % saltoX === 0 || i === datos.length - 1)
    ? `<text x="${px(i).toFixed(1)}" y="${alto - 6}" text-anchor="middle" font-size="9" fill="${MUTE}">${esc(d.x)}</text>`
    : '').join('');

  const linea = datos.map((d, i) => `${i ? 'L' : 'M'}${px(i).toFixed(1)},${py(d.y).toFixed(1)}`).join(' ');
  const ultimo = datos[datos.length - 1];

  const puntos = datos.map((d, i) => `
    <circle cx="${px(i).toFixed(1)}" cy="${py(d.y).toFixed(1)}" r="4"
            fill="${SERIE}" stroke="#FFFFFF" stroke-width="2"></circle>`).join('');

  // Zonas de detección para el globo de datos (más grandes que el punto).
  const zonas = datos.map((d, i) => `
    <rect class="hit" x="${(px(i) - 14).toFixed(1)}" y="${pad.t}" width="28" height="${alto - pad.t - pad.b}"
          fill="transparent" data-x="${esc(d.x)}" data-y="${d.y}" data-cx="${px(i).toFixed(1)}"></rect>`).join('');

  return `
    <figure class="grafico" data-grafico>
      <div style="position:relative">
        <svg viewBox="0 0 ${ancho} ${alto}" role="img" aria-label="${esc(op.aria || 'Evolución del indicador')}">
          ${grilla}
          ${op.resaltarCero ? `<line x1="${pad.l}" y1="${py(0)}" x2="${ancho - pad.r}" y2="${py(0)}" stroke="#D03B3B" stroke-width="1.5"></line>` : ''}
          <line class="cruz" x1="0" y1="${pad.t}" x2="0" y2="${alto - pad.b}" stroke="${MUTE}" stroke-width="1" opacity="0"></line>
          ${ejeX}
          <path d="${linea}" fill="none" stroke="${SERIE}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"></path>
          ${puntos}
          <text x="${(px(datos.length - 1) + 6).toFixed(1)}" y="${(py(ultimo.y) + 3.5).toFixed(1)}"
                font-size="10" font-weight="700" fill="#1A1410">${ultimo.y}</text>
          ${zonas}
        </svg>
        <div class="tip"></div>
      </div>
      ${op.pie ? `<figcaption>${esc(op.pie)}</figcaption>` : ''}
      <details class="ver-datos">
        <summary>Ver los datos</summary>
        <table class="tabla-datos">
          <tr><th>${esc(op.rotuloX || 'Punto')}</th><th>${esc(op.etiquetaY || 'Valor')}</th></tr>
          ${datos.map(d => `<tr><td>${esc(d.x)}</td><td>${d.y}</td></tr>`).join('')}
        </table>
      </details>
    </figure>`;
}

/* ---------------------------------------------------------------- */
/* Gráfico de barras horizontales con línea de objetivo              */
/* Una sola serie, así que tampoco lleva leyenda.                    */
/* ---------------------------------------------------------------- */
function graficoBarras(datos, op = {}) {
  const ancho = 320, izq = 92, der = 30;
  const alto = datos.length * 26 + 26;
  const tope = op.maxX || 100;
  const largo = v => (v / tope) * (ancho - izq - der);

  const objetivo = op.objetivo != null
    ? `<line x1="${(izq + largo(op.objetivo)).toFixed(1)}" y1="4"
             x2="${(izq + largo(op.objetivo)).toFixed(1)}" y2="${alto - 18}"
             stroke="#1A1410" stroke-width="1.5"></line>
       <text x="${(izq + largo(op.objetivo)).toFixed(1)}" y="${alto - 6}" text-anchor="middle"
             font-size="8" fill="${MUTE}">objetivo ${op.objetivo}${op.unidad || ''}</text>` : '';

  // Barra de 14 px con punta redondeada y 2 px de aire entre vecinas.
  const filas = datos.map((d, i) => {
    const y = 8 + i * 26;
    const w = Math.max(2, largo(d.y));
    return `
      <text x="${izq - 7}" y="${y + 11}" text-anchor="end" font-size="9" fill="#574838">${esc(d.x)}</text>
      <rect x="${izq}" y="${y}" width="${(ancho - izq - der).toFixed(1)}" height="14" rx="4" fill="#F6EFE3"></rect>
      <rect x="${izq}" y="${y}" width="${w.toFixed(1)}" height="14" rx="4" fill="${d.color || SERIE}"></rect>
      <text x="${(izq + w + 6).toFixed(1)}" y="${y + 11}" font-size="9" font-weight="700" fill="#1A1410">${d.y}${op.unidad || ''}</text>`;
  }).join('');

  return `
    <figure class="grafico">
      <svg viewBox="0 0 ${ancho} ${alto}" role="img" aria-label="${esc(op.aria || 'Comparación por estación')}">
        ${filas}
        ${objetivo}
      </svg>
      ${op.pie ? `<figcaption>${esc(op.pie)}</figcaption>` : ''}
      <details class="ver-datos">
        <summary>Ver los datos</summary>
        <table class="tabla-datos">
          <tr><th>${esc(op.rotuloX || 'Estación')}</th><th>${esc(op.etiquetaY || 'Valor')}</th></tr>
          ${datos.map(d => `<tr><td>${esc(d.x)}</td><td>${d.y}${op.unidad || ''}</td></tr>`).join('')}
        </table>
      </details>
    </figure>`;
}

/* Globo de datos: se activa después de insertar el gráfico en la página. */
function activarGraficos() {
  $$('figure.grafico:not([data-activo])').forEach(fig => {
    fig.dataset.activo = '1';
    const tip = fig.querySelector('.tip');
    const cruz = fig.querySelector('.cruz');
    const svg = fig.querySelector('svg');

    const mostrar = hit => {
      const caja = fig.querySelector('div').getBoundingClientRect();
      const r = hit.getBoundingClientRect();
      tip.innerHTML = `<b>${hit.dataset.y}</b> · ${hit.dataset.x}`;
      tip.style.left = (r.left + r.width / 2 - caja.left) + 'px';
      tip.classList.add('ver');
      cruz.setAttribute('x1', hit.dataset.cx);
      cruz.setAttribute('x2', hit.dataset.cx);
      cruz.setAttribute('opacity', '.35');
    };
    const ocultar = () => { tip.classList.remove('ver'); cruz.setAttribute('opacity', '0'); };

    fig.querySelectorAll('.hit').forEach(hit => {
      hit.addEventListener('pointerenter', () => mostrar(hit));
      hit.addEventListener('pointerdown', () => mostrar(hit));
    });
    svg.addEventListener('pointerleave', ocultar);
  });
}

/* ---------------------------------------------------------------- */
/* TABLERO                                                           */
/* ---------------------------------------------------------------- */
function renderTablero() {
  const t = CONTENIDO.turno;
  const ultimo = E.turnos[E.turnos.length - 1];
  const m = metricas();

  const tile = (rot, val, meta, pin, icono, texto) => `
    <div class="tile">
      <div class="rot">${esc(rot)}</div>
      <div class="val">${val}</div>
      <div class="meta">${esc(meta)}</div>
      <div class="estado-pin ${pin}">${icono} ${esc(texto)}</div>
    </div>`;

  const estadoDe = (valor, objetivo, menorEsMejor) => {
    const cumple = menorEsMejor ? valor <= objetivo : valor >= objetivo;
    const lejos = menorEsMejor ? valor > objetivo * 2 + 0.01 : valor < objetivo - 8;
    return cumple ? ['bien', '✓', 'En estándar'] : lejos ? ['critico', '⚠', 'Desvío grave'] : ['alerta', '!', 'Desvío'];
  };

  $('#v-tablero').innerHTML = `
    <div class="sec-head" style="margin-bottom:12px">
      <div class="kicker">Control de gestión</div>
      <h2>Tablero del puesto</h2>
      <p class="sub">Estándar → medición → desvío → acción correctiva. Los números salen de tus turnos simulados.</p>
    </div>

    ${ultimo ? `
      <div class="tiles">
        ${(() => { const [p, i, x] = estadoDe(ultimo.mermaPct, t.estandar.merma, true);
                   return tile('% de merma', ultimo.mermaPct + '%', 'objetivo ≤ ' + t.estandar.merma + '%', p, i, x); })()}
        ${(() => { const [p, i, x] = estadoDe(ultimo.quiebres, t.estandar.quiebres, true);
                   return tile('Quiebres', ultimo.quiebres, 'objetivo ' + t.estandar.quiebres, p, i, x); })()}
        ${(() => { const [p, i, x] = estadoDe(ultimo.exactitud, t.estandar.exactitud, false);
                   return tile('Exactitud', ultimo.exactitud + '%', 'objetivo ≥ ' + t.estandar.exactitud + '%', p, i, x); })()}
        ${(() => { const [p, i, x] = estadoDe(ultimo.puntaje, CONTENIDO.metas.notaMinima, false);
                   return tile('Puntaje', ultimo.puntaje + '%', 'último turno', p, i, x); })()}
      </div>

      <div class="sec">
        <div class="sec-head"><div class="kicker">Desvíos</div><h2>Último turno contra el estándar</h2></div>
        <div class="card">
          ${medidor('% de merma', ultimo.mermaPct, t.estandar.merma, 6, '%', true)}
          ${medidor('Quiebres de stock', ultimo.quiebres, t.estandar.quiebres, 4, '', true)}
          ${medidor('Exactitud de inventario', ultimo.exactitud, t.estandar.exactitud, 100, '%', false)}
        </div>
      </div>

      <div class="sec">
        <div class="sec-head"><div class="kicker">Tendencia</div><h2>Puntaje por turno</h2>
          <p class="sub">Un indicador se lee por su tendencia, no por un dato aislado.</p></div>
        <div class="card">
          ${graficoLinea(E.turnos.map((x, n) => ({ x: 'T' + (n + 1), y: x.puntaje })),
            { maxY: 100, etiquetaY: 'Puntaje %', rotuloX: 'Turno', aria: 'Puntaje obtenido en cada turno simulado',
              pie: E.turnos.length === 1 ? 'Con un solo turno todavía no hay tendencia: simulá otro.' : '' })}
        </div>
      </div>` : `
      <div class="card">
        <h3>Todavía no hay datos</h3>
        <p class="sub">Los indicadores se calculan con tus decisiones. Simulá un turno y volvé acá.</p>
        <div class="btn-row"><button class="btn sm" id="alTurno">Simular un turno</button></div>
      </div>`}

    <div class="sec">
      <div class="sec-head"><div class="kicker">Calculadora</div><h2>Probá los indicadores</h2>
        <p class="sub">Movés los valores y mirás cómo reacciona el indicador. Es la fórmula, no un ejemplo fijo.</p></div>
      <div class="card sliders">
        <div class="campo">
          <div class="lectura"><label>Merma del mes</label><b id="vMerma"></b></div>
          <input type="range" id="sMerma" min="0" max="120000" step="5000" value="25000">
        </div>
        <div class="campo">
          <div class="lectura"><label>Compras del mes</label><b id="vCompras"></b></div>
          <input type="range" id="sCompras" min="300000" max="3000000" step="100000" value="1500000">
        </div>
        <div id="resMerma"></div>
      </div>
      <div class="card sliders">
        <div class="campo">
          <div class="lectura"><label>Costo de mercadería usada</label><b id="vCosto"></b></div>
          <input type="range" id="sCosto" min="200000" max="4000000" step="100000" value="1800000">
        </div>
        <div class="campo">
          <div class="lectura"><label>Stock promedio</label><b id="vProm"></b></div>
          <input type="range" id="sProm" min="100000" max="1500000" step="50000" value="400000">
        </div>
        <div id="resRot"></div>
      </div>
    </div>

    <div class="sec">
      <div class="sec-head"><div class="kicker">Certificación</div><h2>${m.certificado ? 'Estás habilitado' : 'Evaluación final'}</h2></div>
      <div class="card">
        ${m.certificado
          ? `<div class="sello bien">🎓 Aprobada con ${E.examen.nota} %</div>
             <p class="sub">Podés volver a rendirla para mejorar la nota.</p>`
          : `<p class="sub">${CONTENIDO.examen.length} preguntas sobre todo lo que entrenaste. Se aprueba con ${CONTENIDO.metas.notaMinima} %.</p>`}
        <div class="btn-row"><button class="btn sm ${m.certificado ? 'ghost' : ''}" id="alExamen">
          ${m.certificado ? 'Rendir de nuevo' : 'Rendir la certificación'}</button></div>
      </div>
    </div>`;

  if ($('#alTurno')) $('#alTurno').onclick = () => ir('turno');
  $('#alExamen').onclick = () => ir('examen');

  /* Calculadoras en vivo */
  const calcular = () => {
    const merma = +$('#sMerma').value, compras = +$('#sCompras').value;
    const costo = +$('#sCosto').value, prom = +$('#sProm').value;

    $('#vMerma').textContent = pesos(merma);
    $('#vCompras').textContent = pesos(compras);
    $('#vCosto').textContent = pesos(costo);
    $('#vProm').textContent = pesos(prom);

    const pct = (merma / compras) * 100;
    $('#resMerma').innerHTML = `
      <div class="ticket" style="text-align:center">
        <div class="l">% DE MERMA = MERMA ÷ COMPRAS × 100</div>
        <div><span class="v" style="font-size:1.6rem">${pct.toFixed(2)} %</span></div>
      </div>
      ${medidor('Contra el objetivo del local', +pct.toFixed(2), CONTENIDO.turno.estandar.merma, 6, '%', true)}`;

    const rot = costo / prom;
    const buena = rot >= 4 && rot <= 12;
    $('#resRot').innerHTML = `
      <div class="ticket" style="text-align:center">
        <div class="l">ROTACIÓN = COSTO USADO ÷ STOCK PROMEDIO</div>
        <div><span class="v" style="font-size:1.6rem">${rot.toFixed(1)}</span> <span class="l">veces</span></div>
      </div>
      <div class="estado-pin ${buena ? 'bien' : 'alerta'}">${buena ? '✓' : '!'} ${
        rot < 4 ? 'Rotación baja: stock parado y plata inmovilizada'
        : rot > 12 ? 'Rotación muy alta: riesgo de quiebre'
        : 'Rotación saludable'}</div>`;
  };
  ['sMerma', 'sCompras', 'sCosto', 'sProm'].forEach(s => $('#' + s).oninput = calcular);
  calcular();

  activarGraficos();
}

/* ---------------------------------------------------------------- */
/* CERTIFICACIÓN                                                     */
/* ---------------------------------------------------------------- */
function renderExamen() {
  const preguntas = mezclar(CONTENIDO.examen.slice());
  let i = 0, aciertos = 0;

  const pintar = () => {
    const p = preguntas[i];
    $('#v-examen').innerHTML = `
      ${barraProgreso(i, preguntas.length)}
      <div class="insumo">
        <div class="kicker">Pregunta ${i + 1} de ${preguntas.length}</div>
        <p class="situacion" style="margin-top:8px;font-size:1.05rem;font-weight:600">${esc(p.pregunta)}</p>
        <div class="acciones">
          ${p.opciones.map((o, n) => `
            <button class="accion" data-op="${n}">
              <span class="ic">${String.fromCharCode(65 + n)}</span>
              <span><strong>${esc(o)}</strong></span>
            </button>`).join('')}
        </div>
        <div id="fb"></div>
      </div>`;

    $$('#v-examen .accion').forEach(b => {
      b.onclick = () => {
        const n = +b.dataset.op, bien = n === p.correcta;
        if (bien) aciertos++;
        vibrar(bien ? 15 : 40);
        $$('#v-examen .accion').forEach((o, k) => {
          o.disabled = true;
          if (k === p.correcta) o.classList.add('era-la-correcta');
          else if (k === n) o.classList.add('elegida-mal');
        });
        $('#fb').innerHTML = devolucion(bien, esc(p.porque)) +
          `<div class="btn-row"><button class="btn sm" id="sigue">${i + 1 < preguntas.length ? 'Siguiente ›' : 'Ver mi nota'}</button></div>`;
        $('#sigue').onclick = () => {
          i++;
          if (i < preguntas.length) { pintar(); window.scrollTo({ top: 0 }); } else cerrar();
        };
      };
    });
  };

  const cerrar = () => {
    const nota = Math.round((aciertos / preguntas.length) * 100);
    const aprobado = nota >= CONTENIDO.metas.notaMinima;
    const previa = E.examen ? E.examen.nota : 0;
    E.examen = { nota: Math.max(nota, previa), aprobado: aprobado || (E.examen && E.examen.aprobado) || false, fecha: hoyISO() };
    guardar();
    sincronizar(true);
    vibrar(aprobado ? [18, 60, 18] : 30);

    $('#v-examen').innerHTML = `
      <div class="card resultado">
        <div class="emo">${aprobado ? '🎓' : '📚'}</div>
        <div class="nota" style="color:${aprobado ? 'var(--bien)' : 'var(--critico)'}">${nota}%</div>
        <h2>${aprobado ? 'Certificación aprobada' : 'No alcanzó'}</h2>
        <p>${aciertos} de ${preguntas.length} respuestas correctas.</p>
        <div class="sello ${aprobado ? 'bien' : 'alerta'}">
          ${aprobado ? '✓ Habilitado para operar el puesto' : '↻ En refuerzo: repasá y volvé a rendir'}
        </div>
        ${aprobado ? '' : `<p class="sub">Acción correctiva: repetí las estaciones donde tengas menos puntaje y simulá otro turno antes de volver a rendir.</p>`}
        <div class="btn-row" style="justify-content:center">
          <button class="btn sm ghost" id="otraVez">Rendir de nuevo</button>
          <button class="btn sm" id="alTablero">Ir al tablero</button>
        </div>
      </div>`;

    $('#otraVez').onclick = () => renderExamen();
    $('#alTablero').onclick = () => ir('tablero');
  };

  pintar();
}

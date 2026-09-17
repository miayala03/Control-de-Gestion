/* ============================================================================
   ESTACIONES — los ocho ejercicios prácticos.
   Cada estación arma su propio ejercicio dentro de #ejercicio y al terminar
   llama a terminarEstacion(), que guarda el puntaje y muestra el resultado.
============================================================================ */

/* ---------------------------------------------------------------- */
/* Andamiaje común                                                   */
/* ---------------------------------------------------------------- */
function renderEstacion(id) {
  const e = estacion(id);
  $('#tbTitulo').textContent = e.numero + '. ' + e.nombre;
  $('#tbSub').textContent = 'Estación de entrenamiento';

  $('#v-estacion').innerHTML = `
    <div class="brief">
      <div class="e">${e.icono}</div>
      <h2>${esc(e.nombre)}</h2>
      <div class="lema">${esc(e.lema)}</div>
      <ul>${e.briefing.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
      <div class="ind">Indicador que mide esta etapa: <b>${esc(e.indicador)}</b></div>
    </div>
    <div id="ejercicio"></div>`;

  const arranques = {
    recepcion: ejRecepcion, zonas: ejZonas, peps: ejPeps, vencimientos: ejVencimientos,
    frio: ejFrio, merma: ejMerma, recuento: ejRecuento, reposicion: ejReposicion
  };
  arranques[e.tipo](id);
}

function barraProgreso(hechos, total) {
  return `
    <div class="progreso-ej">
      <div class="barra"><i style="width:${(hechos / total) * 100}%"></i></div>
      <div class="cuenta">${hechos}/${total}</div>
    </div>`;
}

function devolucion(bien, texto) {
  return `<div class="feedback ${bien ? 'bien' : 'mal'}">
            <span class="ic">${bien ? '✅' : '⚠️'}</span><span>${texto}</span>
          </div>`;
}

/* Pantalla de cierre de cualquier estación. */
function terminarEstacion(id, puntos, total) {
  const pct = Math.round((puntos / total) * 100);
  const previo = puntajeEstacion(id);
  anotarEstacion(id, pct);
  vibrar(pct >= CONTENIDO.metas.notaMinima ? [18, 60, 18] : 30);

  const aprobo = pct >= CONTENIDO.metas.notaMinima;
  const siguiente = CONTENIDO.estaciones.find(e => !estacionSuperada(e.id));

  $('#ejercicio').innerHTML = `
    <div class="card resultado">
      <div class="emo">${aprobo ? (pct === 100 ? '🏆' : '✅') : '🔁'}</div>
      <div class="nota" style="color:${aprobo ? 'var(--bien)' : 'var(--critico)'}">${pct}%</div>
      <h2>${aprobo ? (pct === 100 ? 'Estación perfecta' : 'Estación superada') : 'Todavía no'}</h2>
      <p>${puntos} de ${total} decisiones correctas.
         ${aprobo ? '' : 'Se supera con ' + CONTENIDO.metas.notaMinima + ' %. Repetila: ahora ya sabés dónde estaba la trampa.'}</p>
      ${pct > previo && previo > 0 ? `<div class="sello bien">↑ Mejoraste tu marca anterior de ${previo} %</div>` : ''}
      <div class="btn-row" style="justify-content:center">
        <button class="btn sm ghost" id="repetir">Repetir</button>
        ${siguiente && siguiente.id !== id
          ? `<button class="btn sm" id="siguiente">Estación ${siguiente.numero} ›</button>`
          : `<button class="btn sm" id="alListado">Volver a las estaciones</button>`}
      </div>
    </div>`;

  $('#repetir').onclick = () => ir('estacion', id);
  if ($('#siguiente')) $('#siguiente').onclick = () => ir('estacion', siguiente.id);
  if ($('#alListado')) $('#alListado').onclick = () => ir('entrenar');
  $('#ejercicio').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/* ---------------------------------------------------------------- */
/* Arrastrar y soltar (sirve para tocar y para mouse)                */
/* ---------------------------------------------------------------- */
function habilitarArrastre(ficha, opciones) {
  let clon = null, dx = 0, dy = 0;

  const destinoBajo = (x, y) => opciones.destinos().find(d => {
    const r = d.el.getBoundingClientRect();
    return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  });

  ficha.addEventListener('pointerdown', ev => {
    if (ficha.dataset.fija === '1') return;
    ev.preventDefault();
    const r = ficha.getBoundingClientRect();
    dx = ev.clientX - r.left;
    dy = ev.clientY - r.top;
    clon = ficha.cloneNode(true);
    clon.classList.add('volando');
    clon.style.width = r.width + 'px';
    clon.style.left = r.left + 'px';
    clon.style.top = r.top + 'px';
    document.body.appendChild(clon);
    ficha.classList.add('agarrada');
    ficha.setPointerCapture(ev.pointerId);
  });

  ficha.addEventListener('pointermove', ev => {
    if (!clon) return;
    clon.style.left = (ev.clientX - dx) + 'px';
    clon.style.top = (ev.clientY - dy) + 'px';
    const d = destinoBajo(ev.clientX, ev.clientY);
    opciones.destinos().forEach(x => x.el.classList.toggle('encima', !!d && x.el === d.el));
  });

  const soltar = ev => {
    if (!clon) return;
    const d = destinoBajo(ev.clientX, ev.clientY);
    clon.remove(); clon = null;
    ficha.classList.remove('agarrada');
    opciones.destinos().forEach(x => x.el.classList.remove('encima'));
    if (d) opciones.alSoltar(d.id, ficha);
  };
  ficha.addEventListener('pointerup', soltar);
  ficha.addEventListener('pointercancel', soltar);
}

/* ================================================================== */
/* ESTACIÓN 1 — Recepción de mercadería                               */
/* ================================================================== */
function ejRecepcion(id) {
  const items = mezclar(CONTENIDO.recepcion.slice());
  let i = 0, aciertos = 0;

  const pintar = () => {
    const it = items[i];
    $('#ejercicio').innerHTML = `
      ${barraProgreso(i, items.length)}
      <div class="insumo">
        <div class="insumo-head">
          <span class="e">${it.icono}</span>
          <span><strong>${esc(it.nombre)}</strong><small>Remito: ${esc(it.remito)}</small></span>
        </div>
        <div class="datos">
          ${it.datos.map(d => `
            <div class="dato ${d[2] ? '' : 'mal'}">
              <span class="r">${esc(d[0])}</span>
              <span class="v">${esc(d[1])}</span>
              <span class="marca">${d[2] ? '✓' : '⚠'}</span>
            </div>`).join('')}
        </div>
        <div class="acciones">
          ${CONTENIDO.accionesRecepcion.map(a => `
            <button class="accion" data-accion="${a.id}">
              <span class="ic">${a.icono}</span>
              <span><strong>${esc(a.rotulo)}</strong><small>${esc(a.ayuda)}</small></span>
            </button>`).join('')}
        </div>
        <div id="fb"></div>
      </div>`;

    $$('#ejercicio .accion').forEach(b => b.onclick = () => responder(b.dataset.accion));
  };

  const responder = elegida => {
    const it = items[i];
    const bien = elegida === it.correcta;
    if (bien) aciertos++;
    vibrar(bien ? 15 : 40);

    $$('#ejercicio .accion').forEach(b => {
      b.disabled = true;
      if (b.dataset.accion === elegida) b.classList.add(bien ? 'elegida-bien' : 'elegida-mal');
      else if (b.dataset.accion === it.correcta) b.classList.add('era-la-correcta');
    });

    $('#fb').innerHTML = devolucion(bien, esc(it.porque)) +
      `<div class="btn-row"><button class="btn sm" id="sigue">${i + 1 < items.length ? 'Siguiente insumo ›' : 'Ver resultado'}</button></div>`;
    $('#sigue').onclick = () => {
      i++;
      if (i < items.length) pintar(); else terminarEstacion(id, aciertos, items.length);
    };
  };

  pintar();
}

/* ================================================================== */
/* ESTACIÓN 2 — Dónde va cada cosa (arrastrar a la zona correcta)      */
/* ================================================================== */
function ejZonas(id) {
  const items = mezclar(CONTENIDO.zonasItems.slice());
  let colocados = 0, errores = 0;

  $('#ejercicio').innerHTML = `
    <p class="sub">Arrastrá cada insumo a su lugar de guardado. Si te equivocás, vuelve a la mesa.</p>
    <div id="barra"></div>
    <div class="pileta" id="pileta">
      ${items.map((it, n) => `
        <div class="ficha" data-ficha="${n}"><span class="e">${it.icono}</span>${esc(it.nombre)}</div>`).join('')}
    </div>
    <div class="zonas">
      ${CONTENIDO.zonas.map(z => `
        <div class="zona" data-zona="${z.id}">
          <div class="zona-head"><span class="e">${z.icono}</span><strong>${esc(z.nombre)}</strong><small>${esc(z.rango)}</small></div>
          <div class="zona-items"></div>
        </div>`).join('')}
    </div>
    <div id="fb"></div>`;

  const refrescar = () => $('#barra').innerHTML = barraProgreso(colocados, items.length);
  const destinos = () => $$('.zona').map(el => ({ el, id: el.dataset.zona }));

  $$('#pileta .ficha').forEach(f => {
    habilitarArrastre(f, {
      destinos,
      alSoltar: (zonaId, ficha) => {
        const it = items[+ficha.dataset.ficha];
        if (zonaId === it.zona) {
          ficha.dataset.fija = '1';
          ficha.classList.add('ok');
          $(`.zona[data-zona="${zonaId}"] .zona-items`).appendChild(ficha);
          colocados++; refrescar(); vibrar(15);
          if (colocados === items.length) cerrar();
        } else {
          errores++;
          ficha.classList.add('err');
          vibrar(40);
          setTimeout(() => ficha.classList.remove('err'), 400);
        }
      }
    });
  });

  const cerrar = () => {
    // Cada error descuenta un acierto; el piso es cero.
    const aciertos = Math.max(0, items.length - errores);
    $('#fb').innerHTML = devolucion(errores === 0,
      errores === 0 ? 'Impecable: cada insumo en su temperatura.'
                    : `Ubicaste todo, con <b>${errores}</b> ${errores === 1 ? 'error' : 'errores'} en el camino.`);
    setTimeout(() => terminarEstacion(id, aciertos, items.length), 900);
  };

  refrescar();
}

/* ================================================================== */
/* ESTACIÓN 3 — PEPS: ordenar la estantería                            */
/* ================================================================== */
function ejPeps(id) {
  // Se baraja hasta que el orden inicial no sea ya el correcto.
  let orden = mezclar(CONTENIDO.peps.slice());
  while (orden.every((p, n) => p.orden === n + 1)) orden = mezclar(orden);

  $('#ejercicio').innerHTML = `
    <p class="sub">Arrastrá las cajas: arriba lo que se usa primero. Guía: lo que vence antes va adelante.</p>
    <div class="eti-flujo"><span>↑ Se usa primero</span><span>Se usa último ↓</span></div>
    <div class="estante" id="estante">
      ${orden.map(p => `
        <div class="slot" data-orden="${p.orden}">
          <span class="pos"></span>
          <span class="e">${p.icono}</span>
          <span class="tx"><strong>${esc(p.nombre)}</strong><small>Vence ${esc(p.vence)}</small></span>
          <span class="asas">⣿</span>
        </div>`).join('')}
    </div>
    <div class="btn-row"><button class="btn" id="verificar">Verificar el orden</button></div>
    <div id="fb"></div>`;

  const numerar = () => $$('#estante .slot').forEach((s, n) => s.querySelector('.pos').textContent = n + 1);
  numerar();

  // Arrastre para reordenar: el clon sigue al dedo y la fila se acomoda en vivo.
  $$('#estante .slot').forEach(slot => {
    let clon = null, dy = 0;

    slot.addEventListener('pointerdown', ev => {
      ev.preventDefault();
      const r = slot.getBoundingClientRect();
      dy = ev.clientY - r.top;
      clon = slot.cloneNode(true);
      clon.classList.add('volando');
      clon.style.width = r.width + 'px';
      clon.style.left = r.left + 'px';
      clon.style.top = r.top + 'px';
      document.body.appendChild(clon);
      slot.classList.add('agarrada');
      slot.setPointerCapture(ev.pointerId);
    });

    slot.addEventListener('pointermove', ev => {
      if (!clon) return;
      clon.style.top = (ev.clientY - dy) + 'px';
      const otros = $$('#estante .slot').filter(s => s !== slot);
      for (const o of otros) {
        const r = o.getBoundingClientRect();
        const medio = r.top + r.height / 2;
        if (ev.clientY < medio && o.compareDocumentPosition(slot) & Node.DOCUMENT_POSITION_FOLLOWING) {
          o.parentNode.insertBefore(slot, o); numerar(); break;
        }
        if (ev.clientY > medio && o.compareDocumentPosition(slot) & Node.DOCUMENT_POSITION_PRECEDING) {
          o.parentNode.insertBefore(slot, o.nextSibling); numerar(); break;
        }
      }
    });

    const soltar = () => {
      if (!clon) return;
      clon.remove(); clon = null;
      slot.classList.remove('agarrada');
      vibrar(10);
    };
    slot.addEventListener('pointerup', soltar);
    slot.addEventListener('pointercancel', soltar);
  });

  $('#verificar').onclick = () => {
    const slots = $$('#estante .slot');
    let aciertos = 0;
    slots.forEach((s, n) => {
      const ok = +s.dataset.orden === n + 1;
      if (ok) aciertos++;
      s.classList.add(ok ? 'ok' : 'err');
    });
    $('#verificar').disabled = true;
    $('#fb').innerHTML = devolucion(aciertos === slots.length,
      aciertos === slots.length
        ? 'Orden PEPS correcto: lo que vence primero sale primero.'
        : `Quedaron <b>${slots.length - aciertos}</b> cajas fuera de lugar. El criterio es la fecha de vencimiento, no el tamaño ni el uso.`);
    setTimeout(() => terminarEstacion(id, aciertos, slots.length), 1200);
  };
}

/* ================================================================== */
/* ESTACIÓN 4 — Semáforo de vencimientos                               */
/* ================================================================== */
function ejVencimientos(id) {
  const items = mezclar(CONTENIDO.vencimientos.slice());
  const elegido = {};

  const dias = d => d < 0 ? `Venció hace ${Math.abs(d)} ${Math.abs(d) === 1 ? 'día' : 'días'}`
                  : d === 0 ? 'Vence hoy'
                  : `Vence en ${d} ${d === 1 ? 'día' : 'días'}`;

  $('#ejercicio').innerHTML = `
    <p class="sub">Revisión del depósito: decidí qué hacer con cada producto y después revisá.</p>
    <div class="estaciones" id="lista">
      ${items.map((it, n) => `
        <div class="card" style="padding:13px" data-fila="${n}">
          <div class="insumo-head">
            <span class="e">${it.icono}</span>
            <span><strong>${esc(it.nombre)}</strong><small>${dias(it.dias)}</small></span>
          </div>
          <div class="ops" style="margin-top:11px">
            ${CONTENIDO.accionesVencimiento.map(a => `
              <button class="op" data-fila="${n}" data-acc="${a.id}">${a.icono} ${esc(a.rotulo)}</button>`).join('')}
          </div>
          <div class="fb-fila"></div>
        </div>`).join('')}
    </div>
    <div class="btn-row"><button class="btn" id="revisar" disabled>Revisar las ${items.length} decisiones</button></div>`;

  $$('#lista .op').forEach(b => {
    b.onclick = () => {
      const fila = b.dataset.fila;
      elegido[fila] = b.dataset.acc;
      $$(`#lista .op[data-fila="${fila}"]`).forEach(o => o.classList.toggle('on', o === b));
      $('#revisar').disabled = Object.keys(elegido).length < items.length;
      vibrar(8);
    };
  });

  $('#revisar').onclick = () => {
    let aciertos = 0;
    items.forEach((it, n) => {
      const ok = elegido[n] === it.accion;
      if (ok) aciertos++;
      $$(`#lista .op[data-fila="${n}"]`).forEach(o => {
        o.disabled = true;
        o.classList.remove('on');
        if (o.dataset.acc === it.accion) o.classList.add('ok');
        else if (o.dataset.acc === elegido[n]) o.classList.add('mal');
      });
      $(`#lista [data-fila="${n}"] .fb-fila`).innerHTML =
        `<div class="feedback ${ok ? 'bien' : 'mal'}" style="margin-top:10px">
           <span class="ic">${ok ? '✅' : '⚠️'}</span><span>${esc(it.porque)}</span></div>`;
    });
    $('#revisar').disabled = true;
    setTimeout(() => terminarEstacion(id, aciertos, items.length), 1400);
  };
}

/* ================================================================== */
/* ESTACIÓN 5 — Cadena de frío (llevar el termómetro al rango)         */
/* ================================================================== */
function ejFrio(id) {
  const items = mezclar(CONTENIDO.frio.slice());
  let i = 0, aciertos = 0;

  const zonaDe = t => {
    const z = CONTENIDO.zonas.find(z => t >= z.min && t <= z.max);
    if (z) return { nombre: z.nombre, color: 'var(--bien)', id: z.id };
    if (t >= CONTENIDO.zonaRiesgo.desde && t <= CONTENIDO.zonaRiesgo.hasta)
      return { nombre: 'Zona de riesgo', color: 'var(--critico)', id: 'riesgo' };
    return { nombre: 'Fuera de rango', color: 'var(--alerta)', id: 'fuera' };
  };

  const pintar = () => {
    const it = items[i];
    const objetivo = CONTENIDO.zonas.find(z => z.id === it.zona);
    $('#ejercicio').innerHTML = `
      ${barraProgreso(i, items.length)}
      <div class="termo">
        <div class="insumo-head">
          <span class="e">${it.icono}</span>
          <span><strong>${esc(it.nombre)}</strong><small>¿A qué temperatura se guarda?</small></span>
        </div>
        <div class="termo-valor" style="margin-top:16px">
          <b id="lectura">10 °C</b>
          <span id="etiqueta" style="color:var(--critico)">Zona de riesgo</span>
        </div>
        <div class="termo-escala"></div>
        <input type="range" id="slider" min="-30" max="40" step="1" value="10">
        <div class="termo-ticks"><span>−30 °C</span><span>0 °C</span><span>40 °C</span></div>
        <div class="btn-row"><button class="btn" id="confirmar">Guardar a esta temperatura</button></div>
        <div id="fb"></div>
      </div>`;

    const slider = $('#slider');
    const actualizar = () => {
      const t = +slider.value, z = zonaDe(t);
      $('#lectura').textContent = t + ' °C';
      $('#lectura').style.color = z.color;
      $('#etiqueta').textContent = z.nombre;
      $('#etiqueta').style.color = z.color;
    };
    slider.oninput = actualizar;
    actualizar();

    $('#confirmar').onclick = () => {
      const t = +slider.value;
      const bien = t >= objetivo.min && t <= objetivo.max;
      if (bien) aciertos++;
      vibrar(bien ? 15 : 40);
      slider.disabled = true;
      $('#confirmar').disabled = true;
      $('#fb').innerHTML = devolucion(bien,
        bien ? `Correcto: <b>${esc(it.nombre)}</b> va en ${esc(objetivo.nombre.toLowerCase())} (${esc(objetivo.rango)}).`
             : `${esc(it.nombre)} va en <b>${esc(objetivo.nombre.toLowerCase())}</b>: ${esc(objetivo.rango)}. Elegiste ${t} °C.`) +
        `<div class="btn-row"><button class="btn sm" id="sigue">${i + 1 < items.length ? 'Siguiente insumo ›' : 'Ver resultado'}</button></div>`;
      $('#sigue').onclick = () => {
        i++;
        if (i < items.length) pintar(); else terminarEstacion(id, aciertos, items.length);
      };
    };
  };

  pintar();
}

/* ================================================================== */
/* ESTACIÓN 6 — Cargar una merma                                       */
/* ================================================================== */
function ejMerma(id) {
  const f = CONTENIDO.merma;
  const elegido = {};

  $('#ejercicio').innerHTML = `
    <div class="card">
      <div class="kicker">Caso</div>
      <p class="sub" style="font-size:1rem;color:var(--ink)">${esc(f.caso)}</p>
      <p class="sub">Completá la planilla de merma. Cada campo tiene una sola opción que sirve para el control.</p>
      ${f.campos.map(c => `
        <div class="campo" data-campo="${c.clave}">
          <label>${esc(c.rotulo)}</label>
          <div class="ops">
            ${c.opciones.map(o => `<button class="op" data-campo="${c.clave}" data-val="${esc(o)}">${esc(o)}</button>`).join('')}
          </div>
        </div>`).join('')}
      <div class="btn-row"><button class="btn" id="cargar" disabled>Cargar la merma</button></div>
      <div id="fb"></div>
    </div>`;

  $$('#ejercicio .op').forEach(b => {
    b.onclick = () => {
      elegido[b.dataset.campo] = b.dataset.val;
      $$(`#ejercicio .op[data-campo="${b.dataset.campo}"]`).forEach(o => o.classList.toggle('on', o === b));
      $('#cargar').disabled = Object.keys(elegido).length < f.campos.length;
      vibrar(8);
    };
  });

  $('#cargar').onclick = () => {
    let aciertos = 0;
    const errores = [];
    f.campos.forEach(c => {
      const ok = elegido[c.clave] === c.correcta;
      if (ok) aciertos++; else errores.push(c);
      $$(`#ejercicio .op[data-campo="${c.clave}"]`).forEach(o => {
        o.disabled = true;
        o.classList.remove('on');
        if (o.dataset.val === c.correcta) o.classList.add('ok');
        else if (o.dataset.val === elegido[c.clave]) o.classList.add('mal');
      });
    });
    $('#cargar').disabled = true;

    const todo = aciertos === f.campos.length;
    $('#fb').innerHTML = `
      ${todo ? '' : errores.map(c => devolucion(false, `<b>${esc(c.rotulo)}:</b> ${esc(c.error)}`)).join('')}
      <div class="ticket">
        <div class="l">PLANILLA DE MERMA</div>
        ${f.campos.map(c => `<div><span class="l">${esc(c.rotulo)}:</span> <span class="v">${esc(c.correcta)}</span></div>`).join('')}
      </div>
      ${devolucion(todo, esc(f.cierre))}`;

    setTimeout(() => terminarEstacion(id, aciertos, f.campos.length), 1600);
  };
}

/* ================================================================== */
/* ESTACIÓN 7 — Recuento de inventario                                 */
/* ================================================================== */
function ejRecuento(id) {
  const r = CONTENIDO.recuento;
  let contados = 0;

  $('#ejercicio').innerHTML = `
    <div class="card">
      <div class="kicker">Paso 1 · Conteo físico</div>
      <h3 style="margin-top:5px">${esc(r.producto)}</h3>
      <p class="sub">Tocá cada bulto de la cámara para contarlo. El conteo es físico: se cuenta, no se estima.</p>
      <div class="contador"><b id="cuenta">0</b><span>bultos contados</span></div>
      <div class="bultos" id="bultos">
        ${Array.from({ length: r.fisico }, (_, n) => `<button class="bulto" data-n="${n}">📦</button>`).join('')}
      </div>
      <div class="btn-row"><button class="btn" id="cerrarConteo" disabled>Cerrar el conteo</button></div>
      <div id="paso2"></div>
    </div>`;

  $$('#bultos .bulto').forEach(b => {
    b.onclick = () => {
      if (b.classList.contains('contado')) return;
      b.classList.add('contado');
      contados++;
      $('#cuenta').textContent = contados;
      vibrar(5);
      if (contados === r.fisico) {
        $('#cerrarConteo').disabled = false;
        $('#cerrarConteo').textContent = 'Cerrar el conteo (' + contados + ')';
      }
    };
  });

  $('#cerrarConteo').onclick = () => {
    $('#cerrarConteo').disabled = true;
    const dif = Math.abs(r.teorico - r.fisico) / r.teorico * 100;
    const fuera = dif > r.tolerancia;

    $('#paso2').innerHTML = `
      <div class="sec" style="margin-top:22px">
        <div class="kicker">Paso 2 · Comparación</div>
        <div class="datos" style="margin-top:10px">
          <div class="dato"><span class="r">Stock teórico (sistema)</span><span class="v">${r.teorico}</span></div>
          <div class="dato"><span class="r">Stock físico (contado)</span><span class="v">${r.fisico}</span></div>
          <div class="dato ${fuera ? 'mal' : ''}">
            <span class="r">Diferencia de inventario</span>
            <span class="v">${dif.toFixed(1)} %</span>
            <span class="marca">${fuera ? '⚠' : '✓'}</span>
          </div>
        </div>
        <p class="sub">|${r.teorico} − ${r.fisico}| ÷ ${r.teorico} × 100 = <b>${dif.toFixed(1)} %</b>.
           La tolerancia del local es ${r.tolerancia} %.</p>
        <div class="kicker" style="margin-top:20px">Paso 3 · Tu decisión</div>
        <div class="acciones" style="margin-top:10px">
          <button class="accion" data-d="ajustar"><span class="ic">1</span>
            <span><strong>Ajusto el sistema a ${r.fisico} y busco la causa</strong><small>Registro el ajuste e informo</small></span></button>
          <button class="accion" data-d="dejar"><span class="ic">2</span>
            <span><strong>Dejo ${r.teorico}, la diferencia es chica</strong><small>Ya se va a acomodar</small></span></button>
          <button class="accion" data-d="callar"><span class="ic">3</span>
            <span><strong>Ajusto en silencio, sin avisar</strong><small>Para no generar ruido</small></span></button>
        </div>
        <div id="fb"></div>
      </div>`;
    $('#paso2').scrollIntoView({ behavior: 'smooth', block: 'center' });

    $$('#paso2 .accion').forEach(b => {
      b.onclick = () => {
        const bien = b.dataset.d === 'ajustar';
        $$('#paso2 .accion').forEach(o => {
          o.disabled = true;
          if (o.dataset.d === 'ajustar') o.classList.add('era-la-correcta');
          else if (o === b) o.classList.add('elegida-mal');
        });
        $('#fb').innerHTML = devolucion(bien,
          bien ? `Correcto. Con ${dif.toFixed(1)} % estás <b>fuera de la tolerancia de ${r.tolerancia} %</b>: se ajusta a la realidad, se informa y se busca la causa.`
               : `Con ${dif.toFixed(1)} % la diferencia supera la tolerancia de ${r.tolerancia} %. Se ajusta el sistema a lo contado, se informa y se busca la causa: sin eso, el error se repite el mes que viene.`);
        // Dos puntos: haber contado bien y haber decidido bien.
        setTimeout(() => terminarEstacion(id, 1 + (bien ? 1 : 0), 2), 1600);
      };
    });
  };
}

/* ================================================================== */
/* ESTACIÓN 8 — Punto de pedido                                        */
/* ================================================================== */
function ejReposicion(id) {
  const r = CONTENIDO.reposicion;
  const estado = { consumo: 6, entrega: r.entrega, seguridad: 2 };

  $('#ejercicio').innerHTML = `
    <div class="card sliders">
      <div class="kicker">Configurá la reposición</div>
      <h3 style="margin-top:5px">${esc(r.producto)}</h3>
      <p class="sub">Arrancás la semana con <b>${r.stockInicial}</b> cajas. Ajustá los valores y mirá si el stock aguanta los 7 días.</p>

      <div class="campo">
        <div class="lectura"><label>Consumo diario estimado</label><b id="vConsumo"></b></div>
        <input type="range" id="sConsumo" min="4" max="20" step="1" value="${estado.consumo}">
      </div>
      <div class="campo">
        <div class="lectura"><label>Días que tarda el proveedor</label><b id="vEntrega"></b></div>
        <input type="range" id="sEntrega" min="1" max="5" step="1" value="${estado.entrega}">
      </div>
      <div class="campo">
        <div class="lectura"><label>Stock de seguridad</label><b id="vSeguridad"></b></div>
        <input type="range" id="sSeguridad" min="0" max="20" step="1" value="${estado.seguridad}">
      </div>

      <div class="ticket" style="text-align:center">
        <div class="l">PUNTO DE PEDIDO</div>
        <div><span class="v" style="font-size:1.5rem" id="vPunto"></span> <span class="l">cajas</span></div>
        <div class="l" id="formula"></div>
      </div>
    </div>

    <div class="card" style="margin-top:12px">
      <div class="kicker">Semana simulada</div>
      <h3 style="margin-top:5px">Cómo evoluciona tu stock</h3>
      <div id="grafico"></div>
      <div id="veredicto"></div>
    </div>

    <div class="btn-row"><button class="btn" id="confirmar">Confirmar esta configuración</button></div>`;

  /* Simula la semana: cada día se consume, y si el stock cae al punto de
     pedido se emite un pedido que llega tras los días de entrega. */
  const simular = () => {
    const punto = estado.consumo * estado.entrega + estado.seguridad;
    let stock = r.stockInicial, pedidoEn = -1, quiebres = 0;
    const serie = [{ dia: 'Ini', stock }];

    r.consumoReal.forEach((consumo, d) => {
      if (pedidoEn === d) { stock += r.stockInicial; pedidoEn = -1; }   // llega el pedido
      stock -= consumo;
      if (stock < 0) { quiebres += 1; stock = 0; }
      if (stock <= punto && pedidoEn < 0) pedidoEn = d + estado.entrega;
      serie.push({ dia: r.dias[d], stock });
    });
    return { punto, serie, quiebres };
  };

  const refrescar = () => {
    const { punto, serie, quiebres } = simular();
    $('#vConsumo').textContent = estado.consumo + ' cajas/día';
    $('#vEntrega').textContent = estado.entrega + (estado.entrega === 1 ? ' día' : ' días');
    $('#vSeguridad').textContent = estado.seguridad + ' cajas';
    $('#vPunto').textContent = punto;
    $('#formula').textContent = `${estado.consumo} × ${estado.entrega} + ${estado.seguridad}`;

    $('#grafico').innerHTML = graficoLinea(
      serie.map(p => ({ x: p.dia, y: p.stock })),
      { alto: 150, etiquetaY: 'cajas', resaltarCero: true,
        pie: quiebres > 0
          ? 'La línea toca el cero: hubo quiebre de stock.'
          : 'El stock nunca llega a cero: la semana se cubre.' }
    );

    activarGraficos();

    $('#veredicto').innerHTML = quiebres > 0
      ? `<div class="estado-pin critico">⚠ ${quiebres} ${quiebres === 1 ? 'día' : 'días'} sin stock</div>`
      : `<div class="estado-pin bien">✓ Semana cubierta, sin quiebres</div>`;
  };

  [['sConsumo', 'consumo'], ['sEntrega', 'entrega'], ['sSeguridad', 'seguridad']].forEach(([sel, clave]) => {
    $('#' + sel).oninput = ev => { estado[clave] = +ev.target.value; refrescar(); };
  });
  refrescar();

  $('#confirmar').onclick = () => {
    const { punto, quiebres } = simular();
    // Se evalúan dos cosas: que no haya quiebres y que el consumo estimado
    // no esté lejos del consumo real de la semana.
    const consumoReal = r.consumoReal.reduce((a, b) => a + b, 0) / r.consumoReal.length;
    const buenConsumo = Math.abs(estado.consumo - consumoReal) <= 2;
    const puntos = (quiebres === 0 ? 1 : 0) + (buenConsumo ? 1 : 0);

    $('#confirmar').disabled = true;
    $('#veredicto').innerHTML += devolucion(puntos === 2,
      (quiebres === 0
        ? 'Sin quiebres: reponés antes de quedarte sin. '
        : `Hubo ${quiebres} ${quiebres === 1 ? 'día' : 'días'} sin stock: el punto de pedido quedó bajo. `) +
      (buenConsumo
        ? `Tu estimación de consumo (${estado.consumo}) se parece al consumo real de la semana (${consumoReal.toFixed(1)}).`
        : `Estimaste ${estado.consumo} cajas/día y el consumo real promedió ${consumoReal.toFixed(1)}: el punto de pedido se calcula con el consumo real, no con el deseado.`));

    setTimeout(() => terminarEstacion(id, puntos, 2), 1800);
  };
}

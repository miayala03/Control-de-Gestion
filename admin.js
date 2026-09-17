/* ============================================================================
   SUPERVISOR — panel de seguimiento de la inducción del equipo.

   Se entra con un PIN (definido en contenido.js). Importante: como la app es
   un sitio estático, ese PIN viaja en el código y NO es seguridad real.
   Separa dos modos de uso, no protege datos.

   Los datos de las personas llegan de dos formas:
     · con Firebase configurado, cada persona sincroniza y el panel los lee;
     · sin configurar, la persona genera un código y el supervisor lo pega.
============================================================================ */

const CLAVE_SUP = 'induccion-supervisor-v1';

const supInicial = () => ({
  sesion: false,
  cargadas: [],      // fichas pegadas a mano (modo local)
  estandares: null   // { notaMinima, merma, quiebres, exactitud }
});

let SUP = (() => {
  try { return Object.assign(supInicial(), JSON.parse(localStorage.getItem(CLAVE_SUP) || '{}')); }
  catch (e) { return supInicial(); }
})();

function guardarSup() {
  try { localStorage.setItem(CLAVE_SUP, JSON.stringify(SUP)); } catch (e) {}
}

let personasNube = null;   // última lectura de la nube (no se persiste)
let estadoNube = null;     // { ok, motivo }

/* Los estándares que fija el supervisor pisan los de contenido.js.
   Se aplican al arrancar, antes de dibujar nada. */
function aplicarEstandares() {
  const e = SUP.estandares;
  if (!e) return;
  if (e.notaMinima) CONTENIDO.metas.notaMinima = e.notaMinima;
  const t = CONTENIDO.turno.estandar;
  if (e.merma != null) t.merma = e.merma;
  if (e.quiebres != null) t.quiebres = e.quiebres;
  if (e.exactitud != null) t.exactitud = e.exactitud;
}

function modoSupervisor() { return SUP.sesion === true; }

/* ---------------------------------------------------------------- */
/* Entrada: teclado de PIN                                           */
/* ---------------------------------------------------------------- */
function renderAdmin() {
  if (!modoSupervisor()) { renderPorton(); return; }
  renderPanel();
  // Primera entrada al panel: se lee la base sola, sin tener que apretar
  // "Actualizar". Mientras tanto la barra de estado dice que está leyendo.
  if (nubeActiva() && personasNube === null) refrescarNube(true);
}

function renderPorton() {
  let tecleado = '';
  const s = CONTENIDO.supervisor;

  $('#v-admin').innerHTML = `
    <div class="brief">
      <div class="e">🔐</div>
      <h2>${esc(s.titulo)}</h2>
      <div class="lema">${esc(s.ayuda)}</div>
      <div class="ind">Si sos la persona en inducción, volvé a <b>Inicio</b>: este panel no es para vos.</div>
    </div>

    <div class="card" style="margin-top:14px">
      <p class="sub" style="margin-top:0;text-align:center">Ingresá el PIN de supervisor</p>
      <div class="pin-puntos" id="pinPuntos"></div>
      <div id="pinError"></div>
      <div class="teclado">
        ${[1,2,3,4,5,6,7,8,9].map(n => `<button data-t="${n}">${n}</button>`).join('')}
        <button data-t="borrar" class="aux">←</button>
        <button data-t="0">0</button>
        <button data-t="ok" class="aux ok">✓</button>
      </div>
    </div>`;

  // Tantos círculos como dígitos tenga el PIN configurado, no un número fijo.
  const largoPin = String(s.pin).length;
  const pintarPuntos = () => {
    $('#pinPuntos').innerHTML = Array.from({ length: Math.max(largoPin, tecleado.length) },
      (_, i) => `<span class="${i < tecleado.length ? 'lleno' : ''}"></span>`).join('');
  };
  pintarPuntos();

  const probar = () => {
    if (tecleado === String(s.pin)) {
      SUP.sesion = true; guardarSup(); vibrar([18, 60, 18]);
      actualizarPestanaSupervisor();
      renderAdmin();
    } else {
      vibrar(60);
      $('#pinError').innerHTML = `<div class="feedback mal"><span class="ic">⚠️</span><span>PIN incorrecto.</span></div>`;
      tecleado = ''; pintarPuntos();
    }
  };

  $$('#v-admin .teclado button').forEach(b => {
    b.onclick = () => {
      const t = b.dataset.t;
      if (t === 'borrar') tecleado = tecleado.slice(0, -1);
      else if (t === 'ok') return probar();
      else if (tecleado.length < 8) tecleado += t;
      vibrar(6);
      pintarPuntos();
      $('#pinError').innerHTML = '';
      if (tecleado.length === String(s.pin).length) probar();
    };
  });
}

/* ---------------------------------------------------------------- */
/* Quiénes están en el equipo                                        */
/* ---------------------------------------------------------------- */
function personasVisibles() {
  const deNube = (personasNube || []).map(p => ({
    id: p.id, nombre: p.nombre, avance: p.avance, certificado: p.certificado,
    actualizado: p.actualizado, datos: p.datos || {}, origen: 'nube'
  }));
  // Las pegadas a mano solo se muestran si esa persona no llegó por la nube.
  const nombres = new Set(deNube.map(p => p.nombre.toLowerCase()));
  const aMano = (SUP.cargadas || [])
    .filter(p => !nombres.has(String(p.nombre).toLowerCase()))
    .map((p, i) => ({ id: 'local-' + i, nombre: p.nombre, avance: p.avance,
                      certificado: p.certificado, actualizado: p.actualizado,
                      datos: p.datos || {}, origen: 'codigo' }));
  return deNube.concat(aMano);
}

function resumenEquipo(personas) {
  const n = personas.length;
  if (!n) return null;
  const habilitados = personas.filter(p => p.certificado).length;
  const avance = Math.round(personas.reduce((a, p) => a + (p.avance || 0), 0) / n);
  const turnos = personas.reduce((a, p) => a + ((p.datos && p.datos.turnos) || 0), 0);

  // Por estación: qué porcentaje del equipo la superó.
  const porEstacion = CONTENIDO.estaciones.map(e => {
    const superaron = personas.filter(p =>
      ((p.datos && p.datos.estaciones && p.datos.estaciones[e.id]) || 0) >= CONTENIDO.metas.notaMinima).length;
    return { id: e.id, corto: e.corto, numero: e.numero, pct: Math.round((superaron / n) * 100) };
  });

  return { n, habilitados, avance, turnos, porEstacion,
           pctHabilitados: Math.round((habilitados / n) * 100),
           masFloja: porEstacion.slice().sort((a, b) => a.pct - b.pct)[0] };
}

/* ---------------------------------------------------------------- */
/* Panel                                                             */
/* ---------------------------------------------------------------- */
function renderPanel() {
  const personas = personasVisibles();
  const r = resumenEquipo(personas);
  const t = CONTENIDO.turno;
  const conexion = nubeActiva();

  const filaEstado = !conexion
    ? `<span class="estado-pin alerta">! Modo local: sin base de datos configurada</span>`
    : !estadoNube
      ? `<span class="estado-pin alerta">· Leyendo la base…</span>`
      : estadoNube.ok
        ? `<span class="estado-pin bien">✓ Conectado a la nube</span>`
        : `<span class="estado-pin critico">⚠ No se pudo leer la nube (${esc(estadoNube.motivo)})</span>`;

  $('#v-admin').innerHTML = `
    <div class="barra-sup">
      <div>
        <div class="kicker">Panel de supervisión</div>
        <h2 style="font-size:1.2rem;margin-top:3px">Inducción del equipo</h2>
      </div>
      <button class="btn sm ghost" id="salirSup">Salir</button>
    </div>
    <div class="fila-estado">${filaEstado}
      <button class="btn sm ghost" id="refrescar">Actualizar</button>
    </div>

    ${r ? `
      <div class="tiles" style="margin-top:14px">
        <div class="tile"><div class="rot">Personas</div><div class="val">${r.n}</div><div class="meta">en inducción</div></div>
        <div class="tile"><div class="rot">Habilitadas</div><div class="val">${r.pctHabilitados}%</div>
          <div class="meta">${r.habilitados} de ${r.n}</div>
          <div class="estado-pin ${r.pctHabilitados >= 80 ? 'bien' : r.pctHabilitados >= 50 ? 'alerta' : 'critico'}">
            ${r.pctHabilitados >= 80 ? '✓ En estándar' : r.pctHabilitados >= 50 ? '! Desvío' : '⚠ Desvío grave'}</div></div>
        <div class="tile"><div class="rot">Avance medio</div><div class="val">${r.avance}%</div><div class="meta">del programa</div></div>
        <div class="tile"><div class="rot">Turnos</div><div class="val">${r.turnos}</div><div class="meta">simulados</div></div>
      </div>

      <div class="sec">
        <div class="sec-head"><div class="kicker">Diagnóstico</div><h2>Dónde falla la inducción</h2>
          <p class="sub">Porcentaje del equipo que superó cada estación. Lo que está bajo, no es problema de una persona: es del programa.</p></div>
        <div class="card">
          ${graficoBarras(r.porEstacion.map(e => ({
              x: e.numero + '. ' + e.corto, y: e.pct,
              color: e.pct >= 80 ? '#0CA30C' : e.pct >= 50 ? '#FAB219' : '#D03B3B'
            })), { objetivo: 80, unidad: '%', rotuloX: 'Estación', etiquetaY: 'Superada por',
                   aria: 'Porcentaje del equipo que superó cada estación' })}
        </div>
        <div class="card" style="margin-top:12px">
          <div class="kicker">Acción correctiva</div>
          <h3 style="margin-top:5px">Estación ${r.masFloja.numero}: ${esc(r.masFloja.corto)}</h3>
          <p class="sub">Es la que menos gente supera (${r.masFloja.pct} % del equipo). Antes de insistir persona por persona,
             conviene revisar cómo se está explicando ese punto en el local.</p>
        </div>
      </div>

      <div class="sec">
        <div class="sec-head"><div class="kicker">Seguimiento</div><h2>Persona por persona</h2></div>
        <div class="estaciones">
          ${personas.map((p, i) => {
            const d = p.datos || {};
            const estado = p.certificado ? ['lista', '✅', 'Habilitado']
                        : (p.avance >= 50 ? ['', '🔁', 'En curso'] : ['', '○', 'Inicial']);
            return `
            <button class="est ${estado[0]}" data-persona="${i}">
              <span class="num">${estado[1]}</span>
              <span class="tx">
                <strong>${esc(p.nombre)}</strong>
                <small>${d.superadas || 0}/${CONTENIDO.estaciones.length} estaciones ·
                       ${d.examen && d.examen.nota ? 'certificación ' + d.examen.nota + ' %' : 'sin certificar'}
                       ${p.origen === 'codigo' ? ' · por código' : ''}</small>
              </span>
              <span class="estado"><span class="puntaje">${p.avance}%</span></span>
            </button>`;
          }).join('')}
        </div>
        <div class="btn-row"><button class="btn sm ghost" id="exportar">Descargar planilla (CSV)</button></div>
      </div>` : `
      <div class="card" style="margin-top:14px">
        <h3>Todavía no hay nadie cargado</h3>
        <p class="sub">${conexion
          ? 'La base está conectada, pero ninguna persona sincronizó su avance todavía. Cada una tiene que poner su nombre en Inicio y tocar “Compartir mi avance”.'
          : 'Sin base de datos configurada, pedile a cada persona su código de avance y pegalo abajo. O configurá Firebase para que sincronicen solas.'}</p>
      </div>`}

    <div class="sec">
      <div class="sec-head"><div class="kicker">Estándar</div><h2>Metas del programa</h2>
        <p class="sub">Lo que se fija acá es contra lo que la app mide a cada persona. Vale para este dispositivo.</p></div>
      <div class="card sliders" id="estandares"></div>
    </div>

    <div class="sec">
      <div class="sec-head"><div class="kicker">Datos</div><h2>Cargar un avance a mano</h2>
        <p class="sub">Para quien no tenga conexión: pegá acá el código que te pasó por mensaje.</p></div>
      <div class="card">
        <textarea class="campo-texto" id="codigoPegado" rows="3" placeholder="IND1...."></textarea>
        <div class="btn-row">
          <button class="btn sm" id="importar">Cargar</button>
          ${SUP.cargadas.length ? `<button class="btn sm ghost" id="limpiarCargadas">Borrar las ${SUP.cargadas.length} cargadas a mano</button>` : ''}
        </div>
        <div id="fbImport"></div>
      </div>
    </div>

    <div class="sec">
      <div class="sec-head"><div class="kicker">Conexión</div><h2>Base de datos</h2></div>
      <div class="card" id="cardNube"></div>
    </div>`;

  $('#salirSup').onclick = () => {
    SUP.sesion = false; guardarSup();
    actualizarPestanaSupervisor();
    ir('inicio');
  };
  $('#refrescar').onclick = () => refrescarNube(true);

  $$('#v-admin [data-persona]').forEach(b =>
    b.onclick = () => verPersona(personas[+b.dataset.persona]));

  if ($('#exportar')) $('#exportar').onclick = () => exportarCSV(personas);

  $('#importar').onclick = () => {
    const ficha = decodificarFicha($('#codigoPegado').value);
    if (!ficha) {
      $('#fbImport').innerHTML = devolucion(false, 'Ese código no es válido. Tiene que empezar con <b>IND1.</b> y venir completo.');
      return;
    }
    SUP.cargadas = SUP.cargadas.filter(p => String(p.nombre).toLowerCase() !== String(ficha.nombre).toLowerCase());
    SUP.cargadas.push(ficha);
    guardarSup();
    renderPanel();
  };
  if ($('#limpiarCargadas')) $('#limpiarCargadas').onclick = () => {
    if (confirm('¿Borrar las fichas cargadas a mano?')) { SUP.cargadas = []; guardarSup(); renderPanel(); }
  };

  pintarEstandares();
  pintarCardNube();
  activarGraficos();
}

/* ---------------------------------------------------------------- */
/* Ficha de una persona                                              */
/* ---------------------------------------------------------------- */
function verPersona(p) {
  const d = p.datos || {};
  const est = d.estaciones || {};
  const ut = d.ultimoTurno;

  mostrarPanel({
    titulo: p.nombre,
    sub: `${p.avance} % del programa · ${p.certificado ? 'habilitado' : 'en curso'}` +
         (p.actualizado ? ` · actualizado ${p.actualizado.slice(0, 10)}` : ''),
    nota: `
      <div style="font-size:.8rem">
        <b>Estaciones</b>
        <div class="datos" style="margin-top:8px">
          ${CONTENIDO.estaciones.map(e => {
            const v = est[e.id] || 0, ok = v >= CONTENIDO.metas.notaMinima;
            return `<div class="dato ${v && !ok ? 'mal' : ''}">
                      <span class="r">${e.numero}. ${esc(e.corto)}</span>
                      <span class="v">${v ? v + ' %' : '—'}</span>
                      <span class="marca">${ok ? '✓' : v ? '⚠' : '·'}</span>
                    </div>`;
          }).join('')}
        </div>
        ${ut ? `<b style="display:block;margin-top:14px">Último turno simulado</b>
          <div class="datos" style="margin-top:8px">
            <div class="dato"><span class="r">Puntaje</span><span class="v">${ut.puntaje} %</span></div>
            <div class="dato"><span class="r">% de merma</span><span class="v">${ut.merma} %</span></div>
            <div class="dato"><span class="r">Quiebres</span><span class="v">${ut.quiebres}</span></div>
            <div class="dato"><span class="r">Exactitud</span><span class="v">${ut.exactitud} %</span></div>
          </div>` : '<p class="sub">Todavía no simuló ningún turno.</p>'}
        ${d.examen ? `<p class="sub">Certificación: <b>${d.examen.nota} %</b> — ${d.examen.aprobado ? 'aprobada' : 'no alcanzó'}.</p>`
                   : '<p class="sub">Certificación pendiente.</p>'}
      </div>`,
    acciones: p.origen === 'nube' ? [{
      txt: 'Quitar del panel', clase: 'btn sm ghost',
      fn: async (b) => {
        if (!confirm('¿Quitar a ' + p.nombre + ' de la base? La persona conserva su avance en su teléfono.')) return;
        b.textContent = 'Quitando…';
        const r = await nubeBorrar(p.id);
        cerrarInstalacion();
        if (r.ok) refrescarNube(true); else alert('No se pudo quitar: ' + r.motivo);
      }
    }] : []
  });
}

/* ---------------------------------------------------------------- */
/* Estándares editables                                              */
/* ---------------------------------------------------------------- */
function pintarEstandares() {
  const t = CONTENIDO.turno.estandar;
  const v = SUP.estandares || {
    notaMinima: CONTENIDO.metas.notaMinima, merma: t.merma,
    quiebres: t.quiebres, exactitud: t.exactitud
  };

  const fila = (id, rotulo, valor, min, max, paso, unidad) => `
    <div class="campo">
      <div class="lectura"><label>${esc(rotulo)}</label><b id="v_${id}">${valor}${unidad}</b></div>
      <input type="range" id="e_${id}" min="${min}" max="${max}" step="${paso}" value="${valor}">
    </div>`;

  $('#estandares').innerHTML =
    fila('notaMinima', 'Nota mínima para aprobar', v.notaMinima, 50, 100, 5, ' %') +
    fila('merma', 'Merma máxima aceptada', v.merma, 1, 8, 0.5, ' %') +
    fila('quiebres', 'Quiebres máximos por turno', v.quiebres, 0, 4, 1, '') +
    fila('exactitud', 'Exactitud mínima de inventario', v.exactitud, 90, 100, 1, ' %') +
    `<div class="btn-row">
       <button class="btn sm" id="guardarEst">Guardar estándares</button>
       <button class="btn sm ghost" id="resetEst">Volver a los de origen</button>
     </div><div id="fbEst"></div>`;

  ['notaMinima', 'merma', 'quiebres', 'exactitud'].forEach(k => {
    const u = k === 'quiebres' ? '' : ' %';
    $('#e_' + k).oninput = ev => $('#v_' + k).textContent = ev.target.value + u;
  });

  $('#guardarEst').onclick = () => {
    SUP.estandares = {
      notaMinima: +$('#e_notaMinima').value,
      merma: +$('#e_merma').value,
      quiebres: +$('#e_quiebres').value,
      exactitud: +$('#e_exactitud').value
    };
    guardarSup();
    aplicarEstandares();
    $('#fbEst').innerHTML = devolucion(true, 'Estándares actualizados. La app ya mide contra estos valores.');
  };
  $('#resetEst').onclick = () => {
    SUP.estandares = null; guardarSup();
    location.reload();   // se recargan los valores originales de contenido.js
  };
}

/* ---------------------------------------------------------------- */
/* Tarjeta de conexión                                               */
/* ---------------------------------------------------------------- */
function pintarCardNube() {
  const c = configNube();
  const enRepo = !!(CONTENIDO.firebase && CONTENIDO.firebase.apiKey);

  $('#cardNube').innerHTML = c ? `
      <div class="estado-pin bien">✓ Firebase configurado</div>
      <div class="datos" style="margin-top:12px">
        <div class="dato"><span class="r">Proyecto</span><span class="v">${esc(c.projectId)}</span></div>
        <div class="dato"><span class="r">Colección</span><span class="v">${esc(c.coleccion || 'personas')}</span></div>
        <div class="dato"><span class="r">Origen</span><span class="v">${enRepo ? 'contenido.js' : 'solo este dispositivo'}</span></div>
      </div>
      ${enRepo ? '' : `<p class="sub">Está cargado solo acá, para probar. Para que las personas del equipo
        sincronicen, hay que pegarlo en el bloque <b>firebase</b> de <b>contenido.js</b> y subirlo.</p>`}
      <div class="btn-row">
        <button class="btn sm ghost" id="probarNube">Probar la conexión</button>
        ${enRepo ? '' : '<button class="btn sm ghost" id="olvidarNube">Olvidar en este dispositivo</button>'}
      </div>
      <div id="fbNube"></div>` : `
      <p class="sub" style="margin-top:0">Sin base de datos, cada persona te pasa su código a mano. Con Firebase,
         sincronizan solas y este panel se actualiza.</p>
      <ol class="pasos">
        <li><span class="n">1</span><span>Entrá a <b>console.firebase.google.com</b> y creá un proyecto (gratis, sin tarjeta).</span></li>
        <li><span class="n">2</span><span>En <b>Compilación → Firestore Database</b>, creá la base. Dejá la que viene
            <b>por defecto</b>: las bases con nombre propio no tienen cuota gratuita.</span></li>
        <li><span class="n">3</span><span>Empezá en <b>modo de prueba</b> y, en <b>Reglas</b>, permití lectura y escritura.</span></li>
        <li><span class="n">4</span><span>En <b>Configuración del proyecto</b> agregá una app web y copiá
            <b>apiKey</b> y <b>projectId</b>.</span></li>
        <li><span class="n">5</span><span>Pegalos acá para probar, y después en el bloque <b>firebase</b> de
            <b>contenido.js</b> para que valga para todo el equipo.</span></li>
      </ol>
      <div class="campo"><label>apiKey</label>
        <input class="campo-texto" id="nApiKey" placeholder="AIza..."></div>
      <div class="campo"><label>projectId</label>
        <input class="campo-texto" id="nProject" placeholder="induccion-stock"></div>
      <div class="btn-row"><button class="btn sm" id="guardarNube">Guardar y probar</button></div>
      <div id="fbNube"></div>
      <div class="inst-nota">Esa clave es pública por diseño: va dentro de la página y cualquiera puede verla.
        Quien tenga el enlace puede leer y escribir en la base, así que no cargues datos sensibles.</div>`;

  if ($('#guardarNube')) $('#guardarNube').onclick = async () => {
    const apiKey = $('#nApiKey').value.trim(), projectId = $('#nProject').value.trim();
    if (!apiKey || !projectId) {
      $('#fbNube').innerHTML = devolucion(false, 'Faltan datos: hacen falta los dos.');
      return;
    }
    guardarConfigLocal({ apiKey, projectId });
    await probarConexion();
  };
  if ($('#probarNube')) $('#probarNube').onclick = () => probarConexion();
  if ($('#olvidarNube')) $('#olvidarNube').onclick = () => { borrarConfigLocal(); renderPanel(); };
}

async function probarConexion() {
  $('#fbNube').innerHTML = '<p class="sub">Probando…</p>';
  const r = await nubeListar();
  if (r.ok) {
    personasNube = r.personas;
    estadoNube = { ok: true };
    $('#fbNube').innerHTML = devolucion(true, `Conectado. La base responde y tiene <b>${r.personas.length}</b> ${r.personas.length === 1 ? 'ficha' : 'fichas'}.`);
    setTimeout(renderPanel, 1200);
  } else {
    estadoNube = { ok: false, motivo: r.motivo };
    const explicacion = r.motivo === 'sin-red'
      ? 'No hubo respuesta. Revisá la conexión a internet.'
      : r.motivo.startsWith('http-40')
        ? 'La base contestó que no está permitido. Revisá las <b>Reglas</b> de Firestore: para esta prueba tienen que permitir lectura y escritura.'
        : 'La base contestó con un error: ' + esc(r.motivo) + '. Revisá que el <b>projectId</b> y la <b>apiKey</b> sean los del proyecto.';
    $('#fbNube').innerHTML = devolucion(false, explicacion);
  }
}

async function refrescarNube(avisar) {
  if (!nubeActiva()) { if (avisar) renderPanel(); return; }
  const r = await nubeListar();
  personasNube = r.ok ? r.personas : personasNube;
  estadoNube = { ok: r.ok, motivo: r.motivo || '' };
  if (avisar) renderPanel();
}

/* ---------------------------------------------------------------- */
/* Planilla para el informe                                          */
/* ---------------------------------------------------------------- */
function exportarCSV(personas) {
  const cab = ['Nombre', 'Avance %', 'Estaciones superadas', 'Turnos', 'Mejor turno %',
               'Certificación %', 'Estado', 'Actualizado']
    .concat(CONTENIDO.estaciones.map(e => e.numero + '. ' + e.corto));

  const filas = personas.map(p => {
    const d = p.datos || {};
    return [
      p.nombre, p.avance, (d.superadas || 0) + '/' + CONTENIDO.estaciones.length,
      d.turnos || 0, d.mejorTurno || 0,
      d.examen ? d.examen.nota : '', p.certificado ? 'Habilitado' : 'En refuerzo',
      (p.actualizado || '').slice(0, 10)
    ].concat(CONTENIDO.estaciones.map(e => (d.estaciones && d.estaciones[e.id]) || 0));
  });

  // Punto y coma: es lo que espera el Excel en español.
  const csv = [cab].concat(filas)
    .map(f => f.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n');

  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'induccion-equipo-' + hoyISO() + '.csv';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

/* ---------------------------------------------------------------- */
/* Pestaña del supervisor en la barra inferior                       */
/* ---------------------------------------------------------------- */
function actualizarPestanaSupervisor() {
  const b = $('.nav button[data-ir="admin"]');
  if (b) b.classList.toggle('oculta', !modoSupervisor());
  document.body.classList.toggle('es-supervisor', modoSupervisor());
}

/* ============================================================================
   NÚCLEO — estado, navegación, pantalla de inicio y lista de estaciones.
   Los textos se editan en "contenido.js".
============================================================================ */

const CLAVE = 'induccion-stock-v2';

const estadoInicial = () => ({
  inicio: hoyISO(),
  nombre: '',       // lo pone la persona para que el supervisor la identifique
  sync: null,       // { fecha, ok } de la última sincronización
  estaciones: {},   // id -> { mejor: 0..100, intentos: n }
  turnos: [],       // { fecha, puntaje, mermaPct, quiebres, exactitud }
  examen: null      // { nota, aprobado, fecha }
});

let E = cargar();

function hoyISO() { return new Date().toISOString().slice(0, 10); }

function cargar() {
  try {
    const crudo = localStorage.getItem(CLAVE);
    if (!crudo) return estadoInicial();
    return Object.assign(estadoInicial(), JSON.parse(crudo));
  } catch (e) { return estadoInicial(); }
}
function guardar() {
  try { localStorage.setItem(CLAVE, JSON.stringify(E)); } catch (e) {}
}

/* ---------------------------------------------------------------- */
/* Atajos                                                            */
/* ---------------------------------------------------------------- */
const $  = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const pesos = n => '$' + Math.round(n).toLocaleString('es-AR');
const mezclar = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(p => p[1]);

/* Vibración corta de confirmación, donde el dispositivo la soporte. */
function vibrar(ms) { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} }

function estacion(id) { return CONTENIDO.estaciones.find(e => e.id === id); }
function puntajeEstacion(id) { return (E.estaciones[id] && E.estaciones[id].mejor) || 0; }
function estacionSuperada(id) { return puntajeEstacion(id) >= CONTENIDO.metas.notaMinima; }

function anotarEstacion(id, puntaje) {
  const previo = E.estaciones[id] || { mejor: 0, intentos: 0 };
  E.estaciones[id] = { mejor: Math.max(previo.mejor, puntaje), intentos: previo.intentos + 1 };
  guardar();
  sincronizar(true);   // en segundo plano; si falla, la app sigue igual
}

/* ---------------------------------------------------------------- */
/* Avance global                                                     */
/* ---------------------------------------------------------------- */
function metricas() {
  const total = CONTENIDO.estaciones.length;
  const superadas = CONTENIDO.estaciones.filter(e => estacionSuperada(e.id)).length;
  const turnoHecho = E.turnos.length > 0;
  const certificado = !!(E.examen && E.examen.aprobado);

  // El avance reparte: entrenamiento 60 %, turno 15 %, certificación 25 %.
  const avance = Math.round(
    (superadas / total) * 60 + (turnoHecho ? 15 : 0) + (certificado ? 25 : 0)
  );

  return { total, superadas, turnoHecho, certificado, avance,
           mejorTurno: E.turnos.reduce((m, t) => Math.max(m, t.puntaje), 0) };
}

function proximoPaso() {
  const pendiente = CONTENIDO.estaciones.find(e => !estacionSuperada(e.id));
  if (pendiente) {
    return { rotulo: pendiente.numero === 1 && !E.estaciones[pendiente.id] ? 'Empezar el entrenamiento' : 'Seguir entrenando',
             detalle: 'Estación ' + pendiente.numero + ': ' + pendiente.nombre,
             icono: pendiente.icono, ir: () => ir('estacion', pendiente.id) };
  }
  if (E.turnos.length === 0) {
    return { rotulo: 'Simular un turno completo', detalle: 'Ocho decisiones reales, con su impacto',
             icono: '⏱️', ir: () => ir('turno') };
  }
  if (!(E.examen && E.examen.aprobado)) {
    return { rotulo: 'Rendir la certificación', detalle: CONTENIDO.examen.length + ' preguntas · se aprueba con ' + CONTENIDO.metas.notaMinima + ' %',
             icono: '🎓', ir: () => ir('examen') };
  }
  return { rotulo: 'Mejorar tu marca en el turno', detalle: 'Ya estás habilitado: entrená para subir el puntaje',
           icono: '🔁', ir: () => ir('turno') };
}

/* ---------------------------------------------------------------- */
/* Navegación                                                        */
/* ---------------------------------------------------------------- */
let vistaActual = 'inicio';

const TITULOS = {
  inicio:   ['Inducción · Stock de Cocina', "McDonald's · Cocina"],
  entrenar: ['Entrenamiento', 'Ocho estaciones prácticas'],
  estacion: ['Estación', 'Entrenamiento'],
  turno:    ['Simulador de turno', 'Tus decisiones, sus efectos'],
  tablero:  ['Tablero de control', 'Indicadores del puesto'],
  examen:   ['Certificación', 'Evaluación final'],
  admin:    ['Panel de supervisión', 'Inducción del equipo']
};

// Qué pestaña de la barra inferior se ilumina en cada vista.
const PESTANA = { inicio: 'inicio', entrenar: 'entrenar', estacion: 'entrenar',
                  turno: 'turno', tablero: 'tablero', examen: 'tablero', admin: 'admin' };

function ir(vista, param) {
  vistaActual = vista;

  // Se vacía todo lo que no es la vista activa. Varias pantallas usan los
  // mismos id internos (#fb, #sigue, #ejercicio); si quedaran dos en el
  // documento, querySelector tomaría el de la pantalla oculta y la vista
  // visible dejaría de responder. Cada vista se vuelve a armar al entrar.
  $$('.vista').forEach(v => {
    v.classList.remove('activa');
    if (v.id !== 'v-' + vista) v.innerHTML = '';
  });
  $('#v-' + vista).classList.add('activa');
  $$('.nav button').forEach(b => b.classList.toggle('on', b.dataset.ir === PESTANA[vista]));
  $('#btnVolver').classList.toggle('show', vista === 'estacion' || vista === 'examen');

  const t = TITULOS[vista];
  $('#tbTitulo').textContent = t[0];
  $('#tbSub').textContent = t[1];

  if (vista === 'inicio')   renderInicio();
  if (vista === 'entrenar') renderEntrenar();
  if (vista === 'estacion') renderEstacion(param);
  if (vista === 'turno')    renderTurno();
  if (vista === 'tablero')  renderTablero();
  if (vista === 'examen')   renderExamen();
  if (vista === 'admin')    renderAdmin();

  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

/* ---------------------------------------------------------------- */
/* Anillo de progreso (SVG)                                          */
/* ---------------------------------------------------------------- */
function anillo(pct, rotulo) {
  const r = 36, c = 2 * Math.PI * r;
  const avance = c * (1 - Math.min(100, Math.max(0, pct)) / 100);
  return `
    <div class="anillo">
      <svg viewBox="0 0 86 86" width="86" height="86" aria-hidden="true">
        <circle cx="43" cy="43" r="${r}" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="7"></circle>
        <circle cx="43" cy="43" r="${r}" fill="none" stroke="#FFBC0D" stroke-width="7" stroke-linecap="round"
                stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${avance.toFixed(1)}"></circle>
      </svg>
      <div class="pct">${pct}%<small>${esc(rotulo)}</small></div>
    </div>`;
}

/* ---------------------------------------------------------------- */
/* INICIO                                                            */
/* ---------------------------------------------------------------- */
function renderInicio() {
  const p = CONTENIDO.proyecto, m = metricas(), paso = proximoPaso();

  $('#v-inicio').innerHTML = `
    <div class="hero">
      <div class="kicker">Inducción · Personal nuevo</div>
      <h1>Tu puesto: <em>${esc(p.puesto)}</em></h1>
      <p>Acá no se lee un manual: se practica el puesto. Entrená las ocho estaciones, simulá un turno y certificate.</p>
      <div class="anillo-fila">
        ${anillo(m.avance, 'listo')}
        <div class="anillo-txt">
          <b>${m.superadas} de ${m.total} estaciones superadas</b>
          ${m.turnoHecho ? '✓ Turno simulado' : '○ Turno sin simular'}<br>
          ${m.certificado ? '✓ Certificación aprobada' : '○ Certificación pendiente'}
        </div>
      </div>
    </div>

    <button class="cta" id="ctaSeguir">
      <span class="ic">${paso.icono}</span>
      <span class="tx"><strong>${esc(paso.rotulo)}</strong><small>${esc(paso.detalle)}</small></span>
      <span class="flecha">›</span>
    </button>

    <div class="sec">
      <div class="sec-head">
        <div class="kicker">Tu lugar en el local</div>
        <h2>Con quién trabajás</h2>
      </div>
      <div class="mapa" id="mapa">
        ${CONTENIDO.mapa.nodos.map((n, i) => `
          <button data-nodo="${i}"><span class="e">${n.icono}</span><span>${esc(n.nombre)}</span></button>`).join('')}
      </div>
      <div class="mapa-detalle" id="mapaDetalle">
        <b>Tocá un área</b> para ver qué intercambiás con ella. Tu puesto está en el medio de todas.
      </div>
    </div>

    <div class="sec">
      <div class="sec-head">
        <div class="kicker">Memorizá esto</div>
        <h2>Las temperaturas del local</h2>
      </div>
      <div class="refs">
        ${CONTENIDO.zonas.map(z => `
          <div class="ref"><span class="e">${z.icono}</span><small>${esc(z.nombre)}</small><strong>${esc(z.rango)}</strong></div>`).join('')}
        <div class="ref"><span class="e">🔄</span><small>Regla de oro</small><strong>PEPS</strong></div>
      </div>
    </div>

    <div class="sec">
      <div class="sec-head">
        <div class="kicker">Tu ficha</div>
        <h2>Tu nombre y tu avance</h2>
      </div>
      <div class="card">
        <p class="sub" style="margin-top:0">Poné tu nombre para que el supervisor sepa de quién es este avance.</p>
        <div class="campo">
          <label>Nombre y apellido</label>
          <input class="campo-texto" id="miNombre" value="${esc(E.nombre || '')}" placeholder="Ej.: Lucas González" maxlength="40">
        </div>
        <div id="estadoSync"></div>
        <div class="btn-row">
          <button class="btn sm" id="compartirAvance">Compartir mi avance</button>
        </div>
        <div id="fbCompartir"></div>
      </div>
    </div>

    <div class="sec">
      <div class="sec-head">
        <div class="kicker">Datos del proyecto</div>
        <h2>Ficha</h2>
      </div>
      <div class="card">
        <div class="chips" style="margin-top:0">
          <div class="chip">Materia: <b>${esc(p.materia)}</b></div>
          <div class="chip">Docente: <b>${esc(p.docente)}</b></div>
          <div class="chip">Carrera: <b>${esc(p.carrera)}</b></div>
        </div>
        <p class="sub">Integrantes: <b>${p.integrantes.map(esc).join(' · ')}</b></p>
        <div class="btn-row">
          <button class="btn sm dark" id="instalarApp">Instalar como app</button>
          <button class="btn sm ghost" id="borrarTodo">Borrar mi avance</button>
        </div>
      </div>
    </div>`;

  $('#ctaSeguir').onclick = paso.ir;

  $$('#mapa button').forEach(b => {
    b.onclick = () => {
      const n = CONTENIDO.mapa.nodos[+b.dataset.nodo];
      $$('#mapa button').forEach(o => o.classList.toggle('on', o === b));
      $('#mapaDetalle').innerHTML = `<b>${n.icono} ${esc(n.nombre)}</b> — ${esc(n.detalle)}`;
    };
  });

  $('#miNombre').oninput = ev => { E.nombre = ev.target.value.trim(); guardar(); };
  $('#compartirAvance').onclick = () => compartirAvance();
  refrescarEstadoSync();

  $('#instalarApp').onclick = () => abrirInstalacion();
  $('#borrarTodo').onclick = () => {
    if (confirm('¿Borrar todo tu avance (estaciones, turnos y certificación)? No se puede deshacer.')) {
      E = estadoInicial(); guardar(); ir('inicio');
    }
  };

  $('#avisoLegal').textContent = p.aviso;
}

/* ---------------------------------------------------------------- */
/* ENTRENAR — lista de estaciones                                    */
/* ---------------------------------------------------------------- */
function renderEntrenar() {
  const m = metricas();

  $('#v-entrenar').innerHTML = `
    <div class="sec-head" style="margin-bottom:6px">
      <div class="kicker">Entrenamiento</div>
      <h2>Ocho estaciones del puesto</h2>
      <p class="sub">Cada una es un ejercicio corto. Se supera con ${CONTENIDO.metas.notaMinima} % o más; podés repetirla las veces que quieras.</p>
    </div>

    <div class="progreso-ej">
      <div class="barra"><i style="width:${(m.superadas / m.total) * 100}%"></i></div>
      <div class="cuenta">${m.superadas}/${m.total}</div>
    </div>

    <div class="estaciones">
      ${CONTENIDO.estaciones.map(e => {
        const pts = puntajeEstacion(e.id), ok = estacionSuperada(e.id);
        return `
        <button class="est ${ok ? 'lista' : ''}" data-est="${e.id}">
          <span class="num">${e.icono}</span>
          <span class="tx">
            <strong>${e.numero}. ${esc(e.nombre)}</strong>
            <small>${esc(e.lema)}</small>
          </span>
          <span class="estado">
            ${ok ? '<span class="tilde">✅</span>' : (pts ? '<span class="tilde">🔁</span>' : '<span class="tilde">▶</span>')}
            ${pts ? `<span class="puntaje">${pts}%</span>` : ''}
          </span>
        </button>`;
      }).join('')}
    </div>

    <div class="sec">
      <div class="card">
        <h3>¿Ya entrenaste todo?</h3>
        <p class="sub">El simulador de turno junta las ocho estaciones en un día de trabajo real, con sus consecuencias.</p>
        <div class="btn-row"><button class="btn sm" id="alTurno">Ir al simulador de turno</button></div>
      </div>
    </div>`;

  $$('.est').forEach(b => b.onclick = () => ir('estacion', b.dataset.est));
  $('#alTurno').onclick = () => ir('turno');
}

/* ---------------------------------------------------------------- */
/* Instalar como app (iPhone, Android y escritorio)                  */
/*                                                                   */
/* Android y Chrome de escritorio avisan con "beforeinstallprompt" y */
/* se instalan con un toque. iOS NO tiene ese evento: la única forma */
/* de instalar es Safari -> Compartir -> Agregar a inicio, así que   */
/* ahí mostramos las instrucciones paso a paso.                      */
/* ---------------------------------------------------------------- */
const CLAVE_INST = 'induccion-instalar-oculto';
const UA = navigator.userAgent || '';
const ES_IOS = /iPad|iPhone|iPod/.test(UA) ||
               (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const OTRO_NAV_IOS = /CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo|GSA|FBAN|FBAV|Instagram|Line\//.test(UA);
const ES_SAFARI_IOS = ES_IOS && !OTRO_NAV_IOS;

let promptInstalacion = null;

function appInstalada() {
  return window.navigator.standalone === true ||
         window.matchMedia('(display-mode: standalone)').matches ||
         window.matchMedia('(display-mode: fullscreen)').matches;
}

function cerrarInstalacion() {
  $('#instSheet').classList.remove('show');
  document.body.style.overflow = '';
}

function mostrarPanel({ titulo, sub, pasos = [], nota = '', acciones = [] }) {
  $('#instTitulo').textContent = titulo;
  $('#instSub').textContent = sub;
  $('#instPasos').innerHTML = pasos
    .map((t, i) => `<li><span class="n">${i + 1}</span><span>${t}</span></li>`).join('');
  $('#instNota').innerHTML = nota ? `<div class="inst-nota">${nota}</div>` : '';

  const cont = $('#instAcciones');
  cont.innerHTML = '';
  acciones.concat([{ txt: 'Entendido', clase: 'btn sm ghost' }]).forEach(a => {
    const b = document.createElement('button');
    b.className = a.clase || 'btn sm ghost';
    b.textContent = a.txt;
    b.onclick = () => { if (a.fn) a.fn(b); else cerrarInstalacion(); };
    cont.appendChild(b);
  });

  $('#instSheet').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function copiarEnlace(boton) {
  const url = location.href.split('#')[0];
  const ok = () => { boton.textContent = '¡Enlace copiado!'; };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(ok)
      .catch(() => window.prompt('Copiá este enlace y abrilo en Safari:', url));
  } else {
    window.prompt('Copiá este enlace y abrilo en Safari:', url);
  }
}

function abrirInstalacion() {
  if (appInstalada()) {
    mostrarPanel({
      titulo: 'Ya la estás usando como app',
      sub: 'Esta ventana ya se abrió desde el ícono instalado, no hace falta instalar nada más.',
      nota: 'Tu avance se guarda en este dispositivo y la app sigue funcionando sin internet.'
    });
    return;
  }

  if (promptInstalacion) {
    const ev = promptInstalacion;
    promptInstalacion = null;
    ev.prompt();
    ev.userChoice.then(r => {
      if (r.outcome === 'accepted') ocultarBanner(true);
      else promptInstalacion = ev;
    }).catch(() => {});
    return;
  }

  if (ES_SAFARI_IOS) {
    mostrarPanel({
      titulo: 'Instalala en tu iPhone',
      sub: 'Toma unos segundos. Queda con ícono propio en la pantalla de inicio, se abre a pantalla completa (sin la barra de Safari) y funciona sin internet.',
      pasos: [
        'Tocá el botón <b>Compartir</b> <span class="ios-ic">↑</span> de Safari, abajo en el centro de la pantalla.',
        'Deslizá la lista hacia abajo y elegí <b>Agregar a inicio</b> (<i>Add to Home Screen</i>).',
        'Tocá <b>Agregar</b> arriba a la derecha. El ícono de la inducción queda en tu pantalla de inicio.'
      ],
      nota: 'Después abrila siempre desde ese ícono: ahí se ve como una app y tu avance queda guardado.'
    });
    return;
  }

  if (ES_IOS) {
    mostrarPanel({
      titulo: 'En iPhone se instala desde Safari',
      sub: 'iOS solo permite instalar apps web desde Safari. Los demás navegadores del iPhone (Chrome, Edge, Firefox) apenas crean un acceso directo que se sigue abriendo dentro del navegador.',
      pasos: [
        'Copiá el enlace de esta página con el botón de abajo.',
        'Abrí <b>Safari</b> y pegá el enlace.',
        'Tocá <b>Compartir</b> <span class="ios-ic">↑</span> → <b>Agregar a inicio</b> → <b>Agregar</b>.'
      ],
      acciones: [{ txt: 'Copiar enlace', clase: 'btn sm dark', fn: copiarEnlace }]
    });
    return;
  }

  mostrarPanel({
    titulo: 'Instalar la app',
    sub: 'Tu navegador puede instalar esta inducción desde su propio menú.',
    pasos: [
      'Abrí el menú del navegador (los <b>⋮</b> arriba a la derecha).',
      'Elegí <b>Instalar app</b> o <b>Agregar a la pantalla principal</b>.',
      'Confirmá con <b>Instalar</b>.'
    ],
    nota: 'Si no aparece la opción: la página tiene que estar abierta desde su dirección https (por ejemplo la de GitHub Pages) y no como archivo local. Firefox de escritorio no instala apps web.'
  });
}

function ocultarBanner(recordar) {
  $('#instBanner').classList.remove('show');
  document.body.classList.remove('con-banner');
  if (recordar) { try { localStorage.setItem(CLAVE_INST, '1'); } catch (e) {} }
}

function mostrarBanner(textoBoton, subtexto) {
  let oculto = false;
  try { oculto = localStorage.getItem(CLAVE_INST) === '1'; } catch (e) {}
  if (oculto || appInstalada()) return;
  $('#instBannerBtn').textContent = textoBoton;
  if (subtexto) $('#instBannerSub').textContent = subtexto;
  $('#instBanner').classList.add('show');
  document.body.classList.add('con-banner');
}

function iniciarInstalacion() {
  $('#instBannerBtn').onclick = () => abrirInstalacion();
  $('#instBannerX').onclick = () => ocultarBanner(true);
  $('#instSheet').querySelector('[data-cerrar-inst]').onclick = () => cerrarInstalacion();
  document.addEventListener('keydown', e => { if (e.key === 'Escape') cerrarInstalacion(); });

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    promptInstalacion = e;
    mostrarBanner('Instalar', 'Ícono propio y uso sin internet.');
  });
  window.addEventListener('appinstalled', () => { promptInstalacion = null; ocultarBanner(true); });

  if (ES_IOS && !appInstalada()) {
    mostrarBanner(ES_SAFARI_IOS ? 'Instalar' : 'Cómo', 'Queda en tu pantalla de inicio.');
  }
}

/* ---------------------------------------------------------------- */
/* Arranque (se ejecuta con todos los archivos ya cargados)          */
/* ---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  aplicarEstandares();          // el supervisor puede haber cambiado las metas
  actualizarPestanaSupervisor();

  $$('.nav button').forEach(b => b.onclick = () => ir(b.dataset.ir));
  $('#btnVolver').onclick = () => ir(vistaActual === 'examen' ? 'tablero' : 'entrenar');
  $('#accesoSupervisor').onclick = () => ir('admin');

  ir('inicio');

  // Si quedó algo sin sincronizar de la sesión anterior, se reintenta.
  if (nubeActiva() && E.nombre && !(E.sync && E.sync.ok)) sincronizar(true);
  if (modoSupervisor()) refrescarNube(false);
  iniciarInstalacion();

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
});

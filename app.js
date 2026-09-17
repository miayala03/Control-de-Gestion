/* ============================================================================
   LÓGICA DE LA APP — Plataforma interactiva de inducción
   Encargado de Stock de Cocina · McDonald's  ·  Control de Gestión

   Este archivo hace funcionar la app. Los textos se editan en "contenido.js".
============================================================================ */

/* ---------------------------------------------------------------- */
/* Estado guardado en el propio celular (no se pierde al cerrar)     */
/* ---------------------------------------------------------------- */
const CLAVE = 'induccion-stock-v1';

const estadoInicial = () => ({
  inicio: new Date().toISOString().slice(0, 10),
  modulos: {},          // m1: { leido:true, nota:100, rendida:true }
  checklist: [],
  recepcion: null,      // { aciertos, total }
  peps: null,           // { correcto:true/false }
  final: null           // { aciertos, total, nota }
});

let E = cargar();

function cargar() {
  try {
    const raw = localStorage.getItem(CLAVE);
    if (!raw) return estadoInicial();
    return Object.assign(estadoInicial(), JSON.parse(raw));
  } catch (e) { return estadoInicial(); }
}
function guardar() {
  try { localStorage.setItem(CLAVE, JSON.stringify(E)); } catch (e) {}
}
function mod(id) {
  if (!E.modulos[id]) E.modulos[id] = { leido: false, nota: null, rendida: false };
  return E.modulos[id];
}

/* ---------------------------------------------------------------- */
/* Utilidades                                                        */
/* ---------------------------------------------------------------- */
const $ = s => document.querySelector(s);
const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function diaActual() {
  const d0 = new Date(E.inicio + 'T00:00:00');
  const hoy = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00');
  return Math.floor((hoy - d0) / 86400000) + 1;   // día 1 = primer día
}
function limiteModulo(i) {
  const n = CONTENIDO.modulos.length;
  return Math.max(1, Math.round(CONTENIDO.metas.diasPlan * (i + 1) / n));
}
function moduloCompleto(m) {
  const s = mod(m.id);
  return !!(s.leido && s.nota !== null && s.nota >= CONTENIDO.metas.notaMinima);
}

function metricas() {
  const mods = CONTENIDO.modulos;
  const meta = CONTENIDO.metas;
  const completos = mods.filter(moduloCompleto).length;
  const avance = Math.round(completos / mods.length * 100);

  const rendidas = mods.filter(m => mod(m.id).rendida);
  const notas = rendidas.map(m => mod(m.id).nota);
  const promedio = notas.length ? Math.round(notas.reduce((a, b) => a + b, 0) / notas.length) : null;
  const aprobadas = notas.filter(n => n >= meta.notaMinima).length;

  const dia = diaActual();
  let previstas = 0, enFecha = 0;
  mods.forEach((m, i) => {
    if (dia >= limiteModulo(i)) {
      previstas++;
      if (moduloCompleto(m)) enFecha++;
    }
  });
  const cumplimiento = previstas === 0 ? 100 : Math.round(enFecha / previstas * 100);
  const atrasadas = previstas - enFecha;

  const notaFinal = E.final ? E.final.nota : null;
  const habilitado = completos === mods.length && notaFinal !== null && notaFinal >= meta.notaMinima;

  return { completos, total: mods.length, avance, promedio, aprobadas, rendidas: notas.length,
           dia, previstas, enFecha, cumplimiento, atrasadas, notaFinal, habilitado };
}

/* ---------------------------------------------------------------- */
/* Navegación                                                        */
/* ---------------------------------------------------------------- */
let vistaActual = 'inicio';

function ir(vista, param) {
  vistaActual = vista;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  $('#v-' + vista).classList.add('active');
  document.querySelectorAll('.nav button').forEach(b =>
    b.classList.toggle('on', b.dataset.ir === vista || (vista === 'modulo' && b.dataset.ir === 'modulos')));
  $('#btnBack').classList.toggle('show', vista === 'modulo');

  if (vista === 'inicio')   { $('#tbTitulo').textContent = CONTENIDO.proyecto.titulo; $('#tbSub').textContent = CONTENIDO.proyecto.empresa + " · " + CONTENIDO.proyecto.area; renderInicio(); }
  if (vista === 'modulos')  { $('#tbTitulo').textContent = 'Módulos de inducción'; $('#tbSub').textContent = 'Contenido obligatorio'; renderModulos(); }
  if (vista === 'modulo')   { renderModulo(param); }
  if (vista === 'practica') { $('#tbTitulo').textContent = 'Practicá'; $('#tbSub').textContent = 'Actividades y evaluación'; renderPractica(); }
  if (vista === 'avance')   { $('#tbTitulo').textContent = 'Avance y seguimiento'; $('#tbSub').textContent = 'Control de gestión'; renderAvance(); }

  window.scrollTo({ top: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
}

document.querySelectorAll('.nav button').forEach(b =>
  b.addEventListener('click', () => ir(b.dataset.ir)));
$('#btnBack').addEventListener('click', () => ir('modulos'));

/* ---------------------------------------------------------------- */
/* VISTA: INICIO                                                     */
/* ---------------------------------------------------------------- */
function renderInicio() {
  const p = CONTENIDO.proyecto, m = metricas();
  const riesgos = [
    ["Recibe conforme sin cotejar", "Faltantes que se pagan igual"],
    ["Rompe la cadena de frío", "Riesgo sanitario y descarte"],
    ["No aplica PEPS", "Vencimientos y merma alta"],
    ["No registra mermas ni salidas", "Inventario sin confiabilidad"],
    ["Ignora el stock mínimo", "Quiebre en pleno servicio"]
  ];

  $('#v-inicio').innerHTML = `
    <div class="hero">
      <div class="kicker">Inducción · Personal nuevo</div>
      <h1 style="margin-top:10px">Bienvenido. Este es tu puesto: <em>${esc(p.puesto)}</em>.</h1>
      <p class="sub">${esc(p.objetivo)} Recorré los módulos, practicá y rendí las evaluaciones. Tu avance queda guardado en este celular.</p>
      <div class="chips">
        <div class="chip">Empresa: <b>${esc(p.empresa)}</b></div>
        <div class="chip">Área: <b>${esc(p.area)}</b></div>
        <div class="chip">Día <b>${m.dia}</b> de ${CONTENIDO.metas.diasPlan}</div>
      </div>
    </div>

    <div class="big-progress">
      <div class="bp-head"><span>Avance de la inducción</span><b>${m.avance}%</b></div>
      <div class="track"><div class="fill" style="width:${m.avance}%"></div></div>
      <div class="bp-foot">${m.completos} de ${m.total} módulos completados · meta: 100 % en ${CONTENIDO.metas.diasPlan} días</div>
    </div>

    <button class="cta" id="ctaSeguir">
      <span class="ic">▶</span>
      <span><strong>${m.completos === 0 ? 'Empezar la inducción' : (m.completos === m.total ? 'Repasar los módulos' : 'Seguir donde quedaste')}</strong>
      <small>${m.completos === m.total ? 'Todos los módulos completados' : 'Módulo ' + (proximoModulo().numero) + ': ' + proximoModulo().titulo}</small></span>
      <span class="arrow">›</span>
    </button>

    <div class="refs">
      ${CONTENIDO.referencias.map(r => `
        <div class="ref"><small>${esc(r.rotulo)}</small><strong>${esc(r.valor)}</strong><span>${esc(r.nota)}</span></div>`).join('')}
    </div>

    <div class="sec">
      <div class="sec-head">
        <div class="kicker">Por qué esta inducción</div>
        <h2>Lo que se evita si aprendés bien tu proceso</h2>
      </div>
      <div class="riesgos">
        ${riesgos.map(r => `
          <div class="riesgo"><span class="x">✕</span><p><b>${esc(r[0])}</b><span>→ ${esc(r[1])}</span></p></div>`).join('')}
      </div>
    </div>

    <div class="sec">
      <div class="sec-head">
        <div class="kicker">Datos del proyecto</div>
        <h2>Ficha</h2>
      </div>
      <div class="card">
        <table class="tabla">
          <tr><td>Materia</td><td><b>${esc(p.materia)}</b></td></tr>
          <tr><td>Carrera</td><td><b>${esc(p.carrera)}</b></td></tr>
          <tr><td>Docente</td><td><b>${esc(p.docente)}</b></td></tr>
          <tr><td>Integrantes</td><td><b>${p.integrantes.map(esc).join('<br>')}</b></td></tr>
        </table>
      </div>
    </div>`;

  $('#ctaSeguir').addEventListener('click', () => ir('modulo', proximoModulo().id));
  $('#avisoLegal').textContent = p.aviso;
}

function proximoModulo() {
  return CONTENIDO.modulos.find(m => !moduloCompleto(m)) || CONTENIDO.modulos[0];
}

/* ---------------------------------------------------------------- */
/* VISTA: LISTA DE MÓDULOS                                           */
/* ---------------------------------------------------------------- */
function renderModulos() {
  const m = metricas();
  $('#v-modulos').innerHTML = `
    <div class="kicker">Contenido</div>
    <h2 style="margin-top:8px">Los 6 módulos de tu inducción</h2>
    <p class="sub">Cada módulo termina con una evaluación de 3 preguntas. Se aprueba con ${CONTENIDO.metas.notaMinima} % o más.</p>

    <div class="big-progress">
      <div class="bp-head"><span>Módulos completados</span><b>${m.completos}/${m.total}</b></div>
      <div class="track"><div class="fill" style="width:${m.avance}%"></div></div>
      <div class="bp-foot">Completar = leer el módulo y aprobar su evaluación</div>
    </div>

    <div style="margin-top:18px">
      ${CONTENIDO.modulos.map((mo, i) => {
        const s = mod(mo.id), ok = moduloCompleto(mo);
        let badge = '<span class="badge idle">Pendiente</span>';
        if (ok) badge = '<span class="badge bien">Completo</span>';
        else if (s.rendida) badge = '<span class="badge mal">A reforzar</span>';
        else if (s.leido) badge = '<span class="badge medio">Sin evaluar</span>';
        const nota = s.nota !== null ? `<span class="badge ${s.nota >= CONTENIDO.metas.notaMinima ? 'bien' : 'mal'}">${s.nota}%</span>` : '';
        return `
        <button class="mod ${ok ? 'done' : ''}" data-mod="${mo.id}">
          <span class="mic">${ok ? '✓' : mo.icono}</span>
          <span class="mtx">
            <span class="n">Módulo ${mo.numero} · ${esc(mo.tipo)} · día ${limiteModulo(i)}</span>
            <strong>${esc(mo.titulo)}</strong>
            <small>${esc(mo.resumen)}</small>
          </span>
          <span class="mst">${badge}${nota}</span>
        </button>`;
      }).join('')}
    </div>

    <div class="sec">
      <div class="card">
        <h3>Evaluación final</h3>
        <p class="sub">${CONTENIDO.evaluacionFinal.length} situaciones reales de cocina. ${E.final ? 'Último resultado: <b>' + E.final.nota + ' %</b>.' : 'Todavía no la rendiste.'}</p>
        <div class="btn-row"><button class="btn dark" id="irFinal">Ir a la evaluación final</button></div>
      </div>
    </div>`;

  document.querySelectorAll('[data-mod]').forEach(b =>
    b.addEventListener('click', () => ir('modulo', b.dataset.mod)));
  $('#irFinal').addEventListener('click', () => { ir('practica'); setTimeout(() => { const el = $('#bloqueFinal'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 120); });
}

/* ---------------------------------------------------------------- */
/* VISTA: DETALLE DE MÓDULO                                          */
/* ---------------------------------------------------------------- */
let moduloAbierto = null;

function renderModulo(id) {
  const mo = CONTENIDO.modulos.find(x => x.id === id) || CONTENIDO.modulos[0];
  moduloAbierto = mo;
  const s = mod(mo.id);
  $('#tbTitulo').textContent = 'Módulo ' + mo.numero;
  $('#tbSub').textContent = mo.titulo;

  const actividades = {
    recepcion: ['Simulación de recepción', 'Decidí si recibís o reclamás cada entrega'],
    peps: ['Ejercicio de PEPS', 'Ordená los productos según vencimiento'],
    checklist: ['Checklist diario', 'Rutina de apertura y cierre'],
    kpi: ['Calculadoras de KPI', 'Cargá datos y mirá el semáforo']
  };
  const act = actividades[mo.actividad];

  $('#v-modulo').innerHTML = `
    <div class="kicker">Módulo ${mo.numero} · ${esc(mo.tipo)}</div>
    <h2 style="margin-top:8px">${mo.icono} ${esc(mo.titulo)}</h2>
    <p class="sub">${esc(mo.resumen)}</p>

    <div style="margin-top:20px">
      ${mo.lecciones.map((l, i) => `
        <details class="lec" ${i === 0 ? 'open' : ''}>
          <summary><span class="num">${i + 1}</span><span class="lt">${esc(l.titulo)}</span><span class="chev">▶</span></summary>
          <div class="body">
            <p>${esc(l.texto)}</p>
            ${l.puntos ? `<ul>${l.puntos.map(p => `<li>${esc(p)}</li>`).join('')}</ul>` : ''}
            ${(l.control || l.registro || l.indicador) ? `<div class="pills">
              ${l.control ? `<div class="pill ctrl"><b>Punto de control</b>${esc(l.control)}</div>` : ''}
              ${l.registro ? `<div class="pill"><b>Registro</b>${esc(l.registro)}</div>` : ''}
              ${l.indicador ? `<div class="pill kpi"><b>Indicador</b>${esc(l.indicador)}</div>` : ''}
            </div>` : ''}
          </div>
        </details>`).join('')}
    </div>

    ${act ? `
    <div class="sec">
      <div class="card">
        <div class="kicker">Práctica del módulo</div>
        <h3 style="margin-top:6px">${esc(act[0])}</h3>
        <p class="sub">${esc(act[1])}</p>
        <div class="btn-row"><button class="btn ghost" id="irPractica">Abrir la práctica</button></div>
      </div>
    </div>` : ''}

    <div class="sec">
      <div class="sec-head">
        <div class="kicker">Evaluación del módulo</div>
        <h2>Ponete a prueba</h2>
        <p class="sub">${mo.evaluacion.length} preguntas. Se aprueba con ${CONTENIDO.metas.notaMinima} % o más.
        ${s.nota !== null ? 'Último resultado: <b>' + s.nota + ' %</b>.' : ''}</p>
      </div>
      <div id="evalBox"></div>
      <div id="evalScore"></div>
    </div>

    <div class="sec">
      <button class="btn" id="btnCompletar">${s.leido ? '✓ Módulo marcado como leído' : 'Marcar este módulo como leído'}</button>
      <div class="btn-row">
        ${siguienteId(mo) ? `<button class="btn ghost" id="btnSiguiente">Ir al módulo ${siguienteNumero(mo)} ›</button>` : ''}
      </div>
    </div>`;

  if (act) $('#irPractica').addEventListener('click', () => { ir('practica'); setTimeout(() => { const el = $('#bloque-' + mo.actividad); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 120); });

  renderQuiz($('#evalBox'), $('#evalScore'), mo.evaluacion, res => {
    const st = mod(mo.id);
    st.rendida = true;
    st.nota = Math.round(res.aciertos / res.total * 100);
    guardar();
  }, 'Evaluación del módulo ' + mo.numero);

  const btn = $('#btnCompletar');
  btn.addEventListener('click', () => {
    const st = mod(mo.id);
    st.leido = !st.leido;
    guardar();
    btn.textContent = st.leido ? '✓ Módulo marcado como leído' : 'Marcar este módulo como leído';
  });

  const sig = $('#btnSiguiente');
  if (sig) sig.addEventListener('click', () => ir('modulo', siguienteId(mo)));
}
function siguienteId(mo) {
  const i = CONTENIDO.modulos.findIndex(x => x.id === mo.id);
  return CONTENIDO.modulos[i + 1] ? CONTENIDO.modulos[i + 1].id : null;
}
function siguienteNumero(mo) {
  const i = CONTENIDO.modulos.findIndex(x => x.id === mo.id);
  return CONTENIDO.modulos[i + 1] ? CONTENIDO.modulos[i + 1].numero : '';
}

/* ---------------------------------------------------------------- */
/* Componente reutilizable: quiz                                     */
/* ---------------------------------------------------------------- */
function renderQuiz(cont, contScore, preguntas, alTerminar, titulo) {
  let respondidas = 0, aciertos = 0;
  cont.innerHTML = preguntas.map((q, qi) => `
    <div class="q">
      <div class="qn">PREGUNTA ${qi + 1} DE ${preguntas.length}</div>
      <h3>${esc(q.pregunta)}</h3>
      ${q.opciones.map((o, oi) => `<button class="opt" data-q="${qi}" data-o="${oi}">${esc(o)}</button>`).join('')}
      <div class="fb" data-fb="${qi}"></div>
    </div>`).join('');
  contScore.innerHTML = '';

  cont.onclick = e => {
    const b = e.target.closest('.opt');
    if (!b || b.disabled) return;
    const qi = +b.dataset.q, oi = +b.dataset.o, q = preguntas[qi];
    cont.querySelectorAll(`.opt[data-q="${qi}"]`).forEach(x => {
      x.disabled = true;
      if (+x.dataset.o === q.correcta) x.classList.add('correct');
    });
    const fb = cont.querySelector(`[data-fb="${qi}"]`);
    if (oi === q.correcta) { aciertos++; fb.className = 'fb show ok'; fb.textContent = '✓ ' + q.bien; }
    else { b.classList.add('wrong'); fb.className = 'fb show no'; fb.textContent = '✗ ' + q.mal; }
    respondidas++;

    if (respondidas === preguntas.length) {
      const nota = Math.round(aciertos / preguntas.length * 100);
      const aprobado = nota >= CONTENIDO.metas.notaMinima;
      contScore.innerHTML = `
        <div class="score">
          <small>${esc(titulo)}</small>
          <div class="big">${nota}%</div>
          <p>${aciertos} de ${preguntas.length} correctas · ${aprobado
            ? 'Aprobado: estás dentro del estándar.'
            : 'Desvío: el estándar es ' + CONTENIDO.metas.notaMinima + ' %. Corresponde repasar y volver a rendir.'}</p>
          <div class="btn-row" style="justify-content:center"><button class="btn ghost" style="background:#fff;border-color:#fff" id="reintentar">Volver a rendir</button></div>
        </div>`;
      contScore.querySelector('#reintentar').addEventListener('click', () => {
        renderQuiz(cont, contScore, preguntas, alTerminar, titulo);
        cont.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
      contScore.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (alTerminar) alTerminar({ aciertos, total: preguntas.length, nota });
    }
  };
}

/* ---------------------------------------------------------------- */
/* VISTA: PRÁCTICA                                                   */
/* ---------------------------------------------------------------- */
function renderPractica() {
  $('#v-practica').innerHTML = `
    <div class="kicker">Actividades</div>
    <h2 style="margin-top:8px">Practicá antes de operar solo</h2>
    <p class="sub">Cinco actividades para entrenar tu criterio. Podés repetirlas todas las veces que quieras.</p>

    <div class="sec" id="bloque-recepcion">
      <div class="sec-head">
        <div class="kicker">Práctica 1 · Recepción</div>
        <h2>Llegó el pedido. Decidí vos.</h2>
        <p class="sub">Revisá los datos de cada producto y decidí si lo recibís conforme o si lo reclamás. Se firma solo si <b>todo</b> coincide.</p>
      </div>
      <div id="simBox"></div>
      <div id="simScore"></div>
    </div>

    <div class="sec" id="bloque-peps">
      <div class="sec-head">
        <div class="kicker">Práctica 2 · PEPS</div>
        <h2>¿En qué orden los usás?</h2>
        <p class="sub">Tocá los productos en el orden en que los sacarías para usar: del que vence primero al último.</p>
      </div>
      <div id="pepsBox"></div>
      <div class="btn-row">
        <button class="btn sm" id="pepsCheck">Verificar orden</button>
        <button class="btn sm ghost" id="pepsReset">Reiniciar</button>
      </div>
      <div class="fb" id="pepsFb"></div>
    </div>

    <div class="sec" id="bloque-checklist">
      <div class="sec-head">
        <div class="kicker">Práctica 3 · Rutina</div>
        <h2>Checklist de apertura y cierre</h2>
        <p class="sub">Marcá cada tarea a medida que la hacés. Es la forma más simple de que ningún control se escape.</p>
      </div>
      <div class="big-progress" style="margin-top:0">
        <div class="bp-head"><span>Progreso del día</span><b id="clPct">0%</b></div>
        <div class="track"><div class="fill" id="clFill"></div></div>
      </div>
      <div id="clBox" style="margin-top:12px"></div>
      <div class="btn-row"><button class="btn sm ghost" id="clReset">Empezar un día nuevo</button></div>
    </div>

    <div class="sec" id="bloque-kpi">
      <div class="sec-head">
        <div class="kicker">Práctica 4 · Indicadores</div>
        <h2>Calculadoras de KPI</h2>
        <p class="sub">Cargá tus valores: cada calculadora te da el resultado y el semáforo (verde, amarillo o rojo).</p>
      </div>
      <div id="kpiBox"></div>
    </div>

    <div class="sec" id="bloqueFinal">
      <div class="sec-head">
        <div class="kicker">Práctica 5 · Evaluación final</div>
        <h2>Autoevaluación general</h2>
        <p class="sub">${CONTENIDO.evaluacionFinal.length} situaciones reales. Se aprueba con ${CONTENIDO.metas.notaMinima} % o más.
        ${E.final ? 'Último resultado: <b>' + E.final.nota + ' %</b>.' : ''}</p>
      </div>
      <div id="finalBox"></div>
      <div id="finalScore"></div>
    </div>`;

  renderRecepcion();
  renderPeps();
  renderChecklist();
  renderKpis();
  renderQuiz($('#finalBox'), $('#finalScore'), CONTENIDO.evaluacionFinal, res => {
    E.final = res; guardar();
  }, 'Evaluación final de inducción');
}

/* ---- práctica: recepción ---- */
function renderRecepcion() {
  const box = $('#simBox'), score = $('#simScore');
  let hechas = 0, aciertos = 0;
  box.innerHTML = CONTENIDO.recepcion.map((d, i) => `
    <div class="sim">
      <div class="sname"><span>${d.icono}</span>${esc(d.nombre)}</div>
      <div class="rows">
        ${d.datos.map(r => `<div class="row"><span>${esc(r[0])}</span><b>${esc(r[1])}</b></div>`).join('')}
      </div>
      <div class="acts">
        <button class="act" data-i="${i}" data-a="recibir">Recibir conforme</button>
        <button class="act" data-i="${i}" data-a="reclamar">Reclamar</button>
      </div>
      <div class="fb" data-sfb="${i}"></div>
    </div>`).join('');
  score.innerHTML = '';

  box.onclick = e => {
    const b = e.target.closest('.act');
    if (!b || b.disabled) return;
    const i = +b.dataset.i, a = b.dataset.a, d = CONTENIDO.recepcion[i];
    box.querySelectorAll(`.act[data-i="${i}"]`).forEach(x => x.disabled = true);
    const fb = box.querySelector(`[data-sfb="${i}"]`);
    const bien = a === d.correcta;
    b.classList.add('picked', bien ? 'ok' : 'no');
    fb.className = 'fb show ' + (bien ? 'ok' : 'no');
    fb.textContent = (bien ? '✓ ' : '✗ ') + (bien ? d.bien : d.mal);
    if (bien) aciertos++;
    hechas++;
    if (hechas === CONTENIDO.recepcion.length) {
      E.recepcion = { aciertos, total: hechas }; guardar();
      const pct = Math.round(aciertos / hechas * 100);
      score.innerHTML = `
        <div class="score">
          <small>Simulación de recepción</small>
          <div class="big">${aciertos}/${hechas}</div>
          <p>${pct === 100 ? '¡Perfecto! Controlás la recepción como corresponde.'
            : pct >= 60 ? 'Bien. Ya sabés dónde mirar: cantidad, temperatura y vencimiento.'
            : 'Repasá el paso de recepción: es el control más importante de tu puesto.'}</p>
          <div class="btn-row" style="justify-content:center"><button class="btn ghost" style="background:#fff;border-color:#fff" id="simReset">Volver a intentar</button></div>
        </div>`;
      score.querySelector('#simReset').addEventListener('click', () => { renderRecepcion(); $('#bloque-recepcion').scrollIntoView({ behavior: 'smooth' }); });
    }
  };
}

/* ---- práctica: PEPS ---- */
function renderPeps() {
  const box = $('#pepsBox'), fb = $('#pepsFb');
  let elegidos = [];
  const productos = CONTENIDO.peps;

  function pinta() {
    box.innerHTML = productos.map((p, i) => {
      const pos = elegidos.indexOf(i);
      return `<button class="peps-item ${pos >= 0 ? 'picked' : ''}" data-i="${i}">
        <span class="order">${pos >= 0 ? pos + 1 : '·'}</span>
        <span class="pn">${esc(p.nombre)}</span>
        <span class="pd">${esc(p.vence)}</span>
      </button>`;
    }).join('');
  }
  pinta();

  box.onclick = e => {
    const b = e.target.closest('.peps-item');
    if (!b) return;
    const i = +b.dataset.i;
    if (elegidos.includes(i) || elegidos.length >= productos.length) return;
    elegidos.push(i); pinta();
  };
  $('#pepsReset').onclick = () => { elegidos = []; pinta(); fb.className = 'fb'; };
  $('#pepsCheck').onclick = () => {
    if (elegidos.length < productos.length) {
      fb.className = 'fb show no'; fb.textContent = `Elegí los ${productos.length} productos primero.`; return;
    }
    let todoOk = true;
    box.querySelectorAll('.peps-item').forEach(el => {
      const i = +el.dataset.i, pos = elegidos.indexOf(i) + 1;
      const ok = pos === productos[i].orden;
      el.classList.add(ok ? 'good' : 'bad');
      if (!ok) todoOk = false;
    });
    fb.className = 'fb show ' + (todoOk ? 'ok' : 'no');
    fb.textContent = todoOk ? '✓ ¡Orden PEPS correcto! Primero lo que vence antes.'
                            : '✗ Revisá: se usa primero lo que vence antes.';
    E.peps = { correcto: todoOk }; guardar();
  };
}

/* ---- práctica: checklist ---- */
function renderChecklist() {
  const box = $('#clBox');
  if (!Array.isArray(E.checklist) || E.checklist.length !== CONTENIDO.checklist.length) {
    E.checklist = CONTENIDO.checklist.map(() => false);
  }
  box.innerHTML = CONTENIDO.checklist.map((t, i) => `
    <label class="check">
      <input type="checkbox" data-i="${i}" ${E.checklist[i] ? 'checked' : ''}>
      <span class="box"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>
      <span class="ct"><strong>${esc(t[0])}</strong><small>${esc(t[1])}</small></span>
    </label>`).join('');

  function actualiza() {
    const hechas = E.checklist.filter(Boolean).length;
    const pct = Math.round(hechas / E.checklist.length * 100);
    $('#clFill').style.width = pct + '%';
    $('#clPct').textContent = pct + '%';
  }
  box.onchange = e => {
    const i = +e.target.dataset.i;
    E.checklist[i] = e.target.checked;
    guardar(); actualiza();
  };
  $('#clReset').onclick = () => {
    E.checklist = CONTENIDO.checklist.map(() => false);
    guardar(); renderChecklist();
  };
  actualiza();
}

/* ---- práctica: calculadoras de KPI ---- */
function renderKpis() {
  const box = $('#kpiBox');
  box.innerHTML = CONTENIDO.kpis.map((k, ki) => `
    <div class="calc">
      <div class="et">${esc(k.etiqueta)}</div>
      <h3>${esc(k.titulo)}</h3>
      <div class="hint">${esc(k.ayuda)}</div>
      <div class="formula">${esc(k.formula)}</div>
      <div class="inputs">
        ${k.campos.map(c => `<label>${esc(c.rotulo)}
          <input type="number" min="0" step="any" inputmode="decimal" data-ki="${ki}" data-c="${c.clave}" placeholder="0">
        </label>`).join('')}
      </div>
      <div class="out">
        <span class="val" data-val="${ki}">—</span>
        <span class="badge idle" data-sem="${ki}">Cargá los valores</span>
      </div>
    </div>`).join('');

  box.oninput = e => {
    const ki = +e.target.dataset.ki, k = CONTENIDO.kpis[ki];
    const v = {};
    box.querySelectorAll(`input[data-ki="${ki}"]`).forEach(inp => {
      v[inp.dataset.c] = inp.value === '' ? NaN : parseFloat(inp.value);
    });
    const valEl = box.querySelector(`[data-val="${ki}"]`), semEl = box.querySelector(`[data-sem="${ki}"]`);
    if (Object.values(v).some(x => isNaN(x))) {
      valEl.textContent = '—'; semEl.className = 'badge idle'; semEl.textContent = 'Cargá los valores'; return;
    }
    const r = k.calcular(v);
    if (r === null || !isFinite(r)) {
      valEl.textContent = '—'; semEl.className = 'badge idle'; semEl.textContent = 'Revisá los datos'; return;
    }
    valEl.textContent = k.formato(r);
    const [txt, cls] = k.semaforo(r);
    semEl.className = 'badge ' + cls; semEl.textContent = txt;
  };
}

/* ---------------------------------------------------------------- */
/* VISTA: AVANCE (dashboard del supervisor)                          */
/* ---------------------------------------------------------------- */
function renderAvance() {
  const m = metricas(), meta = CONTENIDO.metas;
  const sem = (ok, medio) => ok ? 'bien' : (medio ? 'medio' : 'mal');

  const alertas = [];
  CONTENIDO.modulos.forEach((mo, i) => {
    const s = mod(mo.id);
    if (m.dia > limiteModulo(i) && !moduloCompleto(mo))
      alertas.push(`Módulo ${mo.numero} (${mo.titulo}) atrasado: su fecha límite era el día ${limiteModulo(i)} y hoy es el día ${m.dia}.`);
    if (s.rendida && s.nota < meta.notaMinima)
      alertas.push(`Módulo ${mo.numero}: nota ${s.nota} % contra un estándar de ${meta.notaMinima} % → desvío de ${s.nota - meta.notaMinima} puntos. Acción: refuerzo + nueva evaluación.`);
  });
  if (m.notaFinal !== null && m.notaFinal < meta.notaMinima)
    alertas.push(`Evaluación final: ${m.notaFinal} % contra ${meta.notaMinima} % → desvío de ${m.notaFinal - meta.notaMinima} puntos.`);
  if (m.cumplimiento < meta.cumplimientoMinimo)
    alertas.push(`Cumplimiento del cronograma ${m.cumplimiento} % contra una meta de ${meta.cumplimientoMinimo} %.`);

  $('#v-avance').innerHTML = `
    <div class="kicker">Seguimiento</div>
    <h2 style="margin-top:8px">Control de gestión de la inducción</h2>
    <p class="sub">Estándar → medición → desvío → acción correctiva. Día <b>${m.dia}</b> de ${meta.diasPlan} del plan.</p>

    <div class="kpi-cards" style="margin-top:18px">
      <div class="kc">
        <small>Avance de inducción</small>
        <div class="v" style="color:var(--red)">${m.avance}%</div>
        <div class="m">Meta: 100 % en ${meta.diasPlan} días</div>
      </div>
      <div class="kc">
        <small>Promedio de evaluaciones</small>
        <div class="v">${m.promedio === null ? '—' : m.promedio + '%'}</div>
        <div class="m">Meta: ≥ ${meta.notaMinima} %</div>
      </div>
      <div class="kc">
        <small>Cumplimiento cronograma</small>
        <div class="v">${m.cumplimiento}%</div>
        <div class="m">Meta: ≥ ${meta.cumplimientoMinimo} %</div>
      </div>
      <div class="kc">
        <small>Actividades atrasadas</small>
        <div class="v" style="color:${m.atrasadas > meta.atrasadasMaximo ? 'var(--warn)' : 'var(--go)'}">${m.atrasadas}</div>
        <div class="m">Meta: ${meta.atrasadasMaximo}</div>
      </div>
    </div>

    <div class="estado ${m.habilitado ? 'hab' : 'ref'}">
      <small>Estado final</small>
      <strong>${m.habilitado ? 'Habilitado' : 'En proceso / refuerzo'}</strong>
      <p>${m.habilitado
        ? 'Completó los 6 módulos y aprobó la evaluación final. Puede operar con seguimiento normal.'
        : 'La inducción se cierra solo cuando todos los indicadores están dentro del estándar.'}</p>
    </div>

    <div class="sec">
      <div class="sec-head">
        <div class="kicker">Detalle por módulo</div>
        <h2>Evaluaciones y cronograma</h2>
      </div>
      <div class="card">
        <table class="tabla">
          <tr><th>Módulo</th><th>Día límite</th><th>Nota</th></tr>
          ${CONTENIDO.modulos.map((mo, i) => {
            const s = mod(mo.id);
            const cls = s.nota === null ? 'idle' : (s.nota >= meta.notaMinima ? 'bien' : 'mal');
            return `<tr>
              <td>${mo.numero}. ${esc(mo.titulo)}${moduloCompleto(mo) ? ' ✓' : ''}</td>
              <td>Día ${limiteModulo(i)}</td>
              <td><span class="badge ${cls}">${s.nota === null ? 'Sin rendir' : s.nota + '%'}</span></td>
            </tr>`;
          }).join('')}
          <tr>
            <td><b>Evaluación final</b></td><td>Día ${meta.diasPlan}</td>
            <td><span class="badge ${m.notaFinal === null ? 'idle' : (m.notaFinal >= meta.notaMinima ? 'bien' : 'mal')}">${m.notaFinal === null ? 'Sin rendir' : m.notaFinal + '%'}</span></td>
          </tr>
        </table>
      </div>
    </div>

    <div class="sec">
      <div class="sec-head">
        <div class="kicker">Prácticas</div>
        <h2>Actividades realizadas</h2>
      </div>
      <div class="card">
        <table class="tabla">
          <tr>
            <td>Simulación de recepción</td>
            <td><span class="badge ${!E.recepcion ? 'idle' : sem(E.recepcion.aciertos === E.recepcion.total, E.recepcion.aciertos >= E.recepcion.total * 0.6)}">${E.recepcion ? E.recepcion.aciertos + '/' + E.recepcion.total : 'Sin hacer'}</span></td>
          </tr>
          <tr>
            <td>Ejercicio de PEPS</td>
            <td><span class="badge ${!E.peps ? 'idle' : (E.peps.correcto ? 'bien' : 'mal')}">${!E.peps ? 'Sin hacer' : (E.peps.correcto ? 'Correcto' : 'A repasar')}</span></td>
          </tr>
          <tr>
            <td>Checklist diario</td>
            <td><span class="badge ${(E.checklist || []).every(Boolean) && (E.checklist || []).length ? 'bien' : 'medio'}">${(E.checklist || []).filter(Boolean).length}/${(E.checklist || []).length || CONTENIDO.checklist.length}</span></td>
          </tr>
        </table>
      </div>
    </div>

    ${alertas.length ? `
    <div class="sec">
      <div class="sec-head">
        <div class="kicker">Alertas por desvío</div>
        <h2>Acciones correctivas pendientes</h2>
      </div>
      ${alertas.map(a => `<div class="alerta"><span class="i">!</span><span>${esc(a)}</span></div>`).join('')}
    </div>` : `
    <div class="sec"><div class="card"><h3>Sin desvíos</h3><p class="sub">Todos los indicadores están dentro del estándar. No hay acciones correctivas pendientes.</p></div></div>`}

    <div class="sec">
      <div class="card">
        <h3>Datos de este dispositivo</h3>
        <p class="sub">El avance se guarda solo en este celular. Fecha de inicio registrada: <b>${esc(E.inicio)}</b>.</p>
        <div class="btn-row">
          <button class="btn sm dark" id="instalarApp">Instalar como app</button>
          <button class="btn sm ghost" id="reiniciarPlan">Reiniciar la fecha de inicio</button>
          <button class="btn sm ghost" id="borrarTodo">Borrar todo mi avance</button>
        </div>
      </div>
    </div>`;

  $('#instalarApp').onclick = () => abrirInstalacion();

  $('#reiniciarPlan').onclick = () => {
    if (confirm('¿Empezar el plan de inducción desde hoy? Se mantiene tu avance.')) {
      E.inicio = new Date().toISOString().slice(0, 10); guardar(); renderAvance();
    }
  };
  $('#borrarTodo').onclick = () => {
    if (confirm('¿Borrar todo el avance (módulos, notas y prácticas)? No se puede deshacer.')) {
      E = estadoInicial(); guardar(); ir('inicio');
    }
  };
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
      pasos: [],
      nota: 'Tu avance se guarda en este dispositivo y la app sigue funcionando sin internet.'
    });
    return;
  }

  // Android / Chrome de escritorio: instalación en un toque.
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

  // Android sin el evento disponible todavía, o navegador de escritorio.
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
/* Arranque                                                          */
/* ---------------------------------------------------------------- */
ir('inicio');
iniciarInstalacion();

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

/* ============================================================================
   NUBE — sincronización con Firebase Firestore.

   Habla con Firestore por su API REST, sin cargar el SDK: así la app sigue
   siendo liviana, funciona sin internet y no depende de un CDN externo.

   Si no hay configuración cargada, la app funciona igual en MODO LOCAL:
   cada persona genera un código de avance y el supervisor lo pega a mano.
   Al pegar la configuración, la sincronización se enciende sola.
============================================================================ */

const CLAVE_NUBE = 'induccion-nube-config';
const CLAVE_ID = 'induccion-mi-id';

/* La configuración puede venir de contenido.js (para todo el equipo) o de
   este dispositivo (para probar antes de subirla al repositorio). */
function configNube() {
  const delRepo = CONTENIDO.firebase || {};
  let local = {};
  try { local = JSON.parse(localStorage.getItem(CLAVE_NUBE) || '{}'); } catch (e) {}
  const c = Object.assign({}, delRepo, local);
  return (c.apiKey && c.projectId) ? c : null;
}

function nubeActiva() { return !!configNube(); }

function guardarConfigLocal(obj) {
  try { localStorage.setItem(CLAVE_NUBE, JSON.stringify(obj)); } catch (e) {}
}
function borrarConfigLocal() {
  try { localStorage.removeItem(CLAVE_NUBE); } catch (e) {}
}

function urlFirestore(camino, c) {
  return `https://firestore.googleapis.com/v1/projects/${c.projectId}` +
         `/databases/(default)/documents/${camino}?key=${c.apiKey}`;
}

/* Firestore guarda cada campo con su tipo. Para no pelear con eso, mandamos
   el detalle completo como un solo texto JSON y dejamos sueltos únicamente
   los campos que el panel necesita listar. */
function aCampos(p) {
  return {
    fields: {
      nombre:      { stringValue: String(p.nombre || '') },
      equipo:      { stringValue: String(p.equipo || '') },
      avance:      { integerValue: String(Math.round(p.avance || 0)) },
      certificado: { booleanValue: !!p.certificado },
      actualizado: { stringValue: p.actualizado || new Date().toISOString() },
      datos:       { stringValue: JSON.stringify(p.datos || {}) }
    }
  };
}

function desdeCampos(doc) {
  const f = (doc && doc.fields) || {};
  const leer = (k, x) => (f[k] && f[k][x] !== undefined) ? f[k][x] : null;
  let datos = {};
  try { datos = JSON.parse(leer('datos', 'stringValue') || '{}'); } catch (e) {}
  return {
    id: (doc.name || '').split('/').pop(),
    nombre: leer('nombre', 'stringValue') || 'Sin nombre',
    equipo: leer('equipo', 'stringValue') || '',
    avance: +(leer('avance', 'integerValue') || 0),
    certificado: !!leer('certificado', 'booleanValue'),
    actualizado: leer('actualizado', 'stringValue') || '',
    datos
  };
}

/* Identificador estable de esta persona en este dispositivo: así cada
   sincronización pisa su propio documento en vez de crear uno nuevo. */
function miIdNube(nombre) {
  let id = null;
  try { id = localStorage.getItem(CLAVE_ID); } catch (e) {}
  if (id) return id;
  const base = String(nombre || 'persona').toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 24) || 'persona';
  id = base + '-' + Math.random().toString(36).slice(2, 7);
  try { localStorage.setItem(CLAVE_ID, id); } catch (e) {}
  return id;
}

/* ---------------------------------------------------------------- */
/* Operaciones                                                       */
/* Todas devuelven { ok, ... } y nunca lanzan: si no hay internet la  */
/* app tiene que seguir funcionando igual.                           */
/* ---------------------------------------------------------------- */
async function nubeGuardar(persona) {
  const c = configNube();
  if (!c) return { ok: false, motivo: 'sin-config' };
  const coleccion = c.coleccion || 'personas';
  const id = miIdNube(persona.nombre);
  try {
    const r = await fetch(urlFirestore(`${coleccion}/${id}`, c), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(aCampos(persona))
    });
    if (!r.ok) return { ok: false, motivo: 'http-' + r.status, detalle: await r.text() };
    return { ok: true, id };
  } catch (e) {
    return { ok: false, motivo: 'sin-red', detalle: String(e) };
  }
}

async function nubeListar(equipo) {
  const c = configNube();
  if (!c) return { ok: false, motivo: 'sin-config' };
  const coleccion = c.coleccion || 'personas';
  try {
    const r = await fetch(urlFirestore(coleccion, c) + '&pageSize=300');
    if (!r.ok) return { ok: false, motivo: 'http-' + r.status, detalle: await r.text() };
    const j = await r.json();
    let personas = (j.documents || []).map(desdeCampos);
    if (equipo) personas = personas.filter(p => !p.equipo || p.equipo === equipo);
    personas.sort((a, b) => (b.actualizado || '').localeCompare(a.actualizado || ''));
    return { ok: true, personas };
  } catch (e) {
    return { ok: false, motivo: 'sin-red', detalle: String(e) };
  }
}

async function nubeBorrar(id) {
  const c = configNube();
  if (!c) return { ok: false, motivo: 'sin-config' };
  const coleccion = c.coleccion || 'personas';
  try {
    const r = await fetch(urlFirestore(`${coleccion}/${id}`, c), { method: 'DELETE' });
    return r.ok ? { ok: true } : { ok: false, motivo: 'http-' + r.status };
  } catch (e) {
    return { ok: false, motivo: 'sin-red' };
  }
}

/* ---------------------------------------------------------------- */
/* Lo que se sincroniza de esta persona                              */
/* ---------------------------------------------------------------- */
function miFicha() {
  const m = metricas();
  const ultimo = E.turnos[E.turnos.length - 1] || null;
  return {
    nombre: E.nombre || '',
    equipo: (CONTENIDO.firebase && CONTENIDO.firebase.equipo) || 'local',
    avance: m.avance,
    certificado: m.certificado,
    actualizado: new Date().toISOString(),
    datos: {
      estaciones: CONTENIDO.estaciones.reduce((o, e) => {
        o[e.id] = puntajeEstacion(e.id); return o;
      }, {}),
      superadas: m.superadas,
      turnos: E.turnos.length,
      mejorTurno: m.mejorTurno,
      ultimoTurno: ultimo ? { puntaje: ultimo.puntaje, merma: ultimo.mermaPct,
                              quiebres: ultimo.quiebres, exactitud: ultimo.exactitud } : null,
      examen: E.examen ? { nota: E.examen.nota, aprobado: E.examen.aprobado } : null,
      desde: E.inicio
    }
  };
}

/* Sincroniza en segundo plano. Si falla, queda marcado como pendiente y se
   reintenta la próxima vez que se abra la app. */
async function sincronizar(silencioso) {
  if (!nubeActiva() || !E.nombre) return { ok: false, motivo: 'sin-config' };
  const r = await nubeGuardar(miFicha());
  E.sync = { fecha: new Date().toISOString(), ok: r.ok, motivo: r.motivo || '' };
  guardar();
  if (!silencioso) refrescarEstadoSync();
  return r;
}

function refrescarEstadoSync() {
  const el = $('#estadoSync');
  if (!el) return;
  if (!nubeActiva()) { el.textContent = ''; return; }
  const s = E.sync;
  el.innerHTML = s && s.ok
    ? '<span class="estado-pin bien">✓ Avance sincronizado con el supervisor</span>'
    : '<span class="estado-pin alerta">! Sin sincronizar todavía</span>';
}

/* ---------------------------------------------------------------- */
/* Modo local: código de avance para pasar por mensaje               */
/* ---------------------------------------------------------------- */
function codificarFicha(ficha) {
  const bytes = new TextEncoder().encode(JSON.stringify(ficha));
  let bin = '';
  bytes.forEach(b => bin += String.fromCharCode(b));
  return 'IND1.' + btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodificarFicha(codigo) {
  try {
    const limpio = String(codigo).trim().replace(/\s+/g, '');
    if (!limpio.startsWith('IND1.')) return null;
    let b64 = limpio.slice(5).replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    const bin = atob(b64);
    const ficha = JSON.parse(new TextDecoder().decode(Uint8Array.from(bin, ch => ch.charCodeAt(0))));
    return (ficha && ficha.nombre) ? ficha : null;
  } catch (e) { return null; }
}

/* ---------------------------------------------------------------- */
/* Botón "Compartir mi avance" de la pantalla de inicio              */
/* Con Firebase configurado sincroniza; si no, arma el código.       */
/* ---------------------------------------------------------------- */
async function compartirAvance() {
  const caja = $('#fbCompartir');
  if (!E.nombre) {
    caja.innerHTML = devolucion(false, 'Escribí tu nombre primero: es lo que ve el supervisor.');
    $('#miNombre').focus();
    return;
  }

  if (nubeActiva()) {
    caja.innerHTML = '<p class="sub">Enviando…</p>';
    const r = await sincronizar(true);
    refrescarEstadoSync();
    caja.innerHTML = r.ok
      ? devolucion(true, 'Listo: tu avance ya le llega al supervisor. Se vuelve a enviar solo cada vez que superás algo.')
      : devolucion(false, r.motivo === 'sin-red'
          ? 'No hay conexión ahora. Tu avance está guardado y se va a enviar solo cuando vuelvas a abrir la app con internet.'
          : 'No se pudo enviar (' + esc(r.motivo) + '). Podés pasarle el código de abajo al supervisor.') +
        cajaCodigo();
    return;
  }

  caja.innerHTML = cajaCodigo();
  const btn = $('#copiarCodigo');
  if (btn) btn.onclick = () => {
    const texto = $('#codigoAvance').value;
    if (navigator.share) {
      navigator.share({ title: 'Mi avance de la inducción', text: texto }).catch(() => {});
      return;
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(texto)
        .then(() => btn.textContent = '¡Código copiado!')
        .catch(() => $('#codigoAvance').select());
    } else {
      $('#codigoAvance').select();
    }
  };
}

function cajaCodigo() {
  const codigo = codificarFicha(miFicha());
  return `
    <p class="sub">Pasale este código al supervisor por mensaje. Contiene tu nombre y tu avance, nada más.</p>
    <textarea class="campo-texto" id="codigoAvance" rows="3" readonly>${esc(codigo)}</textarea>
    <div class="btn-row"><button class="btn sm dark" id="copiarCodigo">${navigator.share ? 'Enviar' : 'Copiar código'}</button></div>`;
}

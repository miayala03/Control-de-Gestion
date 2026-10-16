/* ============================================================================
   SESIÓN — pantalla de ingreso con usuario y contraseña.

   Las cuentas y sus roles están en el bloque "usuarios" de contenido.js.
   El rol 'admin' ve el panel del equipo; el rol 'trabajador', la inducción.
   Cada cuenta tiene su propio avance, así que en un mismo teléfono pueden
   entrar varias personas sin pisarse.

   Importante: como la app es un sitio estático, las contraseñas viajan en
   el código y NO es seguridad real. Separa los perfiles, no protege datos.
============================================================================ */

const CLAVE_SESION = 'induccion-sesion-v1';

let SESION = null;   // { usuario, nombre, rol } de la cuenta que ingresó

function buscarCuenta(usuario) {
  const u = String(usuario || '').trim().toLowerCase();
  return (CONTENIDO.usuarios || []).find(c => c.usuario.toLowerCase() === u) || null;
}

/* La sesión guardada solo vale si la cuenta sigue existiendo en contenido.js. */
function leerSesion() {
  try {
    const s = JSON.parse(localStorage.getItem(CLAVE_SESION) || 'null');
    const c = s && buscarCuenta(s.usuario);
    return c ? { usuario: c.usuario, nombre: c.nombre, rol: c.rol } : null;
  } catch (e) { return null; }
}

function esAdmin() { return !!SESION && SESION.rol === 'admin'; }

function iniciales(nombre) {
  return String(nombre || '?').trim().split(/\s+/).slice(0, 2)
    .map(p => p[0]).join('').toUpperCase();
}

const ROTULO_ROL = { admin: 'Supervisor', trabajador: 'Trabajador' };

/* ---------------------------------------------------------------- */
/* Formulario de ingreso                                             */
/* ---------------------------------------------------------------- */
function prepararLogin() {
  const form = $('#formLogin'), usuario = $('#lgUsuario'), clave = $('#lgClave');
  const error = msg => {
    $('#lgError').innerHTML = msg
      ? `<div class="feedback mal"><span class="ic">⚠️</span><span>${msg}</span></div>` : '';
  };

  form.onsubmit = ev => {
    ev.preventDefault();
    if (!usuario.value.trim() || !clave.value) {
      error('Completá tu usuario y tu contraseña.');
      return;
    }
    const c = buscarCuenta(usuario.value);
    if (!c || c.clave !== clave.value) {
      vibrar(60);
      error('Usuario o contraseña incorrectos.');
      form.classList.remove('sacudir'); void form.offsetWidth; form.classList.add('sacudir');
      clave.value = ''; clave.focus();
      return;
    }
    error('');
    clave.value = '';
    vibrar([18, 60, 18]);
    SESION = { usuario: c.usuario, nombre: c.nombre, rol: c.rol };
    try { localStorage.setItem(CLAVE_SESION, JSON.stringify({ usuario: c.usuario })); } catch (e) {}
    abrirApp();
  };

  usuario.oninput = clave.oninput = () => error('');

  $('#lgVer').onclick = () => {
    const ver = clave.type === 'password';
    clave.type = ver ? 'text' : 'password';
    $('#lgVer').textContent = ver ? 'Ocultar' : 'Ver';
    $('#lgVer').setAttribute('aria-label', ver ? 'Ocultar contraseña' : 'Mostrar contraseña');
  };
}

function mostrarLogin() {
  document.body.classList.add('sin-sesion');
  document.body.classList.remove('es-supervisor');
  $('#lgError').innerHTML = '';
  window.scrollTo(0, 0);
  setTimeout(() => $('#lgUsuario').focus(), 50);
}

/* ---------------------------------------------------------------- */
/* Entrar y salir                                                    */
/* ---------------------------------------------------------------- */
function abrirApp() {
  E = cargar();
  E.nombre = SESION.nombre;   // el nombre lo da la cuenta, no se escribe a mano
  guardar();

  document.body.classList.remove('sin-sesion');
  actualizarPestanaSupervisor();
  pintarUsuario();
  ir(esAdmin() ? 'admin' : 'inicio');

  // Al ingresar, el trabajador aparece en el panel del supervisor sin
  // tener que tocar nada (si la base está configurada).
  if (!esAdmin() && nubeActiva()) sincronizar(true);
}

function cerrarSesion() {
  SESION = null;
  try { localStorage.removeItem(CLAVE_SESION); } catch (e) {}
  E = estadoInicial();
  personasNube = null; estadoNube = null;
  $$('.vista').forEach(v => v.innerHTML = '');
  cerrarInstalacion();
  mostrarLogin();
}

/* Avatar con las iniciales en la barra de arriba: abre la ficha de la sesión. */
function pintarUsuario() {
  const b = $('#btnUsuario');
  b.textContent = iniciales(SESION.nombre);
  b.setAttribute('aria-label', 'Sesión de ' + SESION.nombre);
  b.onclick = () => mostrarPanel({
    titulo: SESION.nombre,
    sub: `Usuario: ${SESION.usuario} · ${ROTULO_ROL[SESION.rol] || SESION.rol}`,
    nota: esAdmin()
      ? 'Con esta cuenta ves el panel del equipo y fijás los estándares. También podés recorrer la inducción.'
      : 'Tu avance queda guardado en tu cuenta y le llega al supervisor.',
    acciones: [{ txt: 'Cerrar sesión', clase: 'btn sm', fn: () => cerrarSesion() }]
  });
}

function iniciarSesion() {
  prepararLogin();
  $('#cerrarSesion').onclick = () => cerrarSesion();
  SESION = leerSesion();
  if (SESION) abrirApp(); else mostrarLogin();
}

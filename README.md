# Plataforma Interactiva de Inducción — Encargado de Stock de Cocina (McDonald's)

**Simulador del puesto** para celular (se instala como app y funciona sin internet): la persona
que entra como **Encargado de Stock de Cocina** no lee un manual, practica el trabajo.

Proyecto final · **Control de Gestión** · Ing. en Sistemas de Producción · Docente: CP Leidy Ríos Argaña
Integrantes: Miguel Ayala · Katherine Espinola · Lucas González

> Trabajo académico. No es material oficial de McDonald's; la marca y los colores se usan solo con fines educativos.

---

## Qué hace la app

Casi todo es práctica: se arrastra, se toca, se decide y la app devuelve el resultado.

| Pantalla | Qué tiene |
|---|---|
| **Inicio** | El puesto, el anillo de avance, el próximo paso y un mapa táctil de las áreas con las que se trabaja. Más las temperaturas de referencia y la ficha del proyecto. |
| **Entrenar** | Las **8 estaciones** del proceso de stock. Cada una es un ejercicio distinto (ver abajo) con puntaje; se supera con 80 % y se puede repetir. |
| **Turno** | El simulador: **8 decisiones** de un día real de trabajo. Cada opción mueve la merma, los quiebres y la exactitud del inventario en vivo. Al cierre sale el informe con los desvíos contra el estándar. |
| **Tablero** | Los indicadores del puesto calculados con los turnos jugados: tarjetas con semáforo, medidores contra el objetivo, gráfico de tendencia, calculadoras de fórmula en vivo y la **certificación** final. |

### Las 8 estaciones

| # | Estación | Qué se hace |
|---|---|---|
| 1 | Recepción | Cotejar 6 entregas contra el remito y decidir: recibir, observar o rechazar. |
| 2 | Dónde va cada cosa | **Arrastrar** 9 insumos a congelado, refrigerado o depósito seco. |
| 3 | PEPS en la estantería | **Reordenar** la estantería arrastrando, de lo que vence primero a lo último. |
| 4 | Semáforo de vencimientos | Clasificar 6 productos: descartar, usar hoy o dejar. |
| 5 | Cadena de frío | Mover el **termómetro** hasta el rango correcto de cada insumo. |
| 6 | Cargar una merma | Completar la planilla con los cuatro datos que sirven: qué, cuánto, cuándo y por qué. |
| 7 | Recuento de inventario | **Contar tocando** cada bulto, comparar con el sistema y decidir el ajuste. |
| 8 | Punto de pedido | Mover los valores y ver en un gráfico si el stock aguanta la semana. |

Todo el avance (puntajes, turnos y certificación) se guarda **en el propio celular**, así que no se
pierde al cerrar la app. En *Inicio* hay un botón para borrarlo.

---

## Las dos perspectivas: persona y supervisor

La app tiene dos modos de uso. El de la **persona en inducción** es el que se ve al entrar. El del
**supervisor** está detrás de un PIN: el enlace *Acceso supervisor* está al pie de cualquier
pantalla, y el PIN se cambia en el bloque `supervisor` de `contenido.js` (viene `2468`).

> **Esto no es seguridad de verdad.** Como la app es un sitio estático sin servidor, el PIN viaja
> dentro del código y quien sepa mirar lo encuentra. Sirve para separar dos modos de uso, no para
> proteger datos. No cargues información sensible.

Con el PIN puesto aparece una quinta pestaña, **Equipo**, y la barra de arriba se pone oscura para
que no haya dudas de en qué modo estás. El panel muestra:

- **Resumen del equipo:** cuántas personas hay, qué porcentaje está habilitado, avance medio y
  turnos simulados, cada uno con su semáforo.
- **Dónde falla la inducción:** un gráfico con el porcentaje del equipo que superó cada estación,
  contra el objetivo. Si una estación está baja para todos, el problema no es de una persona: es del
  programa. El panel señala la más floja como acción correctiva.
- **Persona por persona:** el avance de cada una, y tocando su nombre, el detalle estación por
  estación, su último turno y su certificación.
- **Estándar:** el supervisor cambia la nota mínima y los objetivos de merma, quiebres y exactitud.
  La app pasa a medir contra esos valores.
- **Planilla (CSV):** descarga la tabla completa para el informe, lista para abrir en Excel.

### Cómo llegan los datos al supervisor

El avance de cada persona vive en *su* teléfono, así que hay que llevarlo hasta el panel. Hay dos
formas, y la app usa la que esté disponible:

**Sin configurar nada (funciona ya).** La persona pone su nombre en *Inicio* y toca *Compartir mi
avance*: la app arma un código (`IND1....`) que se manda por mensaje. El supervisor lo pega en su
panel y la persona aparece en la lista.

**Con Firebase (sincroniza sola).** Cada persona sincroniza automáticamente cada vez que supera una
estación, cierra un turno o rinde, y el supervisor ve al equipo desde su propio teléfono.

> 📘 **Paso a paso completo, para quien no sabe programar: [GUIA-FIREBASE.md](GUIA-FIREBASE.md).**
> Incluye el paso de las reglas, que si se saltea hace que la app deje de sincronizar a los 30 días.

En resumen:

1. Crear un proyecto en `console.firebase.google.com` (gratis, sin tarjeta).
2. En *Compilación → Firestore Database*, crear la base. **Dejar la que viene por defecto:** las
   bases con nombre propio no tienen cuota gratuita.
3. Empezar en *modo de prueba* y, en *Reglas*, permitir lectura y escritura.
4. En *Configuración del proyecto*, agregar una app web y copiar `apiKey` y `projectId`.
5. Pegarlos en el bloque `firebase` de `contenido.js` y subir el cambio.

> La `apiKey` de Firebase **es pública por diseño**: viaja dentro de la página y cualquiera puede
> verla. No es una contraseña. Con las reglas en modo de prueba, quien tenga el enlace puede leer y
> escribir en la base.

Sobre el costo: la cuota gratuita de Firestore es **por día** (50.000 lecturas, 20.000 escrituras,
1 GiB guardado) y se reinicia. Un grupo de clase usa una fracción mínima: 5 personas sincronizando
50 veces cada una son 250 escrituras **en total**, contra 20.000 por día. Y sin facturación
habilitada no hay forma de que te cobren: al llegar al tope la base deja de responder hasta el día
siguiente.

---

## Dónde está publicada

La app ya está publicada con GitHub Pages en:

```
https://miayala03.github.io/Control-de-Gestion/
```

**No hay que publicarla a mano cada vez.** Cada cambio que se sube a la rama principal
(`claude/happy-faraday-vcm59y`) se publica solo: lo hace el flujo `.github/workflows/pages.yml`.
Tarda 1 o 2 minutos. El estado de cada publicación se ve en la pestaña **Actions** del repositorio.

Abrí esa dirección en el celular. La app te muestra sola un cartel abajo para instalarla
(y siempre podés volver a verlo en **Avance → Instalar como app**).

### Instalarla en un iPhone

En iPhone **hay que usar Safari**: iOS no deja que otros navegadores instalen apps web. Si abrís
la página con Chrome en el iPhone, lo único que vas a poder hacer es un acceso directo que se
sigue abriendo dentro de Chrome, no una app.

1. Abrí la dirección en **Safari**.
2. Tocá el botón **Compartir** (el cuadrado con la flecha hacia arriba, abajo en el centro).
3. Deslizá y elegí **Agregar a inicio** (*Add to Home Screen*) → **Agregar**.

Queda con ícono propio, se abre a pantalla completa (sin la barra del navegador) y funciona sin
internet. A partir de ahí, abrila siempre desde ese ícono: el avance de cada persona se guarda en
su propio teléfono.

### Instalarla en Android

Con Chrome alcanza con tocar **Instalar** en el cartel que aparece abajo, o entrar al menú de los
tres puntos → *Instalar app* / *Agregar a pantalla principal*.

> Para que se pueda instalar, la página tiene que estar abierta desde su dirección `https://...`
> (la de GitHub Pages). Si abrís el archivo `index.html` directamente desde la computadora, el
> navegador solo ofrece "crear acceso directo", no instalarla.

### Verla sin publicarla

También podés bajar el repositorio (**Code → Download ZIP**), descomprimirlo y abrir `index.html`
haciendo doble clic. Funciona igual, solo que la parte de "instalar como app" y el modo sin
internet requieren que esté publicada.

---

## Cómo cambiar los textos (sin saber programar)

**Todo el contenido está en un solo archivo: `contenido.js`.** Ahí están los ejercicios de las
ocho estaciones, los eventos del turno con sus consecuencias, las preguntas de la certificación con
sus respuestas correctas, las temperaturas y las metas.

Reglas para no romper nada:

- Cambiá **solo el texto que está entre comillas** `"así"`.
- No borres comillas `" "`, comas `,`, corchetes `[ ]` ni llaves `{ }`.
- Si el texto que querés escribir lleva comillas adentro, usá comillas simples: `'así'`.
- En las preguntas, `correcta: 1` significa que la respuesta correcta es la **segunda** opción
  (se cuenta desde 0: la primera es `0`, la segunda `1`, la tercera `2`). Si cambiás el orden de
  las opciones, acordate de cambiar ese número.

Para editar directo desde el navegador: entrá al archivo `contenido.js` en GitHub, apretá el
**lápiz** (Edit this file), hacé el cambio y abajo **Commit changes**. En 1 o 2 minutos se
actualiza la app publicada.

### Cosas típicas que van a querer cambiar

| Qué | Dónde en `contenido.js` |
|---|---|
| Nombres de los integrantes, docente, carrera | bloque `proyecto` |
| Nota mínima para aprobar | bloque `metas` |
| Temperaturas de cada zona | bloque `zonas` |
| Nombre y presentación de cada estación | bloque `estaciones` |
| Entregas de la simulación de recepción | bloque `recepcion` |
| Insumos y su zona de guardado | bloque `zonasItems` |
| Productos del ejercicio PEPS | bloque `peps` (`orden: 1` = el que se usa primero) |
| Productos del semáforo de vencimientos | bloque `vencimientos` |
| Caso y campos de la planilla de merma | bloque `merma` |
| Números del recuento de inventario | bloque `recuento` |
| Consumo y entrega del punto de pedido | bloque `reposicion` |
| Eventos del turno y su impacto | bloque `turno` |
| Preguntas de la certificación | bloque `examen` |
| Áreas del mapa de Inicio | bloque `mapa` |
| PIN del supervisor | bloque `supervisor` |
| Conexión a Firebase | bloque `firebase` |

Si algo se rompe, en GitHub siempre se puede volver a la versión anterior desde el historial del
archivo (**History**).

---

## Qué archivo es cada cosa

```
GUIA-FIREBASE.md      Cómo conectar la base de datos, paso a paso
index.html            El esqueleto de la app (las pantallas se arman por JavaScript)
estilos.css           Todo el diseño: colores, tipografías y componentes
contenido.js          TODOS los textos y ejercicios  ← es el archivo que editan ustedes
app.js                Estado, navegación, pantalla de Inicio e instalación como app
nube.js               Sincronización con Firebase y códigos de avance
admin.js              El panel del supervisor (PIN, seguimiento, estándares, CSV)
estaciones.js         Los ocho ejercicios prácticos
turno.js              El simulador de turno
tablero.js            Indicadores, gráficos y certificación
.github/workflows/    Publica el sitio solo cada vez que se sube un cambio
manifest.webmanifest  Datos para que se pueda instalar como app en el celular
sw.js                 Hace que funcione sin internet
iconos/               Ícono de la app (el de 180 px es el que usa el iPhone)
```

> Si cambian archivos y en el celular siguen viendo la versión vieja: en `sw.js`, cambien
> `const VERSION = 'induccion-v4';` por `'induccion-v5'` (y así), y suban el cambio. Eso fuerza la
> actualización.

---

## Cómo se conecta con la materia

La app no es material de lectura: implementa el **ciclo de control de gestión** completo y lo hace
jugar a quien la usa.

- **Estándar:** merma ≤ 2 %, 0 quiebres de stock, exactitud de inventario ≥ 98 %, 80 % para aprobar
  cada estación y la certificación.
- **Medición:** cada decisión del turno mueve los indicadores en vivo, y cada estación deja su puntaje.
- **Desvío:** el tablero compara el resultado contra el objetivo con medidores y semáforo, y el
  informe de cierre muestra exactamente qué decisión causó cada desvío.
- **Acción correctiva:** el informe indica qué revisar, y la certificación solo marca **Habilitado**
  cuando se alcanza el estándar; si no, queda **En refuerzo** con la indicación de qué repetir.

Los cuatro indicadores del puesto —% de merma, rotación de inventario, quiebres y diferencia de
inventario— se practican con las calculadoras del tablero, donde se mueve cada variable de la
fórmula y se ve el efecto al instante.

El simulador de turno está calibrado para que un turno jugado perfecto caiga **justo en el
estándar**: las pérdidas que igual ocurren (un producto que se quema, uno que vence) son el 2 % de
las compras del día. Es decir que el estándar no es "cero pérdidas", es la pérdida inevitable bien
gestionada.

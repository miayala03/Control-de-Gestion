# Plataforma Interactiva de Inducción — Encargado de Stock de Cocina (McDonald's)

App para celular (se instala como una app, funciona sin internet) para la inducción de una
persona que entra al puesto de **Encargado de Stock de Cocina**.

Proyecto final · **Control de Gestión** · Ing. en Sistemas de Producción · Docente: CP Leidy Ríos Argaña
Integrantes: Miguel Ayala · Katherine Espinola · Lucas González

> Trabajo académico. No es material oficial de McDonald's; la marca y los colores se usan solo con fines educativos.

---

## Qué hace la app

| Pantalla | Qué tiene |
|---|---|
| **Inicio** | Bienvenida, el puesto, temperaturas de referencia, barra de avance, riesgos de una inducción insuficiente y la ficha del proyecto. |
| **Módulos** | Los 6 módulos de la inducción. Cada uno tiene lecciones desplegables (con punto de control, registro e indicador) y una evaluación de 3 preguntas. Se aprueba con 80 %. |
| **Practicá** | 1) Simulación de recepción (recibir o reclamar 6 entregas), 2) Ejercicio de PEPS, 3) Checklist diario con barra de avance, 4) Calculadoras de KPI con semáforo, 5) Evaluación final de 12 preguntas. |
| **Avance** | El dashboard del supervisor: avance de inducción, promedio de evaluaciones, cumplimiento del cronograma, actividades atrasadas, nota por módulo, prácticas hechas, alertas por desvío y estado final (**Habilitado** / **En refuerzo**). |

El avance (módulos leídos, notas, checklist, prácticas) se guarda **en el propio celular**, así que
no se pierde al cerrar la app. En la pantalla *Avance* hay botones para reiniciar la fecha del plan
o borrar todo el avance.

---

## Cómo verla en el celular (3 pasos, sin instalar nada)

La forma más fácil es publicarla con **GitHub Pages**:

1. En GitHub, entrá a este repositorio → pestaña **Settings** (arriba).
2. En el menú de la izquierda, **Pages**.
3. En *Source* elegí **Deploy from a branch**; en *Branch* elegí la rama (`main` o
   `claude/happy-faraday-vcm59y`), carpeta `/ (root)`, y apretá **Save**.

Esperá 1 o 2 minutos y GitHub te muestra la dirección, que va a ser algo así:

```
https://miayala03.github.io/Control-de-Gestion/
```

Abrí esa dirección en el celular. Para que quede como una app en la pantalla de inicio:

- **Android (Chrome):** menú de los tres puntos → *Agregar a pantalla principal* / *Instalar app*.
- **iPhone (Safari):** botón de compartir → *Agregar a pantalla de inicio*.

Una vez instalada, funciona también sin internet.

### Verla sin publicarla

También podés bajar el repositorio (**Code → Download ZIP**), descomprimirlo y abrir `index.html`
haciendo doble clic. Funciona igual, solo que la parte de "instalar como app" y el modo sin
internet requieren que esté publicada.

---

## Cómo cambiar los textos (sin saber programar)

**Todo el contenido está en un solo archivo: `contenido.js`.** Ahí están los módulos, las
lecciones, las preguntas con sus respuestas correctas, la simulación de recepción, el ejercicio de
PEPS, el checklist, las metas y los indicadores.

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
| Metas (días del plan, nota mínima) | bloque `metas` |
| Temperaturas de referencia | bloque `referencias` |
| Módulos, lecciones y evaluaciones | bloque `modulos` |
| Entregas de la simulación | bloque `recepcion` |
| Productos del ejercicio PEPS | bloque `peps` (`orden: 1` = el que se usa primero) |
| Tareas del checklist | bloque `checklist` |
| Preguntas de la evaluación final | bloque `evaluacionFinal` |

Si algo se rompe, en GitHub siempre se puede volver a la versión anterior desde el historial del
archivo (**History**).

---

## Qué archivo es cada cosa

```
index.html            La app en sí (diseño y estructura de las pantallas)
contenido.js          TODOS los textos y preguntas  ← es el archivo que editan ustedes
app.js                La lógica (navegación, notas, avance, cálculos). Mejor no tocar.
manifest.webmanifest  Datos para que se pueda instalar como app en el celular
sw.js                 Hace que funcione sin internet
iconos/               Ícono de la app
```

> Si cambian archivos y en el celular siguen viendo la versión vieja: en `sw.js`, cambien
> `const VERSION = 'induccion-v1';` por `'induccion-v2'` (y así), y suban el cambio. Eso fuerza la
> actualización.

---

## Cómo se conecta con la materia

La app no es solo material de lectura: implementa el **ciclo de control de gestión** completo.

- **Estándar:** nota mínima 80 %, inducción completa en 15 días, cumplimiento de cronograma ≥ 90 %, 0 actividades atrasadas.
- **Medición:** la app registra cada módulo leído, cada nota y cada práctica.
- **Desvío:** compara automáticamente el resultado contra la meta (por ejemplo 65 % contra 80 % = −15 puntos).
- **Acción correctiva:** genera alertas en la pantalla *Avance* (refuerzo + nueva evaluación) y solo
  marca el estado como **Habilitado** cuando todos los indicadores están dentro del estándar.

Además, cada etapa del proceso de stock se presenta con su **punto de control**, su **registro** y su
**indicador**, y las calculadoras permiten trabajar los cuatro KPIs del puesto: % de merma, rotación
de inventario, quiebres de stock y diferencia de inventario.

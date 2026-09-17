# Guía: conectar la app a Firebase (paso a paso)

Esta guía es para que el **supervisor vea el avance de todo el equipo desde su propio teléfono**,
sin que nadie le tenga que mandar códigos a mano.

No hace falta saber programar. Son unos 10 minutos y se hace una sola vez.

> **Mientras tanto la app funciona igual.** Sin esto, cada persona genera un código y el supervisor
> lo pega en su panel. Firebase solo automatiza ese paso.

**Lo que necesitás:** una cuenta de Google (la del Gmail de siempre) y una computadora.
**No hace falta tarjeta de crédito.**

> Los nombres de los botones de Firebase cambian cada tanto. Si alguno no coincide exactamente con
> lo que dice acá, buscá el que haga lo mismo: abajo de cada paso está explicado **qué** hace.

---

## Paso 1 · Crear el proyecto

1. Entrá a **console.firebase.google.com** e iniciá sesión con tu cuenta de Google.
2. Apretá **Crear un proyecto** (o el recuadro con el **+**).
3. Ponele un nombre, por ejemplo `induccion-stock`. Debajo del nombre, Firebase te muestra un
   **ID de proyecto** parecido a `induccion-stock-a1b2c`. **Ese ID es uno de los dos datos que
   necesitamos** — si querés, anotalo ya.
4. Te va a ofrecer activar **Google Analytics**. **Desactivalo**: no lo usamos y complica el alta.
5. Apretá **Crear proyecto** y esperá a que termine.

*Qué acabás de hacer:* reservaste un espacio propio dentro de Google donde va a vivir la base de datos.

---

## Paso 2 · Crear la base de datos

1. En el menú de la izquierda buscá **Compilación** (o *Build*) y adentro **Firestore Database**.
2. Apretá **Crear base de datos**.
3. Te va a pedir una **ubicación** (región). Elegí una de Sudamérica, por ejemplo
   `southamerica-east1`. **Ojo: la ubicación no se puede cambiar después**, pero para este proyecto
   cualquiera funciona.
4. Si en algún momento te ofrece ponerle un **nombre propio** a la base, **no lo hagas**: dejá la que
   viene por defecto. Las bases con nombre propio **no tienen cuota gratuita** y ahí sí te podrían
   cobrar.
5. Cuando pregunte por el modo de las reglas, elegí **Modo de prueba**.

*Qué acabás de hacer:* creaste la base donde se van a guardar las fichas de cada persona.

---

## Paso 3 · Arreglar las reglas ⚠️ (el paso que la mayoría se saltea)

**Este es el paso más importante de todos.** El "modo de prueba" que elegiste recién **se vence a
los 30 días**. Si no hacés esto, la app va a andar perfecto durante un mes y de golpe va a dejar de
sincronizar — probablemente justo antes de presentar el trabajo.

1. Dentro de **Firestore Database**, entrá a la pestaña **Reglas** (o *Rules*).
2. Vas a ver un texto que incluye una línea con una fecha, parecida a
   `allow read, write: if request.time < timestamp.date(2026, 10, 17);`. Esa fecha es el vencimiento.
3. **Borrá todo** lo que haya en el recuadro y pegá exactamente esto:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /personas/{documento} {
      allow read, write: if true;
    }
  }
}
```

4. Apretá **Publicar**.

*Qué acabás de hacer:* dejaste la base abierta **sin fecha de vencimiento**, y solo para la carpeta
`personas`, que es la única que usa la app.

> **Esto deja la base abierta a cualquiera que tenga el enlace de la app.** Para un trabajo práctico
> está bien, y por eso la app solo guarda nombre y puntajes. **No cargues datos personales
> sensibles** (documentos, teléfonos, direcciones).

---

## Paso 4 · Copiar los dos datos que necesita la app

1. Arriba a la izquierda, al lado de *Descripción general del proyecto*, apretá la **rueda dentada
   ⚙️** y entrá a **Configuración del proyecto**.
2. Quedate en la pestaña **General** y bajá hasta **Tus apps**.
3. Apretá el ícono de web, que se ve así: **`</>`**.
4. Ponele un apodo cualquiera (por ejemplo `induccion`). **No** marques la casilla de *Firebase
   Hosting* — nuestra app ya está publicada en GitHub Pages.
5. Apretá **Registrar app**.
6. Te va a mostrar un bloque de código con varias líneas. Solo nos importan **dos**:

```js
const firebaseConfig = {
  apiKey: "AIzaSy................................",   // ← ESTE
  authDomain: "induccion-stock-a1b2c.firebaseapp.com",
  projectId: "induccion-stock-a1b2c",                  // ← Y ESTE
  ...
};
```

Copiá el valor de **`apiKey`** y el de **`projectId`** (sin las comillas).

> La `apiKey` **no es una contraseña** y no hay que esconderla: está pensada para viajar dentro de la
> página web, a la vista de todos. Lo que protege la base son las reglas del paso 3, no esta clave.

---

## Paso 5 · Ponerlos en la app

Tenés dos formas. **La más fácil: pasarle los dos valores a Claude y que lo haga por vos.**

Si preferís hacerlo a mano:

1. En GitHub, entrá al repositorio y abrí el archivo **`contenido.js`**.
2. Apretá el **lápiz** (*Edit this file*).
3. Buscá el bloque `firebase:` (está cerca del principio) y completá los dos valores entre comillas:

```js
  firebase: {
    apiKey: 'AIzaSy................................',
    projectId: 'induccion-stock-a1b2c',
    coleccion: 'personas',
    equipo: 'local-centro'
  },
```

4. Abajo de todo, apretá **Commit changes**.
5. Esperá 1 o 2 minutos: la app se vuelve a publicar sola.

**Importante:** solo cambiá lo que está **entre comillas**. No borres las comillas, ni las comas, ni
las llaves.

---

## Paso 6 · Comprobar que funciona

1. Abrí la app y bajá hasta el pie de cualquier pantalla: **Acceso supervisor**.
2. Poné el PIN (viene `2468`; se cambia en `contenido.js`, bloque `supervisor`).
3. Bajá hasta **Conexión** y apretá **Probar la conexión**.
   - Si dice **"Conectado"**, ya está.
   - Si da error, mirá la tabla de abajo.
4. Ahora pedile a alguien que abra la app, escriba su nombre en *Inicio* y toque **Compartir mi
   avance**. Volvé al panel, apretá **Actualizar** y tiene que aparecer en la lista.

---

## Si algo falla

| Lo que ves | Qué pasó | Cómo se arregla |
|---|---|---|
| *"La base contestó que no está permitido"* | Las reglas están cerradas o vencidas | Rehacé el **paso 3** |
| *"No hubo respuesta"* | Sin internet, o el `projectId` está mal escrito | Revisá la conexión y que el ID sea el del paso 1 |
| Conecta, pero no aparece nadie | Todavía nadie sincronizó, **o** cargaste la configuración solo en tu dispositivo | Cada persona tiene que poner su nombre y tocar *Compartir mi avance*. Y la configuración tiene que estar en `contenido.js`, subida a GitHub |
| Andaba y de golpe dejó de andar | Se vencieron las reglas del modo de prueba | Rehacé el **paso 3** |

---

## Lo que NO hay que hacer

- **No habilites la facturación** ni cargues una tarjeta. Sin eso no te pueden cobrar nada: si
  alguna vez llegaras al tope diario, la base deja de responder hasta el día siguiente y listo.
- **No crees una base con nombre propio.** Solo la que viene por defecto tiene cuota gratuita.
- **No cargues datos personales sensibles**, porque la base queda abierta.
- **No borres el proyecto de Firebase** hasta después de presentar el trabajo.

---

## ¿Cuánto cuesta?

Nada, y por bastante margen. La cuota gratuita es **por día** y se reinicia todos los días:

| | Gratis por día | Lo que gasta un grupo de 5 |
|---|---|---|
| Escrituras | 20.000 | ~250 **en total**, no por día |
| Lecturas | 50.000 | unas 500 por día, como mucho |
| Guardado | 1 GiB | unos 5 KB |

A esa escala nunca llegás al límite. El único cambio posible sería que Google modifique sus
condiciones en el futuro; por eso la app mantiene el modo de códigos como alternativa.

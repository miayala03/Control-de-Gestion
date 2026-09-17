/* ============================================================================
   CONTENIDO — Inducción · Encargado de Stock de Cocina (McDonald's)

   ESTE ES EL ARCHIVO QUE SE EDITA. Todo lo que se lee en la app está acá:
   textos, ejercicios, respuestas correctas y devoluciones.
   No hace falta tocar los demás archivos.
============================================================================ */

const CONTENIDO = {

  /* ------------------------------------------------------------------ */
  /* Datos del proyecto                                                  */
  /* ------------------------------------------------------------------ */
  proyecto: {
    titulo: 'Inducción · Stock de Cocina',
    empresa: "McDonald's",
    puesto: 'Encargado de Stock de Cocina',
    area: 'Operaciones / Cocina',
    materia: 'Control de Gestión',
    carrera: 'Ing. en Sistemas de Producción',
    docente: 'CP Leidy Ríos Argaña',
    integrantes: ['Miguel Ayala', 'Katherine Espinola', 'Lucas González'],
    aviso: "Trabajo académico. No es material oficial de McDonald's; la marca y los colores se usan solo con fines educativos."
  },

  metas: {
    notaMinima: 80,      // % para aprobar la certificación
    estaciones: 8        // cuántas estaciones hay que superar
  },

  /* ------------------------------------------------------------------ */
  /* Acceso del supervisor                                               */
  /*                                                                     */
  /* OJO: esto NO es seguridad de verdad. Como la app es un sitio        */
  /* estático sin servidor, el PIN viaja dentro del código y cualquiera  */
  /* que sepa mirar puede encontrarlo. Sirve para separar dos modos de   */
  /* uso, no para proteger datos. Cambiá el PIN acá.                     */
  /* ------------------------------------------------------------------ */
  supervisor: {
    pin: '2468',
    titulo: 'Acceso supervisor',
    ayuda: 'Panel de seguimiento de la inducción del equipo.'
  },

  /* ------------------------------------------------------------------ */
  /* Base de datos del equipo (Firebase Firestore) — OPCIONAL            */
  /*                                                                     */
  /* Vacío, la app funciona igual: cada persona genera un código de       */
  /* avance y el supervisor lo pega en su panel.                          */
  /*                                                                     */
  /* Con estos dos datos cargados, cada persona sincroniza sola y el      */
  /* supervisor ve al equipo desde su propio teléfono. Cómo obtenerlos    */
  /* está explicado paso a paso dentro del panel, en "Conexión".          */
  /*                                                                     */
  /* La apiKey de Firebase es pública por diseño (viaja en la página).    */
  /* No es una contraseña: quien tenga el enlace puede leer y escribir,   */
  /* así que no cargues datos sensibles.                                  */
  /* ------------------------------------------------------------------ */
  firebase: {
    apiKey: 'AIzaSyBNcr89kDb58cLoXAfOZ4hPzRBIGJZJ_0E',
    projectId: 'induccion-ba8d1',
    coleccion: 'personas',
    equipo: 'local-centro'     // permite separar grupos dentro de la misma base
  },

  /* ------------------------------------------------------------------ */
  /* Rangos de temperatura: se usan en varios ejercicios                 */
  /* ------------------------------------------------------------------ */
  zonas: [
    { id: 'congelado',   nombre: 'Congelado',     icono: '❄️', rango: '−18 °C o menos', min: -30, max: -18 },
    { id: 'refrigerado', nombre: 'Refrigerado',   icono: '🧊', rango: '0 a 4 °C',       min: 0,   max: 4 },
    { id: 'seco',        nombre: 'Depósito seco', icono: '📦', rango: '15 a 22 °C',     min: 15,  max: 22 }
  ],

  zonaRiesgo: { desde: 5, hasta: 60, texto: 'Zona de riesgo: las bacterias se multiplican rápido.' },

  /* ------------------------------------------------------------------ */
  /* Las 8 estaciones de entrenamiento                                   */
  /* El "briefing" es lo único que se lee: 3 líneas como máximo.          */
  /* ------------------------------------------------------------------ */
  estaciones: [
    {
      id: 'recepcion', numero: 1, tipo: 'recepcion',
      nombre: 'Recepción', icono: '🚚',
      corto: 'Recepción',
      lema: 'Llegó el camión. Nada entra sin control.',
      briefing: [
        'Cotejá contra el remito: cantidad, estado, temperatura y vencimiento.',
        'Se firma conforme solo si todo coincide.',
        'Cadena de frío rota = se rechaza, no se discute.'
      ],
      indicador: '% de discrepancias en recepción'
    },
    {
      id: 'zonas', numero: 2, tipo: 'zonas',
      nombre: 'Dónde va cada cosa', icono: '🏬',
      corto: 'Zonas',
      lema: 'Cada insumo tiene su temperatura.',
      briefing: [
        'Congelado −18 °C · Refrigerado 0 a 4 °C · Seco 15 a 22 °C.',
        'Nada en contacto con el piso: estantería o pallet.',
        'Guardar mal es perder el producto igual que tirarlo.'
      ],
      indicador: '% de cumplimiento de temperaturas'
    },
    {
      id: 'peps', numero: 3, tipo: 'peps',
      nombre: 'PEPS en la estantería', icono: '🔄',
      corto: 'PEPS',
      lema: 'Primero entra, primero sale.',
      briefing: [
        'Lo que vence antes va adelante; lo nuevo, atrás.',
        'Ordená la estantería de izquierda (se usa primero) a derecha.'
      ],
      indicador: 'Rotación de inventario'
    },
    {
      id: 'vencimientos', numero: 4, tipo: 'vencimientos',
      nombre: 'Semáforo de vencimientos', icono: '📅',
      corto: 'Vencimientos',
      lema: 'Revisión diaria del depósito.',
      briefing: [
        'Vencido: se retira y se registra como merma.',
        'Vence hoy o mañana: se adelanta su uso.',
        'Con margen: sigue su rotación normal.'
      ],
      indicador: '% de merma sobre compras'
    },
    {
      id: 'frio', numero: 5, tipo: 'frio',
      nombre: 'Cadena de frío', icono: '🌡️',
      corto: 'Cadena de frío',
      lema: 'Llevá cada producto a su temperatura.',
      briefing: [
        'Movés el termómetro hasta el rango correcto de cada insumo.',
        'Entre 5 y 60 °C está la zona de riesgo: ahí no se guarda nada.'
      ],
      indicador: '% de cumplimiento de temperaturas'
    },
    {
      id: 'merma', numero: 6, tipo: 'merma',
      nombre: 'Cargar una merma', icono: '📝',
      corto: 'Merma',
      lema: 'Si no está registrado, no existe.',
      briefing: [
        'Todo movimiento necesita cuatro datos: qué, cuánto, cuándo y por qué.',
        'En la merma, el motivo es el dato más valioso: ataca la causa.'
      ],
      indicador: '% de merma sobre compras'
    },
    {
      id: 'recuento', numero: 7, tipo: 'recuento',
      nombre: 'Recuento de inventario', icono: '🔢',
      corto: 'Recuento',
      lema: 'Contá el stock real y comparalo con el sistema.',
      briefing: [
        'Tocá cada bulto para contarlo: el conteo es físico, no estimado.',
        'Diferencia = |teórico − físico| ÷ teórico × 100.',
        'Tolerancia del local: hasta 2 %.'
      ],
      indicador: 'Diferencia de inventario (%)'
    },
    {
      id: 'reposicion', numero: 8, tipo: 'reposicion',
      nombre: 'Punto de pedido', icono: '📈',
      corto: 'Punto de pedido',
      lema: 'Reponer antes del quiebre, no después.',
      briefing: [
        'Punto de pedido = consumo diario × días de entrega + stock de seguridad.',
        'Ajustá los valores y mirá si el stock aguanta la semana.'
      ],
      indicador: 'Quiebres de stock'
    }
  ],

  /* ------------------------------------------------------------------ */
  /* ESTACIÓN 1 — Recepción                                              */
  /* accion correcta: 'recibir' | 'observar' | 'rechazar'                */
  /* ------------------------------------------------------------------ */
  recepcion: [
    {
      icono: '🥬', nombre: 'Lechuga', remito: '20 bolsas',
      datos: [['Recibido', '20 bolsas', true], ['Estado', 'Fresca, sin golpes', true], ['Vence', 'en 5 días', true]],
      correcta: 'recibir',
      porque: 'Cantidad, estado y vencimiento coinciden: se firma conforme.'
    },
    {
      icono: '🍔', nombre: 'Medallones de carne', remito: '8 cajas',
      datos: [['Recibido', '8 cajas', true], ['Temperatura', '12 °C', false], ['Vence', 'en 40 días', true]],
      correcta: 'rechazar',
      porque: 'Deberían venir a −18 °C y llegaron a 12 °C. La cadena de frío se rompió: no se recibe.'
    },
    {
      icono: '🍟', nombre: 'Papas congeladas', remito: '30 cajas',
      datos: [['Recibido', '25 cajas', false], ['Temperatura', '−19 °C', true], ['Estado', 'Sin daños', true]],
      correcta: 'observar',
      porque: 'Faltan 5 cajas. El producto está bien: se recibe lo que llegó, se deja constancia y se reclama la diferencia.'
    },
    {
      icono: '🍞', nombre: 'Pan de hamburguesa', remito: '40 unidades',
      datos: [['Recibido', '40 unidades', true], ['Vence', 'mañana', false], ['Estado', 'Ok', true]],
      correcta: 'rechazar',
      porque: 'Un vencimiento de un día no alcanza para el uso previsto: se devuelve al proveedor.'
    },
    {
      icono: '🧃', nombre: 'Concentrado de gaseosa', remito: '12 bidones',
      datos: [['Recibido', '12 bidones', true], ['Estado', '1 bidón con pérdida', false], ['Vence', 'en 6 meses', true]],
      correcta: 'observar',
      porque: 'Once bidones están bien. Se recibe con observación en el remito y se reclama la unidad dañada.'
    },
    {
      icono: '🧀', nombre: 'Queso cheddar', remito: '15 cajas',
      datos: [['Recibido', '15 cajas', true], ['Temperatura', '3 °C', true], ['Vence', 'en 20 días', true]],
      correcta: 'recibir',
      porque: 'Todo coincide y 3 °C está dentro del rango de refrigerado.'
    }
  ],

  accionesRecepcion: [
    { id: 'recibir',  rotulo: 'Recibir conforme', icono: '✓', ayuda: 'Todo coincide' },
    { id: 'observar', rotulo: 'Recibir con observación', icono: '!', ayuda: 'Algo falta o está dañado' },
    { id: 'rechazar', rotulo: 'Rechazar', icono: '✕', ayuda: 'No es apto para usar' }
  ],

  /* ------------------------------------------------------------------ */
  /* ESTACIÓN 2 — Dónde va cada cosa                                     */
  /* ------------------------------------------------------------------ */
  zonasItems: [
    { icono: '🍔', nombre: 'Medallones',    zona: 'congelado' },
    { icono: '🍟', nombre: 'Papas',         zona: 'congelado' },
    { icono: '🍦', nombre: 'Mix de helado', zona: 'congelado' },
    { icono: '🥬', nombre: 'Lechuga',       zona: 'refrigerado' },
    { icono: '🧀', nombre: 'Queso',         zona: 'refrigerado' },
    { icono: '🥓', nombre: 'Panceta',       zona: 'refrigerado' },
    { icono: '🍞', nombre: 'Pan',           zona: 'seco' },
    { icono: '🧂', nombre: 'Sal y especias', zona: 'seco' },
    { icono: '🥤', nombre: 'Vasos',         zona: 'seco' }
  ],

  /* ------------------------------------------------------------------ */
  /* ESTACIÓN 3 — PEPS (el orden correcto es por fecha de vencimiento)   */
  /* ------------------------------------------------------------------ */
  peps: [
    { icono: '🍔', nombre: 'Medallones',  vence: '08/08', orden: 1 },
    { icono: '🍞', nombre: 'Pan',         vence: '10/08', orden: 2 },
    { icono: '🧀', nombre: 'Queso',       vence: '12/08', orden: 3 },
    { icono: '🥬', nombre: 'Lechuga',     vence: '14/08', orden: 4 },
    { icono: '🥒', nombre: 'Pepinillos',  vence: '15/08', orden: 5 }
  ],

  /* ------------------------------------------------------------------ */
  /* ESTACIÓN 4 — Semáforo de vencimientos                               */
  /* dias: días que faltan (negativo = ya venció)                        */
  /* accion: 'descartar' | 'adelantar' | 'normal'                        */
  /* ------------------------------------------------------------------ */
  vencimientos: [
    { icono: '🥬', nombre: 'Lechuga',      dias: -1, accion: 'descartar', porque: 'Venció ayer: se retira y se carga como merma.' },
    { icono: '🧀', nombre: 'Queso',        dias: 0,  accion: 'adelantar', porque: 'Vence hoy: se usa en este turno o se pierde.' },
    { icono: '🍞', nombre: 'Pan',          dias: 1,  accion: 'adelantar', porque: 'Vence mañana: se adelanta su uso.' },
    { icono: '🥓', nombre: 'Panceta',      dias: 7,  accion: 'normal',    porque: 'Tiene margen: sigue su rotación normal.' },
    { icono: '🍟', nombre: 'Papas',        dias: 45, accion: 'normal',    porque: 'Congelado con 45 días: rotación normal.' },
    { icono: '🥫', nombre: 'Salsa abierta', dias: -3, accion: 'descartar', porque: 'Producto abierto y vencido hace 3 días: se descarta.' }
  ],

  accionesVencimiento: [
    { id: 'descartar', rotulo: 'Descartar', icono: '🗑️', color: 'critico' },
    { id: 'adelantar', rotulo: 'Usar hoy',  icono: '⏩', color: 'alerta' },
    { id: 'normal',    rotulo: 'Dejar',     icono: '👍', color: 'bien' }
  ],

  /* ------------------------------------------------------------------ */
  /* ESTACIÓN 5 — Cadena de frío (llevar el termómetro al rango)         */
  /* ------------------------------------------------------------------ */
  frio: [
    { icono: '🍔', nombre: 'Medallones de carne', zona: 'congelado' },
    { icono: '🥬', nombre: 'Lechuga',             zona: 'refrigerado' },
    { icono: '🍞', nombre: 'Pan de hamburguesa',  zona: 'seco' },
    { icono: '🍦', nombre: 'Mix de helado',       zona: 'congelado' }
  ],

  /* ------------------------------------------------------------------ */
  /* ESTACIÓN 6 — Cargar una merma                                       */
  /* ------------------------------------------------------------------ */
  merma: {
    caso: 'Durante el servicio se queman 3 kg de medallones de carne en la plancha.',
    campos: [
      { clave: 'producto', rotulo: 'Producto', tipo: 'opciones',
        opciones: ['Medallones de carne', 'Pan de hamburguesa', 'Papas congeladas'], correcta: 'Medallones de carne',
        error: 'El caso habla de medallones de carne.' },
      { clave: 'cantidad', rotulo: 'Cantidad', tipo: 'opciones',
        opciones: ['3', '1', 'Unos pocos'], correcta: '3',
        error: 'La cantidad va contada y exacta, nunca estimada.' },
      { clave: 'unidad', rotulo: 'Unidad', tipo: 'opciones',
        opciones: ['kg', 'cajas', 'unidades'], correcta: 'kg',
        error: 'No mezcles unidades: el caso está en kilos.' },
      { clave: 'turno', rotulo: 'Cuándo', tipo: 'opciones',
        opciones: ['Hoy, turno tarde', 'Esta semana', 'Lo cargo mañana'], correcta: 'Hoy, turno tarde',
        error: 'Se registra en el momento y con su turno, no de memoria al cierre.' },
      { clave: 'motivo', rotulo: 'Motivo', tipo: 'opciones',
        opciones: ['Quemado en plancha', 'Otro', 'Sin especificar'], correcta: 'Quemado en plancha',
        error: 'El motivo es lo que permite atacar la causa: "otro" no sirve para nada.' }
    ],
    cierre: 'Con esos cuatro datos —qué, cuánto, cuándo y por qué— la merma alimenta el indicador y se puede corregir la causa.'
  },

  /* ------------------------------------------------------------------ */
  /* ESTACIÓN 7 — Recuento de inventario                                 */
  /* ------------------------------------------------------------------ */
  recuento: {
    producto: 'Cajas de medallones de carne',
    teorico: 26,        // lo que dice el sistema
    fisico: 24,         // lo que hay de verdad en la cámara
    tolerancia: 2       // % aceptado por el local
  },

  /* ------------------------------------------------------------------ */
  /* ESTACIÓN 8 — Punto de pedido                                        */
  /* ------------------------------------------------------------------ */
  reposicion: {
    producto: 'Cajas de papas congeladas',
    stockInicial: 40,
    consumoReal: [7, 9, 8, 12, 14, 15, 10],   // lo que se consume cada día de la semana
    dias: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    entrega: 2,          // días que tarda el proveedor
    consumoSugerido: 11,
    seguridadSugerida: 8
  },

  /* ------------------------------------------------------------------ */
  /* SIMULADOR DE TURNO                                                  */
  /* Cada opción mueve los indicadores del local.                        */
  /* merma en $ · quiebres en cantidad · exactitud en puntos %           */
  /* ------------------------------------------------------------------ */
  turno: {
    inicial: { merma: 0, quiebres: 0, exactitud: 100 },
    // Compras del turno. Está calibrado para que un turno jugado perfecto
    // caiga justo en el estándar de merma: las pérdidas inevitables del día
    // ($48.000) son el 2 % de esta cifra.
    compras: 2400000,
    estandar: { merma: 2, quiebres: 0, exactitud: 98 },
    eventos: [
      {
        hora: '07:10', icono: '🚚',
        situacion: 'Llega el proveedor con 30 cajas de papas, pero el remito dice 35 y el chofer tiene apuro.',
        opciones: [
          { texto: 'Firmo conforme para no demorarlo', efecto: { merma: 45000, quiebres: 1, exactitud: -4 }, puntos: 0,
            nota: 'Firmaste por 35 y entraron 30: pagás 5 cajas que no tenés y el sistema queda mal.' },
          { texto: 'Cuento, anoto 30 y dejo constancia en el remito', efecto: {}, puntos: 10,
            nota: 'Correcto. La recepción es el punto de control: se firma lo que realmente entró.' },
          { texto: 'Recibo todo y lo reviso más tarde', efecto: { merma: 20000, exactitud: -3 }, puntos: 3,
            nota: 'Después el chofer ya no está y el reclamo se pierde. Se cuenta en el momento.' }
        ]
      },
      {
        hora: '07:40', icono: '🌡️',
        situacion: 'La cámara de congelados marca −9 °C. Debería estar en −18 °C.',
        opciones: [
          { texto: 'Aviso al supervisor y no uso el producto hasta que se defina', efecto: {}, puntos: 10,
            nota: 'Así es. Un valor fuera de rango es una alerta, y el producto dudoso no se usa.' },
          { texto: 'Anoto el valor y sigo trabajando normal', efecto: { merma: 60000, exactitud: -2 }, puntos: 2,
            nota: 'Anotar sin actuar no sirve: el producto se sigue deteriorando.' },
          { texto: 'Bajo el termostato y no lo registro', efecto: { merma: 80000, exactitud: -5 }, puntos: 0,
            nota: 'Sin registro no hay evidencia del control ni forma de encontrar la causa.' }
        ]
      },
      {
        hora: '09:15', icono: '📦',
        situacion: 'Entra pan nuevo y en la estantería todavía queda pan de anteayer.',
        opciones: [
          { texto: 'Pongo el nuevo adelante, que es más cómodo', efecto: { merma: 35000 }, puntos: 0,
            nota: 'Así se vence el viejo en el fondo. PEPS: lo nuevo va atrás.' },
          { texto: 'Pongo el nuevo atrás y adelanto el de anteayer', efecto: {}, puntos: 10,
            nota: 'Correcto: primero entra, primero sale.' },
          { texto: 'Mezclo todo en la misma bandeja', efecto: { merma: 25000, exactitud: -2 }, puntos: 1,
            nota: 'Sin orden no hay rotación posible ni conteo confiable.' }
        ]
      },
      {
        hora: '11:30', icono: '🔥',
        situacion: 'Se queman 3 kg de medallones en la plancha en pleno pico de servicio.',
        opciones: [
          { texto: 'Los descarto y sigo; después veo si lo anoto', efecto: { merma: 30000, exactitud: -4 }, puntos: 2,
            nota: 'La merma no registrada desaparece del indicador y reaparece como diferencia de inventario.' },
          { texto: 'Los descarto y cargo la merma con el motivo', efecto: { merma: 30000 }, puntos: 10,
            nota: 'Bien. La pérdida ya ocurrió; registrarla con motivo es lo que permite corregir la causa.' },
          { texto: 'Los sirvo igual, apenas se ven quemados', efecto: { merma: 30000, exactitud: -6 }, puntos: 0,
            nota: 'Nunca. Producto no apto no se sirve: es calidad y es seguridad alimentaria.' }
        ]
      },
      {
        hora: '13:00', icono: '⚠️',
        situacion: 'Quedan 4 cajas de papas y el proveedor tarda 2 días. Se consumen unas 12 por día.',
        opciones: [
          { texto: 'Espero al pedido semanal del jueves', efecto: { quiebres: 2, merma: 15000 }, puntos: 0,
            nota: 'Con 4 cajas no llegás ni a mañana: quiebre en pleno servicio.' },
          { texto: 'Aviso a Compras hoy para pedido urgente', efecto: {}, puntos: 10,
            nota: 'Correcto: estás por debajo del punto de pedido, hay que reponer ya.' },
          { texto: 'Uso menos papas por porción para estirar el stock', efecto: { quiebres: 1, exactitud: -3 }, puntos: 0,
            nota: 'Cambiar la porción rompe el estándar del producto. El problema es de reposición.' }
        ]
      },
      {
        hora: '15:20', icono: '🥬',
        situacion: 'Encontrás una caja de lechuga vencida ayer, todavía cerrada y con buen aspecto.',
        opciones: [
          { texto: 'La uso: está cerrada y se ve bien', efecto: { merma: 18000, exactitud: -6 }, puntos: 0,
            nota: 'Vencido no se usa, aunque se vea bien. Es riesgo sanitario.' },
          { texto: 'La retiro, la registro como merma y reviso por qué no rotó', efecto: { merma: 18000 }, puntos: 10,
            nota: 'Exacto: se retira, se registra y se busca la causa de la mala rotación.' },
          { texto: 'La dejo para el personal', efecto: { merma: 18000, exactitud: -4 }, puntos: 0,
            nota: 'Producto vencido no se consume ni se regala: se descarta y se registra.' }
        ]
      },
      {
        hora: '18:45', icono: '🔢',
        situacion: 'Recuento de cierre: el sistema dice 48 cajas y contás 46.',
        opciones: [
          { texto: 'Ajusto el sistema a 46 y busco la causa de la diferencia', efecto: { exactitud: -2 }, puntos: 10,
            nota: 'Bien. Se ajusta a la realidad y —lo más importante— se busca por qué pasó.' },
          { texto: 'Dejo 48, la diferencia es chica', efecto: { exactitud: -8 }, puntos: 0,
            nota: 'El sistema queda mintiendo y la diferencia crece mes a mes.' },
          { texto: 'Cuento de nuevo y si da 46, lo cargo sin avisar a nadie', efecto: { exactitud: -4 }, puntos: 5,
            nota: 'Recontar está bien, pero la diferencia se informa: es un dato de control.' }
        ]
      },
      {
        hora: '22:30', icono: '🧹',
        situacion: 'Cierre de turno. Quedaron cajas apoyadas en el piso del depósito y planillas sin cargar.',
        opciones: [
          { texto: 'Cierro y lo dejo para el turno de mañana', efecto: { merma: 12000, exactitud: -5 }, puntos: 0,
            nota: 'El registro es parte de la tarea, no un extra. Y nada va en el piso.' },
          { texto: 'Subo todo a estantería y cargo las planillas antes de irme', efecto: {}, puntos: 10,
            nota: 'Cierre correcto: depósito ordenado y datos del día cargados.' },
          { texto: 'Cargo las planillas de memoria mañana temprano', efecto: { exactitud: -6 }, puntos: 2,
            nota: 'De memoria el dato se deforma. Se registra en el momento.' }
        ]
      }
    ]
  },

  /* ------------------------------------------------------------------ */
  /* CERTIFICACIÓN — evaluación final                                    */
  /* ------------------------------------------------------------------ */
  examen: [
    { pregunta: 'El remito dice 30 cajas de papas, pero contás 25 al recibir. ¿Qué hacés?',
      opciones: ['Firmo conforme y aviso después', 'Registro la diferencia, no firmo conforme y reclamo', 'Guardo todo y se verá en el inventario'],
      correcta: 1, porque: 'La recepción es el punto de control: se firma solo lo que realmente entró.' },
    { pregunta: '¿Qué significa aplicar PEPS al guardar la mercadería?',
      opciones: ['Usar primero lo más caro', 'Usar primero lo que entró primero', 'Usar lo que está adelante, sea nuevo o viejo'],
      correcta: 1, porque: 'PEPS: primero entra, primero sale. Lo más viejo se usa antes.' },
    { pregunta: 'En pleno servicio encontrás un producto vencido. ¿Qué corresponde?',
      opciones: ['Retirarlo, no usarlo y registrarlo como merma', 'Usarlo si parece estar bien', 'Devolverlo a su lugar y avisar mañana'],
      correcta: 0, porque: 'Se retira, no se usa y se registra con su motivo.' },
    { pregunta: '¿Cuál es el rango correcto de la heladera (refrigerado)?',
      opciones: ['−18 °C o menos', 'Entre 0 y 4 °C', 'Entre 10 y 15 °C'],
      correcta: 1, porque: 'Refrigerado va de 0 a 4 °C. −18 °C es congelado; 10 a 15 °C es zona de riesgo.' },
    { pregunta: '¿Para qué sirve tener definido un stock mínimo?',
      opciones: ['Para comprar siempre lo mismo', 'Para saber cuándo reponer antes de quedarse sin', 'Para llenar el depósito'],
      correcta: 1, porque: 'Es la alarma que avisa antes del quiebre.' },
    { pregunta: '¿Cómo se calcula el % de merma?',
      opciones: ['Merma ÷ compras × 100', 'Merma ÷ ventas × 100', 'Compras ÷ merma × 100'],
      correcta: 0, porque: 'Merma sobre compras: qué parte de lo comprado se perdió.' },
    { pregunta: 'La rotación de inventario da muy baja. ¿Qué significa?',
      opciones: ['Que se vende muchísimo', 'Que hay stock parado y plata inmovilizada', 'Que falta mercadería'],
      correcta: 1, porque: 'Rotación baja = stock quieto. Muy alta, en cambio, avisa riesgo de quiebre.' },
    { pregunta: '¿Por qué se registra la merma todos los días?',
      opciones: ['Para tener más papeleo', 'Para medir el % de merma y atacar sus causas', 'Para descontársela a quien la generó'],
      correcta: 1, porque: 'El dato registrado alimenta el indicador y permite corregir.' },
    { pregunta: 'Los cuatro pasos del ciclo de control de gestión son:',
      opciones: ['Comprar, guardar, usar, contar', 'Estándar, medición, desvío, acción correctiva', 'Planificar, delegar, esperar, informar'],
      correcta: 1, porque: 'Sin acción correctiva, medir no sirve de nada.' },
    { pregunta: 'Medís la cámara y da −9 °C cuando debería estar a −18 °C. ¿Qué hacés?',
      opciones: ['Lo anoto y sigo', 'Aviso al supervisor y no uso el producto hasta definir', 'Lo corrijo y no lo anoto'],
      correcta: 1, porque: 'Se avisa, se separa el producto dudoso y se registra todo.' }
  ],

  /* ------------------------------------------------------------------ */
  /* Mapa del puesto (Inicio) — se toca cada área y muestra el vínculo   */
  /* ------------------------------------------------------------------ */
  mapa: {
    centro: { icono: '📦', nombre: 'Vos', detalle: 'Encargado de Stock de Cocina' },
    nodos: [
      { icono: '🚛', nombre: 'Proveedores',   detalle: 'Te entregan la mercadería. Cotejás contra el remito y firmás.' },
      { icono: '🛒', nombre: 'Compras',       detalle: 'Les avisás qué reponer y cuándo, antes del quiebre.' },
      { icono: '👨‍🍳', nombre: 'Producción',    detalle: 'Les entregás los insumos del turno y registrás la salida.' },
      { icono: '🧾', nombre: 'Administración', detalle: 'Reciben tus planillas: son la base de los indicadores.' },
      { icono: '👔', nombre: 'Supervisión',   detalle: 'Tu jefe directo. Le informás desvíos y alertas.' },
      { icono: '🧽', nombre: 'Calidad e Higiene', detalle: 'Controlan temperaturas, rotulado y limpieza del depósito.' }
    ]
  }
};

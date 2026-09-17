/* ============================================================================
   CONTENIDO DE LA APP  —  Editá SOLO este archivo para cambiar textos
   ============================================================================

   Proyecto final · Control de Gestión
   Plataforma interactiva de inducción — Encargado de Stock de Cocina (McDonald's)

   CÓMO EDITAR (no hace falta saber programar):
   - Cambiá únicamente el texto que está entre comillas "asi".
   - No borres las comillas, las comas, los corchetes [ ] ni las llaves { }.
   - Si un texto lleva comillas adentro, usá comillas simples: 'asi'.
   - Guardá el archivo y recargá la app.

   Si algo se rompe, avisá: se vuelve a la versión anterior desde GitHub.
============================================================================ */

const CONTENIDO = {

  /* ------------------------------------------------------------------ */
  /* 1) DATOS GENERALES DEL PROYECTO                                     */
  /* ------------------------------------------------------------------ */
  proyecto: {
    titulo: "Inducción · Stock de Cocina",
    empresa: "McDonald's",
    puesto: "Encargado de Stock de Cocina",
    area: "Operaciones / Cocina",
    materia: "Control de Gestión",
    carrera: "Ing. en Sistemas de Producción",
    docente: "CP Leidy Ríos Argaña",
    integrantes: ["Miguel Ayala", "Katherine Espinola", "Lucas González"],
    objetivo: "Que el nuevo colaborador domine su proceso, sus puntos de control y sus indicadores antes de operar solo.",
    aviso: "Trabajo académico. No es material oficial de McDonald's; la marca y los colores se usan solo con fines educativos."
  },

  /* ------------------------------------------------------------------ */
  /* 2) METAS DEL PLAN DE INDUCCIÓN (se usan en la pantalla Avance)      */
  /* ------------------------------------------------------------------ */
  metas: {
    diasPlan: 15,            // la inducción debe completarse en 15 días
    notaMinima: 80,          // nota mínima de cada evaluación, en %
    cumplimientoMinimo: 90,  // cumplimiento del cronograma mínimo, en %
    atrasadasMaximo: 0       // actividades atrasadas permitidas
  },

  /* ------------------------------------------------------------------ */
  /* 3) TEMPERATURAS DE REFERENCIA (tarjetas de la pantalla Inicio)      */
  /* ------------------------------------------------------------------ */
  referencias: [
    { rotulo: "Congelado", valor: "−18 °C", nota: "cámara de congelados" },
    { rotulo: "Refrigerado", valor: "0 a 4 °C", nota: "cadena de frío" },
    { rotulo: "Depósito seco", valor: "15 a 22 °C", nota: "seco y ventilado" },
    { rotulo: "Regla de oro", valor: "PEPS", nota: "primero entra, primero sale" }
  ],

  /* ------------------------------------------------------------------ */
  /* 4) MÓDULOS DE LA INDUCCIÓN                                          */
  /*    Cada módulo tiene: lecciones + una evaluación de 3 preguntas     */
  /*    "actividad" conecta el módulo con una práctica:                  */
  /*    "recepcion" | "peps" | "checklist" | "kpi" | ""  (vacío = sin)   */
  /* ------------------------------------------------------------------ */
  modulos: [

    /* ---------------------------- MÓDULO 1 ---------------------------- */
    {
      id: "m1",
      numero: 1,
      titulo: "La empresa y el local",
      tipo: "Obligatorio",
      icono: "🏪",
      resumen: "Dónde trabajás, cómo funciona un local estandarizado y por qué acá todo se mide.",
      lecciones: [
        {
          titulo: "Una operación estandarizada",
          texto: "McDonald's es una de las cadenas gastronómicas más estandarizadas del mundo: cada tarea del local sigue un procedimiento definido y documentado. Eso significa que casi nada se hace 'como a uno le parece': hay una forma correcta, escrita, que se puede enseñar y controlar.",
          puntos: [
            "Los procedimientos son repetibles: el mismo resultado en cualquier turno.",
            "Cada actividad tiene un responsable claro.",
            "Todo lo importante queda registrado."
          ]
        },
        {
          titulo: "Por qué el stock es tan sensible acá",
          texto: "El local maneja un gran volumen de insumos perecederos, con exigencias de cadena de frío y vencimientos ajustados. Un error de stock impacta directo en dos cosas: el costo y la seguridad alimentaria. Por eso el control de inventario no es una tarea administrativa opcional, es parte esencial de la operación.",
          puntos: [
            "Insumos perecederos: se vencen, no esperan.",
            "Cadena de frío: si se rompe, el producto se descarta.",
            "Alta rotación de personal: la inducción tiene que ser clara y rápida."
          ]
        },
        {
          titulo: "Con quién te vas a relacionar",
          texto: "Tu puesto está en el medio de varias áreas: recibís de Proveedores, coordinás con Compras, entregás a Producción/Cocina, informás a Administración y respondés a Supervisión de Cocina y al Gerente de Local. Calidad e Higiene controla que todo se cumpla.",
          puntos: [
            "Dependés del Supervisor de Cocina y, por encima, del Gerente de Local.",
            "Trabajás con: Compras, Proveedores, Producción, Administración, Calidad e Higiene."
          ]
        }
      ],
      actividad: "",
      evaluacion: [
        {
          pregunta: "¿Por qué el control de stock es esencial en este local y no solo 'papeleo'?",
          opciones: [
            "Porque lo pide la administración una vez al mes",
            "Porque los insumos son perecederos y un error afecta el costo y la seguridad alimentaria",
            "Porque hay que llenar planillas para el archivo"
          ],
          correcta: 1,
          bien: "Exacto: el stock impacta directo en costos y en seguridad alimentaria.",
          mal: "El motivo real es que son insumos perecederos: un error se traduce en pérdida de dinero y en riesgo sanitario."
        },
        {
          pregunta: "¿Qué ventaja tiene que la operación esté estandarizada?",
          opciones: [
            "Que cada uno puede trabajar a su manera",
            "Que los controles son visibles, repetibles y fáciles de enseñar",
            "Que no hacen falta registros"
          ],
          correcta: 1,
          bien: "Correcto. Estandarizar permite enseñar, repetir y controlar.",
          mal: "Al estar estandarizado, el control se vuelve visible y repetible: se puede enseñar y medir."
        },
        {
          pregunta: "¿De quién depende directamente el Encargado de Stock de Cocina?",
          opciones: [
            "Del Supervisor de Cocina",
            "De los proveedores",
            "De nadie, es un puesto independiente"
          ],
          correcta: 0,
          bien: "Así es: Supervisor de Cocina y, por encima, Gerente de Local.",
          mal: "La dependencia es: Gerente de Local → Supervisor de Cocina → Encargado de Stock."
        }
      ]
    },

    /* ---------------------------- MÓDULO 2 ---------------------------- */
    {
      id: "m2",
      numero: 2,
      titulo: "El cargo y sus responsabilidades",
      tipo: "Obligatorio",
      icono: "🧑‍🍳",
      resumen: "Tu objetivo, tus seis funciones y qué se espera que asegures (no solo qué hacés).",
      lecciones: [
        {
          titulo: "Objetivo de tu cargo",
          texto: "Asegurar que todo insumo que ingresa se reciba, registre, conserve y consuma correctamente, evitando pérdidas y faltantes. Dicho más corto: que ningún insumo se pierda, se venza ni falte.",
          puntos: [
            "Sos un puesto operativo, pero con responsabilidad de control.",
            "Tu trabajo se describe por lo que hacés y por lo que asegurás que no falle."
          ]
        },
        {
          titulo: "Tus seis funciones",
          texto: "El ciclo completo del stock pasa por tus manos, de la puerta del local a la olla.",
          puntos: [
            "1. Recibir y cotejar mercadería contra el remito.",
            "2. Registrar los ingresos y etiquetar con fecha.",
            "3. Almacenar aplicando PEPS y cadena de frío.",
            "4. Controlar vencimientos y stock mínimo.",
            "5. Registrar salidas y mermas.",
            "6. Realizar el recuento de inventario."
          ]
        },
        {
          titulo: "Tus errores se miden en plata",
          texto: "Cada función tiene asociado un punto de control y un indicador. Por eso tu desempeño puede evaluarse de forma objetiva, con números y no con percepciones.",
          puntos: [
            "Mermas por vencimiento o mala rotación = dinero perdido.",
            "Quiebres de stock = producción frenada y cliente molesto.",
            "Diferencias de inventario = pérdidas o fallas de registro."
          ]
        }
      ],
      actividad: "",
      evaluacion: [
        {
          pregunta: "¿Cuál es, en una frase, el objetivo de tu cargo?",
          opciones: [
            "Que ningún insumo se pierda, venza ni falte",
            "Comprar lo más barato posible",
            "Cocinar cuando falta personal"
          ],
          correcta: 0,
          bien: "Correcto: recibir, registrar, conservar y consumir bien todo lo que entra.",
          mal: "Tu objetivo es que ningún insumo se pierda, se venza ni falte."
        },
        {
          pregunta: "¿Qué hace que este puesto sea un puesto de control y no solo operativo?",
          opciones: [
            "Que usa uniforme",
            "Que cada tarea tiene un punto de control y un indicador asociado",
            "Que trabaja de noche"
          ],
          correcta: 1,
          bien: "Tal cual: por eso se puede evaluar con indicadores.",
          mal: "Lo que lo vuelve un puesto de control es que cada tarea tiene un punto de control y un indicador."
        },
        {
          pregunta: "¿Cuántas etapas tiene el proceso de stock que está a tu cargo?",
          opciones: ["Tres", "Seis", "Diez"],
          correcta: 1,
          bien: "Seis: recepción, registro, almacenamiento, vencimientos, salidas y recuento.",
          mal: "Son seis etapas: recepción, registro, almacenamiento, vencimientos/stock mínimo, salidas y mermas, y recuento."
        }
      ]
    },

    /* ---------------------------- MÓDULO 3 ---------------------------- */
    {
      id: "m3",
      numero: 3,
      titulo: "Proceso de stock: 6 etapas",
      tipo: "Obligatorio",
      icono: "📦",
      resumen: "De la puerta a la olla. Cada etapa con su punto de control, su registro y su indicador.",
      lecciones: [
        {
          titulo: "1. Recepción de mercadería",
          texto: "Cuando llega el proveedor, cotejá lo que entra contra el remito y la orden de compra: cantidades, calidad, fecha de vencimiento y temperatura. No firmes 'conforme' si algo no coincide.",
          control: "Se firma solo si todo coincide; lo no conforme se rechaza o se reclama.",
          registro: "Remito y orden de compra firmados",
          indicador: "% de discrepancias en recepción"
        },
        {
          titulo: "2. Registro de entrada",
          texto: "Cargá el ingreso en la planilla o el sistema y etiquetá cada producto con la fecha de recepción. Si no quedó registrado, para el control no existe.",
          control: "Todo ingreso queda registrado y etiquetado con fecha.",
          registro: "Planilla o sistema de stock",
          indicador: "Ingresos registrados vs. recibidos"
        },
        {
          titulo: "3. Almacenamiento (PEPS / FIFO)",
          texto: "Guardá cada cosa donde va —seco, refrigerado o congelado— respetando las temperaturas. Lo nuevo atrás y lo viejo adelante: primero se usa lo que entró primero.",
          control: "Rotación PEPS correcta y temperaturas dentro de rango.",
          registro: "Planilla de control de temperaturas",
          indicador: "% de cumplimiento de temperaturas"
        },
        {
          titulo: "4. Control de vencimientos y stock mínimo",
          texto: "Revisá las fechas y apartá lo que está por vencer para usarlo primero. Compará los niveles con el stock mínimo definido: si algo está bajo, hay que reponer antes de quedarse sin.",
          control: "Nada vencido en uso; se repone antes del quiebre.",
          registro: "Listado de vencimientos y stock mínimo",
          indicador: "Cantidad de quiebres de stock"
        },
        {
          titulo: "5. Registro de salidas y mermas",
          texto: "Descontá lo que se usa y registrá las mermas: desperdicio, rotura, producto vencido. Anotar la merma no es delatarse, es dar información para mejorar.",
          control: "Toda salida y merma queda justificada y registrada.",
          registro: "Planilla de mermas",
          indicador: "% de merma sobre compras"
        },
        {
          titulo: "6. Recuento y ajuste (inventario)",
          texto: "Cada cierto tiempo se cuenta físicamente el stock y se compara con lo que dice el sistema. Si hay diferencia, se ajusta y —lo más importante— se busca la causa.",
          control: "La diferencia queda dentro de la tolerancia definida.",
          registro: "Hoja de recuento de inventario",
          indicador: "Diferencia de inventario (%)"
        }
      ],
      actividad: "recepcion",
      evaluacion: [
        {
          pregunta: "El remito dice 30 cajas de papas, pero contás 25 al recibir. ¿Qué hacés?",
          opciones: [
            "Firmo conforme y aviso después",
            "Registro la diferencia y no firmo conforme; reclamo al proveedor",
            "Guardo todo y ya se verá en el inventario"
          ],
          correcta: 1,
          bien: "Exacto. La recepción es el punto de control: se firma solo si coincide.",
          mal: "Si no coincide, no se firma conforme y se registra la diferencia para reclamar."
        },
        {
          pregunta: "Llega mercadería nueva del mismo producto que ya tenés. ¿Dónde la ponés?",
          opciones: [
            "Adelante, para usarla primero",
            "Detrás de la que ya estaba, para usar antes la más vieja",
            "En cualquier lugar libre"
          ],
          correcta: 1,
          bien: "Así es: lo nuevo atrás, se usa primero lo más viejo (PEPS).",
          mal: "Por PEPS, lo nuevo va detrás: primero se usa lo que entró antes."
        },
        {
          pregunta: "En el recuento el sistema dice 100 unidades y contás 80. ¿Qué corresponde?",
          opciones: [
            "Ajustar el sistema a 80 y buscar la causa de la diferencia",
            "Dejar 100 en el sistema, ya aparecerán",
            "Contar de nuevo hasta que dé 100"
          ],
          correcta: 0,
          bien: "Correcto: se ajusta a lo real y se investiga el motivo.",
          mal: "Se ajusta al conteo real y se busca la causa: merma no registrada, error de carga o faltante."
        }
      ]
    },

    /* ---------------------------- MÓDULO 4 ---------------------------- */
    {
      id: "m4",
      numero: 4,
      titulo: "Seguridad e higiene alimentaria",
      tipo: "Obligatorio",
      icono: "🧼",
      resumen: "Cadena de frío, temperaturas, higiene personal y qué hacer ante un producto dudoso.",
      lecciones: [
        {
          titulo: "Cadena de frío: no se negocia",
          texto: "La cadena de frío es mantener el producto siempre dentro de su rango de temperatura, desde el proveedor hasta su uso. Si se corta —aunque sea un rato— el producto puede volverse inseguro incluso si 'se ve bien'.",
          puntos: [
            "Congelado: −18 °C o menos.",
            "Refrigerado: entre 0 y 4 °C.",
            "Depósito seco: 15 a 22 °C, seco y ventilado.",
            "Zona de riesgo: entre 5 y 60 °C las bacterias se multiplican rápido."
          ]
        },
        {
          titulo: "Rutina de temperaturas",
          texto: "Las temperaturas se miden y se anotan: si no está anotado, no hay evidencia de que se controló. Ante un valor fuera de rango, avisá de inmediato al Supervisor de Cocina y no uses el producto hasta que se defina qué hacer.",
          puntos: [
            "Medí y registrá al abrir, durante el turno y al cerrar.",
            "Un valor fuera de rango es una alerta, no un detalle.",
            "Producto dudoso: se separa, se rotula y se consulta. Nunca se usa 'por si acaso'."
          ]
        },
        {
          titulo: "Higiene personal y del depósito",
          texto: "El insumo mejor controlado se contamina igual si el manipuleo es malo. Lavado de manos frecuente, uniforme limpio, pelo cubierto, nada de comer en zona de depósito.",
          puntos: [
            "Lavado de manos al ingresar, entre tareas y después de manipular residuos.",
            "Nada en contacto directo con el piso: todo en estanterías o pallets.",
            "Producto abierto: rotulado con fecha y cerrado correctamente.",
            "Químicos de limpieza siempre separados de los alimentos."
          ]
        }
      ],
      actividad: "checklist",
      evaluacion: [
        {
          pregunta: "¿Cuál es el rango correcto de la heladera (refrigerado)?",
          opciones: ["−18 °C o menos", "Entre 0 y 4 °C", "Entre 10 y 15 °C"],
          correcta: 1,
          bien: "Correcto. Por debajo de eso ya es congelado.",
          mal: "Refrigerado va de 0 a 4 °C: −18 °C es congelado y 10–15 °C es zona de riesgo."
        },
        {
          pregunta: "Encontrás un producto vencido en la heladera en pleno servicio. ¿Qué hacés?",
          opciones: [
            "Retirarlo, no usarlo y registrarlo como merma",
            "Usarlo igual si parece estar bien",
            "Devolverlo a su lugar y avisar mañana"
          ],
          correcta: 0,
          bien: "Así es: se retira, no se usa y se registra como merma con su motivo.",
          mal: "Vencido no se usa: se retira y se registra como merma."
        },
        {
          pregunta: "Los medallones llegan a 12 °C. ¿Qué corresponde?",
          opciones: [
            "Recibirlos y meterlos rápido al freezer",
            "No recibirlos: la cadena de frío se rompió y se reclama",
            "Recibirlos y usarlos primero"
          ],
          correcta: 1,
          bien: "Correcto. Cadena de frío rota: no se recibe y se reclama.",
          mal: "Si llegan fuera de rango, la cadena de frío se rompió: no se reciben y se reclama al proveedor."
        }
      ]
    },

    /* ---------------------------- MÓDULO 5 ---------------------------- */
    {
      id: "m5",
      numero: 5,
      titulo: "Registros y sistema de carga",
      tipo: "Obligatorio",
      icono: "📝",
      resumen: "Qué se anota, dónde se anota y por qué 'si no está registrado, no existe'.",
      lecciones: [
        {
          titulo: "Si no está registrado, no existe",
          texto: "El control de gestión trabaja con datos. Una tarea bien hecha pero no registrada no se puede medir, ni demostrar, ni mejorar. El registro es parte de la tarea, no un extra al final del turno.",
          puntos: [
            "Registrá en el momento, no de memoria al cierre.",
            "Un dato dudoso anotado vale más que un dato perfecto olvidado.",
            "Nunca 'arregles' un registro para que cierre: se corrige y se explica."
          ]
        },
        {
          titulo: "Tus registros del día",
          texto: "Estos son los documentos con los que trabajás. Cada uno alimenta un indicador.",
          puntos: [
            "Remito y orden de compra firmados → % de discrepancias en recepción.",
            "Planilla o sistema de stock (ingresos) → ingresos registrados vs. recibidos.",
            "Planilla de temperaturas → % de cumplimiento de temperaturas.",
            "Listado de vencimientos y stock mínimo → quiebres de stock.",
            "Planilla de mermas → % de merma sobre compras.",
            "Hoja de recuento → diferencia de inventario."
          ]
        },
        {
          titulo: "Cómo cargar bien un movimiento",
          texto: "Cada movimiento necesita cuatro datos mínimos para servir: qué, cuánto, cuándo y por qué. En las mermas, el 'por qué' (motivo) es el dato más valioso: es lo que permite atacar la causa.",
          puntos: [
            "Producto e unidad de medida correcta (no mezcles cajas con unidades).",
            "Cantidad exacta, contada, no estimada.",
            "Fecha y turno.",
            "Motivo en el caso de mermas: vencido, roto, quemado, desperdicio."
          ]
        }
      ],
      actividad: "peps",
      evaluacion: [
        {
          pregunta: "¿Para qué sirve registrar las mermas todos los días?",
          opciones: [
            "Para tener más papeleo",
            "Para controlar costos, calcular el % de merma y encontrar sus causas",
            "Para descontarle el costo a quien la generó"
          ],
          correcta: 1,
          bien: "Tal cual: el dato alimenta el indicador y muestra dónde se pierde plata.",
          mal: "Registrar mermas no castiga a nadie: da el dato para medir y atacar las causas."
        },
        {
          pregunta: "¿Cuál es el dato más valioso al cargar una merma?",
          opciones: ["El motivo", "El nombre del turno anterior", "El precio de venta"],
          correcta: 0,
          bien: "Correcto: el motivo es lo que permite corregir la causa.",
          mal: "El motivo (vencido, roto, quemado, desperdicio) es lo que permite atacar la causa."
        },
        {
          pregunta: "Te olvidaste de registrar un ingreso y ya terminó el turno. ¿Qué hacés?",
          opciones: [
            "Lo dejo así, el inventario lo va a corregir",
            "Lo registro indicando la fecha real y aviso del olvido",
            "Lo cargo con datos aproximados para que cierre"
          ],
          correcta: 1,
          bien: "Bien: se corrige con el dato real y se avisa. Nunca se inventa para que cierre.",
          mal: "Se registra con la fecha real y se avisa. Inventar datos rompe la confiabilidad del inventario."
        }
      ]
    },

    /* ---------------------------- MÓDULO 6 ---------------------------- */
    {
      id: "m6",
      numero: 6,
      titulo: "Indicadores y costos",
      tipo: "Complementario",
      icono: "📊",
      resumen: "Cómo se mide tu trabajo: merma, rotación, quiebres y diferencia de inventario.",
      lecciones: [
        {
          titulo: "El ciclo de control",
          texto: "Control de gestión es un ciclo de cuatro pasos que se repite: se fija un estándar, se mide el resultado real, se calcula el desvío y se define una acción correctiva. Sin acción, medir no sirve para nada.",
          puntos: [
            "ESTÁNDAR: nota mínima 80 %.",
            "MEDICIÓN: resultado real 65 %.",
            "DESVÍO: −15 puntos porcentuales.",
            "ACCIÓN: módulo de refuerzo + práctica supervisada + nueva evaluación."
          ]
        },
        {
          titulo: "Los cuatro indicadores de tu puesto",
          texto: "Convierten la rutina de la cocina en números comparables mes a mes.",
          puntos: [
            "% de merma = merma ÷ compras × 100. Qué parte de lo comprado se pierde.",
            "Rotación de inventario = costo de mercadería usada ÷ stock promedio. Cuántas veces se renueva el stock.",
            "Quiebres de stock = cantidad de veces que faltó un insumo.",
            "Diferencia de inventario = |teórico − físico| ÷ teórico × 100. Cuánto se despega el sistema de la realidad."
          ]
        },
        {
          titulo: "Leer un indicador sin asustarse",
          texto: "Un indicador no es una nota de conducta: es una señal. Lo importante no es el número solo, sino su tendencia y su causa. Rotación baja significa stock parado y plata inmovilizada; rotación muy alta puede significar riesgo de quiebre.",
          puntos: [
            "Mirá la tendencia, no un solo dato aislado.",
            "Todo desvío necesita una causa identificada y una acción.",
            "Un indicador que nadie usa para decidir es un indicador muerto."
          ]
        }
      ],
      actividad: "kpi",
      evaluacion: [
        {
          pregunta: "Un insumo tiene una rotación de inventario muy baja. ¿Qué significa?",
          opciones: [
            "Se vende muy rápido",
            "Hay mercadería inmovilizada que casi no se usa",
            "Falta stock de ese insumo"
          ],
          correcta: 1,
          bien: "Correcto: stock parado, plata inmovilizada y más riesgo de vencimiento.",
          mal: "Rotación baja = mercadería que casi no se mueve: capital inmovilizado y riesgo de vencimiento."
        },
        {
          pregunta: "¿Cómo se calcula el % de merma?",
          opciones: [
            "Merma ÷ compras × 100",
            "Compras ÷ merma × 100",
            "Merma ÷ ventas del día"
          ],
          correcta: 0,
          bien: "Así es: qué parte de lo comprado se perdió.",
          mal: "Es merma ÷ compras × 100: la porción de lo comprado que se perdió."
        },
        {
          pregunta: "Tu evaluación dio 65 % y el estándar es 80 %. ¿Qué corresponde?",
          opciones: [
            "Nada, ya está rendida",
            "Registrar el desvío y hacer módulo de refuerzo + nueva evaluación",
            "Bajar el estándar a 65 %"
          ],
          correcta: 1,
          bien: "Correcto: desvío de −15 puntos → acción correctiva y nueva medición.",
          mal: "Un desvío exige acción correctiva: refuerzo, práctica supervisada y nueva evaluación."
        }
      ]
    }
  ],

  /* ------------------------------------------------------------------ */
  /* 5) PRÁCTICA: SIMULACIÓN DE RECEPCIÓN                                */
  /*    correcta: "recibir"  o  "reclamar"                               */
  /* ------------------------------------------------------------------ */
  recepcion: [
    {
      icono: "🥬", nombre: "Lechuga",
      datos: [["Remito", "20 bolsas"], ["Recibido", "20 bolsas"], ["Estado", "Fresca, sin golpes"]],
      correcta: "recibir",
      bien: "Bien. Cantidad y estado coinciden: se firma conforme.",
      mal: "Acá todo coincide y está en buen estado: corresponde recibir conforme."
    },
    {
      icono: "🍔", nombre: "Medallones de carne",
      datos: [["Remito", "8 cajas"], ["Recibido", "8 cajas"], ["Temperatura", "12 °C ⚠"]],
      correcta: "reclamar",
      bien: "Correcto. Llegaron a 12 °C: la cadena de frío se rompió, no se reciben.",
      mal: "La cantidad está, pero llegaron a 12 °C. Cadena de frío rota: se reclama."
    },
    {
      icono: "🍞", nombre: "Pan de hamburguesa",
      datos: [["Remito", "40 u"], ["Recibido", "40 u"], ["Vence", "en 1 día ⚠"]],
      correcta: "reclamar",
      bien: "Bien visto. Un vencimiento tan corto no sirve para el uso previsto.",
      mal: "Vence en 1 día: es muy poco para usarlo. Se observa y se reclama."
    },
    {
      icono: "🍟", nombre: "Papas congeladas",
      datos: [["Remito", "30 cajas"], ["Recibido", "25 cajas ⚠"], ["Estado", "Ok"]],
      correcta: "reclamar",
      bien: "Exacto. Faltan 5 cajas: no se firma conforme y se registra la diferencia.",
      mal: "Faltan 5 cajas respecto del remito: no se firma conforme, se reclama."
    },
    {
      icono: "🧃", nombre: "Concentrado de gaseosa",
      datos: [["Remito", "12 bidones"], ["Recibido", "12 bidones"], ["Estado", "1 bidón con pérdida ⚠"]],
      correcta: "reclamar",
      bien: "Correcto. Un envase dañado no se recibe conforme: se observa en el remito.",
      mal: "Hay un envase con pérdida: se deja constancia en el remito y se reclama esa unidad."
    },
    {
      icono: "🧀", nombre: "Queso cheddar",
      datos: [["Remito", "15 cajas"], ["Recibido", "15 cajas"], ["Temperatura", "3 °C ✓"]],
      correcta: "recibir",
      bien: "Bien. Cantidad correcta y temperatura dentro de rango (0 a 4 °C).",
      mal: "Todo coincide y 3 °C está dentro del rango de refrigerado: se recibe conforme."
    }
  ],

  /* ------------------------------------------------------------------ */
  /* 6) PRÁCTICA: EJERCICIO PEPS                                         */
  /*    "orden" = posición correcta de uso (1 = se usa primero)          */
  /* ------------------------------------------------------------------ */
  peps: [
    { nombre: "Medallones de carne", vence: "Vence 08/08", orden: 1 },
    { nombre: "Pan de hamburguesa", vence: "Vence 10/08", orden: 2 },
    { nombre: "Queso cheddar", vence: "Vence 12/08", orden: 3 },
    { nombre: "Lechuga", vence: "Vence 14/08", orden: 4 },
    { nombre: "Pepinillos", vence: "Vence 15/08", orden: 5 }
  ],

  /* ------------------------------------------------------------------ */
  /* 7) PRÁCTICA: CHECKLIST DIARIO                                       */
  /* ------------------------------------------------------------------ */
  checklist: [
    ["Revisar temperaturas de heladeras y cámara", "Anotá el valor; deben estar dentro de rango"],
    ["Controlar mercadería próxima a vencer", "Adelantá lo que vence primero (PEPS)"],
    ["Cotejar entregas del día contra remitos", "No firmes conforme si algo no coincide"],
    ["Registrar entradas y etiquetar con fecha", "Todo ingreso queda cargado en el sistema"],
    ["Registrar mermas del servicio", "Desperdicio, rotura o vencido, con su motivo"],
    ["Chequear niveles vs. stock mínimo", "Avisá qué hay que reponer para mañana"],
    ["Ordenar el depósito y dejar nada en el piso", "Todo en estantería o pallet, rotulado"]
  ],

  /* ------------------------------------------------------------------ */
  /* 8) CALCULADORAS DE INDICADORES (KPI)                                */
  /*    No conviene editar las fórmulas si no sabés programar;           */
  /*    los textos y los límites del semáforo sí se pueden cambiar.      */
  /* ------------------------------------------------------------------ */
  kpis: [
    {
      etiqueta: "Desperdicio", titulo: "% de merma",
      ayuda: "Qué parte de lo comprado se pierde.",
      formula: "merma ÷ compras × 100",
      campos: [{ clave: "merma", rotulo: "Merma ($)" }, { clave: "compras", rotulo: "Compras ($)" }],
      calcular: v => v.compras > 0 ? v.merma / v.compras * 100 : null,
      formato: x => x.toFixed(1).replace('.', ',') + ' %',
      semaforo: x => x < 2 ? ["Bajo · bajo control", "bien"] : x <= 5 ? ["Medio · vigilalo", "medio"] : ["Alto · atacar la causa", "mal"]
    },
    {
      etiqueta: "Rotación", titulo: "Rotación de inventario",
      ayuda: "Cuántas veces se renueva el stock.",
      formula: "costo usado ÷ stock promedio",
      campos: [{ clave: "costo", rotulo: "Costo mercadería usada ($)" }, { clave: "prom", rotulo: "Stock promedio ($)" }],
      calcular: v => v.prom > 0 ? v.costo / v.prom : null,
      formato: x => x.toFixed(1).replace('.', ',') + ' veces',
      semaforo: x => x < 2 ? ["Baja · stock inmovilizado", "medio"] : x <= 8 ? ["Saludable", "bien"] : ["Muy alta · riesgo de quiebre", "medio"]
    },
    {
      etiqueta: "Faltantes", titulo: "Quiebres de stock",
      ayuda: "Veces que faltó un insumo en el período.",
      formula: "conteo de faltantes",
      campos: [{ clave: "q", rotulo: "N.º de quiebres" }],
      calcular: v => v.q >= 0 ? v.q : null,
      formato: x => Math.round(x) + (Math.round(x) === 1 ? ' quiebre' : ' quiebres'),
      semaforo: x => x === 0 ? ["Sin faltantes", "bien"] : x <= 2 ? ["Pocos · mejorable", "medio"] : ["Muchos · revisar compras", "mal"]
    },
    {
      etiqueta: "Exactitud", titulo: "Diferencia de inventario",
      ayuda: "Cuánto se despega el sistema de la realidad.",
      formula: "|teórico − físico| ÷ teórico × 100",
      campos: [{ clave: "teo", rotulo: "Stock teórico (sistema)" }, { clave: "fis", rotulo: "Stock físico (contado)" }],
      calcular: v => v.teo > 0 ? Math.abs(v.teo - v.fis) / v.teo * 100 : null,
      formato: x => x.toFixed(1).replace('.', ',') + ' %',
      semaforo: x => x < 2 ? ["Exacto", "bien"] : x <= 5 ? ["Aceptable · revisar", "medio"] : ["Alta · investigar causa", "mal"]
    }
  ],

  /* ------------------------------------------------------------------ */
  /* 9) AUTOEVALUACIÓN FINAL                                             */
  /* ------------------------------------------------------------------ */
  evaluacionFinal: [
    {
      pregunta: "El remito dice 30 cajas de papas, pero contás 25 al recibir. ¿Qué hacés?",
      opciones: ["Firmo conforme y aviso después", "Registro la diferencia y no firmo conforme; reclamo al proveedor", "Guardo todo y ya se verá en el inventario"],
      correcta: 1,
      bien: "Exacto. La recepción es el punto de control: se firma solo si coincide.",
      mal: "Si no coincide, no se firma conforme: se registra la diferencia y se reclama."
    },
    {
      pregunta: "¿Qué significa aplicar PEPS (o FIFO) al guardar la mercadería?",
      opciones: ["Usar primero lo más caro", "Usar primero lo que entró primero", "Usar lo que está adelante, sea nuevo o viejo"],
      correcta: 1,
      bien: "Correcto. Primero entra, primero sale.",
      mal: "PEPS = primero entra, primero sale: lo más viejo se usa antes."
    },
    {
      pregunta: "En pleno servicio encontrás un producto vencido. ¿Qué corresponde?",
      opciones: ["Retirarlo, no usarlo y registrarlo como merma", "Usarlo igual si parece estar bien", "Devolverlo a su lugar y avisar mañana"],
      correcta: 0,
      bien: "Así es: se retira, no se usa y se registra como merma.",
      mal: "Vencido no se usa: se retira y se registra como merma con su motivo."
    },
    {
      pregunta: "¿Para qué sirve registrar las mermas todos los días?",
      opciones: ["Para tener más papeleo", "Para controlar costos, calcular el % de merma y encontrar sus causas", "Para descontarle el costo a quien la generó"],
      correcta: 1,
      bien: "Tal cual. La merma registrada alimenta el indicador.",
      mal: "Da el dato para medir el % de merma y atacar sus causas."
    },
    {
      pregunta: "¿Cuál es el rango de temperatura correcto para la heladera?",
      opciones: ["−18 °C o menos", "Entre 0 y 4 °C", "Entre 10 y 15 °C"],
      correcta: 1,
      bien: "Correcto. El refrigerado va de 0 a 4 °C.",
      mal: "Refrigerado: 0 a 4 °C. −18 °C es congelado y 10–15 °C es zona de riesgo."
    },
    {
      pregunta: "¿Para qué sirve tener definido un stock mínimo?",
      opciones: ["Para comprar siempre la misma cantidad", "Para saber cuándo reponer antes de quedarse sin", "Para llenar todo el depósito"],
      correcta: 1,
      bien: "Tal cual: es la alarma que avisa antes del quiebre.",
      mal: "Marca el punto en que hay que reponer para no quedarse sin insumo."
    },
    {
      pregunta: "Llega mercadería nueva del mismo producto que ya tenés. ¿Dónde la ponés?",
      opciones: ["Adelante, para usarla primero", "Detrás de la que ya estaba", "En cualquier lugar libre"],
      correcta: 1,
      bien: "Así es: lo nuevo atrás.",
      mal: "Lo nuevo va detrás de lo viejo, por PEPS."
    },
    {
      pregunta: "En el recuento el sistema dice 100 y contás 80. ¿Qué hacés?",
      opciones: ["Ajusto a 80 y busco la causa", "Dejo 100, ya aparecerán", "Cuento hasta que dé 100"],
      correcta: 0,
      bien: "Correcto: se ajusta a lo real y se investiga.",
      mal: "Se ajusta al conteo real y se busca la causa de la diferencia."
    },
    {
      pregunta: "¿Cuál de estos es un ejemplo de merma?",
      opciones: ["Una hamburguesa que se vendió", "Papas que se quemaron y se tiraron", "Un insumo que sigue en stock"],
      correcta: 1,
      bien: "Exacto: producto que se pierde sin venderse.",
      mal: "Merma es lo que se pierde sin venderse: quemado, roto, vencido o desperdiciado."
    },
    {
      pregunta: "Un insumo tiene rotación de inventario muy baja. ¿Qué significa?",
      opciones: ["Se vende muy rápido", "Hay mercadería inmovilizada que casi no se usa", "Falta stock de ese insumo"],
      correcta: 1,
      bien: "Correcto: stock parado y riesgo de vencimiento.",
      mal: "Rotación baja = mercadería que casi no se mueve."
    },
    {
      pregunta: "Los medallones llegan a 12 °C con la cantidad correcta. ¿Qué hacés?",
      opciones: ["Recibo conforme, la cantidad está bien", "No recibo: cadena de frío rota, y reclamo", "Recibo y los uso primero"],
      correcta: 1,
      bien: "Correcto. La temperatura también es parte del control de recepción.",
      mal: "Aunque la cantidad esté bien, la cadena de frío se rompió: no se recibe."
    },
    {
      pregunta: "Tu evaluación dio 65 % y el estándar es 80 %. ¿Qué pasa según el ciclo de control?",
      opciones: ["Nada", "Se registra el desvío y se hace un refuerzo con nueva evaluación", "Se baja el estándar"],
      correcta: 1,
      bien: "Exacto: estándar → medición → desvío → acción correctiva.",
      mal: "Un desvío exige acción: refuerzo, práctica supervisada y nueva evaluación."
    }
  ]
};

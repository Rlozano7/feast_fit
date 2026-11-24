// Catálogo de ejercicios.
// Las imágenes vienen de free-exercise-db (dominio público): cada ejercicio
// tiene dos fotos (inicio y final) que la app alterna para animar el movimiento.
const IMG = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises'

const RAW = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises'

export const imagesFor = (id) => [`${IMG}/${id}/0.jpg`, `${IMG}/${id}/1.jpg`]
// Respaldo si el CDN no responde
export const fallbackImagesFor = (id) => [`${RAW}/${id}/0.jpg`, `${RAW}/${id}/1.jpg`]

// lugar: dónde se puede hacer. 'casa' = sin equipo o con mancuernas/ligas.
const E = (id, nombre, grupo, lugar, equipo, pasos) => ({ id, nombre, grupo, lugar, equipo, pasos })

export const EXERCISES = [
  // ---------- Pecho ----------
  E('Pushups', 'Lagartijas', 'pecho', ['casa', 'gimnasio'], 'Peso corporal', [
    'Manos un poco más abiertas que los hombros, cuerpo recto de cabeza a talones.',
    'Baja controlando hasta casi tocar el piso con el pecho.',
    'Empuja el piso para subir sin dejar caer la cadera.',
  ]),
  E('Dumbbell_Floor_Press', 'Press de piso con mancuernas', 'pecho', ['casa'], 'Mancuernas', [
    'Acostado en el piso con rodillas flexionadas y una mancuerna en cada mano.',
    'Baja hasta que los codos toquen suavemente el piso.',
    'Empuja hacia arriba juntando ligeramente las mancuernas.',
  ]),
  E('Barbell_Bench_Press_-_Medium_Grip', 'Press de banca con barra', 'pecho', ['gimnasio'], 'Barra', [
    'Escápulas juntas y pies firmes en el piso.',
    'Baja la barra a la parte media del pecho con los codos a unos 45°.',
    'Empuja hasta extender los brazos sin despegar la espalda.',
  ]),
  E('Incline_Dumbbell_Press', 'Press inclinado con mancuernas', 'pecho', ['gimnasio'], 'Mancuernas y banco', [
    'Banco a 30–45°, mancuernas a la altura del pecho.',
    'Empuja hacia arriba y adentro sin chocar las mancuernas.',
    'Baja lento hasta sentir estiramiento en el pecho.',
  ]),
  E('Cable_Crossover', 'Cruce de poleas', 'pecho', ['gimnasio'], 'Poleas', [
    'Un pie adelante, torso ligeramente inclinado.',
    'Junta las manos al frente en arco, con los codos un poco flexionados.',
    'Regresa despacio sintiendo el estiramiento.',
  ]),
  E('Dips_-_Chest_Version', 'Fondos en paralelas', 'pecho', ['gimnasio'], 'Paralelas', [
    'Inclina el torso hacia adelante para trabajar más pecho.',
    'Baja hasta que los hombros queden a la altura de los codos.',
    'Sube empujando sin bloquear los codos de golpe.',
  ]),

  // ---------- Espalda ----------
  E('Superman', 'Superman', 'espalda', ['casa', 'gimnasio'], 'Peso corporal', [
    'Boca abajo con brazos estirados al frente.',
    'Levanta a la vez brazos, pecho y piernas unos centímetros.',
    'Sostén un segundo arriba y baja controlando.',
  ]),
  E('Inverted_Row', 'Remo invertido', 'espalda', ['casa', 'gimnasio'], 'Mesa firme o barra baja', [
    'Cuélgate debajo de una barra o mesa firme con el cuerpo recto.',
    'Jala el pecho hacia la barra apretando las escápulas.',
    'Baja lento hasta estirar los brazos.',
  ]),
  E('One-Arm_Dumbbell_Row', 'Remo a una mano', 'espalda', ['casa', 'gimnasio'], 'Mancuerna', [
    'Apoya mano y rodilla en un banco o silla, espalda plana.',
    'Jala la mancuerna hacia la cadera, no hacia el hombro.',
    'Baja estirando el brazo por completo.',
  ]),
  E('Bent_Over_Two-Dumbbell_Row', 'Remo inclinado con mancuernas', 'espalda', ['casa', 'gimnasio'], 'Mancuernas', [
    'Inclínate desde la cadera con la espalda recta y rodillas flojas.',
    'Lleva ambas mancuernas hacia la cintura.',
    'Aprieta la espalda arriba y baja controlando.',
  ]),
  E('Pullups', 'Dominadas', 'espalda', ['gimnasio'], 'Barra fija', [
    'Agarre un poco más abierto que los hombros.',
    'Sube llevando el pecho hacia la barra, sin balancearte.',
    'Baja hasta estirar los brazos por completo.',
  ]),
  E('Wide-Grip_Lat_Pulldown', 'Jalón al pecho', 'espalda', ['gimnasio'], 'Polea alta', [
    'Agarre abierto, pecho alto y ligera inclinación hacia atrás.',
    'Lleva la barra a la parte alta del pecho bajando los codos.',
    'Regresa lento hasta estirar los dorsales.',
  ]),
  E('Seated_Cable_Rows', 'Remo sentado en polea', 'espalda', ['gimnasio'], 'Polea baja', [
    'Espalda recta, rodillas ligeramente flexionadas.',
    'Jala el agarre hacia el abdomen apretando escápulas.',
    'Estira los brazos sin redondear la espalda.',
  ]),
  E('Barbell_Deadlift', 'Peso muerto', 'espalda', ['gimnasio'], 'Barra', [
    'Barra pegada a las espinillas, espalda neutra y pecho arriba.',
    'Empuja el piso con las piernas y extiende la cadera.',
    'Baja la barra rozando las piernas, sin redondear la espalda.',
  ]),
  E('Face_Pull', 'Face pull', 'hombro', ['gimnasio'], 'Polea con cuerda', [
    'Polea a la altura de la cara, agarre con cuerda.',
    'Jala hacia la frente abriendo los codos hacia afuera.',
    'Regresa lento; ideal para la salud del hombro.',
  ]),

  // ---------- Piernas ----------
  E('Bodyweight_Squat', 'Sentadilla libre', 'piernas', ['casa', 'gimnasio'], 'Peso corporal', [
    'Pies al ancho de hombros, puntas un poco hacia afuera.',
    'Baja como si te sentaras atrás, rodillas en línea con los pies.',
    'Sube empujando con los talones.',
  ]),
  E('Goblet_Squat', 'Sentadilla goblet', 'piernas', ['casa', 'gimnasio'], 'Mancuerna o pesa rusa', [
    'Sostén la pesa pegada al pecho con ambas manos.',
    'Baja manteniendo el torso erguido y los codos entre las rodillas.',
    'Sube apretando glúteos.',
  ]),
  E('Bodyweight_Walking_Lunge', 'Zancadas caminando', 'piernas', ['casa', 'gimnasio'], 'Peso corporal', [
    'Da un paso largo y baja hasta que ambas rodillas formen 90°.',
    'La rodilla de atrás casi toca el piso.',
    'Empuja con la pierna de adelante y avanza con la otra.',
  ]),
  E('Split_Squats', 'Sentadilla búlgara', 'piernas', ['casa', 'gimnasio'], 'Silla o banco', [
    'Pie trasero apoyado en una silla o banco.',
    'Baja vertical hasta que el muslo de adelante quede paralelo al piso.',
    'Sube empujando con el talón delantero.',
  ]),
  E('Dumbbell_Step_Ups', 'Subidas al cajón', 'piernas', ['casa', 'gimnasio'], 'Escalón o banco', [
    'Sube todo el pie al escalón.',
    'Empuja con esa pierna hasta quedar de pie arriba.',
    'Baja controlando y alterna.',
  ]),
  E('Barbell_Squat', 'Sentadilla con barra', 'piernas', ['gimnasio'], 'Barra y rack', [
    'Barra sobre trapecios, abdomen firme.',
    'Baja hasta que la cadera quede a la altura de las rodillas o más abajo.',
    'Sube sin que las rodillas se vayan hacia adentro.',
  ]),
  E('Leg_Press', 'Prensa de piernas', 'piernas', ['gimnasio'], 'Máquina', [
    'Pies al centro de la plataforma, espalda pegada al respaldo.',
    'Baja hasta 90° de rodilla sin despegar la cadera.',
    'Empuja sin bloquear las rodillas.',
  ]),
  E('Leg_Extensions', 'Extensión de cuádriceps', 'piernas', ['gimnasio'], 'Máquina', [
    'Ajusta el rodillo justo arriba de los tobillos.',
    'Extiende las piernas y aprieta arriba un segundo.',
    'Baja lento.',
  ]),
  E('Lying_Leg_Curls', 'Curl femoral acostado', 'piernas', ['gimnasio'], 'Máquina', [
    'Boca abajo con el rodillo detrás de los tobillos.',
    'Flexiona las rodillas llevando los talones a los glúteos.',
    'Regresa sin dejar caer el peso.',
  ]),
  E('Romanian_Deadlift', 'Peso muerto rumano', 'gluteo', ['casa', 'gimnasio'], 'Barra o mancuernas', [
    'Rodillas ligeramente flexionadas, espalda recta.',
    'Lleva la cadera hacia atrás bajando el peso por las piernas.',
    'Sube apretando glúteos cuando sientas el estiramiento femoral.',
  ]),
  E('Rocking_Standing_Calf_Raise', 'Elevación de talones', 'piernas', ['casa', 'gimnasio'], 'Peso corporal', [
    'De pie, con apoyo ligero para el equilibrio.',
    'Sube a puntas lo más alto que puedas.',
    'Baja lento hasta estirar las pantorrillas.',
  ]),

  // ---------- Glúteo ----------
  E('Butt_Lift_Bridge', 'Puente de glúteo', 'gluteo', ['casa', 'gimnasio'], 'Peso corporal', [
    'Acostado boca arriba, rodillas flexionadas y pies firmes.',
    'Eleva la cadera apretando glúteos hasta formar una línea recta.',
    'Baja sin llegar a descansar en el piso.',
  ]),
  E('Single_Leg_Glute_Bridge', 'Puente a una pierna', 'gluteo', ['casa', 'gimnasio'], 'Peso corporal', [
    'Igual que el puente, pero con una pierna estirada al aire.',
    'Sube la cadera sin que se incline hacia un lado.',
    'Haz todas las repeticiones y cambia de pierna.',
  ]),
  E('Barbell_Hip_Thrust', 'Hip thrust con barra', 'gluteo', ['gimnasio'], 'Barra y banco', [
    'Espalda alta apoyada en el banco, barra sobre la cadera.',
    'Empuja la cadera hacia arriba hasta quedar paralelo al piso.',
    'Aprieta un segundo arriba y baja controlando.',
  ]),

  // ---------- Hombro ----------
  E('Dumbbell_Shoulder_Press', 'Press de hombro con mancuernas', 'hombro', ['casa', 'gimnasio'], 'Mancuernas', [
    'Mancuernas a la altura de las orejas, abdomen firme.',
    'Empuja hacia arriba sin arquear la espalda baja.',
    'Baja hasta la altura de las orejas.',
  ]),
  E('Side_Lateral_Raise', 'Elevaciones laterales', 'hombro', ['casa', 'gimnasio'], 'Mancuernas', [
    'Codos ligeramente flexionados.',
    'Sube los brazos a los lados hasta la altura de los hombros.',
    'Baja lento; evita impulsarte con el cuerpo.',
  ]),
  E('Arnold_Dumbbell_Press', 'Press Arnold', 'hombro', ['gimnasio'], 'Mancuernas', [
    'Empieza con las palmas hacia ti frente al pecho.',
    'Gira las muñecas mientras empujas hacia arriba.',
    'Regresa girando a la posición inicial.',
  ]),
  E('Band_Pull_Apart', 'Aperturas con liga', 'hombro', ['casa', 'gimnasio'], 'Liga de resistencia', [
    'Sostén la liga frente al pecho con brazos estirados.',
    'Ábrela hacia los lados juntando las escápulas.',
    'Regresa sin perder la tensión.',
  ]),

  // ---------- Brazos ----------
  E('Dumbbell_Bicep_Curl', 'Curl de bíceps', 'brazos', ['casa', 'gimnasio'], 'Mancuernas', [
    'Codos pegados al cuerpo.',
    'Sube las mancuernas girando las palmas hacia ti.',
    'Baja lento sin balancear el torso.',
  ]),
  E('Hammer_Curls', 'Curl martillo', 'brazos', ['casa', 'gimnasio'], 'Mancuernas', [
    'Palmas mirándose entre sí.',
    'Sube sin mover los codos.',
    'Baja controlando.',
  ]),
  E('Bench_Dips', 'Fondos en silla', 'brazos', ['casa', 'gimnasio'], 'Silla o banco', [
    'Manos en el borde de una silla firme, piernas al frente.',
    'Baja doblando los codos hacia atrás hasta unos 90°.',
    'Empuja hasta estirar los brazos.',
  ]),
  E('Triceps_Pushdown_-_Rope_Attachment', 'Extensión de tríceps en polea', 'brazos', ['gimnasio'], 'Polea con cuerda', [
    'Codos pegados al cuerpo.',
    'Empuja la cuerda hacia abajo y ábrela al final.',
    'Sube sin despegar los codos.',
  ]),
  E('EZ-Bar_Skullcrusher', 'Rompecráneos', 'brazos', ['gimnasio'], 'Barra Z', [
    'Acostado, brazos estirados sobre el pecho.',
    'Baja la barra hacia la frente doblando solo los codos.',
    'Extiende de nuevo.',
  ]),

  // ---------- Core ----------
  E('Plank', 'Plancha', 'core', ['casa', 'gimnasio'], 'Peso corporal', [
    'Apoyado en antebrazos y puntas, cuerpo recto.',
    'Aprieta abdomen y glúteos; no dejes caer la cadera.',
    'Sostén el tiempo indicado respirando normal.',
  ]),
  E('Side_Bridge', 'Plancha lateral', 'core', ['casa', 'gimnasio'], 'Peso corporal', [
    'Apoyado en un antebrazo, pies uno sobre otro.',
    'Eleva la cadera hasta formar una línea recta.',
    'Sostén y cambia de lado.',
  ]),
  E('Dead_Bug', 'Dead bug', 'core', ['casa', 'gimnasio'], 'Peso corporal', [
    'Boca arriba, brazos al techo y rodillas a 90°.',
    'Estira brazo y pierna contrarios sin despegar la espalda baja.',
    'Regresa y alterna.',
  ]),
  E('Russian_Twist', 'Giro ruso', 'core', ['casa', 'gimnasio'], 'Peso corporal o disco', [
    'Sentado con el torso inclinado hacia atrás y pies elevados.',
    'Gira el torso llevando las manos de un lado al otro.',
    'Mantén el pecho alto.',
  ]),
  E('Reverse_Crunch', 'Crunch inverso', 'core', ['casa', 'gimnasio'], 'Peso corporal', [
    'Boca arriba con las rodillas flexionadas al aire.',
    'Lleva las rodillas al pecho despegando la cadera.',
    'Baja lento sin impulso.',
  ]),
  E('Flutter_Kicks', 'Patadas de tijera', 'core', ['casa', 'gimnasio'], 'Peso corporal', [
    'Boca arriba, manos bajo los glúteos.',
    'Piernas estiradas a unos centímetros del piso.',
    'Alterna arriba y abajo con movimientos cortos.',
  ]),
  E('Hanging_Leg_Raise', 'Elevación de piernas colgado', 'core', ['gimnasio'], 'Barra fija', [
    'Cuelga de la barra con agarre firme.',
    'Sube las piernas sin balancearte.',
    'Baja controlando.',
  ]),
  E('Cable_Crunch', 'Crunch en polea', 'core', ['gimnasio'], 'Polea alta con cuerda', [
    'De rodillas frente a la polea, cuerda a los lados de la cabeza.',
    'Enrolla el torso llevando los codos a los muslos.',
    'Regresa lento.',
  ]),

  // ---------- Cardio / acondicionamiento ----------
  E('Mountain_Climbers', 'Escaladores', 'cardio', ['casa', 'gimnasio'], 'Peso corporal', [
    'Posición de lagartija con brazos estirados.',
    'Lleva una rodilla al pecho y alterna rápido.',
    'Mantén la cadera baja.',
  ]),
  E('One-Arm_Kettlebell_Swings', 'Swing con pesa rusa', 'cardio', ['casa', 'gimnasio'], 'Pesa rusa', [
    'Pies abiertos, pesa entre las piernas.',
    'Lleva la cadera atrás y luego empuja fuerte hacia adelante.',
    'La pesa sube por el impulso de la cadera, no de los brazos.',
  ]),
  E('Air_Bike', 'Bicicleta abdominal', 'core', ['casa', 'gimnasio'], 'Peso corporal', [
    'Boca arriba, manos detrás de la cabeza.',
    'Lleva el codo a la rodilla contraria mientras estiras la otra pierna.',
    'Alterna con ritmo constante.',
  ]),

  // ---------- Máquinas y poleas del gimnasio ----------
  E('Machine_Bench_Press', 'Press de pecho en máquina', 'pecho', ['gimnasio'], 'Máquina', [
    'Ajusta el asiento para que las agarraderas queden a la altura del pecho.',
    'Empuja hacia el frente hasta casi estirar los brazos, sin bloquear los codos.',
    'Regresa lento hasta sentir el estiramiento en el pecho.',
  ]),
  E('Leverage_Incline_Chest_Press', 'Press inclinado en máquina', 'pecho', ['gimnasio'], 'Máquina', [
    'Espalda bien apoyada y agarraderas a la altura de la parte alta del pecho.',
    'Empuja hacia arriba y al frente con control.',
    'Baja despacio sin dejar que el peso golpee.',
  ]),
  E('Butterfly', 'Aperturas en máquina (peck deck)', 'pecho', ['gimnasio'], 'Máquina', [
    'Siéntate con la espalda pegada al respaldo y los codos ligeramente flexionados.',
    'Junta los brazos al frente apretando el pecho.',
    'Abre lento hasta sentir el estiramiento, sin pasar la línea de los hombros.',
  ]),
  E('Leverage_Iso_Row', 'Remo en máquina', 'espalda', ['gimnasio'], 'Máquina', [
    'Pecho apoyado en el cojín y brazos estirados al frente.',
    'Jala llevando los codos hacia atrás y juntando las escápulas.',
    'Regresa lento hasta estirar los brazos.',
  ]),
  E('V-Bar_Pulldown', 'Jalón con agarre cerrado', 'espalda', ['gimnasio'], 'Polea alta con triángulo', [
    'Siéntate con los muslos fijos bajo los cojines y toma el triángulo.',
    'Jala hacia la parte alta del pecho inclinándote apenas hacia atrás.',
    'Sube controlando hasta estirar los brazos.',
  ]),
  E('Straight-Arm_Pulldown', 'Pullover en polea', 'espalda', ['gimnasio'], 'Polea alta', [
    'De pie frente a la polea, brazos casi estirados y torso un poco inclinado.',
    'Baja la barra en arco hasta los muslos usando la espalda.',
    'Sube lento sin doblar los codos.',
  ]),
  E('Machine_Shoulder_Military_Press', 'Press de hombro en máquina', 'hombro', ['gimnasio'], 'Máquina', [
    'Ajusta el asiento para que las agarraderas queden a la altura de los hombros.',
    'Empuja hacia arriba sin arquear la espalda baja.',
    'Baja controlando hasta la altura de las orejas.',
  ]),
  E('Reverse_Machine_Flyes', 'Deltoide posterior en máquina', 'hombro', ['gimnasio'], 'Máquina (peck deck)', [
    'Siéntate de frente al respaldo con los brazos estirados al frente.',
    'Abre los brazos hacia atrás apretando la parte de atrás del hombro.',
    'Regresa lento sin soltar la tensión.',
  ]),
  E('Hack_Squat', 'Sentadilla hack', 'piernas', ['gimnasio'], 'Máquina', [
    'Espalda y hombros pegados a los cojines, pies a lo ancho de la cadera.',
    'Baja doblando las rodillas hasta que los muslos queden paralelos.',
    'Empuja con todo el pie para subir sin bloquear las rodillas.',
  ]),
  E('Smith_Machine_Squat', 'Sentadilla en máquina Smith', 'piernas', ['gimnasio'], 'Máquina Smith', [
    'Barra sobre la parte alta de la espalda y pies un poco adelante.',
    'Baja llevando la cadera atrás con el pecho arriba.',
    'Sube empujando con los talones.',
  ]),
  E('Seated_Leg_Curl', 'Curl femoral sentado', 'piernas', ['gimnasio'], 'Máquina', [
    'Rodillas alineadas con el eje de la máquina y cojín sobre los tobillos.',
    'Dobla las rodillas llevando los talones hacia abajo y atrás.',
    'Regresa lento sin dejar caer el peso.',
  ]),
  E('Seated_Calf_Raise', 'Pantorrilla sentado en máquina', 'piernas', ['gimnasio'], 'Máquina', [
    'Puntas de los pies en la plataforma y cojín sobre los muslos.',
    'Sube los talones lo más alto posible y aprieta un segundo.',
    'Baja hasta sentir el estiramiento de la pantorrilla.',
  ]),
  E('Thigh_Adductor', 'Aductores en máquina', 'piernas', ['gimnasio'], 'Máquina', [
    'Siéntate con la espalda apoyada y las piernas abiertas contra los cojines.',
    'Junta las piernas apretando la parte interna del muslo.',
    'Abre lento sin pasar tu rango cómodo.',
  ]),
  E('Thigh_Abductor', 'Abductores en máquina', 'gluteo', ['gimnasio'], 'Máquina', [
    'Siéntate con las piernas juntas y los cojines por fuera de las rodillas.',
    'Abre las piernas empujando con la parte externa de la cadera.',
    'Regresa despacio.',
  ]),
  E('Machine_Bicep_Curl', 'Curl de bíceps en máquina', 'brazos', ['gimnasio'], 'Máquina', [
    'Brazos apoyados en el cojín y codos alineados con el eje.',
    'Sube doblando los codos y aprieta el bíceps arriba.',
    'Baja lento hasta casi estirar.',
  ]),
  E('Standing_Biceps_Cable_Curl', 'Curl de bíceps en polea', 'brazos', ['gimnasio'], 'Polea baja', [
    'De pie frente a la polea, codos pegados al cuerpo.',
    'Sube la barra doblando solo los codos.',
    'Baja controlando sin mover los hombros.',
  ]),
  E('Machine_Triceps_Extension', 'Extensión de tríceps en máquina', 'brazos', ['gimnasio'], 'Máquina', [
    'Codos apoyados en el cojín y alineados con el eje.',
    'Estira los brazos empujando hacia abajo.',
    'Regresa lento hasta que los codos queden a 90°.',
  ]),
  E('Ab_Crunch_Machine', 'Abdominales en máquina', 'core', ['gimnasio'], 'Máquina', [
    'Siéntate con los pies bajo los rodillos y toma las agarraderas.',
    'Enrolla el torso hacia adelante apretando el abdomen.',
    'Regresa lento sin soltar la tensión.',
  ]),
]

export const EX_BY_ID = Object.fromEntries(EXERCISES.map((e) => [e.id, e]))

export const GROUP_LABEL = {
  pecho: 'Pecho', espalda: 'Espalda', piernas: 'Piernas', gluteo: 'Glúteo',
  hombro: 'Hombro', brazos: 'Brazos', core: 'Abdomen', cardio: 'Cardio',
}

export const exercisesFor = (place) => EXERCISES.filter((e) => e.lugar.includes(place))

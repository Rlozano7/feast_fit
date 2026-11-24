# Carga

App para registrar tus entrenamientos de fuerza: series, kilos, repeticiones y RPE, con tu historial y tu progreso en cada ejercicio.

Usa **el mismo proyecto de Supabase que Tráguese ese sapo**: entras con el mismo correo y contraseña, y lo que entrenes también cuenta en el progreso de esa app (y marca el hábito "Entrenar" del día).

## Qué incluye

- **Entrenar**: al abrir una rutina puedes revisarla y ajustarla; el cronómetro empieza al presionar **Iniciar rutina**. Columnas columnas Serie · Anterior · Kg · Reps · RPE · ✓. Lo de la vez pasada aparece como sugerencia; tócalo para copiarlo, o marca ✓ sin escribir y se llena solo.
- Descanso con cuenta regresiva, sonido y vibración (+15 s o saltar). La pantalla no se apaga mientras entrenas.
- Agregar o quitar series y ejercicios sobre la marcha, mover ejercicios, notas por ejercicio.
- Si cierras la app a media rutina, al volver sigue donde la dejaste.
- Al terminar: resumen con tiempo, volumen, mejor serie de cada ejercicio y **récords nuevos**.
- **Rutinas**: arma las tuyas (series, reps, descanso, notas) y empiézalas con un toque. Un entrenamiento libre se puede guardar como rutina.
- También muestra la **rutina del mes del Coach** de Tráguese ese sapo para empezarla desde aquí.
- **Historial** por mes, con el detalle de cada serie; puedes repetir o borrar un entrenamiento.
- **Perfil**: calendario de los días que entrenaste (toca un día para ver ese entrenamiento), racha de semanas, tiempo y volumen total, y **tus medidas** (peso, grasa, músculo, cintura, etc.) con gráfica y línea de meta. Usa la misma tabla de medidas de Tráguese ese sapo.
- **Ejercicios**: 67 ejercicios con animación y técnica (incluye 18 máquinas y poleas). Cada uno tiene récords y gráfica de progreso (1RM estimado, peso máximo, volumen y reps).

## Puesta en marcha (unos 10 minutos)

### 1. Supabase (el que ya tienes)

1. Entra a tu proyecto de Supabase → **SQL Editor → New query**.
2. Pega todo el contenido de `supabase/carga.sql` y presiona **Run**. Solo crea la tabla de rutinas propias; no toca nada de lo que ya existe.
3. Cuando tengas la dirección de Netlify (paso 2), ve a **Authentication → URL Configuration → Redirect URLs** y agrégala (por ejemplo `https://carga-raul.netlify.app`). Solo hace falta para "Olvidé mi contraseña".

### 2. Netlify

1. Sube esta carpeta a un repositorio de GitHub (o usa Netlify CLI).
2. En Netlify: **Add new site → Import an existing project**. La configuración ya viene en `netlify.toml`.
3. En **Site configuration → Environment variables** agrega los **mismos valores** de Tráguese ese sapo:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. **Deploys → Trigger deploy**.

Esta app no usa funciones ni la clave de Claude, así que también puedes correr `npm install && npm run build` y arrastrar la carpeta `dist` a Netlify (pero primero crea un archivo `.env` con las dos variables).

### 3. En tu celular

Abre la dirección en el navegador y elige **Agregar a pantalla de inicio**. Se abre como app, a pantalla completa.

### Probar en tu computadora

```bash
cp .env.example .env   # y llena los dos valores
npm install
npm run dev
```

## Estructura

```
supabase/carga.sql          Tabla de rutinas propias (workout_templates)
src/pages/Workout.jsx       Entrenamiento en curso y resumen final
src/pages/Templates*.jsx    Lista y editor de rutinas
src/pages/History.jsx       Historial (y WorkoutDetail.jsx para el detalle)
src/pages/Exercise*.jsx     Catálogo y progreso por ejercicio
src/lib/workout.js          Guardado, historial, récords y entrenamiento en curso
src/lib/exercises.js        Catálogo de ejercicios en español
```

Los entrenamientos se guardan en la tabla `workouts` (la misma de Tráguese ese sapo). Cada serie guarda `kg`, `reps`, `rpe` y si se marcó como hecha.

## Créditos

Imágenes de ejercicios: [free-exercise-db](https://github.com/yuhonas/free-exercise-db), dominio público.

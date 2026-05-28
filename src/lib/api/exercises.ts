/**
 * Bundled exercise library. Stable text ids are referenced by
 * routine_exercises.exercise_id and set_logs.exercise_id. The library lives
 * in code (not Supabase) so new exercises ship via app updates and survive
 * the user being offline.
 *
 * Sources: ACSM training guidelines, NSCA Essentials, ExRx public-domain
 * exercise database. Equipment codes are normalised to a small vocabulary
 * so routine generators can filter by what the user has.
 */

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'core'
  | 'cardio';

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'cable'
  | 'machine'
  | 'bodyweight'
  | 'kettlebell'
  | 'bench'
  | 'pull_up_bar'
  | 'cardio_machine';

export type MovementPattern =
  | 'horizontal_push'
  | 'vertical_push'
  | 'horizontal_pull'
  | 'vertical_pull'
  | 'squat'
  | 'hinge'
  | 'lunge'
  | 'isolation'
  | 'core'
  | 'cardio';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  name: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment[];
  pattern: MovementPattern;
  difficulty: Difficulty;
  isCompound: boolean;
  instructions: string;
}

export const EXERCISES: Exercise[] = [
  // ----- SQUAT / QUAD-DOMINANT -----
  { id: 'back-squat',      name: 'Back squat',          primaryMuscle: 'quads',      secondaryMuscles: ['glutes', 'hamstrings', 'core'], equipment: ['barbell'],                pattern: 'squat',          difficulty: 'intermediate', isCompound: true,  instructions: 'Bar on upper back. Brace, descend until thighs roughly parallel, drive through mid-foot.' },
  { id: 'front-squat',     name: 'Front squat',         primaryMuscle: 'quads',      secondaryMuscles: ['core', 'glutes'],               equipment: ['barbell'],                pattern: 'squat',          difficulty: 'advanced',     isCompound: true,  instructions: 'Bar on front delts in clean rack. Elbows high, upright torso, descend deep.' },
  { id: 'goblet-squat',    name: 'Goblet squat',        primaryMuscle: 'quads',      secondaryMuscles: ['glutes', 'core'],               equipment: ['dumbbell', 'kettlebell'], pattern: 'squat',          difficulty: 'beginner',     isCompound: true,  instructions: 'Hold a dumbbell at chest. Squat below parallel keeping torso vertical.' },
  { id: 'leg-press',       name: 'Leg press',           primaryMuscle: 'quads',      secondaryMuscles: ['glutes', 'hamstrings'],         equipment: ['machine'],                pattern: 'squat',          difficulty: 'beginner',     isCompound: true,  instructions: 'Press weight away with feet shoulder-width. Knees track over toes.' },
  { id: 'bulgarian-split', name: 'Bulgarian split squat', primaryMuscle: 'quads',    secondaryMuscles: ['glutes', 'hamstrings'],         equipment: ['dumbbell', 'bench'],      pattern: 'lunge',          difficulty: 'intermediate', isCompound: true,  instructions: 'Rear foot on bench, front foot ~2 feet ahead. Descend until front knee bends ~90°.' },
  { id: 'walking-lunge',   name: 'Walking lunge',       primaryMuscle: 'quads',      secondaryMuscles: ['glutes', 'hamstrings'],         equipment: ['dumbbell', 'bodyweight'], pattern: 'lunge',          difficulty: 'beginner',     isCompound: true,  instructions: 'Step forward, descend until rear knee taps floor, drive up and continue.' },
  { id: 'leg-extension',   name: 'Leg extension',       primaryMuscle: 'quads',      secondaryMuscles: [],                               equipment: ['machine'],                pattern: 'isolation',      difficulty: 'beginner',     isCompound: false, instructions: 'Sit on machine. Extend knees fully without overarching back.' },

  // ----- HINGE / POSTERIOR CHAIN -----
  { id: 'deadlift',        name: 'Conventional deadlift', primaryMuscle: 'hamstrings', secondaryMuscles: ['glutes', 'back', 'core'],     equipment: ['barbell'],                pattern: 'hinge',          difficulty: 'intermediate', isCompound: true,  instructions: 'Bar over mid-foot. Set lats, hinge, push the floor away. Stand tall, lock out.' },
  { id: 'romanian-dl',     name: 'Romanian deadlift',   primaryMuscle: 'hamstrings', secondaryMuscles: ['glutes', 'back'],               equipment: ['barbell', 'dumbbell'],    pattern: 'hinge',          difficulty: 'intermediate', isCompound: true,  instructions: 'Soft knee, push hips back, bar travels close to legs. Stop at end-range hamstring stretch.' },
  { id: 'hip-thrust',      name: 'Barbell hip thrust',  primaryMuscle: 'glutes',     secondaryMuscles: ['hamstrings'],                   equipment: ['barbell', 'bench'],       pattern: 'hinge',          difficulty: 'beginner',     isCompound: true,  instructions: 'Upper back on bench, bar on hips. Drive hips to full lockout, squeeze glutes.' },
  { id: 'leg-curl',        name: 'Lying leg curl',      primaryMuscle: 'hamstrings', secondaryMuscles: [],                               equipment: ['machine'],                pattern: 'isolation',      difficulty: 'beginner',     isCompound: false, instructions: 'Face-down on machine, curl pad toward glutes. Slow eccentric.' },
  { id: 'good-morning',    name: 'Good morning',        primaryMuscle: 'hamstrings', secondaryMuscles: ['back', 'glutes'],               equipment: ['barbell'],                pattern: 'hinge',          difficulty: 'advanced',     isCompound: true,  instructions: 'Bar on upper back. Slight knee bend, hinge until torso ~parallel, return.' },

  // ----- HORIZONTAL PUSH (CHEST) -----
  { id: 'bench-press',     name: 'Barbell bench press', primaryMuscle: 'chest',      secondaryMuscles: ['triceps', 'shoulders'],         equipment: ['barbell', 'bench'],       pattern: 'horizontal_push', difficulty: 'intermediate', isCompound: true,  instructions: 'Retract shoulder blades. Touch lower-chest, drive bar back to start.' },
  { id: 'incline-bench',   name: 'Incline barbell bench', primaryMuscle: 'chest',    secondaryMuscles: ['triceps', 'shoulders'],         equipment: ['barbell', 'bench'],       pattern: 'horizontal_push', difficulty: 'intermediate', isCompound: true,  instructions: 'Bench at ~30°. Bar to upper chest, press to lockout.' },
  { id: 'dumbbell-bench',  name: 'Dumbbell bench press', primaryMuscle: 'chest',     secondaryMuscles: ['triceps', 'shoulders'],         equipment: ['dumbbell', 'bench'],      pattern: 'horizontal_push', difficulty: 'beginner',     isCompound: true,  instructions: 'Press dumbbells from chest level to lockout. Slight inward path at top.' },
  { id: 'incline-db-bench',name: 'Incline dumbbell bench', primaryMuscle: 'chest',   secondaryMuscles: ['triceps', 'shoulders'],         equipment: ['dumbbell', 'bench'],      pattern: 'horizontal_push', difficulty: 'beginner',     isCompound: true,  instructions: 'Bench at 30°. Press dumbbells until elbows fully extend.' },
  { id: 'push-up',         name: 'Push-up',             primaryMuscle: 'chest',      secondaryMuscles: ['triceps', 'shoulders', 'core'], equipment: ['bodyweight'],             pattern: 'horizontal_push', difficulty: 'beginner',     isCompound: true,  instructions: 'Rigid plank. Lower until chest ~1 inch from floor, press back up.' },
  { id: 'cable-fly',       name: 'Cable fly',           primaryMuscle: 'chest',      secondaryMuscles: ['shoulders'],                    equipment: ['cable'],                  pattern: 'isolation',      difficulty: 'beginner',     isCompound: false, instructions: 'Slight elbow bend. Hug arms across midline, squeeze chest at peak.' },

  // ----- VERTICAL PUSH (SHOULDERS) -----
  { id: 'overhead-press',  name: 'Barbell overhead press', primaryMuscle: 'shoulders', secondaryMuscles: ['triceps', 'core'],            equipment: ['barbell'],                pattern: 'vertical_push',  difficulty: 'intermediate', isCompound: true,  instructions: 'Brace hard. Press from shoulders to lockout overhead, head through at top.' },
  { id: 'db-shoulder-press', name: 'Dumbbell shoulder press', primaryMuscle: 'shoulders', secondaryMuscles: ['triceps'],                 equipment: ['dumbbell', 'bench'],      pattern: 'vertical_push',  difficulty: 'beginner',     isCompound: true,  instructions: 'Seated or standing. Press dumbbells from shoulder height to lockout.' },
  { id: 'lateral-raise',   name: 'Dumbbell lateral raise', primaryMuscle: 'shoulders', secondaryMuscles: [],                             equipment: ['dumbbell', 'cable'],      pattern: 'isolation',      difficulty: 'beginner',     isCompound: false, instructions: 'Slight forward lean. Raise dumbbells out and slightly forward to shoulder height.' },
  { id: 'rear-delt-fly',   name: 'Rear delt fly',       primaryMuscle: 'shoulders',  secondaryMuscles: ['back'],                         equipment: ['dumbbell', 'cable'],      pattern: 'isolation',      difficulty: 'beginner',     isCompound: false, instructions: 'Hinge forward 45°. Pull dumbbells out and back, squeeze rear delts.' },
  { id: 'face-pull',       name: 'Cable face pull',     primaryMuscle: 'shoulders',  secondaryMuscles: ['back'],                         equipment: ['cable'],                  pattern: 'isolation',      difficulty: 'beginner',     isCompound: false, instructions: 'Pull rope toward face with high elbows, externally rotating at the top.' },

  // ----- VERTICAL PULL (BACK / WIDTH) -----
  { id: 'pull-up',         name: 'Pull-up',             primaryMuscle: 'back',       secondaryMuscles: ['biceps'],                       equipment: ['pull_up_bar', 'bodyweight'], pattern: 'vertical_pull', difficulty: 'intermediate', isCompound: true,  instructions: 'Overhand grip. Pull until chin clears bar, control descent to full hang.' },
  { id: 'chin-up',         name: 'Chin-up',             primaryMuscle: 'back',       secondaryMuscles: ['biceps'],                       equipment: ['pull_up_bar', 'bodyweight'], pattern: 'vertical_pull', difficulty: 'intermediate', isCompound: true,  instructions: 'Underhand grip. Pull until chin clears bar, full extension at bottom.' },
  { id: 'lat-pulldown',    name: 'Lat pulldown',        primaryMuscle: 'back',       secondaryMuscles: ['biceps'],                       equipment: ['cable', 'machine'],       pattern: 'vertical_pull',  difficulty: 'beginner',     isCompound: true,  instructions: 'Pull bar to upper chest, drive elbows down and back. Squeeze lats.' },

  // ----- HORIZONTAL PULL (BACK / THICKNESS) -----
  { id: 'barbell-row',     name: 'Barbell row',         primaryMuscle: 'back',       secondaryMuscles: ['biceps', 'shoulders'],          equipment: ['barbell'],                pattern: 'horizontal_pull', difficulty: 'intermediate', isCompound: true,  instructions: 'Hinge to ~45°. Row bar to lower chest / upper abs. Pause, control return.' },
  { id: 'dumbbell-row',    name: 'One-arm dumbbell row', primaryMuscle: 'back',      secondaryMuscles: ['biceps'],                       equipment: ['dumbbell', 'bench'],      pattern: 'horizontal_pull', difficulty: 'beginner',     isCompound: true,  instructions: 'Brace one hand and knee on bench. Row dumbbell to hip, elbow stays close.' },
  { id: 'cable-row',       name: 'Seated cable row',    primaryMuscle: 'back',       secondaryMuscles: ['biceps'],                       equipment: ['cable', 'machine'],       pattern: 'horizontal_pull', difficulty: 'beginner',     isCompound: true,  instructions: 'Tall chest. Pull handle to lower sternum, drive elbows back. Slow eccentric.' },
  { id: 't-bar-row',       name: 'T-bar row',           primaryMuscle: 'back',       secondaryMuscles: ['biceps'],                       equipment: ['barbell', 'machine'],     pattern: 'horizontal_pull', difficulty: 'intermediate', isCompound: true,  instructions: 'Straddle the bar. Hinge, row toward sternum. Keep low back neutral.' },

  // ----- ARMS -----
  { id: 'barbell-curl',    name: 'Barbell curl',        primaryMuscle: 'biceps',     secondaryMuscles: [],                               equipment: ['barbell'],                pattern: 'isolation',      difficulty: 'beginner',     isCompound: false, instructions: 'Elbows pinned at sides. Curl bar without swinging.' },
  { id: 'db-curl',         name: 'Dumbbell curl',       primaryMuscle: 'biceps',     secondaryMuscles: [],                               equipment: ['dumbbell'],               pattern: 'isolation',      difficulty: 'beginner',     isCompound: false, instructions: 'Alternating or together. Supinate at the top.' },
  { id: 'hammer-curl',     name: 'Hammer curl',         primaryMuscle: 'biceps',     secondaryMuscles: [],                               equipment: ['dumbbell'],               pattern: 'isolation',      difficulty: 'beginner',     isCompound: false, instructions: 'Neutral grip. Curl without rotating wrist - hits brachialis.' },
  { id: 'preacher-curl',   name: 'Preacher curl',       primaryMuscle: 'biceps',     secondaryMuscles: [],                               equipment: ['barbell', 'dumbbell', 'machine'], pattern: 'isolation', difficulty: 'beginner',  isCompound: false, instructions: 'Upper arms on pad. Strict curl, do not lock elbows at bottom.' },
  { id: 'tricep-pushdown', name: 'Cable tricep pushdown', primaryMuscle: 'triceps',  secondaryMuscles: [],                               equipment: ['cable'],                  pattern: 'isolation',      difficulty: 'beginner',     isCompound: false, instructions: 'Elbows at sides. Extend fully, control on the way up.' },
  { id: 'skull-crusher',   name: 'Skull crusher',       primaryMuscle: 'triceps',    secondaryMuscles: [],                               equipment: ['barbell', 'dumbbell', 'bench'], pattern: 'isolation',   difficulty: 'intermediate', isCompound: false, instructions: 'Lying. Lower bar behind head, extend back to lockout.' },
  { id: 'overhead-tri',    name: 'Overhead tricep extension', primaryMuscle: 'triceps', secondaryMuscles: [],                            equipment: ['dumbbell', 'cable'],      pattern: 'isolation',      difficulty: 'beginner',     isCompound: false, instructions: 'Hands overhead, lower weight behind head, extend through elbows only.' },
  { id: 'close-grip-bench',name: 'Close-grip bench press', primaryMuscle: 'triceps', secondaryMuscles: ['chest', 'shoulders'],           equipment: ['barbell', 'bench'],       pattern: 'horizontal_push', difficulty: 'intermediate', isCompound: true,  instructions: 'Shoulder-width grip. Elbows close, bar to lower chest.' },

  // ----- CALVES & GLUTES (ISOLATION) -----
  { id: 'standing-calf',   name: 'Standing calf raise', primaryMuscle: 'calves',     secondaryMuscles: [],                               equipment: ['machine', 'bodyweight'],  pattern: 'isolation',      difficulty: 'beginner',     isCompound: false, instructions: 'Full plantar flexion at top, full stretch at bottom. Pause briefly.' },
  { id: 'seated-calf',     name: 'Seated calf raise',   primaryMuscle: 'calves',     secondaryMuscles: [],                               equipment: ['machine'],                pattern: 'isolation',      difficulty: 'beginner',     isCompound: false, instructions: 'Seated soleus emphasis. Full ROM, slow.' },
  { id: 'glute-bridge',    name: 'Glute bridge',        primaryMuscle: 'glutes',     secondaryMuscles: ['hamstrings'],                   equipment: ['bodyweight', 'barbell'],  pattern: 'hinge',          difficulty: 'beginner',     isCompound: false, instructions: 'Lying, knees bent. Drive hips up, squeeze glutes, brief hold.' },

  // ----- CORE -----
  { id: 'plank',           name: 'Plank',               primaryMuscle: 'core',       secondaryMuscles: ['shoulders'],                    equipment: ['bodyweight'],             pattern: 'core',           difficulty: 'beginner',     isCompound: false, instructions: 'Forearms or hands. Brace, glutes squeezed, body in one line. Hold for time.' },
  { id: 'hanging-leg-raise', name: 'Hanging leg raise', primaryMuscle: 'core',       secondaryMuscles: [],                               equipment: ['pull_up_bar', 'bodyweight'], pattern: 'core',         difficulty: 'intermediate', isCompound: false, instructions: 'From dead hang, raise legs to 90° or higher. No swing.' },
  { id: 'cable-crunch',    name: 'Cable crunch',        primaryMuscle: 'core',       secondaryMuscles: [],                               equipment: ['cable'],                  pattern: 'core',           difficulty: 'beginner',     isCompound: false, instructions: 'Kneel under cable. Crunch by curling rib cage toward pelvis, not the hips.' },
  { id: 'russian-twist',   name: 'Russian twist',       primaryMuscle: 'core',       secondaryMuscles: [],                               equipment: ['bodyweight', 'dumbbell'], pattern: 'core',           difficulty: 'beginner',     isCompound: false, instructions: 'Lean back ~45°. Rotate trunk side to side, control range.' },
  { id: 'ab-wheel',        name: 'Ab wheel rollout',    primaryMuscle: 'core',       secondaryMuscles: ['shoulders'],                    equipment: ['bodyweight'],             pattern: 'core',           difficulty: 'advanced',     isCompound: false, instructions: 'Roll forward without arching back. Pull rib cage in as you return.' },
  { id: 'pallof-press',    name: 'Pallof press',        primaryMuscle: 'core',       secondaryMuscles: [],                               equipment: ['cable'],                  pattern: 'core',           difficulty: 'beginner',     isCompound: false, instructions: 'Anti-rotation. Press handle straight out, resist the cable pulling you to the side.' },

  // ----- CARDIO -----
  { id: 'treadmill-run',   name: 'Treadmill run',       primaryMuscle: 'cardio',     secondaryMuscles: [],                               equipment: ['cardio_machine'],         pattern: 'cardio',         difficulty: 'beginner',     isCompound: true,  instructions: 'Steady pace conversational; for intervals, alternate hard / easy by time.' },
  { id: 'stationary-bike', name: 'Stationary bike',     primaryMuscle: 'cardio',     secondaryMuscles: ['quads'],                        equipment: ['cardio_machine'],         pattern: 'cardio',         difficulty: 'beginner',     isCompound: true,  instructions: 'Adjust seat so knee is slightly bent at bottom of pedal stroke.' },
  { id: 'rowing-machine',  name: 'Rowing machine',      primaryMuscle: 'cardio',     secondaryMuscles: ['back', 'quads'],                equipment: ['cardio_machine'],         pattern: 'cardio',         difficulty: 'beginner',     isCompound: true,  instructions: 'Drive with legs first, then hip hinge, then pull arms. Reverse on recovery.' },
  { id: 'jump-rope',       name: 'Jump rope',           primaryMuscle: 'cardio',     secondaryMuscles: ['calves', 'shoulders'],          equipment: ['bodyweight'],             pattern: 'cardio',         difficulty: 'beginner',     isCompound: true,  instructions: 'Light bounce, wrist rotation drives the rope. Hold any pace 30 s - several minutes.' },
];

export function exerciseById(id: string): Exercise | undefined {
  return EXERCISES.find((e) => e.id === id);
}

export function exercisesByPattern(pattern: MovementPattern): Exercise[] {
  return EXERCISES.filter((e) => e.pattern === pattern);
}

export function filterByEquipment(exercises: Exercise[], available: Equipment[]): Exercise[] {
  const set = new Set(available);
  return exercises.filter((e) => e.equipment.some((eq) => set.has(eq)));
}

export function searchExercises(query: string, limit = 20): Exercise[] {
  const q = query.trim().toLowerCase();
  if (q.length < 2) return [];
  const out: { ex: Exercise; score: number }[] = [];
  for (const e of EXERCISES) {
    const name = e.name.toLowerCase();
    let score = 0;
    if (name === q) score = 100;
    else if (name.startsWith(q)) score = 80;
    else if (name.includes(q)) score = 60;
    else if (e.primaryMuscle.includes(q as MuscleGroup)) score = 40;
    if (score > 0) out.push({ ex: e, score });
  }
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, limit).map((r) => r.ex);
}

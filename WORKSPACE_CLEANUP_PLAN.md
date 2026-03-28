# 🧹 PLAN DE LIMPIEZA DEL WORKSPACE — TravelPro Quotes

**Fecha:** 2026-03-28
**Estado:** CRÍTICO — Desorden detectado, necesita organización profesional

---

## 📊 DIAGNÓSTICO DEL DESORDEN

### Archivos/Directorios PROBLEMÁTICOS identificados:

#### 🔴 **ELIMINAR INMEDIATAMENTE** (Basura pura)
1. ❌ `testsprite_tests/` — Framework externo de tests, NO parte del proyecto
   - Contiene `TC_*.py` (test cases de otro sistema)
   - `testsprite_frontend_test_plan.json`
   - `standard_prd.json`
   - **Total:** 30+ archivos Python + JSONs de otra herramienta

2. ❌ `playwright-report/` — Artifacts de reports HTML
   - `index.html` + `data/` — resultados de tests E2E
   - **NO versionar** — se regeneran en cada `npm run test:e2e`

3. ❌ `test-results/` — Artifacts de Playwright test results
   - Directorios con screenshots y JSONs de errores
   - **NO versionar** — se regeneran

4. ❌ `playwright_full_output*.txt` (6 archivos) — Logs de debugging
   - `playwright_full_output.txt` a `playwright_full_output_6.txt`
   - Output crudo de consola, NO necesario

5. ❌ `playwright_output.txt` — Log adicional
6. ❌ `files.md` — Archivo suelto sin propósito claro

#### 🟡 **MOVER o REORGANIZAR** (Contenido válido pero mal ubicado)
7. ⚠️ `docs/future-architecture-vision.md.resolved` — Visión futura (Sanity CMS)
   - **NO es código actual** — es roadmap/planificación
   - Mover a `roadmap/` o renombrar a `VISION_FUTURA.md` en docs/

8. ⚠️ `docs/CTZN CIRO VARGAS PERU LIM 2026-3.pdf` — PDF de referencia
   - ¿Es ejemplo de itinerary? ¿Documentación?
   - Mover a `examples/` o `reference-materials/`

9. ⚠️ `scripts/` — Scripts de desarrollo
   - `seed-dashboard-data.ts`, `create-test-user.ts`, `check-tables.ts`
   - **Son útiles** pero podrían ir en `dev-tools/` o mantener en `scripts/` (está bien)
   - **Decisión:** Mantener en `scripts/` (es estándar)

10. ⚠️ `verify_db.ts` — Script de verificación de BD
    - Mover a `scripts/` o mantener en raíz (está bien donde está)

#### 🟢 **MANTENER** (Archivos legítimos del proyecto)
11. ✅ `app/`, `lib/`, `features/`, `components/` — Código productivo
12. ✅ `e2e/` — Tests E2E reales (estos SÍ son parte del proyecto)
13. ✅ `__tests__/` — Tests unitarios
14. ✅ `docs/` (excepto los archivos problemáticos mencionados)
    - `prd.md`, `dal-guidelines.md`, `PERFORMANCE_BOOST.md`, `supabase_optimizations.sql`
15. ✅ `public/`, `components.json`, `eslint.config.mjs`, `tsconfig.json`, etc.

---

## 📋 ACCIONES CONCRETAS

### **Acción 1: Actualizar .gitignore** (PREVENIR FUTURO DESORDEN)

Agregar estas líneas a `.gitignore`:

```gitignore
# ============================================
# PLAYWRIGHT ARTIFACTS (NUNCA versionar)
# ============================================
playwright-report/
test-results/
playwright-*.txt

# ============================================
# EXPERIMENTOS EXTERNOS (testsprite)
# ============================================
testsprite_tests/
*.py  # (excepto si hay scripts Python legítimos del proyecto)

# ============================================
# CLAUDE/AGENT ARTIFACTS
# ============================================
.agent/
.opencode/
*.output
.claude/projects/*/memory/  # solo los informes de memoria

# ============================================
# LOGS & DEBUG FILES
# ============================================
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# ============================================
# TEMPORARY FILES
# ============================================
.DS_Store
Thumbs.db
*.tmp
*.temp
```

---

### **Acción 2: Eliminar Archivos Basura** (Ejecutar en terminal)

```bash
# ELIMINAR (nunca versionar)
rm -rf testsprite_tests/
rm -rf playwright-report/
rm -rf test-results/
rm playwright_full_output*.txt
rm playwright_output.txt
rm files.md

# NOTA: .agent/ y .opencode/ ya están en .gitignore pero existen localmente.
# Opcional: rm -rf .opencode/ (si no lo usas)
# NO eliminar .agent/ si configuraste agentes ahí (pero NO committear)
```

---

### **Acción 3: Reorganizar Documentación** (Opcional pero recomendado)

```bash
# Mover documentos a estructura más clara
mkdir -p docs/roadmap
mv docs/future-architecture-vision.md.resolved docs/roadmap/VISION_FUTURA_SANITY.md

# O alternativamente, eliminar si es solo speculation no aprobada
# rm docs/future-architecture-vision.md.resolved

# Mover PDF de referencia
mkdir -p examples/reference-materials
mv docs/CTZN CIRO VARGAS PERU LIM 2026-3.pdf examples/reference-materials/
```

---

### **Acción 4: Commit de Limpieza** (Una vez eliminado)

```bash
git add .gitignore
git rm -r --cached testsprite_tests/ playwright-report/ test-results/
git rm playwright_full_output*.txt playwright_output.txt files.md
git commit -m "chore: cleanup workspace — remove artifacts, test reports, and experiment files

- Remove testsprite_tests/ (external framework, not part of project)
- Remove playwright-report/ and test-results/ (should be in .gitignore)
- Remove debug output files (*.txt logs)
- Remove files.md (unordered notes)
- Add comprehensive .gitignore entries for Playwright artifacts
- Keep production code intact (app/, lib/, features/, e2e/, __tests__/)

This cleans the workspace to prevent confusion for AI agents and developers."

git push  # siYa tienes remote configurado
```

---

## ✅ **CRITERIOS DE ÉXITO POST-LIMPIEZA**

Después de la limpieza, el workspace debería verse así:

```
travelpro-quotes/
├── app/                    ✅ Código productivo
├── lib/
├── features/
├── components/
├── e2e/                    ✅ Tests E2E (los specs reales)
├── __tests__/              ✅ Tests unitarios
├── docs/
│   ├── prd.md
│   ├── dal-guidelines.md
│   ├── PERFORMANCE_BOOST.md
│   ├── supabase_optimizations.sql
│   ├── roadmap/           (opcional)
│   │   └── VISION_FUTURA_SANITY.md
│   └── examples/          (opcional)
│       └── reference-materials/
│           └── CTZN CIRO VARGAS PERU LIM 2026-3.pdf
├── scripts/                ✅ Dev tools (seed, check-tables)
├── verify_db.ts            ✅ Script BD
├── .gitignore              ✅ ACTUALIZADO
├── package.json
├── tsconfig.json
├── playwright.config.ts
├── vitest.config.ts
└── README.md
```

**Archivos que NO deberían existir:**
- ❌ `testsprite_tests/`
- ❌ `playwright-report/`
- ❌ `test-results/`
- ❌ `playwright_*_output.txt`
- ❌ `files.md`
- ❌ `.opencode/` (en .gitignore)
- ❌ `.agent/` (en .gitignore, local config only)

---

## 🎯 **PRÓXIMOS PASOS DESPUÉS DE LIMPIAR**

Una vez que el workspace esté limpio:

1. **Verificar** que `git status` esté limpio (o solo cambios en .gitignore)
2. **Ejecutar** `npm run test` — confirmar 44 unit tests aún pasan
3. **Ejecutar** `npm run test:e2e` — confirmar que los 8 specs funcionan (o al menos identificar fallos sin ruido)
4. **Proceder** a crear los 3 equipos de agentes (como planeamos)
5. **Comentar** en el análisis actualizado: "Workspace limpio, ahora enfocado en X, Y, Z"

---

## ⚠️ **ADVERTENCIAS**

- ⚠️ **NO eliminar** `.agent/` si ya configuraste agentes personalizados ahí (aunque NO debe committearse)
- ⚠️ **NO eliminar** `e2e/` — esos specs son parte del proyecto
- ⚠️ **NO eliminar** `__tests__/` — tests unitarios son críticos
- ⚠️ **NO eliminar** `docs/prd.md` y otros documentos técnicos válidos
- ⚠️ **Hacer backup** mental de `future-architecture-vision.md.resolved` si lo necesitas después

---

## 📞 **¿PROCEDO CON LA LIMPIEZA?**

¿Quieres que ejecute los comandos de eliminación y actualización de .gitignore **AHORA MISMO**?

O prefieres que:
1. Te dé la lista de comandos para que los ejecutes tú manualmente
2. Revisemos primero los documentos en `docs/` antes de borrar/mover
3. Confirmemos cada eliminación antes de hacer `git rm`

**Elige:**
- **Opción A:** Yo ejecuto la limpieza automáticamente (asumo responsabilidad, pero Anything eliminado se puede recover del git history)
- **Opción B:** Te doy los comandos y tú los ejecutas paso a paso (más seguro)
- **Opción C:** Primero Revisionando los archivos dudosos (`future-architecture-vision.md.resolved`, PDF) antes de eliminar

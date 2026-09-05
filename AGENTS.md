<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:luxe-estate-rules -->

# Luxe Estate — Reglas del Proyecto

## ⚠️ Regla ABSOLUTA: Leer AGENTS.md en cada prompt
- **Antes de cualquier acción, releer este archivo completo**
- Ignorar su contenido = error grave

## ⚠️ Regla ABSOLUTA: Siempre en ramas temporales
- **NUNCA trabajar directamente en `main`**, bajo ninguna circunstancia
- Cada tarea/modiﬁcación se hace en una rama con nombre tipo `feat/...`, `fix/...`, etc.
- Solo commiteo/mergeo/pusheo cuando el usuario lo pide explícitamente
- Esto aplica incluso si el usuario dice "comitea, mergea y pushea" — primero creo una rama, luego mergeo siguiendo el flujo

## Objetivo
App de bienes raíces premium llamada **Luxe Estate** con Next.js (App Router) + Tailwind CSS v4 + Supabase. Diseño moderno, premium y minimalista siguiendo referencias en `antigravity/resources/`.

---

## 🎨 Paleta de Colores (usar exactamente estos valores)

| Variable | Hex | Uso |
|----------|-----|-----|
| `nordic` / `nordic-dark` | `#19322F` | Headers, navegación, texto principal |
| `mosque` | `#006655` | Botones primarios, acciones, acentos |
| `hint-of-green` | `#D9ECC8` | Fondos suaves, tarjetas destacadas |
| `clear-day` / `background-light` | `#EEF6F6` | Fondo general de la app |

## Tipografía
- **SF Pro Display** (primera opción) → Inter → system fonts

---

## 🏗️ Arquitectura de Componentes

### Server Components primero
- Priorizar Server Components para renderizado SEO y llamadas a Supabase
- `'use client'` solo para elementos interactivos (botones, sliders, mapas, formularios)
- Separar lógica de datos en `lib/` → componentes de presentación en `components/`

### Organización de carpetas
```
components/
├── home/       # Hero, FeaturedCollections, NewInMarket, SearchFiltersModal
├── property/   # PropertyCard, PropertyGallery, PropertyMap, MortgageCalculator...
└── ui/         # Navbar, LanguageSelector, LocaleDebug...
```

---

## 🖼️ Imágenes

- **[Obligatorio]** Usar `<Image />` de Next.js (`next/image`) en TODAS las fotos
- **[Prioridad]** `priority={true}` en imágenes Hero (LCP)
- **[Blur]** `placeholder="blur"` en galerías pesadas
- Imágenes de Unsplash como fallback definidas en `FALLBACK_IMAGES`

---

## 🔍 SEO y Renderizado

- **[ISR]** Usar Incremental Static Regeneration para páginas de detalle
- **[Metadatos]** `generateMetadata` por propiedad para SEO dinámico
- **[JSON-LD]** Implementar esquema `RealEstateListing` para Rich Snippets

---

## 🔎 Búsqueda y Filtros

- **[URL State]** Sincronizar filtros con `searchParams` en la URL
- **[Debouncing]** Retraso en auto-completado para no saturar Supabase
- Filtros disponibles: texto, dormitorios, baños, tipo, rango de precios

---

## 🌐 Internacionalización

- 3 idiomas: `es` (default), `en`, `pt`
- Archivos en `messages/{locale}.json`
- Detección automática del navegador vía `Accept-Language`
- Selector manual en el Navbar
- Sin cookie = primera visita detecta idioma del navegador

---

## 💾 Base de Datos (Supabase)

- Tabla `properties` con: id, slug, title, price, type (SALE/RENT), bedrooms, bathrooms, garages, area, description, amenities[], location, address, lat, lng, is_featured
- Tabla `property_images` con: id, property_id, url, is_main, sort_order
- Relación 1:N entre properties y property_images
- RLS activo

---

## ⚡ Rendimiento

- **[Lazy Loading]** Mapas (Mapbox GL) cargados diferidamente
- **[Skeletons]** Usar skeletons, no spinners, para evitar layout shift
- **[Server > Client]** Server Components por defecto

---

## ✨ UX Premium ("Wow Factor")

- Micro-animaciones en tarjetas (hover, transiciones)
- Calculadora de hipoteca integrada en detalle de propiedad
- Propiedades vendidas/desactivadas → página sugerente, no 404
- Diseño responsive mobile-first

---

## 📁 Referencias de Diseño

Las guías visuales están en:
- `antigravity/resources/home_discover_screen/`
- `antigravity/resources/property_details_screen/`
- `antigravity/resources/search_filters_screen/`

Cada una contiene `screen.png` (referencia visual) y `code.html` (implementación de referencia).

---

## 🚫 Prohibiciones

- No instalar librerías sin consultar primero
- No usar spinners genéricos donde aplican skeletons
- No romper la paleta de colores definida
- No usar `'use client'` a menos que sea estrictamente necesario
<!-- END:luxe-estate-rules -->

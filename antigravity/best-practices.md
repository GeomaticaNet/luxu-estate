# Checklist Condensado: Mejores Prácticas para Real Estate en Next.js

## 1. Rendimiento y Carga Visual (Imágenes)
*   **[ Obligatorio ]** Utilizar el componente `<Image />` de Next.js (`next/image`) en TODAS las fotos para redimensionamiento, formato WebP/AVIF y lazy loading automático.
*   **[ Prioridad ]** Establecer `priority={true}` en las imágenes en formato "Hero" (cabecera o carrusel principal) para maximizar métricas LCP.
*   **[ Blur ]** Implementar `placeholder="blur"` en galerías pesadas para simular fluidez de carga visual.

## 2. Puntos Fuertes en SEO y Renderizado
*   **[ ISR ]** (Incremental Static Regeneration) para páginas de detalles de propiedad; ideal para actualizar datos en segundo plano sin sacrificar velocidad.
*   **[ Metadatos Dinámicos ]** Inyectar descripciones de SEO específicas por propiedad usando la función `generateMetadata`.
*   **[ Microformatos ]** Emplear JSON-LD (esquema `RealEstateListing`) para mostrar "Rich Snippets" directamente en los resultados de Google (precios, número de habitaciones, etc).

## 3. UI, Búsquedas y Filtrado (El Corazón de la App)
*   **[ URL State ]** Sincronizar todos los filtros de búsqueda (ej. ciudad, precio) usando `searchParams` en la URL (`?habitaciones=3&precioMax=500000`). Facilitará compartir links de búsquedas.
*   **[ Event Debouncing ]** Poner retrasos a las consultas de auto-completado en inputs de búsqueda para no colapsar la capa de datos o base de datos.
*   **[ Carga Inteligente ]** Mapas geográficos (Mapbox/Google Maps) deben ser diferidos (`lazy loaded` o ruta dinámica) para no penalizar el tiempo de respuesta inicial.

## 4. Componentes y Arquitectura Interna
*   **[ Server > Client ]** Priorizar Server Components para el renderizado SEO y llamadas directas a Supabase (Base de datos); reservar el tag `'use client'` estrictamente para elementos interactivos (botones, sliders, mapas).
*   **[ Skeletons ]** Usar diseños de carga esqueléticos y no spinners clásicos al solicitar datos, con el fin de evitar la restructuración inesperada de la pantalla o "layout shift".

## 5. El "Wow Factor" 
*   **[ Animaciones ]** Incorporar micro-animaciones en tarjetas de resultados. Un toque premium requiere transiciones visuales agradables (usando `framer-motion` o CSS).
*   **[ Extras ]** Agregar estimadores y calculadoras hipotecarias locales en las vistas en detalle aportará enorme valor al perfil del comprador.
*   **[ Manejo de Vendidos ]** Las propiedades desactivadas/vendidas deben llevar a páginas sugerentes y no a "Errores 404".

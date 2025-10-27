# Configuración de Redirecciones para Render

## El Problema
La URL `https://frontend-azuralis-project-int-platform.onrender.com/emergency/PATIENT:9904a402-307b-44f5-be2e-debb810148c0` devuelve 404 porque Render está buscando un archivo físico en esa ruta.

## La Solución

### Opción 1: Configurar en el Dashboard de Render (RECOMENDADO)

1. Ve al dashboard de Render: https://dashboard.render.com
2. Selecciona tu servicio `frontend-azuralis-project-int-platform`
3. Ve a **Settings** → **Redirects/Rewrites**
4. Agrega la siguiente regla:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: `Rewrite`
5. Guarda y redeploy

### Opción 2: Usar render.yaml (ya está configurado)

El archivo `render.yaml` en la raíz del repositorio ya tiene la configuración correcta:

```yaml
services:
  - type: web
    name: frontend-azuralis-project-int-platform
    env: static
    buildCommand: cd web && npm ci && npm run build
    staticPublishPath: ./web/dist
    routes:
      - type: rewrite
        source: /*
        destination: /index.html
```

**IMPORTANTE**: Para que Render use este archivo, necesitas:

1. Asegurarte de que el archivo está en la raíz del repositorio (YA ESTÁ ✓)
2. En el dashboard de Render, en **Settings**, verificar que:
   - **Build Command** sea: `cd web && npm ci && npm run build`
   - **Publish Directory** sea: `web/dist`
3. Si el servicio fue creado manualmente, puede que necesites recrearlo para que lea el `render.yaml`

### Opción 3: Verificar la Configuración Actual

Si las opciones anteriores no funcionan, verifica:

1. **En Render Dashboard → Settings**:
   - Environment: debe ser `Static Site` o `Web Service` con `env: static`
   - Build Command: `cd web && npm ci && npm run build`
   - Publish Directory: `web/dist`

2. **Logs del Deploy**:
   - Verifica que el build se complete exitosamente
   - Verifica que se estén copiando todos los archivos al `dist`

3. **Prueba Manual**:
   - Después del deploy, ve a `https://frontend-azuralis-project-int-platform.onrender.com/`
   - Si la raíz funciona pero las subrutas no, el problema es definitivamente de redirecciones

## Por qué funciona en Localhost

Vite dev server automáticamente redirige todas las rutas a `index.html` para que React Router funcione. En producción, necesitas configurar esto manualmente en tu servidor/hosting.

## Archivos Importantes

- ✓ `render.yaml` - Configuración de Render (raíz del repo)
- ✓ `web/public/_redirects` - Para Netlify (no funciona en Render)
- ✓ `web/public/netlify.toml` - Para Netlify (no funciona en Render)
- ✓ `web/vite.config.ts` - Configuración de build correcta
- ✓ `web/dist/_redirects` - Se copia pero Render no lo usa

## Próximos Pasos

1. Haz commit y push de todos los cambios
2. Configura las redirecciones en el dashboard de Render (Opción 1)
3. O verifica que el `render.yaml` se esté usando correctamente
4. Redeploy el servicio
5. Prueba la URL de emergencia nuevamente

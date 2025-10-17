# Web Application - Azuralis Platform

Aplicación web frontend construida con React, TypeScript, Vite y Tailwind CSS.

## 🚀 Inicio Rápido

### Instalación
```powershell
npm install
```

### Desarrollo
```powershell
npm run dev
```
La aplicación estará disponible en http://localhost:5173

### Build de Producción
```powershell
npm run build
```

## 🛠️ Stack Tecnológico

- **React 19** - Biblioteca UI
- **TypeScript 5.8** - Tipado estático
- **Vite 7** - Build tool y dev server
- **Tailwind CSS 3.3** - Framework CSS utility-first
- **React Router 7** - Enrutamiento
- **ESLint 9** - Linting

## 📁 Estructura

```
web/
├── src/
│   ├── components/    # Componentes reutilizables
│   ├── pages/         # Páginas/vistas
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

## 🎨 Tailwind CSS

Usar clases de utilidad directamente:

```tsx
<div className="flex items-center justify-center min-h-screen bg-gray-100">
  <h1 className="text-3xl font-bold text-blue-600">
    ¡Hola Tailwind!
  </h1>
</div>
```

## 📝 Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |
| `npm run lint` | Ejecutar ESLint |

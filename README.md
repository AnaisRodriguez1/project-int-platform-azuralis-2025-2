# 🏥 Ficha Médica Portátil FAMED UCN

Proyecto integrador que combina **hardware y software** para que pacientes oncológicos porten su historial clínico en una **tarjeta o pulsera con QR/NFC**, permitiendo a profesionales de la salud **acceso inmediato, seguro y confiable** a la información crítica.

---

## 📌 Objetivo del Proyecto
Facilitar el **acceso rápido y seguro** a información médica verificada para mejorar la **continuidad y calidad de la atención** de pacientes oncológicos.

### Objetivos Específicos
- Implementar identificación mediante **QR/NFC** para acceso inmediato a la ficha.
- Desarrollar aplicaciones **web y móvil** para registro, consulta y actualización de datos.
- Permitir a pacientes añadir **notas e imágenes** de documentos médicos.
- Asegurar **seguridad y confidencialidad** de la información.
- Validar el sistema con un **grupo piloto** de pacientes y personal de salud.

---

## 🧩 Arquitectura y Tecnologías
**Infraestructura**: Google Cloud Platform (GCP)  
**Backend**: NestJS + Cloud SQL (PostgreSQL) + TypeORM  
**Frontend Web**: React + Vite  
**Frontend Móvil**: React Native + Expo Go  
**Lenguaje**: TypeScript  
**Almacenamiento de archivos**: Google Cloud Storage  

---

## 🔑 Roles y Usuarios
- **Paciente**  
  - Porta una tarjeta o pulsera QR/NFC.  
  - Puede registrar datos, agregar notas y subir documentos.  
  - Personaliza el color de la app según su tipo de cáncer.
- **Personal Médico**  
  - Escanea el código QR/NFC y accede en **<3 segundos** a la información crítica: diagnóstico, medicamentos, alergias, historial quirúrgico y contactos de emergencia.  
  - Actualiza registros de atención.

---

## 🚀 Funcionalidades Clave
- **QR/NFC**: Generación y escaneo de códigos únicos para acceso instantáneo.
- **Gestión de Fichas**: Creación, visualización y actualización de datos médicos.
- **Carga de Archivos**: Imágenes de recetas, exámenes y documentos.
- **Diseño Minimalista**: Interfaz simple, rápida y personalizable.

---

## ⚠️ Riesgos y Mitigación
- **Fallas de integración QR/NFC** → prototipos tempranos y pruebas unitarias.  
- **Problemas de rendimiento** → optimización de consultas, uso de caché y validación en tiempo real.  
- **Accesos no autorizados** → autenticación robusta (MFA, JWT) y auditoría de accesos.  
- **Cambios de requisitos** → gestión ágil con Scrum y revisiones periódicas.

---

## ✅ Criterios de Aceptación
- Escaneo QR **funcional en <3 segundos**.  
- Roles de **paciente** y **personal médico** claramente diferenciados.  
- Información crítica visible al instante.  
- Compatibilidad **iOS y Android**.  
- Validación exitosa por parte del grupo piloto.

---

## 👥 Equipo de Desarrollo
| Nombre             | Rol                                    |
|--------------------|-----------------------------------------|
| Adrián Elgueta     | Product Owner / Backend Developer       |
| Anais Rodríguez    | Frontend Web Developer / Tester         |
| Paula Núñez        | Scrum Master / Frontend Móvil Developer |

---

## 📅 Plan de Trabajo
- **Fase 1**: Análisis de requisitos  
- **Fase 2**: Diseño del sistema  
- **Fase 3**: Implementación  
- **Fase 4**: Pruebas y ajustes  

---

## 🔗 Recursos
- [Documentación Google Cloud](https://cloud.google.com/products)
- [NestJS](https://docs.nestjs.com/)
- [React](https://react.dev/)
- [React Native](https://reactnative.dev/docs/getting-started)

---

### 📄 Licencia
Este proyecto es de uso académico en el marco de la **Facultad de Medicina UCN**.
"""
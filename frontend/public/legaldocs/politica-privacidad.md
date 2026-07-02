# Política de Privacidad

## Responsable del tratamiento

**Identidad:** Mikel León Ramos
**Correo electrónico:** [musicai@mikelleon-gaisep1.eus](mailto:musicai@mikelleon-gaisep1.eus)
**Finalidad del tratamiento:** Gestión del servicio de generación de partituras musicales con inteligencia artificial.

## Datos personales recogidos y finalidades

### 1. Registro de cuenta

| Dato | Finalidad | Base legal |
|------|-----------|------------|
| Nombre de usuario | Identificación en la plataforma | Ejecución del contrato de servicios (RGPD art. 6.1.b) |
| Correo electrónico | Identificación única y recuperación de cuenta | Ejecución del contrato de servicios (RGPD art. 6.1.b) |
| Contraseña (almacenada como hash bcrypt) | Autenticación segura | Ejecución del contrato de servicios (RGPD art. 6.1.b) |

### 2. Generación de partituras

| Dato | Finalidad | Base legal |
|------|-----------|------------|
| Instrumento, tempo, compás, duración | Configurar y generar la partitura solicitada | Ejecución del contrato de servicios (RGPD art. 6.1.b) |
| MusicXML generado | Almacenar, visualizar y exportar la partitura | Ejecución del contrato de servicios (RGPD art. 6.1.b) |

### 3. Cambio de contraseña

| Dato | Finalidad | Base legal |
|------|-----------|------------|
| Contraseña actual y nueva | Modificación de credenciales de acceso | Ejecución del contrato de servicios (RGPD art. 6.1.b) |

### 4. Restablecimiento de contraseña

| Dato | Finalidad | Base legal |
|------|-----------|------------|
| Correo electrónico | Envío de enlace de restablecimiento | Interés legítimo del usuario (RGPD art. 6.1.f) |

## Conservación de los datos

| Tipo de dato | Plazo de conservación |
|--------------|-----------------------|
| Datos de la cuenta de usuario | Hasta que el usuario solicite la baja voluntaria |
| Partituras generadas | Hasta que el usuario las elimine o elimine su cuenta |
| Tokens de restablecimiento de contraseña | 10 minutos (expiración automática) o hasta su uso |
| Token JWT (authToken) | 24 horas (duración de la sesión) |
| Datos de navegación anónimos | No se recogen |

## Derechos del usuario (ARSO +)

De acuerdo con el Reglamento General de Protección de Datos (RGPD) y la Ley Orgánica 3/2018 de Protección de Datos y Garantía de los Derechos Digitales (LOPDGDD), el usuario tiene derecho a:

- **Acceso:** Conocer qué datos personales están siendo tratados.
- **Rectificación:** Solicitar la corrección de datos inexactos.
- **Supresión:** Solicitar la eliminación de los datos personales.
- **Oposición:** Oponerse al tratamiento de sus datos.
- **Portabilidad:** Recibir los datos en un formato estructurado y transmitirlos a otro responsable.
- **Limitación del tratamiento:** Solicitar que se restrinja el tratamiento de sus datos.

Para ejercer cualquiera de estos derechos, el usuario puede enviar una solicitud a **[musicai@mikelleon-gaisep1.eus](mailto:musicai@mikelleon-gaisep1.eus)** indicando el derecho que desea ejercer y adjuntando una copia de un documento identificativo si fuera necesario. El responsable responderá en un plazo máximo de 30 días.

## Eliminación de la cuenta

El usuario puede eliminar su cuenta y todos los datos asociados (partituras, tokens de restablecimiento) desde la sección "Zona de peligro" de su perfil, confirmando su contraseña. Esta acción es irreversible.

## Transferencias internacionales de datos

El Servicio utiliza la API de **Groq** para la generación de partituras. Groq procesa los datos de inferencia en servidores ubicados en **Estados Unidos** (Google Cloud Platform). Groq ofrece **Cláusulas Contractuales Tipo (SCCs)** adoptadas por la Comisión Europea como garantía adecuada para las transferencias internacionales de datos.

Groq **no utiliza los datos de los clientes para entrenar sus modelos** por defecto y ofrece la opción de **Zero Data Retention**.

Puede consultar la política de datos de Groq en: [https://console.groq.com/docs/your-data](https://console.groq.com/docs/your-data)

## Destinatarios de los datos

El Servicio no cede datos personales a terceros, salvo los siguientes prestadores de servicio necesarios para el funcionamiento:

| Proveedor | Servicio | Ubicación |
|-----------|----------|-----------|
| Groq (Groq LLC) | Inferencia de IA para generación de partituras | Estados Unidos (SCCs) |
| Dinahosting | Servicio de correo electrónico (SMTP) para envío de enlaces de restablecimiento | España / UE |
| Google Fonts | Fuentes tipográficas (solicitud CSS, sin envío de datos personales) | Estados Unidos |

## Medidas de seguridad

El Servicio implementa las siguientes medidas técnicas y organizativas para proteger los datos personales:

- Cifrado de contraseñas mediante **bcrypt** (coste 12).
- Transmisión de tokens de autenticación mediante **cookie HttpOnly** (no accesible desde JavaScript).
- Atributo **SameSite=Lax** para protección contra CSRF.
- Cabecera **Secure** activada en producción (HTTPS).
- Validación de MusicXML contra el esquema oficial antes de su almacenamiento.
- Registro de errores sin exponer datos sensibles en producción.

## Menores de edad

El Servicio no está dirigido a menores de 14 años. Los menores de 14 a 17 años podrán utilizar el Servicio únicamente con el consentimiento de sus padres o tutores legales.

## Actualizaciones

Esta Política de Privacidad puede actualizarse periódicamente. Se notificará a los usuarios cualquier cambio sustancial a través del correo electrónico registrado o mediante un aviso en el servicio.

*Última actualización: julio de 2026*

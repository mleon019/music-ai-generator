# Información sobre Inteligencia Artificial

## Modelos utilizados

El Servicio utiliza modelos de lenguaje de gran escala (LLMs) a través de la API de **Groq** para generar partituras musicales en formato MusicXML. Los modelos empleados incluyen, entre otros:

- Llama 3.3 70B (Meta)
- Llama 3.1 8B (Meta)
- Llama 4 Scout 17B (Meta)
- GPT-OSS Safeguard 20B / 120B (OpenAI)
- Groq Compound Mini / Compound

La selección del modelo concreto depende de la duración de la composición solicitada.

## Funcionamiento

Cuando un usuario introduce los parámetros de configuración (instrumento, tempo, indicador de compás y número de compases), el Servicio envía una solicitud a la API de Groq que contiene:

- Un **prompt de sistema** que define el rol del modelo como generador de partituras.
- **Ejemplos** (few-shot) en el indicador de compás solicitado.
- Los **parámetros del usuario** (instrumento, tempo, compás, duración).

La respuesta de la API se procesa, se valida contra el esquema oficial MusicXML 4.0 y, si es correcta, se presenta al usuario.

## Datos enviados al proveedor de IA

**Datos que SÍ se envían a Groq:**

- Parámetros de configuración de la partitura (instrumento, tempo, indicador de compás, número de compases).
- Prompt del sistema y ejemplos de referencia (sin datos personales).

**Datos que NO se envían a Groq:**

- Nombre, correo electrónico o cualquier dato personal del usuario.
- Credenciales de acceso (contraseñas, tokens).
- Información de otros usuarios.
- Datos de navegación o comportamiento.

## Política de datos de Groq

Groq, como proveedor de inferencia, **no utiliza los datos de los clientes para entrenar o mejorar sus modelos** por defecto. Groq no retiene los inputs ni outputs de las solicitudes de inferencia.

Los datos se almacenan en infraestructura de Google Cloud Platform (GCP) ubicada en **Estados Unidos**. Groq ofrece Cláusulas Contractuales Tipo (SCCs) como garantía para las transferencias internacionales de datos.

Para más información, consulte la [Política de Privacidad de Groq](https://groq.com/privacy-policy) y su [documentación sobre datos](https://console.groq.com/docs/your-data).

## Limitaciones

Los modelos de inteligencia artificial presentan limitaciones inherentes y pueden producir resultados incorrectos o inesperados.

En particular, la aplicación no garantiza que las partituras generadas:

- sean originales;
- sean musicalmente coherentes;
- resulten adecuadas para un propósito concreto;
- no presenten similitudes con obras musicales existentes.

Se recomienda revisar siempre el contenido antes de utilizarlo.

## Transparencia

Las partituras disponibles en la aplicación son generadas automáticamente mediante inteligencia artificial.

En todo momento el usuario debe ser consciente de que el contenido mostrado no ha sido elaborado manualmente por el autor del proyecto, sino producido mediante modelos de IA.

## Derechos de autor

Las partituras generadas mediante inteligencia artificial pueden presentar similitudes con composiciones existentes debido a las limitaciones propias de los modelos generativos.

La aplicación no realiza comprobaciones automáticas sobre la originalidad de las obras generadas.

Corresponde al usuario verificar que el uso de las partituras cumple la legislación aplicable en materia de propiedad intelectual y derechos de autor.

## Uso permitido

Las partituras generadas por esta aplicación están destinadas exclusivamente a fines:

- educativos;
- personales;
- de investigación.

No está permitido utilizar la aplicación ni las partituras generadas con fines comerciales.

*Última actualización: julio de 2026*

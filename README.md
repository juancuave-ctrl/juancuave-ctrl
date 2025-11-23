# News Site — Proyecto simple para publicar noticias

Instrucciones rápidas (PowerShell en Windows):

1. Abrir la carpeta del proyecto:

```powershell
cd "C:\Users\IACOLBOG703\Downloads\Yojares trabajos\yojares 11\news-site"
```

2. Instalar dependencias y arrancar:

```powershell
npm install
npm start
```

3. Abrir en el navegador:

http://localhost:3000

Descripción:
- `server.js` sirve `/public` y expone API `GET /api/news` y `POST /api/news`.
- Los datos se almacenan en `data/news.json`.

Notas:
- Si `npm` no está disponible, instalar Node.js desde https://nodejs.org.
- El frontend usa `fetch` y `textContent` para evitar inyección HTML.
 
Despliegue en Render (pasos rápidos)

1. Crear un repositorio en GitHub y subir el proyecto.

2. Desde PowerShell en la carpeta del proyecto:

```powershell
cd "C:\Users\IACOLBOG703\Downloads\Yojares trabajos\yojares 11\news-site"
git init
git add .
git commit -m "Initial commit: news-site"
git branch -M main
git remote add origin https://github.com/<tu-usuario>/<tu-repo>.git
git push -u origin main
```

3. En https://render.com -> New -> Web Service -> Connect a GitHub repo -> elegir tu repo.
	- Build Command: `npm install`
	- Start Command: `npm start`
	- Environment: dejar por defecto; Render provee `PORT` automáticamente.

4. Desplegar y abrir la URL asignada por Render.

Notas sobre persistencia de datos

- Actualmente las noticias se guardan en `data/news.json` en el sistema de archivos del servidor. Muchos servicios (incluido Render) tratan el sistema de archivos como efímero entre despliegues; las noticias podrían perderse cuando la instancia se reinicie o al hacer un nuevo deploy.
- Recomendación: para producción conectar la app a una base de datos (por ejemplo MongoDB Atlas). Puedo ayudarte a migrar y añadir la integración.

Despliegue con Docker (construir y ejecutar localmente)

1. Construir la imagen (PowerShell):

```powershell
cd "C:\Users\IACOLBOG703\Downloads\Yojares trabajos\yojares 11\news-site"
docker build -t news-site:latest .
```

2. Ejecutar la imagen localmente (mapear puerto 3000):

```powershell
docker run -p 3000:3000 news-site:latest
```

3. (Opcional) Subir a Docker Hub:

```powershell
docker tag news-site:latest <tu-dockerhub-usuario>/news-site:latest
docker push <tu-dockerhub-usuario>/news-site:latest
```

Despliegue en Render usando Dockerfile

- En Render crea un nuevo servicio y elige la opción para desplegar usando Docker (Render detectará el `Dockerfile`). Render construirá la imagen desde tu repo y la ejecutará.
- Alternativamente puedes usar la imagen en Docker Hub si prefieres empujar la imagen y desplegar desde ella.

Migración a MongoDB Atlas (persistencia recomendada)

1. Crear una cuenta gratuita en https://www.mongodb.com/atlas y crear un clúster gratis.
2. Crear un usuario de base de datos y añadir las IPs permitidas (puedes permitir tu IP temporalmente o usar 0.0.0.0/0 durante pruebas).
3. Obtener la cadena de conexión (URI) para tu clúster. Será algo como:

```
mongodb+srv://<usuario>:<password>@cluster0.abcd.mongodb.net/myDatabase?retryWrites=true&w=majority
```

4. En Render: abre tu servicio -> Environment -> Add Secret y añade la variable `MONGODB_URI` con el valor de la URI.

5. Migrar datos existentes (opcional):
	- Si quieres llevar las noticias ya publicadas en `data/news.json` al clúster, ejecuta en tu máquina local:

```powershell
cd "C:\Users\IACOLBOG703\Downloads\Yojares trabajos\yojares 11\news-site"
# exportar variable MONGODB_URI en PowerShell
$env:MONGODB_URI = 'mongodb+srv://<usuario>:<password>@cluster0.../myDatabase'
node migrate.js
```

6. Después de añadir `MONGODB_URI` a Render y (si migraste) ejecutar la migración localmente, redeploya la app en Render. La app detectará `MONGODB_URI` y empezará a usar la base de datos en lugar de `data/news.json`.

Notas de seguridad

- No subas credenciales (URI con usuario/contraseña) al repo. Usa variables de entorno/Secrets en Render.
- Considera crear un usuario de lectura/escritura con contraseña segura y restringir el acceso por IP mientras realizas pruebas.




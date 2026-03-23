# SecurityArepClass

Proyecto de despliegue seguro en AWS con arquitectura separada en dos instancias EC2:

- **Frontend**: Apache HTTP Server sirviendo cliente HTML + JavaScript.
- **Backend**: Spring Boot con autenticación sobre MongoDB Atlas.
- **TLS**: Certificados Let’s Encrypt (Certbot) en ambos dominios.

---

## 1) Arquitectura general

### Componentes

1. **Instancia EC2 Frontend**
   - Dominio: `https://apachevicentegarzon.duckdns.org`
   - Servicio: Apache
   - Función: servir cliente estático (`index.html`, `app.js`, `config.js`, `styles.css`).

2. **Instancia EC2 Backend**
   - Dominio: `https://springvicentegarzon.duckdns.org`
   - Servicios:
     - Apache (reverse proxy HTTPS)
     - Spring Boot (escuchando internamente en `127.0.0.1:5000`)
   - Función: exponer API REST segura y lógica de autenticación.

3. **MongoDB Atlas**
   - Base de datos: `arepDB`
   - Colección: `users`
   - Almacenamiento de credenciales con hash `BCrypt`.

### Flujo de comunicación

1. El navegador entra al frontend en `https://apachevicentegarzon.duckdns.org`.
2. El cliente JS envía peticiones HTTPS al backend en `https://springvicentegarzon.duckdns.org`.
3. Apache de backend recibe TLS y reenvía (reverse proxy) a Spring en `http://127.0.0.1:5000`.
4. Spring valida usuarios contra MongoDB Atlas.
5. La respuesta vuelve al cliente por HTTPS.

---

## 2) Estructura del proyecto

- `Apache/`
  - `index.html`: interfaz del cliente.
  - `styles.css`: estilos.
  - `config.js`: URL base del backend (`springApiBaseUrl`).
  - `app.js`: llamadas REST asíncronas (`fetch`).

- `springsecure/`
  - `src/main/java/...`: código Spring Boot (controladores, seguridad, auth, repositorio).
  - `src/main/resources/application.properties`: configuración de app.
  - `pom.xml`: dependencias y build Maven.

---

## 3) Seguridad implementada

1. **TLS extremo público**
   - Dominio frontend con Let’s Encrypt.
   - Dominio backend con Let’s Encrypt.

2. **Reverse proxy en backend**
   - Apache termina TLS en 443.
   - Spring no se expone públicamente en 5000.

3. **Autenticación**
   - Endpoints de registro/login.
   - Contraseñas almacenadas como hash BCrypt en MongoDB.

4. **CORS restringido**
   - Backend acepta solicitudes desde:
     - `https://apachevicentegarzon.duckdns.org`

---

## 4) Variables de entorno del backend (EC2 Spring)

Definir antes de iniciar Spring:

```bash
export MONGODB_URI='mongodb+srv://USUARIO:PASSWORD@cluster0.kgpjlte.mongodb.net/arepDB'
export MONGODB_DATABASE='arepDB'
export APP_CORS_ALLOWED_ORIGIN='https://apachevicentegarzon.duckdns.org'
export SERVER_SSL_ENABLED='false'
```

---

## 5) Despliegue (paso a paso)

### 5.1 Frontend (instancia Apache frontend)

1. Copiar archivos de `Apache/` a `/var/www/html/`.
2. Verificar `Apache/config.js` con:

```js
springApiBaseUrl: "https://springvicentegarzon.duckdns.org";
```

3. Reiniciar Apache.
4. Probar en navegador:
   - `https://apachevicentegarzon.duckdns.org`

### 5.2 Backend (instancia Spring)

1. Compilar en local:

```bash
mvn clean package
```

2. Subir `target/classes` y `target/dependency` a la instancia backend.
3. Iniciar Spring con classpath:

```bash
java -cp "classes:dependency/*" com.mycompany.springsecure.Secureweb
```

4. Configurar Apache 443 como reverse proxy a `http://127.0.0.1:5000/`.
5. Verificar certificado Let’s Encrypt activo para `springvicentegarzon.duckdns.org`.

---

## 6) Endpoints principales

### Públicos

- `GET /`
- `POST /api/auth/register`
- `POST /api/auth/login`

### Protegidos

- `GET /api/auth/me`
- `GET /api/secure/ping`

---

## 7) Pruebas de funcionamiento

### 7.1 Salud backend

```bash
curl -i https://springvicentegarzon.duckdns.org/
```

### 7.2 Registro

```bash
curl -i -X POST https://springvicentegarzon.duckdns.org/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"MiClaveSegura123"}'
```

### 7.3 Login

```bash
curl -i -X POST https://springvicentegarzon.duckdns.org/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"MiClaveSegura123"}'
```

### 7.4 Endpoint protegido

```bash
curl -i -u test@test.com:MiClaveSegura123 \
  https://springvicentegarzon.duckdns.org/api/secure/ping
```

### 7.5 Verificación CORS

```bash
curl -i -X OPTIONS https://springvicentegarzon.duckdns.org/api/auth/login \
  -H "Origin: https://apachevicentegarzon.duckdns.org" \
  -H "Access-Control-Request-Method: POST"
```

---

## 8) Evidencia de pruebas (screenshots)

Capturas incluidas en la carpeta `assets/`:

1. **Frontend HTTPS**
   - Archivo: `assets/frontHTTPS.png`
   - Evidencia: acceso seguro al frontend en `https://apachevicentegarzon.duckdns.org`.

![Frontend HTTPS](assets/frontHTTPS.png)

2. **Backend HTTPS**
   - Archivo: `assets/BackHttps.png`
   - Evidencia: acceso seguro al backend en `https://springvicentegarzon.duckdns.org`.

![Backend HTTPS](assets/BackHttps.png)

3. **Login exitoso**
   - Archivo: `assets/LoginSucces.png`
   - Evidencia: autenticación correcta desde el cliente web.

![Login exitoso](assets/LoginSucces.png)

4. **Login fallido**
   - Archivo: `assets/LoginUnsucces.png`
   - Evidencia: rechazo de credenciales inválidas.

![Login fallido](assets/LoginUnsucces.png)

5. **Hash en MongoDB**
   - Archivo: `assets/MongoDb.png`
   - Evidencia: almacenamiento de contraseña hasheada (BCrypt).

![Hash en MongoDB](assets/MongoDb.png)

---

## 9) Problemas comunes y diagnóstico rápido

1. **`Failed to fetch` en frontend**
   - Revisar `Apache/config.js` (URL backend correcta HTTPS).
   - Verificar que backend responde por dominio.
   - Verificar CORS en backend.

2. **`curl: Could not connect to server` en 443**
   - Revisar Apache activo y escuchando en 443.
   - Revisar Security Group (puertos 80/443).

3. **Apache muestra `It works!` en backend**
   - Falta configurar reverse proxy en vhost 443.

4. **Build Maven falla al limpiar `target`**
   - Detener proceso Java que esté usando `target/dependency`.

---

## 10) Estado final esperado

- Frontend accesible por HTTPS en su dominio.
- Backend accesible por HTTPS en su dominio.
- Login funcionando contra MongoDB Atlas.
- Passwords almacenadas con BCrypt.
- CORS restringido al dominio del frontend.
- Evidencias (screenshots + video) listas para entrega.

---

## 11) Video explicativo

- Enlace del video: https://drive.google.com/file/d/1AySr0r2pGeiwdpUgK_hWKBYHwikaIFkE/view?usp=drive_link

# Genki - Plataforma de Gestión Docente

## Descripción del Proyecto

Genki es una plataforma de gestión docente diseñada para facilitar la administración de clases, estudiantes, evaluaciones y reportes. Permite a los profesores gestionar sus cursos de manera eficiente, registrar calificaciones, y generar informes detallados. La aplicación cuenta con un frontend basado en HTML, CSS y JavaScript puro, y un backend robusto construido con Node.js y Express.js, utilizando MongoDB como base de datos.

## Características

-   **Autenticación de Usuarios**: Registro y login seguro para profesores.
-   **Gestión de Clases**: Creación, edición y eliminación de clases.
-   **Gestión de Estudiantes**: Inscripción de estudiantes a clases.
-   **Gestión de Evaluaciones**: Creación y asignación de evaluaciones a estudiantes.
-   **Registro de Calificaciones**: Ingreso y actualización de calificaciones.
-   **Generación de Reportes**: Exportación de datos en formatos PDF y CSV.
-   **Calendario de Eventos**: Gestión de eventos y fechas importantes.
-   **Perfiles de Usuario**: Visualización y edición de perfiles de usuario.
-   **Archivos Estáticos**: Servir archivos HTML, CSS, JS e imágenes directamente.

## Tecnologías Utilizadas

### Frontend
-   **HTML5**: Estructura de las páginas web.
-   **CSS3**: Estilos y diseño de la interfaz de usuario.
-   **JavaScript (Vanilla JS)**: Lógica del lado del cliente y manipulación del DOM.

### Backend
-   **Node.js**: Entorno de ejecución de JavaScript.
-   **Express.js**: Framework web para Node.js.
-   **MongoDB**: Base de datos NoSQL para almacenamiento de datos.
-   **Mongoose**: ODM (Object Data Modeling) para MongoDB.
-   **JWT (JSON Web Tokens)**: Para autenticación segura.
-   **Bcrypt.js**: Para el hash de contraseñas.
-   **CORS**: Manejo de políticas de origen cruzado.
-   **Dotenv**: Gestión de variables de entorno.
-   **Multer**: Para la carga de archivos (imágenes de perfil).
-   **PDFKit**: Generación de documentos PDF.
-   **CSV-stringify**: Generación de archivos CSV.
-   **Cookie-parser**: Parseo de cookies.
-   **Express-validator**: Validación de datos de entrada.

## Estructura del Proyecto

```
.
├── .env.example
├── .gitignore
├── README.md
├── app.js
├── package-lock.json
├── package.json
├── public/
│   ├── assets/
│   │   └── images/
│   ├── calendar.html
│   ├── css/
│   ├── dashboard.html
│   ├── edit-class.html
│   ├── gradebook.html
│   ├── index.html
│   ├── js/
│   ├── login.html
│   ├── profile.html
│   ├── register.html
│   ├── reports.html
│   └── uploads/
│       └── profiles/
└── src/
    ├── config/
    │   └── database.js
    ├── controllers/
    │   ├── assessmentController.js
    │   ├── authController.js
    │   ├── classController.js
    │   ├── eventController.js
    │   ├── reportController.js
    │   └── userController.js
    ├── middleware/
    │   ├── auth.js
    │   ├── hashPassword.js
    │   ├── upload.js
    │   └── validation.js
    ├── models/
    │   ├── Assessment.js
    │   ├── Class.js
    │   ├── Event.js
    │   └── User.js
    └── routes/
        ├── assessmentRoutes.js
        ├── authRoutes.js
        ├── classRoutes.js
        ├── eventRoutes.js
        ├── index.js
        ├── reportRoutes.js
        └── userRoutes.js
```

## Instalación

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/hearty22/tomeru-.git
    cd tomeru-
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno**:
    Crea un archivo `.env` en la raíz del proyecto y añade las siguientes variables:
    ```
    PORT=3000
    MONGODB_URI=your_mongodb_connection_string
    JWT_SECRET=your_jwt_secret
    ```
    Reemplaza `your_mongodb_connection_string` con la URI de conexión a tu base de datos MongoDB y `your_jwt_secret` con una cadena secreta fuerte para JWT.

4.  **Iniciar el servidor**:
    ```bash
    npm run dev
    ```
    El servidor se iniciará en `http://localhost:3000` (o el puerto que hayas configurado).

## Uso

Una vez que el servidor esté en funcionamiento, puedes acceder a la aplicación a través de tu navegador web en `http://localhost:3000`.

-   **Página de Inicio**: `public/index.html`
-   **Login**: `public/login.html`
-   **Registro**: `public/register.html`
-   **Dashboard**: `public/dashboard.html`
-   **Calendario**: `public/calendar.html`
-   **Libro de Calificaciones**: `public/gradebook.html`
-   **Perfil**: `public/profile.html`
-   **Reportes**: `public/reports.html`

## Endpoints de la API

Todas las rutas de la API están prefijadas con `/api`.

### Autenticación (`/api/auth`)
-   `POST /api/auth/register`: Registra un nuevo usuario.
-   `POST /api/auth/login`: Inicia sesión y devuelve un token JWT.
-   `GET /api/auth/profile`: Obtiene el perfil del usuario autenticado.
-   `POST /api/auth/logout`: Cierra la sesión del usuario.

### Clases (`/api/classes`)
-   `GET /api/classes`: Obtiene todas las clases.
-   `GET /api/classes/:id`: Obtiene una clase por ID.
-   `POST /api/classes`: Crea una nueva clase.
-   `PUT /api/classes/:id`: Actualiza una clase existente.
-   `DELETE /api/classes/:id`: Elimina una clase.

### Evaluaciones (`/api/assessments`)
-   `GET /api/assessments`: Obtiene todas las evaluaciones.
-   `GET /api/assessments/:id`: Obtiene una evaluación por ID.
-   `POST /api/assessments`: Crea una nueva evaluación.
-   `PUT /api/assessments/:id`: Actualiza una evaluación existente.
-   `DELETE /api/assessments/:id`: Elimina una evaluación.

### Reportes (`/api/reports`)
-   `GET /api/reports/grades/csv`: Genera un reporte de calificaciones en formato CSV.
-   `GET /api/reports/grades/pdf`: Genera un reporte de calificaciones en formato PDF.

### Eventos (`/api/events`)
-   `GET /api/events`: Obtiene todos los eventos.
-   `GET /api/events/:id`: Obtiene un evento por ID.
-   `POST /api/events`: Crea un nuevo evento.
-   `PUT /api/events/:id`: Actualiza un evento existente.
-   `DELETE /api/events/:id`: Elimina un evento.

### Usuarios (`/api/users`)
-   `GET /api/users`: Obtiene todos los usuarios.
-   `GET /api/users/:id`: Obtiene un usuario por ID.
-   `PUT /api/users/:id`: Actualiza un usuario existente.
-   `DELETE /api/users/:id`: Elimina un usuario.

### Salud del API (`/api/health`)
-   `GET /api/health`: Verifica el estado de la API.

## Esquema de la Base de Datos (MongoDB)

### User Schema
-   `username`: String, único, requerido.
-   `email`: String, único, requerido.
-   `password`: String, requerido.
-   `role`: String (e.g., 'teacher', 'admin').
-   `profilePicture`: String (URL a la imagen de perfil).
-   `createdAt`: Date.
-   `updatedAt`: Date.

### Class Schema
-   `name`: String, requerido.
-   `description`: String.
-   `teacher`: ObjectId (referencia a User), requerido.
-   `students`: Array de ObjectId (referencia a User).
-   `createdAt`: Date.
-   `updatedAt`: Date.

### Assessment Schema
-   `name`: String, requerido.
-   `class`: ObjectId (referencia a Class), requerido.
-   `student`: ObjectId (referencia a User), requerido.
-   `grade`: Number.
-   `date`: Date.
-   `createdAt`: Date.
-   `updatedAt`: Date.

### Event Schema
-   `title`: String, requerido.
-   `description`: String.
-   `date`: Date, requerido.
-   `class`: ObjectId (referencia a Class).
-   `createdAt`: Date.
-   `updatedAt`: Date.

---
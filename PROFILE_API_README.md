# API de Fotos de Perfil - Documentación

## Endpoints Disponibles

### 1. Obtener Perfil del Usuario
**GET** `/api/profile`

Obtiene la información del perfil del usuario autenticado, incluyendo la ruta de la foto de perfil.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "message": "Perfil obtenido exitosamente",
  "user": {
    "id": 1,
    "user_name": "johndoe",
    "email": "john@example.com",
    "gender": "masculino",
    "profile_photo_path": "uploads/profiles/profile_photo-1234567890123.jpg"
  }
}
```

### 2. Subir Foto de Perfil
**POST** `/api/profile`

Sube una nueva foto de perfil para el usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Body (form-data):**
- `profile_photo`: Archivo de imagen (JPG, PNG, GIF, etc.)

**Respuesta exitosa (200):**
```json
{
  "message": "Foto de perfil actualizada exitosamente",
  "profilePhotoPath": "uploads/profiles/profile_photo-1234567890123.jpg",
  "filename": "profile_photo-1234567890123.jpg"
}
```

**Errores posibles:**
- `400`: No se seleccionó ningún archivo
- `400`: Solo se permiten archivos de imagen
- `401`: Token inválido o expirado
- `404`: Usuario no encontrado
- `413`: Archivo demasiado grande (máximo 5MB)
- `500`: Error interno del servidor

### 3. Eliminar Foto de Perfil
**DELETE** `/api/profile`

Elimina la foto de perfil actual del usuario autenticado.

**Headers:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "message": "Foto de perfil eliminada exitosamente"
}
```

**Errores posibles:**
- `401`: Token inválido o expirado
- `404`: Usuario no encontrado
- `500`: Error interno del servidor

## Validaciones

- **Tamaño máximo**: 5MB por archivo
- **Formatos permitidos**: JPG, PNG, GIF, WEBP, BMP, TIFF
- **Autenticación**: Todos los endpoints requieren un token JWT válido

## Acceso a las Imágenes

Las imágenes de perfil se sirven estáticamente desde la URL:
```
http://localhost:PORT/uploads/profiles/[filename]
```

Por ejemplo:
```
http://localhost:3000/uploads/profiles/profile_photo-1234567890123.jpg
```

## Notas Importantes

1. Las imágenes se almacenan en el directorio `uploads/profiles/`
2. Los nombres de archivo son únicos y generados automáticamente
3. Al eliminar una foto de perfil, se elimina tanto del sistema de archivos como de la base de datos
4. El campo `profile_photo_path` en la base de datos puede ser `null` si el usuario no tiene foto de perfil

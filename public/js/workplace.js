    const parseJwt = (token)=>{
        try {
            return JSON.parse(atob(token.split(".")[1]))
        } catch (e) {
            return null
        }
    }

    // ✅ Obtener token de cookies (como está configurado en el backend)
    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    }

    // ✅ Función simplificada para obtener solo la foto de perfil
    async function loadProfilePicture() {
        try {
            const token = getCookie('token') || localStorage.getItem("token");

            if (!token) {
                console.log("No se encontró token");
                return;
            }

            const payload = parseJwt(token);
            console.log("Usuario:", payload);

            if (payload && payload.user_name) {
                // ✅ Actualizar el mensaje de bienvenida
                document.getElementById("username").textContent = payload.user_name;

                // ✅ Obtener información completa del perfil del servidor
                const response = await fetch("/api/profile", {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const user = data.user;

                    // ✅ Actualizar el dropdown de perfil
                    const profilePicture = document.getElementById("profile-picture");
                    const profileName = document.querySelector(".pd-name strong");

                    // Actualizar nombre en el dropdown
                    profileName.textContent = user.user_name;

                    // ✅ Actualizar foto de perfil si existe
                    if (user.profile_photo_path) {
                        profilePicture.src = `/${user.profile_photo_path}`;
                        profilePicture.alt = `Foto de ${user.user_name}`;
                        console.log("✅ Foto de perfil cargada:", user.profile_photo_path);
                    } else {
                        // Si no hay foto, usar imagen por defecto
                        profilePicture.src = "./img/pfp-default.webp";
                        profilePicture.alt = "Foto de perfil por defecto";
                        console.log("📷 Usando imagen por defecto");
                    }

                    console.log("Perfil cargado exitosamente:", user.user_name);
                } else {
                    console.log("Error al obtener perfil:", response.status);
                }
            }
        } catch (error) {
            console.error("Error al cargar el perfil:", error);
        }
    }

    // ✅ Cargar la foto de perfil cuando se carga la página
    document.addEventListener('DOMContentLoaded', loadProfilePicture);

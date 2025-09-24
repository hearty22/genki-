
// Mostrar preview de la imagen seleccionada
const profilePictureInput = document.getElementById('profilePicture');
const currentPFP = document.getElementById('currentPFP');
const pfpPreview = document.getElementById('pfpPreview');

// ✅ Agregar preview antes de subir
profilePictureInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            currentPFP.src = e.target.result;
            // Cambiar borde a amarillo para indicar "pendiente de subir"
            pfpPreview.style.border = "4px solid #FFC107";
            pfpPreview.style.boxShadow = "0 0 10px rgba(255, 193, 7, 0.3)";
        };
        reader.readAsDataURL(file);
    }
});


const todasLasCookies = document.cookie;

// Para obtener el valor de una cookie específica, debes analizar la cadena
// Por ejemplo, para obtener una cookie llamada "token":
const token = document.cookie
  .split('; ')
  .find(row => row.startsWith('token='))
  ?.split('=')[1];
//funcion para decodificar el token
function decodeJwt(token) {
    try {
        // Separa el token en sus 3 partes
        const base64Url = token.split('.')[1];
        // Reemplaza los caracteres especiales de base64
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        // Decodifica y parsea la cadena JSON
        const payload = JSON.parse(window.atob(base64));
        return payload;
    } catch (e) {
        // En caso de que el token sea inválido o la decodificación falle
        return null;
    }
};
const user = decodeJwt(token);

document.getElementById("username").textContent = user.user_name;
//--------------------------------------------------------------------------------------------------------
//parte logica para cargar las fotos de perfiles a la base de datos

document.getElementById("pfpForm").addEventListener("submit",async (e)=>{
    e.preventDefault();
    const file = document.getElementById("profilePicture").files[0];

    // Validar que se haya seleccionado un archivo
    if(!file){
        alert("Por favor selecciona una imagen");
        return;
    }

    const formData = new FormData();
    formData.append("profile_photo", file); // ✅ Cambiado a 'profile_photo' para coincidir con el backend

    try {
        const res = await fetch("/api/profile",{ // ✅ Ruta relativa en lugar de URL completa
            method: "POST",
            headers: {
                'Authorization': `Bearer ${token}` // ✅ Agregado token de autenticación
            },
            body: formData
        });

        const data = await res.json();

        if(res.ok){
            alert("✅ " + data.message);

            // ✅ Actualizar la imagen mostrada dinámicamente
            const currentPFP = document.getElementById('currentPFP');
            const pfpPreview = document.getElementById('pfpPreview');

            // Usar la ruta devuelta por el servidor
            currentPFP.src = `/uploads/profiles/${data.filename}`;

            // ✅ Agregar efecto visual de éxito
            pfpPreview.style.border = "4px solid #4CAF50"; // Verde para éxito
            pfpPreview.style.boxShadow = "0 0 15px rgba(76, 175, 80, 0.5)";

            // ✅ Limpiar el input para permitir subir otra imagen
            document.getElementById('profilePicture').value = '';

            // ✅ Remover el efecto después de 3 segundos
            setTimeout(() => {
                pfpPreview.style.border = "4px solid #4ecdc4"; // Volver al color original
                pfpPreview.style.boxShadow = "none";
            }, 3000);

            // ✅ Actualizar el texto del label
            const labelSpan = document.querySelector('.custom-file-label span');
            labelSpan.textContent = '📷 Cambiar Foto de Perfil';
            window.location.href = "../workplace.html"
        }else{
            alert("❌ Error: " + data.error);
        }
    } catch (error) {
        alert("❌ No se pudo conectar con el servidor: " + error.message);
        console.log(error);
    }
})



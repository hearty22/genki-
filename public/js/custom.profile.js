
// Mostrar preview de la imagen seleccionada
    const profilePictureInput = document.getElementById('profilePicture');
    const currentPFP = document.getElementById('currentPFP');
    const pfpPreview = document.getElementById('pfpPreview');
    const frameColorInput = document.getElementById('frameColor');

    profilePictureInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(evt) {
                currentPFP.src = evt.target.result;
            }
            reader.readAsDataURL(file);
        } else {
            currentPFP.src = "./img/pfp-default.webp";
        }
    });
    
    document.getElementById("pfpForm").addEventListener("submit", async (e)=>{
        e.preventDefault();
        const formData = new FormData();
        const file = document.getElementById("profilePicture").files[0];

        if (file){formData.append("profilePicture", file);};
        const token = localStorage.getItem("token")

        const res = await fetch("http://localhost:3000/api/profile",{
            method: "POST",
            headers:{"Authorization": `Bearer ${token}`},
            body: formData
        });
        const data = await res.json();
        if(res.ok){
            window.location.href = "./workplace.html"
        }
        else{alert("error al guardar la foto")}
        
    })

    const parseJwt = (token)=>{
        try {
            return JSON.parse(atob(token.split(".")[1]))
        } catch (e) {
            return null
        }
    }
    const token = localStorage.getItem("token");
    if(token){
        const payload = parseJwt(token);
        if(payload && payload.user_name){
            document.getElementById("username").textContent = payload.user_name;
        }
    }
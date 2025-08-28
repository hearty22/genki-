document.getElementById("register-form").addEventListener("submit",async (e)=>{
    e.preventDefault();

    const mensaje = document.getElementById("message");

    const res = await fetch("http://localhost:3000/api/register",{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            user_name: e.target.children.name.value,
            email: e.target.children.email.value,
            password: e.target.children.pass.value
        })
    
    });
    const data = await res.json();
    if (res.ok) {
        mensaje.textContent = "Usuario registrado";
        mensaje.style.color = "green";
    } else {
        mensaje.textContent = data.error || "error en el registro"
        mensaje.style.color = "red"
    }


})
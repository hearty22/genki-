document.getElementById("register-form").addEventListener("submit",async (e)=>{
    e.preventDefault();
    const mensaje = document.getElementById("message-register");
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
        mensaje.textContent = "Usuario registrado, Inicie sesión";
        mensaje.style.color = "green";
    } else {
        mensaje.textContent = data.message || data.error;
        mensaje.style.color = "red"
    }
})
document.getElementById("login-form").addEventListener("submit", async (e)=>{
    e.preventDefault()
    console.log(e.target.children.loginemail.value);
    console.log(e.target.children.loginpass.value)

    const mensaje = document.getElementById("message-login");
    const res = await fetch("http://localhost:3000/api/login",{
        method: "POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify({
            email: e.target.children.loginemail.value,
            password: e.target.children.loginpass.value
        })

    });
    const data = await res.json();
    if (res.ok) {
        console.log("logeado cabro")
        mensaje.textContent = "Logeado cabro";
        mensaje.style.color = "green";
    } else {
        console.log("error mi cabro")
        mensaje.textContent = data.message || data.error || "no hay nada"
        mensaje.style.color = "red"
    }
})

document.getElementById("show-login").onclick = async ()=>{
    document.getElementById("login-form-container").classList.add("active");
    document.getElementById("register-form-container").classList.remove("active");
    // this.classList.add("active")
    document.getElementById("show-register").classList.remove("active");
};
document.getElementById("show-register").onclick = async ()=>{
    document.getElementById("login-form-container").classList.remove("active");
    document.getElementById("register-form-container").classList.add("active");
    // this.classList.add("active");
    document.getElementById("show-login").classList.remove("active");
}
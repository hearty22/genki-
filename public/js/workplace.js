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

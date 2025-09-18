
// Mostrar preview de la imagen seleccionada
const profilePictureInput = document.getElementById('profilePicture');
const currentPFP = document.getElementById('currentPFP');
const pfpPreview = document.getElementById('pfpPreview');


const user = async ()=>{
    const info = await fetch("http://localhost:3000/api/profile")
    console.log(info);
    return info;
}
console.log(user());

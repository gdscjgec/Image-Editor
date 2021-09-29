const fileBtn = document.querySelector("#input-field");
const uploadBtn = document.querySelector("#upload");

//global variable 
var uploaded_img = "";

//Action button for file upload
function uploadbtnActive(){
    fileBtn.click();
}
//Displaying the image from user input
fileBtn.addEventListener('change', function(){
    const reader = new FileReader();
    reader.addEventListener('load',() => {
        uploaded_img = reader.result;
        document.querySelector('#img-box').style.backgroundImage = `url(${uploaded_img})`;

    });
    reader.readAsDataURL(this.files[0]);
})

const fileBtn = document.querySelector("#input-field");
const uploadBtn = document.querySelector("#upload");
const saveBtn = document.querySelector("#save-now");
const canvas = document.querySelector("#img-box");
const ctx = canvas.getContext("2d");

//global variable 
var uploaded_img = "";

//Action button for file upload
function uploadbtnActive(){
    fileBtn.click();
}

//Simple algorithm to convert image to GreyScale
function doGreyScale(){
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    for(var i = 0; i < data.length; i += 4){
        var avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = avg;
        data[i + 1] = avg;
        data[i + 2] = avg;
    }
    ctx.putImageData(imageData, 0, 0);
}

//Simple algorithm to convert image to Sepia
function doSepia(){
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    for(let i = 0; i < data.length; i += 4){
        data[i]*=1.07;
        data[i + 1]*=0.74;
        data[i + 2]*=0.43;
    }
    ctx.putImageData(imageData, 0, 0);
}

function brightness(data,val){
    if(val<=-1){
        val=-1;
    }
    if(val>=1){
        val=1;
    }
    val=~~(255*val);
    for(let i=0;i<data.length;i+=1){
        data[i]+=val;
    }
}

function saturation(data,val){
    if(val<=-1){
        val=-1;
    }
    for(let i=0;i<data.length;i+=4){
        let gray=0.2989*data[i]+0.1140*data[i+2]+0.5870*data[i+1];
        data[i]= -gray*val+data[i]*(1+val);
        data[i+1]= -gray*val+data[i+1]*(1+val);
        data[i+2]= -gray*val+data[i+2]*(1+val);
    }
}

function rgbAdjust(data,vals){
    for(let i=0;i<data.length;i+=4){
        data[i]*=vals[0];
        data[i+1]*=vals[1];
        data[i+2]*=vals[2];
    }
}


//Save Image from Canvas
saveBtn.addEventListener("click", function(){
    const downloadImg = canvas.toDataURL("image/png");
    saveBtn.href = downloadImg;
    saveBtn.download = "image.png";
    saveBtn.click();
});

//Rendering user Generated Image onto Canvas
fileBtn.addEventListener('change', function(){
    const reader = new FileReader();
    reader.addEventListener('load',() => {
        uploaded_img = reader.result;
        const image = new Image();
        image.src = uploaded_img;
        image.onload = () => {
            document.querySelector("div.uploaded-img-container").style.display = "none";
            canvas.style.display = "block";
            ctx.clearRect(0,0,canvas.width,canvas.height);
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        };
    });
    reader.readAsDataURL(this.files[0]);
});

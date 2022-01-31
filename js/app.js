const fileBtn = document.querySelector("#input-field");
const uploadBtn = document.querySelector("#upload");
const saveBtn = document.querySelector("#save-now");
const undoBtn = document.querySelector("#undo-btn");
const redoBtn = document.querySelector("#redo-btn");
var canvas = document.querySelector("#img-box");
var isDark = false;
const cropButtonDOM = document.getElementById("crop-button");
var beforeExpImagedata;
var isExpRangeVisible = false;
var ctx = canvas.getContext("2d");
const changeControl = {
    prevImage: null,
    currentImage: null,
    nextImage: null,
};

const themeSwitch = document.querySelector('input');

themeSwitch.addEventListener('change', () => {
	if (!isDark) {
		document.getElementById("dark").style.display = "none"
		document.getElementById("light").style.display = "block"
	}
	else {
		document.getElementById("dark").style.display = "block"
		document.getElementById("light").style.display = "none"
	}
	isDark = !isDark;
  document.body.classList.toggle('dark-theme');
});

// Rotate image on cick 
const Root = document.documentElement
const gRoot = getComputedStyle(Root)

var RotateDeg = parseInt(gRoot.getPropertyValue('--turn'))

function rotate() {
    ctx.save();
  // prep canvas for rotation
    ctx.translate(canvas.width, 0);                   // translate to canvas center
    ctx.rotate(Math.PI*0.5);                 // add rotation transform
    ctx.globalCompositeOperation = "copy";   // set comp. mode to "copy"
    ctx.drawImage(ctx.canvas,  0, 0, canvas.height, canvas.width); // draw image
    ctx.restore();
    //Root.style.setProperty('--turn', RotateDeg + "deg")
}

// Undo last action
function unDo(){
    if(changeControl.prevImage){
        if(document.getElementById("img-box").style.display=='none'){
            document.getElementById("img-box").style.display='block';
            document.querySelector("div.uploaded-img-container").style.display = "none";
        }
        undoBtn.classList.add("disabled");
        redoBtn.classList.remove("disabled");
        ctx.putImageData(changeControl.prevImage, 0, 0);
        changeControl.nextImage = changeControl.currentImage;
        changeControl.currentImage = changeControl.prevImage;
        changeControl.prevImage = null;
    }
}

// Draw a rectangle to crop with mousemove
const doCrop = (initialCoords, imageData, event) => {
   ctx.putImageData(imageData, 0, 0);
   const rect = canvas.getBoundingClientRect();
   const coords = {
      x: ((event.clientX - rect.left) / (rect.right - rect.left)) * canvas.width,
      y: ((event.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height,
   };
   ctx.strokeRect(initialCoords.x, initialCoords.y, coords.x, coords.y);
};

// Crop and set the new image with mouseup
const endCrop = (initialCoords, event) => {
   const rect = canvas.getBoundingClientRect();
   const coords = {
      x: ((event.clientX - rect.left) / (rect.right - rect.left)) * canvas.width,
      y: ((event.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height,
   };

   // getting the image in the area of the reactangle
   const croppedImage = ctx.getImageData(
      initialCoords.x + 1,
      initialCoords.y + 1,
      Math.abs(initialCoords.x - coords.x),
      Math.abs(initialCoords.y - coords.y)
   );

   // removing listerners
   var old_element = canvas;
   var new_element = old_element.cloneNode(true);
   old_element.parentNode.replaceChild(new_element, old_element);
   canvas = new_element;
   ctx = canvas.getContext("2d");

   // setting up the cropped image
   ctx.putImageData(croppedImage, 0, 0);
};

// Crop when mousedown
const startCrop = (imageData, event) => {
   const rect = canvas.getBoundingClientRect();
   const initialCoords = {
      x: ((event.clientX - rect.left) / (rect.right - rect.left)) * canvas.width,
      y: ((event.clientY - rect.top) / (rect.bottom - rect.top)) * canvas.height,
   };
   canvas.addEventListener("mousemove", (event) => doCrop(initialCoords, imageData, event));
   canvas.addEventListener("mouseup", (event) => endCrop(initialCoords, event));
};

// Crop Image
const cropImage = () => {
   var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
   canvas.addEventListener("mousedown", (event) => startCrop(imageData, event));
};

// Show Exposure Range
const showExposureRange = () => {
   if (!isExpRangeVisible) {
      document.getElementById("exposure-icon").style.display = "none";
      document.getElementById("exposure-range").style.display = "block";
      beforeExpImagedata = ctx.getImageData(0, 0, canvas.width, canvas.height);
      isExpRangeVisible = true;
   }
};

// Change Exposure
const changeExposure = (event) => {
   const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
   const val = event.target.value;
   for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = beforeExpImagedata.data[i] + 255 * (val / 100);
      imageData.data[i + 1] = beforeExpImagedata.data[i + 1] + 255 * (val / 100);
      imageData.data[i + 2] = beforeExpImagedata.data[i + 2] + 255 * (val / 100);
   }
   ctx.putImageData(imageData, 0, 0);
};

// Redo last action
function reDo(){
    if(changeControl.nextImage){
        redoBtn.classList.add("disabled");
        undoBtn.classList.remove("disabled");
        ctx.putImageData(changeControl.nextImage, 0, 0);
        changeControl.prevImage = changeControl.currentImage;
        changeControl.currentImage = changeControl.nextImage;
        changeControl.nextImage = null;
    }
}

// Remove image btn click
function remove()
{
document.getElementById("img-box").style.display='none';
ctx.clearRect(0, 0, canvas.width, canvas.height);
document.querySelector("div.uploaded-img-container").style.display = "block";
}

//Function to call specific filters and do change control, add new cases for new filters
function applyFilter(filter){
    redoBtn.classList.add("disabled");
    undoBtn.classList.remove("disabled");
    changeControl.nextImage = null;
    changeControl.prevImage = changeControl.currentImage;
    switch(filter){
        case "grey":
            doGreyScale();
            break;
        case "sepia":
            doSepia();
            break;
        case "lark":
            doLark();
            break;
        case "amaro":
            doAmaro();
            break;
        case "remove":
            remove();
    }
    changeControl.currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

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

//Simple algorithm to convert image to Lark
function doLark(){
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    brightness(data,0.08);
    rgbAdjust(data,[1,1.03,1.05]);
    saturation(data,0.12);
    ctx.putImageData(imageData, 0, 0);
}

//Simple algorithm to convert image to Amaro
function doAmaro(){
    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;
    brightness(data,0.15);
    saturation(data,0.3);
    ctx.putImageData(imageData, 0, 0);
}

//val should be from -1 to 1 and 0 for unchanged
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

//val should be -1 to positive number and 0 is for unchanged
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

//RGB Adjust
function rgbAdjust(data,vals){
    for(let i=0;i<data.length;i+=4){
        data[i]*=vals[0];
        data[i+1]*=vals[1];
        data[i+2]*=vals[2];
    }
}

// Adjust image exposure
rangeInput = document.getElementById('range');

container = document.getElementsByClassName('img-box')[0];

rangeInput.addEventListener("mousemove",function(){
container.style.filter = "brightness(" + rangeInput.value + "%)";
});

//Save Image from Canvas
saveBtn.addEventListener("click", function(){
    const downloadImg = canvas.toDataURL("image/png");
    saveBtn.href = downloadImg;
    saveBtn.download = "image.png";
});

//Rendering user Generated Image onto Canvas
fileBtn.addEventListener('change', function(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
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
            changeControl.currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
        };
    });
    reader.readAsDataURL(this.files[0]);
});

cropButtonDOM.addEventListener("click", cropImage);

$(window).scroll(function() {
    if ($(this).scrollTop() > 50 ) {
        $('.scrolltop:hidden').stop(true, true).fadeIn();
    } else {
        $('.scrolltop').stop(true, true).fadeOut();
    }
});
$(function(){$(".scroll").click(function(){$("html,body").animate({scrollTop:$(".thetop").offset().top},"1000");return false})})
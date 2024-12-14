setTimeout(() => {
  document.getElementById("autoCloseButton")?.click();
}, 2000);

NProgress.configure({
  minimum: 0.1, // Minimum percentage
  speed: 300, // Speed of the progress bar
  showSpinner: false, // Hide the spinner
  trickleSpeed: 200, // How often to trickle, in ms
  easing: "ease", // Easing for animation
});

function updateValue(spanId, value) {
  document.getElementById(spanId).textContent = value;
}

const submitButton = document.querySelector('button.btn[type="submit"]');
const loadingButton = document.getElementById("loadingButton");
submitButton.addEventListener("click", function () {
  submitButton.classList.add("d-none");
  loadingButton.classList.remove("d-none");
  NProgress.start();
  NProgress.inc();
});

const fileInput = document.getElementById("myfile");
const previewContainer = document.querySelector(".preview-container");
const preview = document.getElementById("img-preview");
const closeButton = document.querySelector(".preview-container button");

function clearInput() {
  previewContainer.classList.add("d-none");
  preview.src = null;
  fileInput.value = "";
}

closeButton.addEventListener("click", clearInput);

function previewImage(event) {
  const fileInput = event.target;
  const reader = new FileReader();

  if (fileInput.files && fileInput.files[0]) {
    previewContainer.classList.remove("d-none");

    reader.onload = function (e) {
      preview.src = e.target.result;
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    clearInput();
  }
}

function submitPicture() {
  console.log("Clicked");
  fetch("/User/generate", {
    method: "POST",
  })
    .then((result) => {
      console.log(result);
      return result.json();
    })
    .then((data) => {
      console.log(data);
      // productElement.parentNode.removeChild(productElement);
    })
    .catch((err) => console.log(err));
}

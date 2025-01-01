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

const submitButton = document.getElementById('submit-button');
const loadingButton = document.getElementById("loading-button");

submitButton.addEventListener("click", function () {
  console.log("Clicked");
  submitButton.classList.add("d-none");
  loadingButton.classList.remove("d-none");
  NProgress.start();
  NProgress.inc();
});

function submitPicture() {
  console.log("Clicked");
  fetch("/user/generate", {
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

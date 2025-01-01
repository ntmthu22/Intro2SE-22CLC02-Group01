document.querySelectorAll(".fas.fa-undo").forEach((undoIcon) => {
  undoIcon.addEventListener("click", () => {
    handleAccountAction(
      "restore",
      `/admin/users/${undoIcon.dataset.userId}/restore`
    );
  });
});

document.querySelectorAll(".fa.fa-ban").forEach((trashIcon) => {
  trashIcon.addEventListener("click", () => {
    handleAccountAction(
      "disable",
      `/admin/users/${trashIcon.dataset.userId}/disable`
    );
  });
});

const disableButton = document.getElementById("button-disable");
const restoreButton = document.getElementById("button-restore");

if (disableButton) {
  disableButton.addEventListener("click", function () {
    handleAccountAction(
      "disable",
      `/admin/users/${disableButton.dataset.userId}/disable`
    );
  });
}
if (restoreButton) {
  restoreButton.addEventListener("click", function () {
    handleAccountAction(
      "restore",
      `/admin/users/${restoreButton.dataset.userId}/restore`
    );
  });
}

async function handleAccountAction(action, endpointUrl) {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: `This will ${action} the account to full functionalities!`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: `Yes, ${action} it!`,
  });

  if (result.isConfirmed) {
    try {
      const response = await fetch(endpointUrl, {
        method: "POST",
        body: JSON.stringify({
          title: `${action} this account`,
          completed: false,
        }),
        headers: {
          "Content-Type": "application/json; charset=UTF-8",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        Swal.fire({
          title: "Error!",
          text: `Failed: ${errorData.message || "Unknown error"}`,
          icon: "error",
        });
        return;
      }

      // Show success feedback
      Swal.fire({
        title: `${action.charAt(0).toUpperCase()}${action.slice(1)}d!`,
        text: `This account has been ${action}d!`,
        icon: "success",
      }).then(() => {
        window.location.reload();
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        title: "Error!",
        text: "An unexpected error occurred. Please try again later.",
        icon: "error",
      });
    }
  }
}

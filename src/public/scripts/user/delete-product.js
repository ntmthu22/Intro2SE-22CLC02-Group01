document
  .querySelector(".container")
  .addEventListener("click", async function (e) {
    if (e.target.classList.contains("delete-button")) {
      const productId = e.target.dataset.productId;
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "This will delete the product completely!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        try {
          const response = await fetch(`/user/delete-product/${productId}`, {
            method: "DELETE",
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

          const successData = await response.json();
          Swal.fire({
            title: "Deleted!",
            text: successData.message,
            icon: "success",
          }).then(() => {
            window.location.reload();
          });
        } catch (err) {
          console.error(err);
          Swal.fire({
            title: "Error!",
            text: "An unexpected error occurred. Please try again later.",
            icon: "error",
          });
        }
      }
    }
  });

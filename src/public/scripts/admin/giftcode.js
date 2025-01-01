document.getElementById("generate-code").addEventListener("click", async () => {
  const response = await fetch("/admin/generate-giftcode", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (response.ok) {
    location.reload();
  } else {
    alert("Failed to generate giftcode!");
  }
});

document.querySelector("tbody").addEventListener("click", async (e) => {
  if (e.target.classList.contains("delete-button")) {
    const codeId = e.target.dataset.codeId;
    const response = await fetch(`/admin/delete-giftcode?id=${codeId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      location.reload();
    } else {
      alert("Failed to delete giftcode!");
    }
  }
});

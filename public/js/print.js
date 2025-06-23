window.addEventListener("DOMContentLoaded", () => {
  const printButton = document.getElementById("printButton");
  if (printButton) {
    printButton.addEventListener("click", () => {
      console.log("Print button clicked");
      window.print();
    });
  }
});

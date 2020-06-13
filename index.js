function change() {
  copyStringToClipboard("​");
  var btn = document.getElementById("Change");
  btn.style.transition = "0.12s ease-in-out";
  btn.style.color = "#7289da";
  sleep(300).then(() => {
    btn.innerHTML = "Copied!";
    btn.style.color = "white";
    sleep(300).then(() => {
      btn.style.color = "#7289da";
      sleep(300).then(() => {
        btn.style.color = "white";
        btn.innerHTML = "Zero Width Space";
      });
    });
  });
}
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
function copyStringToClipboard(str) {
  var el = document.createElement("textarea");
  el.value = str;
  el.setAttribute("readonly", "");
  el.style = { position: "absolute", left: "-9999px" };
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
}

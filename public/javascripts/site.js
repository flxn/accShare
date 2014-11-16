window.scrollTo(0, 0);
document.querySelector('.addnewcard').style.display = "inherit";

var matches = document.querySelectorAll('.hide-load');

for (var i in matches) {
    matches[i].style.transition = "opacity 0.3s";
    matches[i].style.opacity = "1";
}

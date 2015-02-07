$(document).ready(function(){
  //$('ul.tabs').tabs();
  $(".button-collapse").sideNav();
  $(".modal-trigger").leanModal();
  $('.tooltipped').tooltip({"delay": 50});
  window.scrollTo(0, 0);
  var matches = document.querySelectorAll('.hide-load');

  for (var i in matches) {
    if(matches[i].style){
      matches[i].style.transition = "opacity 0.3s";
      matches[i].style.opacity = "1";
    }
      
  }

  $('#url').keyup(function() {
    if($('#url').val().length > 2){
      angular.element(document.getElementById('url')).scope().getAccounts($('#url').val());
    }
  });
});



$(function(){
  $.fn.serializeObject = function() { 
    var o = {}; 
    var a = this.serializeArray(); 
    $.each(a, function() { 
      if (o[this.name]) { 
        if (!o[this.name].push) { 
          o[this.name] = [ o[this.name] ]; 
        } 
        o[this.name].push(this.value || ''); 
      } else { 
        o[this.name] = this.value || ''; 
      } 
    }); 
    return o; 
  }
  $('#submitBtnJoke').click(function(e){
   var formNode = $('#formJoke');
   var formObj = formNode.serializeObject();
   console.log(formObj)
   if(!formObj.joke){
      return false;
   }
   document.getElementById("formJoke").submit();
  })
  $('#submitBtnImage').click(function(e){
    var formNode = $('#inputFile');
    console.log(formNode)
    if(!formNode[0].value){
       return false;
    }
    document.getElementById("formImage").submit();
   })
})
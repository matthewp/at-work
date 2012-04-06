function gimmePrefix(prop){
  var prefixes = ['Moz','Khtml','Webkit','O','ms'],
      elem     = document.createElement('div'),
      upper    = prop.charAt(0).toUpperCase() + prop.slice(1);

  if (prop in elem.style)
    return prop;
        
  for (var len = prefixes.length; len--; ){
    if ((prefixes[len] + upper)  in elem.style)
      return (prefixes[len] + upper);
  }
  

  return false;
}

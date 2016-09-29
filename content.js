function outputText( text ){
    console.log( text );
    var para = document.createElement("P");
    var t = document.createTextNode( text );
    para.appendChild(t);
    document.body.appendChild(para);
}

function getSearchTerm(){
  let elements = document.querySelectorAll('.gsfi');
  if( elements.length === 0 ){
    setTimeout( getSearchTerm, 100 );
    return false;
  }
  var element = elements[ 0 ];

  if( element.value.length > 0 ){
     outputText( element.value );
  }

 element.addEventListener( 'input', function( event ){
     outputText( event.target.value );
  });
}

if( document.readyState === 'complete' ){
    console.log('document is complete');
    getSearchTerm();
}

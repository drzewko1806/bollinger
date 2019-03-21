function doUpload(uploader) {
   var reader = new FileReader();
   reader.readAsText(uploader.files[0], 'UTF-8');
   reader.onload = function(evt) {
	   var entryContent = document.getElementById('entryContent');
	   entryContent.value = evt.target.result;
	   entryContent.innerHTML = evt.target.result;
   };
   reader.onerror = function(evt) {
      alert('Błąd wczytywania pliku!');
   };
}




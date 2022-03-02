let saveFile = () => {
    // Get the data from each element on the form.
      const classNum = document.getElementById('classInfo');
    const capacity = document.getElementById('capInfo');
    const lab = document.getElementById('labInfo');
    const tech = document.getElementById('techInfo');
    const ciscOrStat = document.getElementById('classes');

     // This variable stores all the data.
     let data = 
        '\r class number: ' + classNum.value + ' \r\n ' + 
        'capacity: ' +capacity.value + ' \r\n ' + 
        'lab: ' + lab.value + ' \r\n ' + 
        'tech: ' + tech.value + ' \r\n ' + 
        'cisc or stat: ' + ciscOrStat.value;


         // Convert the text to BLOB.
    const textToBLOB = new Blob([data], { type: 'text/plain' });
    const sFileName = 'formData.txt';	   // The file to save the data.

    let newLink = document.createElement("a");
    newLink.download = sFileName;

    if (window.webkitURL != null) {
        newLink.href = window.webkitURL.createObjectURL(textToBLOB);
    }
    else {
        newLink.href = window.URL.createObjectURL(textToBLOB);
        newLink.style.display = "none";
        document.body.appendChild(newLink);
    }

    newLink.click();
    
    classNum.value = '';
    capacity.value = '';
    lab.value      = '';
    tech.value     = '';
}
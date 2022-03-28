/* eslint-disable no-undef */
// eslint-disable-next-line no-unused-vars
const saveFile = () => {
  // Get the data from each element on the form.
  // get class number
  const classNum = document.getElementById('classInfo');
  // get capacity
  const capacity = document.getElementById('capInfo');
  // get Y or N for lab needed
  const lab = document.getElementById('labInfo');
  // get Y or N for tech needed
  const tech = document.getElementById('techInfo');
  // get if Cisc or Stat
  const ciscOrStat = document.getElementById('classes');

  // This variable stores all the data.
  const data = `\r class number: ${classNum.value} \r\n `
        + `capacity: ${capacity.value} \r\n `
        + `lab: ${lab.value} \r\n `
        + `tech: ${tech.value} \r\n `
        + `cisc or stat: ${ciscOrStat.value}`;

  // Convert the text to BLOB.
  // textToBLOB is plain text file
  const textToBLOB = new Blob([data], { type: 'text/plain' });
  const sFileName = 'formData.txt'; // The file to save the data.
  // create a new element
  const newLink = document.createElement('a');
  // download the saved data
  newLink.download = sFileName;
  // the download is successful
  if (window.webkitURL != null) {
    // virutal hyperlink representing textToBLOB
    // can be downloaded or sent to database
    newLink.href = window.webkitURL.createObjectURL(textToBLOB);
  } else {
    // virtual hyperlink representing textToBLOB
    newLink.href = window.URL.createObjectURL(textToBLOB);
    // don't display it
    newLink.style.display = 'none';
    // add url
    document.body.appendChild(newLink);
  }
  // click link to download/send to database
  newLink.click();
  // clear values once finished
  classNum.value = '';
  capacity.value = '';
  lab.value = '';
  tech.value = '';
};

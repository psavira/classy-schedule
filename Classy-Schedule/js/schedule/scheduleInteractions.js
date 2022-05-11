// Contains Schedule Getters and Setters

/* -------------------------------------------------------------------------- */
/*                                  Professor                                 */
/* -------------------------------------------------------------------------- */

/**
 * Sets the professor dropdown at a particular time and day to a given value
 * @param {*} timecode 
 * @param {*} day 
 * @param {*} professor_id 
 */
function setProfessor(timecode, day, professor_id) {
  // Get the time row by timecode
  let tr = document.querySelector(`tr[data-time-code=${timecode}]`)

  if (!tr) {
    console.error(`Couldn't find row for time code ${timecode}`)
    return
  }

  // Get the day column by day
  let td = tr.querySelector(`td[data-day=${day}]`)

  if (!tr) {
    console.error(`Couldn't find column ${day} for time code ${timecode}`)
    return
  }

  // Make sure the class isn't at default value
  let classSelect = td.querySelector('select.classSelection')

  if (!classSelect) {
    console.error(`Couldn't find class select at T${timecode}, D${day}`)
    return
  }

  if (classSelect.value == '') {
    console.error('Can\'t set professor on an undefined class.')
    return
  }

  // Finally, set the professor 
  let professorSelect = td.querySelector('select.professorSelect')

  professorSelect.value = professor_id;

  professorSelect.dispatchEvent(new Event('change'))
}

/* -------------------------------------------------------------------------- */
/*                                    Class                                   */
/* -------------------------------------------------------------------------- */

/**
 * Sets the class dropdown at a particular time and day to a given value
 * @param {*} timecode 
 * @param {*} day 
 * @param {*} professor_id 
 */
function setClass(timecode, day, class_id, section) {
  // Get the time row by timecode
  let tr = document.querySelector(`tr[data-time-code='${timecode}']`)

  if (!tr) {
    console.error(`Couldn't find row for time code ${timecode}`)
    return
  }

  // Get the day column by day
  let td = tr.querySelector(`td[data-day='${day}']`)

  if (!tr) {
    console.error(`Couldn't find column ${day} for time code ${timecode}`)
    return
  }

  // Reset the professor value
  let professorSelect = td.querySelector('select.professorSelect')

  if (!professorSelect) {
    console.error(`Couldn't find professor select at T${timecode}, D${day}`)
    return
  }

  professorSelect.value = ''

  // Set the class value
  let classSelect = td.querySelector('select.classSelection')

  if (!classSelect) {
    console.error(`Couldn't find class select at T${timecode}, D${day}`)
    return
  }

  classSelect.value = `${class_id}:${section}`

  // Fire the change event on classSelect
  classSelect.dispatchEvent(new Event('change'))
}

/* -------------------------------------------------------------------------- */
/*                                    Table                                   */
/* -------------------------------------------------------------------------- */

/**
 * Gets the schedule as an object
 * @returns The current schedule as an object
 */
function getTable() {
  let table = {}

  // Iterate through class selects in schedule
  let selects = document.querySelectorAll("table select.classSelection");
  
  selects.forEach((select) => {
    // Get the class select value
    let selectedClass = select.value;
    // Get the professor select value
    let profSelect = select.parentNode.querySelector('select.professorSelect')
    let selectedProf = profSelect.value;
    
    // Find the time block and the day
    let day = select.parentNode.dataset.day;
    let time = select.parentNode.parentNode.dataset.time;

    // Check that the appropriate day exists. If not, create one
    if (table[day] === undefined) {
      table[day] = {};
    }
    table[day][time] = {
      'class': selectedClass,
      'professor': selectedProf
    };
  });

  return table;
}

/**
 * Sets the visual table to the values saved in the given table parameter
 * @param table The table object to put into the table
 */
function setTable(table) {
  // Iterate through selects in table
  let selects = document.querySelectorAll("table select.classSelection");
  selects.forEach((select) => {
    // Get the local professor select
    let profSelect = select.parentNode.querySelector('select.professorSelect')

    // Find the time block and the day
    let day = select.parentNode.dataset.day;
    let time = select.parentNode.parentNode.dataset.time;

    // Check that the appropriate day exists. If not, create one
    if (table[day] === undefined) {
      throw new Error(`Couldn't find day [${day}] in parameter table`);
    }

    if (table[day][time] === undefined) {
      throw new Error(`Couldn't find time [${time}] for day [${day}] in parameter table`);
    }
    select.value = table[day][time]['class'];
    profSelect.value = table[day][time]['professor'];

    select.dispatchEvent(new Event('change'))
  });
}

/** Sets the table to an empty configuration */
function clearTable() {
  // get the table
  const tableSelects = document.querySelectorAll('#table select');
  // for each row in table - clear it
  tableSelects.forEach((tableSelect) => {
    tableSelect.value = '';
  });
}

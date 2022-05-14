// Functions dealing with schedule population

/**
 * Parse professor data into dropdown options
 * @param {*} profdata Professor data to parse
 */
function populateProfessorDropdowns(profdata) {
  // Turn each professor into an option for the select element
  let options = []
  for (let prof of profdata) {
    let $profOption = $(document.createElement("option"))
    $profOption.val(prof.professor_id)
    $profOption.text(`${prof.last_name}, ${prof.first_name}`)
    options.push($profOption)
  }

  // Sort options alphabetically
  options.sort((o1, o2) => {
    let t1 = o1.text().toLowerCase()
    let t2 = o2.text().toLowerCase()
    if (t1 <= t2) return -1
    return 1
  })

  // Hide and disable option by default
  options.forEach((option) => {
    option[0].disabled = true
    option[0].hidden = true
  })

  // Add all options to the select
  $(".professorSelect").append(options)
}

/**
 * Populates plan dropdowns from given data
 * @param {*} plans List of plans to populate
 */
function populatePlanDropdowns(plans) {
  let options = []
  for(let plan of plans) {
    console.log(plans)
    let option = document.createElement("option")
    option.value = plan["plan_id"]
    option.textContent = plan["plan_name"]
    options.push(option)
  }
  $("#planSelect").append(options)
}
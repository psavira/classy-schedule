// Functions dealing with schedule population
function populateProfessorDropdowns(profdata) {
    let options = []
    for(let prof of profdata) {
        let $profOption = $(document.createElement("option"))
        $profOption.val(prof.professor_id)
        $profOption.text(`${prof.last_name}, ${prof.first_name}`)
        options.push($profOption)
    }
    options.sort((o1, o2) => {
        let t1 = o1.text().toLowerCase()
        let t2 = o2.text().toLowerCase()
        if(t1 <= t2) return -1
        return 1
    })
    $(".professorSelect").append(options)
}
(function() {

    function createOptionElement(classes) {
        let data = classes.length

        // get the department element
        const department_select = document.getElementById("test")

        // have some kind of loop
        for(let i = 0; i < data.length; i++) {

        // create a new option element
        const new_option = document.createElement("option")

        // set the properties you want
        new_option.innerText = data[i]
        new_option.value = data[i]

        // append the new option to the select element
        department_select.appendChild(new_option)
    }
    }

    let container = document.getElementById("deptContainer");

    console.log("Fetching departments")

    fetch("/api/Classes")
    .then((response) => {
        if(response.ok) {
            return response.json()
        } else {
            throw new Error("Failed to get API response");
        }
    })
    .then((json) => {
        for(let classes of json) {
            container.appendChild(createDeptElement(classes))
        }
    })
    .catch((error) => {
        console.error(error.message)
    })
})()
(function() {

    function createDeptElement(dept) {
        let element = document.createElement("div");
        element.textContent = `ID: ${dept.dept_id} | NAME: ${dept.dept_name}`;
        return element;
    }

    let container = document.getElementById("deptContainer");

    console.log("Fetching departments")

    fetch("/api/departments")
    .then((response) => {
        if(response.ok) {
            return response.json()
        } else {
            throw new Error("Failed to get API response");
        }
    })
    .then((json) => {
        for(let department of json) {
            container.appendChild(createDeptElement(department))
        }
    })
    .catch((error) => {
        console.error(error.message)
    })
})()
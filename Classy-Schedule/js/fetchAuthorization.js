var dbToken;

let body = {
    username: window.localStorage.getItem("user"),
    password: window.localStorage.getItem("pass")
}

function fetchAuthorization() {
    return fetch("https://capstonedbapi.azurewebsites.net/user-management/admin/authenticate",
    {
        "method": "POST",
        "headers": {
        "Content-Type": "application/json"
        },
        "body": JSON.stringify(body),
    }).then((response) => {
        return response.json()
    }).then((json) => {
        return json.token;
    })
}

dbToken = fetchAuthorization()

dbToken.then(token => {
    console.log(token)
})
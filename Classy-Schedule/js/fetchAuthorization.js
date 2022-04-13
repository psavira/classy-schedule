var dbToken;
let body = {
    username: "test",
    password: "test"
}

function fetchAuthorization() {
    return fetch("https://capstonedbapi.azurewebsites.net/Users/authenticate",
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
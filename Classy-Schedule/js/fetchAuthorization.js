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

// Refresh time is 60 seconds (1000 ms/s * 60 s)
const authRefreshTime = 1000 * 60
setInterval(() => {
    dbToken = fetchAuthorization()
}, authRefreshTime)
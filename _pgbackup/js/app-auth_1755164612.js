(function(global){
    function login(email, password){
        return API.login(email, password).then(user => {
            localStorage.setItem('user', JSON.stringify(user));
            window.location.href = 'dashboard.html';
        }).catch(err => alert('Login failed: ' + err.message));
    }

    function logout(){
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }

    global.Auth = { login, logout };
})(window);

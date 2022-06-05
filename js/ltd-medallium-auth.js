function rc4(key, str) {
	var s = [], j = 0, x, res = '';
	for (var i = 0; i < 256; i++) {
		s[i] = i;
	}
	for (i = 0; i < 256; i++) {
		j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
		x = s[i];
		s[i] = s[j];
		s[j] = x;
	}
	i = 0;
	j = 0;
	for (var y = 0; y < str.length; y++) {
		i = (i + 1) % 256;
		j = (j + s[i]) % 256;
		x = s[i];
		s[i] = s[j];
		s[j] = x;
		res += String.fromCharCode(str.charCodeAt(y) ^ s[(s[i] + s[j]) % 256]);
	}
	return res;
}

function decrypt(message = '', key = ''){
    var code = CryptoJS.AES.decrypt(message, key);
    var decryptedMessage = code.toString(CryptoJS.enc.Utf8);
    return decryptedMessage;
}

function onSubmit(form) {

    var login = form.username || form.querySelector('#login').value;
    var password = form.token || form.querySelector('#password').value;
    var loginbak = login
    var rc4key = login.concat(' ltd-medallium.github.io')
    var decrypt1 = decrypt(password, loginbak)
    var accessToken = rc4(rc4key, decrypt1)

    var gh = new GitHub({
        token: accessToken
    });

    var username = 'ltd-medallium';
    var repoName = 'ltd-medallium-private';
    var filePath = `${page}`;

    var fileName = filePath.split(/(\\|\/)/g).pop();
    var fileParent = filePath.substr(0, filePath.lastIndexOf("/") + 1);

    var repo = gh.getRepo(username, repoName);

    fetch('https://api.github.com/repos/' +
		  username + '/' +
		  repoName + '/git/trees' +
		  encodeURI(fileParent+fileName), {
		    headers: {
		      "Authorization": "token " + accessToken
		    }
		  }).then(function(response) {
		  return response.json();
		}).then(function(content) {
        var file = content.tree.filter(entry => entry.path === fileName);

        if (file.length > 0) {
            repo.getBlob(file[0].sha).then(function(response) {
            		localStorage.setItem('ltd-medalliumAuth', JSON.stringify({ username: loginbak, token: password }));
                var content_priv = response.data;
                var startIdx = content_priv.indexOf('<body ');
                document.body.innerHTML = content_priv.substring(
                    content_priv.indexOf('>', startIdx) + 1,
                    content_priv.indexOf('</body>'));
            });
        } else {
            //document.querySelector('#loginForm').innerHTML = `Failed to load document (status: ${response.status})`;
        }
    });
}

var existingAuth = JSON.parse(localStorage.getItem('ltd-medalliumAuth'));
if (existingAuth) {
    onSubmit(existingAuth);
}

const http = require('http');

const query = 'a';
const url = `http://localhost:3000/api/search?q=${query}`;

console.log(`Testing API URL: ${url}`);

http.get(url, (res) => {
    let data = '';

    console.log(`Status Code: ${res.statusCode}`);

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log('API Response received:');
            console.log('Songs found:', json.songs ? json.songs.length : 0);
            console.log('Albums found:', json.albums ? json.albums.length : 0);
            console.log('Artists found:', json.artists ? json.artists.length : 0);
            console.log('Playlists found:', json.playlists ? json.playlists.length : 0);

            if (json.artists && json.artists.length > 0) {
                console.log('First Artist Name:', json.artists[0].artistName);
            }

            if (res.statusCode === 200 && (json.artists.length > 0 || json.songs.length > 0)) {
                console.log('✅ API TEST PASSED: Data returned.');
            } else {
                console.log('❌ API TEST FAILED: Response empty or error.');
                console.log('Full JSON:', JSON.stringify(json, null, 2));
            }

        } catch (e) {
            console.error('Error parsing JSON:', e.message);
            console.log('Raw Data:', data);
        }
    });

}).on("error", (err) => {
    console.log("Error: " + err.message);
});

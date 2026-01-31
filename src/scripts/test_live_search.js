const http = require('http');

const testQueries = ['Xian Ni', 'Xian', 'Ni'];

async function testSearch(query) {
    return new Promise((resolve, reject) => {
        const url = `http://localhost:3000/api/search?q=${encodeURIComponent(query)}`;

        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ status: res.statusCode, query, data: json });
                } catch (e) {
                    resolve({ status: res.statusCode, query, error: data });
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function runTests() {
    console.log('Testing Search API...\n');

    for (const query of testQueries) {
        try {
            const result = await testSearch(query);
            console.log(`Query: "${result.query}"`);
            console.log(`Status: ${result.status}`);

            if (result.status === 200) {
                console.log(`✅ Songs: ${result.data.songs?.length || 0}`);
                console.log(`✅ Artists: ${result.data.artists?.length || 0}`);
                console.log(`✅ Albums: ${result.data.albums?.length || 0}`);
                console.log(`✅ Playlists: ${result.data.playlists?.length || 0}`);
            } else {
                console.log(`❌ Error: ${result.data?.message || result.error}`);
            }
            console.log('---\n');
        } catch (err) {
            console.error(`Failed to test "${query}":`, err.message);
        }
    }
}

runTests();

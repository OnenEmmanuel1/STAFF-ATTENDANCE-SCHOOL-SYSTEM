const bcrypt = require('bcrypt');

async function testHash() {
    const password = 'password123';
    const hashFromDb = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'; // The one I inserted

    console.log('Testing hash from DB...');
    const match = await bcrypt.compare(password, hashFromDb);
    console.log(`Password: ${password}`);
    console.log(`Hash: ${hashFromDb}`);
    console.log(`Match? ${match}`);

    if (!match) {
        console.log('Generating new hash...');
        const newHash = await bcrypt.hash(password, 10);
        console.log(`New Hash for 'password123': ${newHash}`);
    }
}

testHash();

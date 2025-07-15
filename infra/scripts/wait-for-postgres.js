const { exec } = require('node:child_process');
function checkPostgres() {

    exec('docker exec postgres-dev pg_isready --host localhost', randleReturn)

    function randleReturn(error, stdout) {
        if (stdout.search("accepting connections") === -1) {
            process.stdout.write(".");
            checkPostgres();
            return;
        }

        console.log("\nPostgres está pronto para receber conexões!");
    }

}

console.log("aguardando o postgres iniciar...");
checkPostgres();
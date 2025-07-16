import retry from "async-retry";
async function waitForAllServices(params) {
    await waitForWebServer();

    async function waitForWebServer() {
        return retry(fecthStatusPage, {
            retries: 100,
            maxTimeout: 2000,
        })

        async function fecthStatusPage() {
            const response = await fetch("http://localhost:3000/api/v1/status");
            const result = await response.json();
            if (response.status !== 200) {
                throw new Error(`Status page returned ${response.status}`);
            }
            return result;

        }
    }
}

export default {
    waitForAllServices,
};
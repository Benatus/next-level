function status(req, res) {
    res.status(200).json({
        message: "testando Ok"
    });
}

//Essa função é chamada quando a rota /api/status é acessada
// Ela envia uma resposta com status 200 e a mensagem "testando Ok"
export default status;
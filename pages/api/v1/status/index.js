import database from 'infra/database.js';

async function status(req, res) {
	try {
		const updateAt = new Date().toISOString();

		const status_do_banco = await database.query({
			text: 'SELECT (SELECT setting FROM pg_settings WHERE name = $1) AS max_connections,(SELECT count(*) FROM pg_stat_activity where datname= $2) AS active_connections,(SELECT current_setting($3)) AS version;',
			values: ['max_connections', 'local_db', 'server_version'],
		});
		res.status(200).json({
			update_at: updateAt,
			dependencies: {
				database: {
					db_version: status_do_banco.rows[0].version,
					db_max_connections: parseInt(status_do_banco.rows[0].max_connections),
					db_active_connections: parseInt(status_do_banco.rows[0].active_connections),
				},
			},
		});
	} catch(error) {
		console.error('Erro ao obter o status:', error);
		res.status(500).json({error: 'Erro ao obter o status do servidor'});
	}
}

// Essa função é chamada quando a rota /api/status é acessada
// Ela envia uma resposta com status 200 e a mensagem "testando Ok"
export default status;

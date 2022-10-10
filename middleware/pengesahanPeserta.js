const Peserta = require("../model/Peserta");

const pengesahanPeserta = async (req, res, next) => {
    try {
        const { peserta_id } = req.params;

        if (!peserta_id) {
            res.status(400).send({ mesej: 'Sila berikan ID Peserta' });
        }
    
        const peserta = await Peserta.findById(peserta_id);
    
        if (!peserta) {
            res.status(404).send({ mesej: 'Peserta tidak wujud' });
        }
    
        req.peserta = peserta;

        next();
    } catch (err) {
        res.status(500).end();
    }
}

module.exports = pengesahanPeserta;
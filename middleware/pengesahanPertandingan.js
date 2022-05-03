const Pertandingan = require("../model/Pertandingan");
const pengesahanToken = require("./pengesahanToken");


const pengesahanPertandingan = async (req, res, next) => {
    try {
        const { _id } = req.pengguna;
        const { pertandingan_id } = req.params;

        if (!_id) {
            return res.status(500).end();
        }

        // Mencari pertandingan dengan id yang diberi
        const pertandingan = await Pertandingan.findById(pertandingan_id);

        // Memastikan pertaningan wujud
        if (!pertandingan) {
            return res.status(404).send({ mesej: 'Pertandingan tidak dijumpai' });
        }
    
        // Memastikan pertandingan adalah milik pengguna
        if (_id !== pertandingan.pengguna_id) {
            return res.status(403).send({ mesej: 'Anda tidak dibenarkan mengelola pertandingan ini' });
        }
    
        // Mengumpukkan maklumat pertandingan
        req.pertandingan = pertandingan;

        next();
    } catch (err) {
        console.log(err);
        return res.status(500).send({ mesej: 'Masalah dalaman server' });
    }
};

module.exports = pengesahanPertandingan;
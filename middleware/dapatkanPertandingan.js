const Pertandingan = require("../model/Pertandingan");

const dapatkanPertandingan = async (req, res, next) => {
    try {
        const { _id: pengguna_id } = req.pengguna;
        const { pertandingan_id: _id } = req.params;

        // Mencari pertandingan dengan id yang diberi
        const pertandingan = await Pertandingan.findOne({ _id, pengguna_id });

        // Memastikan pertaningan wujud
        if (!pertandingan) {
            return res.status(404).send({ mesej: 'Pertandingan tidak dijumpai' });
        }
    
        // Mengumpukkan maklumat pertandingan
        req.pertandingan = pertandingan;

        next();
    } catch (err) {
        console.log(err);
        return res.status(500).send({ mesej: 'Masalah dalaman server' });
    }
};

module.exports = dapatkanPertandingan;
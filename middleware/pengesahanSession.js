const Session = require("../model/Session");

const pengesahanSession = async (req, res, next) => {
    try {
        const authorization = req.headers['authorization'];

        if (!authorization) {
            return res.status(400).send({ mesej: 'Sila muatkan token dalam Headers \'Authorization\' dengan format "Session {session}"'})
        }

        const type = authorization.split(' ');
        const _id = type[1];

        if (!_id) {
            return res.status(400).send({ mesej: 'Sila muatkan token dalam Headers \'Authorization\' dengan format "Session {session}'});
        }

        const session = await Session.findById(_id).populate('peserta');

        if (!session) {
            return res.status(400).send({ mesej: 'Session tidak sah' });
        }

        req.peserta = session.peserta;

        next();
    } catch (err) {
        if (err) throw err;
        return res.status(500).send({ mesej: 'Masalah dalaman server'});
    }
    
}

module.exports = pengesahanSession
const { CastError } = require('mongoose');

const kendaliRalatMongoose = (res, ralat, mesejDefault) => {
    console.log(ralat)
    if (ralat instanceof TypeError || ralat instanceof CastError) {
        return res.status(400).send({ nama: 'Ralat', mesej: mesejDefault });
    }

    return res.status(400).send({ ralat: ralat.name, mesej: ralat.message});
}

module.exports = kendaliRalatMongoose;
const deleteUndefinedProps = (object) => {
    let updateObj = {};
    for(let [key, value] of Object.entries(object)){
        if(value !== undefined){
            updateObj[key] = value;
        }
    }
    return updateObj;
}

module.exports = deleteUndefinedProps;


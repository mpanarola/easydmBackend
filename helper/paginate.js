async function paginate(params, model) {
    let search = null;
    let query = {};
    let $or = [];
    let options = { limit: 5, page: 1, pagination: true };
    if (params.hasOwnProperty('search')) {
        search = params.search;
        delete params.search;
    }
    if (params.hasOwnProperty('query')) {
        query = params.query;
    }
    if (params.hasOwnProperty('options')) {
        options = params.options;
    }
    if (search && search.hasOwnProperty('keys') && Array.isArray(search.keys) && search.keys.length) {
        for (let keyIndex = 0; keyIndex < search.keys.length; keyIndex++) {
            const key = search.keys[keyIndex];
            $or.push({ [key]: new RegExp(search.value, 'i') });
        }
        query['$or'] = $or;
    }
    try {
        const data = await model.paginate(query, options);
        return data;
    } catch(err) {
        console.log(err);
    }
}
module.exports = paginate;
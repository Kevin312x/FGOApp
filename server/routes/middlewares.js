const paginated_results = (req, list) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    
    const start_index = (page - 1) * limit;
    const end_index = page * limit;

    const list_result = {};

    if(end_index < list.length) {
        list_result.next = {
        page: page + 1,
        }
    }
    
    if(start_index > 0) {
        list_result.prev = {
        page: page - 1,
        }
    }
    
    list_result.current_page = page;
    list_result.limit = limit;
    list_result.result = list.slice(start_index, end_index);
    list_result.list_length = list.length;
    return list_result;
}

module.exports.paginated_results = paginated_results;
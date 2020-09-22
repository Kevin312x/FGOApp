const paginated_results = (list) => {
    return (req, res, next) => {
        list.then((ce) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 25;
            
            const start_index = (page - 1) * limit;
            const end_index = page * limit;

            const ce_list_result = {};

            if(end_index < ce.length) {
                ce_list_result.next = {
                page: page + 1,
                }
            }
            
            if(start_index > 0) {
                ce_list_result.prev = {
                page: page - 1,
                }
            }
            
            ce_list_result.current_page = page;
            ce_list_result.limit = limit;
            ce_list_result.result = ce.slice(start_index, end_index);
            ce_list_result.ce_length = ce.length;
            res.ce_list_result = ce_list_result;
            next();
        });
    }
}

module.exports.paginated_results = paginated_results;
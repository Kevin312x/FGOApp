const paginated_results = (req, list) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const sort = req.query.sort || 'id';
    
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

    switch(sort) {
        case 'rarity':
            list.sort((item1, item2) => {
                return item1.rarity < item2.rarity ? -1 : item1.rarity > item2.rarity ? 1 : 0;
            });
            break;
        case 'name':
            list.sort((item1, item2) => {
                let name1 = item1.name.toLowerCase();
                let name2 = item2.name.toLowerCase();
                return name1 < name2 ? -1 : name1 > name2 ? 1 : 0;
            });
            break;
        case 'atk':
            list.sort((item1, item2) => {
                return item2.max_atk - item1.max_atk;
            });
            break;
        case 'hp':
            list.sort((item1, item2) => {
                return item2.max_hp - item1.max_hp;
            });
            break;
        default:
            break;
    }

    list_result.current_page = page;
    list_result.limit = limit;
    list_result.result = list.slice(start_index, end_index);
    list_result.list_length = list.length;
    list_result.sort = sort;
    return list_result;
}

module.exports.paginated_results = paginated_results;
/**
 * Let R = # of rolls, P = % of probability
 * Percentage of rolling a 5* given a number of rolls:
 * P = 1 - (1 - .03)^(R)
 * 
 * Number of rolls to achieve a given probability:
 * R = (ln(1 - (P)) / ln(1 - .03))
 */

let calc_perc = document.getElementById('calcPercentage')
if(calc_perc) {
    addEventListener('click', () => {
        const ele = document.getElementsByName('server_options_1');
        const sq = document.getElementById('SQAmount').value;
        const tickets = document.getElementById('TicketAmount').value || 0;
        const percentage = document.getElementById('projected-percentage');
    
        for(i = 0; i < ele.length; ++i) {
            if(ele[i].checked) {
                var server = ele[i].value;
            }
        }
    
        const rate_up = (server == 'na' ? 0.007 : 0.008);
        const rolls = Math.floor(sq / 3) + parseInt(tickets) + (server == 'na' ? 0 : Math.floor((Math.floor(sq / 3) + parseInt(tickets)) / 10));
        
        percentage.value = (1 - Math.pow((1 - rate_up), rolls)) * 100;
    });
}


let calc_rolls = document.getElementById('calcRolls')
if(calc_rolls) {
   addEventListener('click', () => {
        const ele = document.getElementsByName('server_options_2');
        const percentage = document.getElementById('percentage').value;
        const num_rolls = document.getElementById('projected-rolls');
    
        for(i = 0; i < ele.length; ++i) {
            if(ele[i].checked) {
                var server = ele[i].value;
            }
        }
        const rate_up = (server == 'na' ? 0.007 : 0.008);
        const rolls = Math.ceil(Math.log((1 - (parseFloat(percentage) / 100))) / Math.log((1 - rate_up)));
        num_rolls.value = rolls;
    })
}

function display(x) {
    if(x == 0) {
        document.getElementById('percentage-form').style.display='block';
        document.getElementById('roll-form').style.display='none';
    } else if(x == 1) {
        document.getElementById('percentage-form').style.display='none';
        document.getElementById('roll-form').style.display='block';
    }
}

async function enable_servant_select() {
    const class_selected = document.getElementById('class-select').value;
    const servant_select = document.getElementById('servant-select');
    const np_level_selected = document.getElementById('np-level-select');

    document.getElementById('ATK').value = '0';
    document.getElementById('NPMod').value = '0';
    if(class_selected != 'None') {
        let servants;

        await $.ajax({
            url: '/servants/class/' + class_selected,
        }).done(function (data) {
            servants = data;
        })
        
        $('#servant-select').empty().append('<option value="None" selected>Choose a servant...</option>');
        servant_select.disabled = false;
        
        for(let servant in servants) {
            let option = document.createElement('option')
            option.appendChild(document.createTextNode(servants[servant]['name']));
            option.value = servants[servant]['servant_id'];
            servant_select.append(option);
        }
    } else {
        servant_select.value = 'None';
        servant_select.disabled = true;
        np_level_selected.value = '1';
        np_level_selected.disabled = true;
    }

}

async function fill_out_inputs() {
    let servant_id = document.getElementById('servant-select').value;
    const np_level_selected = document.getElementById('np-level-select');
    let servant_data;
    let servant_np_levels;

    await $.ajax({
        url: '/servants/id/' + servant_id,
    }).done(function (data) {
        servant_data = data['servant_data'];
        servant_np_levels = data['servant_np_levels'];
    })

    let atk_ele = document.getElementById('ATK');
    let np_ele = document.getElementById('NPMod');
    atk_ele.value = servant_data[0]['max_atk'];
    np_ele.value = servant_np_levels[0]['np_modifier'];

    np_level_selected.disabled = false;
}

function check_validity(event, cap) {
    const old_val = document.getElementById($(event.target).attr("id")).value;
    const input = event.key;
    const reg = new RegExp(/^[0-9]*(\.[0-9]{0,2})?$/, 'g');
    const new_val = old_val + input;
    
    if(reg.test(new_val) && parseFloat(new_val) <= cap) { return true; }
    else { return false; }
}

async function update_np_modifier() {
    const np_mod_ele = document.getElementById('NPMod');
    const servant_id = document.getElementById('servant-select').value;
    const np_level = document.getElementById('np-level-select').value;
    let servant_np_levels;

    await $.ajax({
        url: '/servants/id/' + servant_id,
    }).done(function(data) {
        servant_np_levels = data['servant_np_levels'];
    })

    np_mod_ele.value = servant_np_levels[parseInt(np_level) - 1]['np_modifier'];
}
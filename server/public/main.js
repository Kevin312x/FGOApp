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
        console.log(server)
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
        console.log(server)
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
    document.getElementById('ATK').value = '0';
    document.getElementById('NPMod').value = '0';
    if(class_selected != 'None') {
        let servant_select_id = document.getElementById('servant-select');
        let servants;

        await $.ajax({
            url: '/servants/class/' + class_selected,
        }).done(function (data) {
            servants = data;
        })
        
        $('#servant-select').empty().append('<option value="None" selected>Choose a servant...</option>');
        servant_select_id.disabled = false;
        
        for(let servant in servants) {
            let option = document.createElement('option')
            option.appendChild(document.createTextNode(servants[servant]['name']));
            option.value = servants[servant]['servant_id'];
            servant_select_id.append(option);
        }
    } else {
        document.getElementById('servant-select').disabled = true;
    }

}

async function fill_out_inputs() {
    let servant_id = document.getElementById('servant-select').value;
    let servant_data;
    await $.ajax({
        url: '/servants/id/' + servant_id,
    }).done(function (data) {
        servant_data = data;
    })

    let atk_ele = document.getElementById('ATK');
    let np_ele = document.getElementById('NPMod');
    atk_ele.value = servant_data[0]['max_atk'];
    np_ele.value = servant_data[0]['np_modifier'];
}

function check_validity(event, cap) {
    const old_val = document.getElementById('ATKMod').value;
    const input = event.key;
    const reg = new RegExp(/^[0-9]*(\.[0-9]{0,2})?$/, 'g');
    const new_val = old_val + input;
    
    if(reg.test(new_val) && parseFloat(new_val) <= cap) { return true; }
    else { return false; }
}
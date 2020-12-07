
/**
 * Let R = # of rolls, P = % of probability
 * Percentage of rolling a 5* given a number of rolls:
 * P = 1 - (1 - .03)^(R)
 * 
 * Number of rolls to achieve a given probability:
 * R = (ln(1 - (P)) / ln(1 - .03))
 */
const calc_perc = () => {
    let sq = parseInt(document.getElementById('sq_amount').value) || 0;
    const tickets = parseInt(document.getElementById('ticket_amount').value) || 0;
    const sq_fragments = parseInt(document.getElementById('sq_frag_amount').value) || 0;
    const percentage = document.getElementById('projected-percentage');
    let rate_up = 0;

    // Retrieve values of all checked items in sidebar
    let server = document.querySelector(`input[name="server_options_1"]:checked`).value;
    let rarity = parseInt(document.querySelector(`input[name="rarity-roll-option"]:checked`).value);
    let type = document.querySelector(`input[name="type-roll-option"]:checked`).value;
    let amount = parseInt(document.querySelector(`input[name="amount-roll-option"]:checked`).value);
    console.log(1)
    if(type == 'servant') {
        switch(rarity) {
            case 5:
                switch(amount) {
                    case 1:
                        rate_up = (server == 'na' ? 0.007 : 0.008);
                        break;
                    case 2:
                        rate_up = 0.004;
                        break;
                    case 3:
                        rate_up = 0.003;
                        break;
                    default:
                        rate_up = 0;
                        break;
                }
                break;
            case 4:
                switch(amount) {
                    case 1:
                        rate_up = 0.015;
                        break;
                    case 2:
                        rate_up = 0.012;
                        break;
                    case 3:
                        rate_up = 0.007;
                        break;
                    default:
                        rate_up = 0;
                        break;
                }
                break;
            default:
                rate_up = 0;
                break;
        }
    } else {
        switch(rarity) {
            case 5:
                switch(amount) {
                    case 1:
                        rate_up = 0.028;
                        break;
                    case 2:
                        rate_up = 0.014;
                        break;
                    default:
                        rate_up = 0;
                        break;
                }
                break;
            case 4:
                switch(amount) {
                    case 1:
                        rate_up = 0.040;
                        break;
                    default:
                        rate_up = 0;
                        break;
                }
                break;
            default:
                rate_up = 0;
                break;
        }
    }
    console.log(2)
    sq += (Math.floor(sq_fragments / 7));
    const rolls = Math.floor(sq / 3) + parseInt(tickets) + (server == 'na' ? 0 : Math.floor((Math.floor(sq / 3) + tickets) / 10));
    percentage.value = ((1 - Math.pow((1 - rate_up), rolls)) * 100 == 0 ? '' : (1 - Math.pow((1 - rate_up), rolls)) * 100);
}

const calc_rolls = () => {
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

    document.getElementById('ATK').value = 0;
    document.getElementById('NPMod').value = '0';
    if(class_selected != 'None') {
        let servants;

        await $.ajax({
            url: '/servant/class/' + class_selected,
            dataType: 'json'
        }).done(function (data) {
            servants = data['servants'];
        })
        
        $('#servant-select').empty().append('<option value="None" selected>Choose a servant...</option>');
        servant_select.disabled = false;
        
        for(let servant in servants) {
            let option = document.createElement('option')
            option.appendChild(document.createTextNode(servants[servant]['name']));
            option.value = servants[servant]['name'];
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
    let servant_name = document.getElementById('servant-select').value;
    const np_level_selected = document.getElementById('np-level-select');
    const class_adv_selected = document.getElementById('class-adv-mod');
    const attribute_adv_selected = document.getElementById('attribute-adv-mod');
    let servant_data;
    let servant_np_levels;
    let servant_np_data;
    let class_dmg_mod

    await $.ajax({
        url: '/servant/' + servant_name.replace(' ', '_'),
        dataType: 'json'
    }).done(function (data) {
        servant_data = data['servant_data'];
        servant_np_data = data['servant_np_data'];
        servant_np_levels = data['servant_np_levels'];
        class_dmg_mod = data['servant_class_dmg_mod'];
    })

    let atk_ele = document.getElementById('ATK');
    let np_ele = document.getElementById('NPMod');
    atk_ele.value = parseInt(servant_data[0]['max_atk'].replace(',', ''));
    np_ele.value = (servant_np_data[0]['effect'].includes('Deals damage') ? servant_np_levels[0]['np_modifier'] : '-');

    np_level_selected.disabled = false;
    class_adv_selected.disabled = false;
    attribute_adv_selected.disabled = false;
    document.getElementById('ATK').disabled = false;
    document.getElementById('class-dmg-mod').value = class_dmg_mod[0]['atk_modifier'];
    document.getElementById('card-type').value = servant_np_data[0]['card_type'];
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
    const servant_name = document.getElementById('servant-select').value;
    const np_level = document.getElementById('np-level-select').value;
    let servant_np_levels;

    await $.ajax({
        url: '/servant/' + servant_name.replace(' ', '_'),
        dataType: 'json'
    }).done(function(data) {
        servant_np_levels = data['servant_np_levels'];
    })

    np_mod_ele.value = servant_np_levels[parseInt(np_level) - 1]['np_modifier'];
}

function update_btns() {
    const type = document.querySelector(`input[name="type-roll-option"]:checked`).value;
    const rarity = parseInt(document.querySelector(`input[name="rarity-roll-option"]:checked`).value);
    if(type == 'ce') {
        switch(rarity) {
            case 5:
                disable_btns(1);
                break;
            case 4:
                disable_btns(2);
                break;
            default:
                disable_btns(0);
                break;
        }
    } else { disable_btns(0); }
    document.querySelector(`#option-1`).checked = true;
}

function disable_btns(num_btns) {
    document.querySelectorAll(`input[name="amount-roll-option"]`).forEach((e, index) => {
        e.disabled = false;
        if(index >= (3 - num_btns)) { e.disabled = true; }
    });


}

/**
  * Taken From 'https://blogs.nrvnqsr.com/entry.php/3309-How-is-damage-calculated', 
  * the formula for damage calculation.
  * 
  * DMG = [servant_atk * np_dmg_mod * (first_card_bonus * (card_dmg_value * (1 + card_mod))) * class_atk_mod * triangle_mod * attribute_mod * rand_mod 
  *        * 0.23 * (1 + atk_mod - def_mod) * critical_mod * extra_card_mod * (1 - spec_def_mod) * {1 + power_mod + self_dmg_mod + (crit_dmg_mod * is_crit) 
  *        + (np_dmg_mod * is_np)} * {1 + ((super_eff_mod - 1) * is_super_eff)}] + dmg_plus_mod + self_dmg_cut + (servant_atk * buster_chain_mod)
  * 
  * NP_DMG = [servant_atk * np_dmg_mod * (1 + card_mod) * class_atk_mod * triangle_mod * attribute_mod 
  *          * rand_mod * 0.23 * (1 + atk_mod - def_mod) * {1 + power_mod + (np_dmg_mod * is_np)} * {1 + ((super_eff_mod - 1) 
  *          * is_super_eff)}] + dmg_plus_mod
  * 
  * servant_atk = servants's atk
  * class_atk_mod = class dmg modifier
  * triangle_mod = class advantage modifier
  * attribute_mod = attribute advantage modifier
  * rand_mod = random modifier ranging from 0.9 to 1.1
  * np_dmg_mod = np's dmg modifier from np_levels
  * super_eff_mod = np's super effective mod (gil on servants)
  * is_super_eff = 1 or 0 depending on enemy traits
  * card_mod = card type buff modifier
  * atk_mod = atk up modifier
  * def_mod = def down modifier (pos or neg)
  * power_mod = dmg up (events/ce)
  * is_np = 1 or 0 depending if np
  * dmg_plus_mod = flat damage increase
  */

function calc_dmg() {
    const servant_atk = parseInt(document.getElementById('ATK').value.replace(',', '')) || 0;
    const np_dmg_mod = (parseInt(document.getElementById('NPMod').value) / 100)  || 0;
    const class_dmg_mod = parseFloat(document.getElementById('class-dmg-mod').value.slice(0, -1)) || 0;
    const triangle_mod = parseFloat(document.getElementById('class-adv-mod').value) || 0;
    const attribute_mod = parseFloat(document.getElementById('attribute-adv-mod').value) || 0;
    const atk_mod = (parseFloat(document.getElementById('ATKMod').value) / 100) || 0;
    const card_mod = (parseFloat(document.getElementById('CardMod').value) / 100) || 0;
    const def_mod = (parseFloat(document.getElementById('def-down-mod').value) / 100) || 0;
    const card_down_mod = (parseFloat(document.getElementById('card-down-mod').value) / 100) || 0;
    const np_up_mod = (parseFloat(document.getElementById('np-buff-mod').value) / 100) || 0;
    const power_mod = (parseInt(document.getElementById('event-ce-buff-mod').value) / 100) || 0;
    const dmg_plus_mod = (document.getElementById('flat-dmg-mod').value) || 0;
    const card_type = document.getElementById('card-type').value;

    const card_type_mod = (card_type == 'Buster' ? 1.5 : (card_type == 'Arts') ? 1.0 : 0.8);

    const dmg = servant_atk * np_dmg_mod * card_type_mod * (1 + card_mod + card_down_mod) * class_dmg_mod * triangle_mod * attribute_mod * 0.23 * (1 + atk_mod + def_mod) * (1 + power_mod + (np_up_mod))
    const min_dmg = (dmg * 0.9) + dmg_plus_mod;
    const avg_dmg = dmg + dmg_plus_mod;
    const max_dmg = (dmg * 1.1) + dmg_plus_mod;
    
    document.getElementById('dmg-low-res').value = Math.round(min_dmg);
    document.getElementById('dmg-avg-res').value = Math.round(avg_dmg);
    document.getElementById('dmg-high-res').value = Math.round(max_dmg);
}